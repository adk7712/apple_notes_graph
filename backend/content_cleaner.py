import re
import html

def strip_html(html_content: str) -> str:
    """
    Remove HTML tags and base64-encoded attachment data from note content.
    """
    if not html_content:
        return ""

    # 1. Remove base64-encoded patterns: data:[type];base64,[base64string]
    # We replace the whole tag that contains a data: URI with [ATTACHMENT]
    # This ensures the placeholder survives tag stripping.
    content = re.sub(r'<[^>]+data:[^;]+;base64,[a-zA-Z0-9+/=]+[^>]*>', ' [ATTACHMENT] ', html_content)
    
    # Also remove long alphanumeric sequences that might be base64 but not in a data: URI
    content = re.sub(r'[a-zA-Z0-9+/]{100,}', ' [BASE64_DATA] ', content)

    # 2. Remove all HTML tags
    content = re.sub(r'<[^>]+>', ' ', content)

    # 3. Unescape HTML entities (&nbsp;, &amp;, etc.)
    content = html.unescape(content)

    # 4. Clean up whitespace
    # Replace multiple spaces with a single space
    content = re.sub(r' +', ' ', content)
    
    # Split by newlines, strip each line, and remove empty lines
    lines = [line.strip() for line in content.splitlines() if line.strip()]
    
    return "\n".join(lines)
