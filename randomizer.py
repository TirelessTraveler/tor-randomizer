import random

def shuffle(array):
    currentIndex = len(array)
    while currentIndex != 0:
        randomIndex = random.randint(0, currentIndex - 1)
        currentIndex -= 1
        array[currentIndex], array[randomIndex] = array[randomIndex], array[currentIndex]
    return array

def expandCategory(category, role_categories, case_lookup, found=None):
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
                for role in expandCategory(s, role_categories, case_lookup, found):
                    included_roles[role] = True
            return list(included_roles.keys())
        else:
            return [category]
    else:
        return []

def main(data):
    test_roles = {}
    role_categories = data['role_categories']
    case_lookup = data['case_lookup']
    all_roles = data['all_roles']
    rolelist = data['rolelist']
    group_restrictions = data['group_restrictions']
    faction_limit = data['faction_limit']

    for x in all_roles:
        case_lookup[x.upper()] = x
        category = all_roles[x].get('category')
        if category:
            role_categories[category] = role_categories.get(category, []) + [x]
    for x in role_categories:
        case_lookup[x.upper()] = x

    rolelist_expanded = []
    for line in rolelist:
        parts = [s.strip() for s in line.split(",") if s.strip()]
        included_roles = {}
        for s in parts:
            for role in expandCategory(s, role_categories, case_lookup):
                included_roles[role] = True
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
            'roles': set(role for s in entry['grouping'] for role in expandCategory(s, role_categories, case_lookup)),
            'restrictions': set(s.lower() for s in normal_restrictions),
            'leaders': set(role for s in leaders for role in expandCategory(s, role_categories, case_lookup))
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

    playerlist = data['playerlist']
    while len(playerlist) < len(rolelist_expanded):
        playerlist.append(f"Player {len(playerlist) + 1}")
    playerlist = shuffle(playerlist)
    for i, entry in enumerate(rolelist_expanded):
        entry['player'] = playerlist[i]

    results = [f"{entry.get('selected_role', '-')} ({entry['player']})" for entry in rolelist_expanded]
    return {"results": results}
