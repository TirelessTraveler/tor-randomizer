import tkinter as tk
from tkinter import ttk

rolelist_presets = {
    "All Any": ["Any"] * 15,
    "Uprising Ranked": [
        "Cult Order",
        "Cult Investigative",
        "Cult Guardian",
        "Random Cult",
        "Random Cult",
        "Random Cult",
        "Common Cult",
        "Random Uprising",
        "Random Uprising",
        "Rogue Outcast"
    ],
    "Ghosts Ranked": [
        "Cult Order",
        "Cult Investigative",
        "Cult Support",
        "Random Cult",
        "Random Cult",
        "Random Cult",
        "Common Cult",
        "Ghost Killing",
        "Random Ghost",
        "Random Ghost"
    ],
    "Rogues Ranked": [
        "Cult Order",
        "Cult Investigative",
        "Cult Guardian",
        "Random Cult",
        "Random Cult",
        "Random Cult",
        "Cult Negative",
        "Rogue Killing",
        "Rogue Outcast",
        "Rogue Outcast"
    ],
    "Saints Ranked": [
        "Cult Order",
        "Cult Investigative",
        "Cult Fabled",
        "Random Cult",
        "Random Cult",
        "Random Cult",
        "Random Cult",
        "Cult Negative",
        "Saint Vessel",
        "Rogue Outcast"
    ]
}

def on_preset_change(event):
    selected_preset = preset_combobox.get()
    if selected_preset in rolelist_presets:
        rolelist_text.delete(1.0, tk.END)
        rolelist_text.insert(tk.END, "\n".join(rolelist_presets[selected_preset]))

def on_rolelist_change(event):
    preset_combobox.set("")

root = tk.Tk()
root.title("Rolelist Presets")

preset_combobox = ttk.Combobox(root, values=list(rolelist_presets.keys()))
preset_combobox.grid(row=0, column=0, padx=10, pady=10)
preset_combobox.bind("<<ComboboxSelected>>", on_preset_change)

rolelist_text = tk.Text(root, width=50, height=20)
rolelist_text.grid(row=1, column=0, padx=10, pady=10)
rolelist_text.bind("<KeyRelease>", on_rolelist_change)

root.mainloop()
