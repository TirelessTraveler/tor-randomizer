import re
from collections import defaultdict

case_lookup_base = {}
role_meta_categories = {}  # Assuming role_meta_categories is defined somewhere

for category in role_meta_categories:
    role_meta_categories[category] = [
        (acronym := re.sub(r'[^A-Z]', '', x)) if acronym and len(acronym) < 5 and acronym not in role_meta_categories else x
        for x in role_meta_categories[category]
    ]
    for x in role_meta_categories[category]:
        if isinstance(x, str) and x.isupper() and len(x) < 5:
            role_meta_categories[x] = [x]

for x in role_meta_categories:
    case_lookup_base[x.upper()] = x

def update_categories():
    categories_val = "\n".join(
        f"{key}: {', '.join(values)}"
        for key, values in role_meta_categories.items()
    )
    # Assuming a function to set the value of an element with id 'categories'
    set_element_value("#categories", categories_val)

def on_categories_change():
    lines = get_element_value("#categories").splitlines()
    global role_meta_categories
    role_meta_categories = {
        parts[0].strip(): [s.strip() for s in ":".join(parts[1:]).split(",") if s.strip()]
        for line in lines if (parts := line.split(":"))
    }
    global case_lookup_base
    case_lookup_base = {x.upper(): x for x in role_meta_categories}

# Assuming functions to get and set the value of an element with id 'categories'
def get_element_value(element_id):
    # Placeholder for actual implementation
    pass

def set_element_value(element_id, value):
    # Placeholder for actual implementation
    pass

# Assuming a function to bind an event handler to an element with id 'categories'
def bind_event_handler(element_id, event, handler):
    # Placeholder for actual implementation
    pass

# Initial setup
update_categories()
bind_event_handler("#categories", "change", on_categories_change)