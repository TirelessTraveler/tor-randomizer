import re

def update_group_restrictions(group_restrictions):
    group_restrictions_str = "\n".join(
        [", ".join(entry['grouping']) + ": " + ", ".join(entry['restrictions']) for entry in group_restrictions]
    )
    
    # Simulating the change event
    lines = group_restrictions_str.splitlines()
    group_restrictions = [
        {
            'grouping': list(filter(None, [s.strip() for s in parts[0].split(",")])),
            'restrictions': list(filter(None, [s.strip() for s in parts[1].split(",")]))
        }
        for line in lines if line
        for parts in [line.split(":")]
    ]
    
    return group_restrictions