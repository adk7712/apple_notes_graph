import re
from typing import List

def extract_backlinks(note_content: str) -> List[str]:
    """
    Extract backlinks in [[Note Name]] format from note content.
    Returns a list of unique target note names.
    """
    if not note_content:
        return []

    # Use regex to find all matches of [[anything]]
    # (.*?) is non-greedy to handle multiple backlinks on the same line
    matches = re.findall(r'\[\[(.*?)\]\]', note_content)
    
    # Return unique note names, stripped of whitespace
    return list(set(name.strip() for name in matches if name.strip()))
