import asyncio

async def execute_applescript(script: str) -> str:
    """Execute AppleScript and return result."""
    process = await asyncio.create_subprocess_exec(
        "osascript",
        "-e",
        script,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await process.communicate()

    if process.returncode != 0:
        raise RuntimeError(f"AppleScript error: {stderr.decode()}")

    return stdout.decode().strip()

def create_applescript_quoted_string(text: str) -> str:
    """Create a properly quoted string for AppleScript."""
    if not text:
        return '""'
    # Escape the text for AppleScript string literals
    escaped_text = text.replace("\\", "\\\\").replace('"', '\\"')
    return f'"{escaped_text}"'
