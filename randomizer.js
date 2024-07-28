import random
import re
from collections import defaultdict

def shuffle(array):
    currentIndex = len(array)
    while currentIndex != 0:
        randomIndex = random.randint(0, currentIndex - 1)
        currentIndex -= 1
        array[currentIndex], array[randomIndex] = array[randomIndex], array[currentIndex]
    return array

role_categories = {}
case_lookup = {}

def expandCategory(category, found=None):
    if found is None:
        found = []
    category = case_lookup.get(category.upper())
    found = found + [category]
    if category:
        if category in role_categories:
            included_roles = {}
            for s in role_categories[category]:
                if s in found:
                    continue
                for role in expandCategory(s, found):
                    included_roles[role] = True
            return list(included_roles.keys())
        else:
            return [category]
    else:
        return []

def main():
    import tkinter as tk
    from tkinter import ttk

    def on_roll_button_click():
        test_roles = {}
        coven_roles_enabled = coven_on_var.get()
        tg_ar_roles_enabled = ar_on_var.get()
        tg_vamp_overhaul_roles_enabled = vo_on_var.get()
        tg_florae_roles_enabled = florae_on_var.get()
        faction_limit = int(faction_limit_entry.get())

        global role_categories, case_lookup
        role_categories = role_meta_categories.copy()
        case_lookup = case_lookup_base.copy()

        test_role_names = test_role_names_text.get("1.0", tk.END).strip().splitlines()
        test_role_alignments = test_role_alignments_text.get("1.0", tk.END).strip().splitlines()
        test_role_limits = test_role_limits_text.get("1.0", tk.END).strip().splitlines()
        test_role_weights = test_role_weights_text.get("1.0", tk.END).strip().splitlines()

        for i in range(len(test_role_names)):
            line = test_role_names[i].strip()
            if line == "":
                continue
            name = case_lookup.get(line.upper(), line)

            test_roles[name] = {}
            if i < len(test_role_alignments) and test_role_alignments[i].strip():
                category = test_role_alignments[i].strip()
                test_roles[name]['category'] = case_lookup.get(category.upper(), category)
            if i < len(test_role_limits) and test_role_limits[i].strip():
                limit = int(test_role_limits[i].strip())
                if limit >= 0:
                    test_roles[name]['limit'] = limit
            if i < len(test_role_weights) and test_role_weights[i].strip():
                weight = float(test_role_weights[i].strip())
                if weight >= 0:
                    test_roles[name]['weight'] = weight

        all_roles = all_roles_base.copy()
        for x in test_roles:
            all_roles[x] = {**{'limit': 6}, **all_roles.get(x, {}), **test_roles[x]}
        for x in all_roles:
            case_lookup[x.upper()] = x

            category = all_roles[x].get('category')
            if category:
                role_categories[category] = role_categories.get(category, []) + [x]
        for x in role_categories:
            case_lookup[x.upper()] = x

        rolelist = rolelist_text.get("1.0", tk.END).strip().splitlines()
        rolelist_expanded = []
        for line in rolelist:
            parts = [s.strip() for s in line.split(",") if s.strip()]
            included_roles = {}
            for s in parts:
                for role in expandCategory(s):
                    included_roles[role] = True
            for role in list(included_roles.keys()):
                if role in test_roles:
                    continue
                if 'coven' in all_roles[role] and all_roles[role]['coven'] != coven_roles_enabled:
                    del included_roles[role]
                if 'tg_ar' in all_roles[role] and all_roles[role]['tg_ar'] != tg_ar_roles_enabled:
                    del included_roles[role]
                if 'tg_vamp_overhaul' in all_roles[role] and all_roles[role]['tg_vamp_overhaul'] != tg_vamp_overhaul_roles_enabled:
                    del included_roles[role]
                if 'tg_florae' in all_roles[role] and all_roles[role]['tg_florae'] != tg_florae_roles_enabled:
                    del included_roles[role]
            rolelist_expanded.append({
                'slot_num': len(rolelist_expanded) + 1,
                'list': list(included_roles.keys())
            })

        rolelist_expanded = shuffle(rolelist_expanded)
        rolelist_expanded.sort(key=lambda x: len(x['list']))

        selected_roles = []
        restricted_groups = []
        for entry in group_restrictions:
            normal_restrictions = []
            leaders = []
            for s in entry['restrictions']:
                if s.lower().startswith("leader "):
                    leaders.append(s[6:].strip())
                else:
                    normal_restrictions.append(s)
            restricted_groups.append({
                'roles': set(role for s in entry['grouping'] for role in expandCategory(s)),
                'restrictions': set(s.lower() for s in normal_restrictions),
                'leaders': set(role for s in leaders for role in expandCategory(s))
            })

        for entry in rolelist_expanded:
            options = [role for role in entry['list'] if selected_roles.count(role) < all_roles[role]['limit'] and all(
                not (group['roles'].issuperset({role}) and (
                    (faction_limit and "faction" in group['restrictions'] and len([a for a in selected_roles if a in group['roles']]) >= faction_limit) or
                    ("exclusive" in group['restrictions'] and len([a for a in selected_roles if a in group['roles']]) >= 1)
                )) for group in restricted_groups
            )]
            weights = [all_roles[role].get('weight', 1) for role in options]
            rand = random.random() * sum(weights)
            for j, weight in enumerate(weights):
                rand -= weight
                if rand < 0:
                    entry['selected_role'] = options[j]
                    break

            for group in restricted_groups:
                if entry['selected_role'] in group['roles'] and group['leaders']:
                    has_leader = any(role in group['leaders'] for role in selected_roles) or entry['selected_role'] in group['leaders']
                    possible_leaders = [role for role in options if role in group['leaders']]
                    if possible_leaders and not has_leader:
                        weights = [all_roles[role].get('weight', 1) for role in possible_leaders]
                        rand = random.random() * sum(weights)
                        for j, weight in enumerate(weights):
                            rand -= weight
                            if rand < 0:
                                entry['selected_role'] = possible_leaders[j]
                                break

            if 'selected_role' in entry:
                selected_roles.append(entry['selected_role'])

        rolelist_expanded.sort(key=lambda x: x['slot_num'])

        playerlist = playerlist_text.get("1.0", tk.END).strip().splitlines()
        while len(playerlist) < len(rolelist_expanded):
            playerlist.append(f"Player {len(playerlist) + 1}")
        playerlist = shuffle(playerlist)
        for i, entry in enumerate(rolelist_expanded):
            entry['player'] = playerlist[i]

        results = [f"{entry.get('selected_role', '-')} ({entry['player']})" for entry in rolelist_expanded]
        results_text.delete("1.0", tk.END)
        results_text.insert(tk.END, "\n".join(results))

    root = tk.Tk()
    root.title("Role Selector")

    coven_on_var = tk.BooleanVar()
    ar_on_var = tk.BooleanVar()
    vo_on_var = tk.BooleanVar()
    florae_on_var = tk.BooleanVar()

    tk.Checkbutton(root, text="Coven On", variable=coven_on_var).pack()
    tk.Checkbutton(root, text="AR On", variable=ar_on_var).pack()
    tk.Checkbutton(root, text="VO On", variable=vo_on_var).pack()
    tk.Checkbutton(root, text="Florae On", variable=florae_on_var).pack()

    tk.Label(root, text="Faction Limit").pack()
    faction_limit_entry = tk.Entry(root)
    faction_limit_entry.pack()

    tk.Label(root, text="Test Role Names").pack()
    test_role_names_text = tk.Text(root, height=5)
    test_role_names_text.pack()

    tk.Label(root, text="Test Role Alignments").pack()
    test_role_alignments_text = tk.Text(root, height=5)
    test_role_alignments_text.pack()

    tk.Label(root, text="Test Role Limits").pack()
    test_role_limits_text = tk.Text(root, height=5)
    test_role_limits_text.pack()

    tk.Label(root, text="Test Role Weights").pack()
    test_role_weights_text = tk.Text(root, height=5)
    test_role_weights_text.pack()

    tk.Label(root, text="Role List").pack()
    rolelist_text = tk.Text(root, height=5)
    rolelist_text.pack()

    tk.Label(root, text="Player List").pack()
    playerlist_text = tk.Text(root, height=5)
    playerlist_text.pack()

    tk.Button(root, text="Roll", command=on_roll_button_click).pack()

    tk.Label(root, text="Results").pack()
    results_text = tk.Text(root, height=10)
    results_text.pack()

    root.mainloop()

if __name__ == "__main__":
    main()
