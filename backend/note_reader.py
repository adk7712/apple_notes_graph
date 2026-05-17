from typing import List, Dict
from .applescript_operations import execute_applescript

class NoteReader:
    @staticmethod
    def extract_primary_key(full_note_id: str) -> str:
        """Extract just the primary key from a full Core Data ID."""
        try:
            parts = full_note_id.split("/")
            if len(parts) > 0:
                return parts[-1]
            return full_note_id
        except:
            return full_note_id

    @staticmethod
    async def fetch_all_notes_batch() -> List[Dict[str, str]]:
        """
        Fetch ALL notes (ID, name, body) in a single batch call.
        This captures notes from all accounts and all folders (including root and nested).
        """
        # We use a unique delimiter to avoid collisions with note content
        DELIM_RECORD = "|||REC_DELIM|||"
        DELIM_FIELD = "|||FLD_DELIM|||"
        
        script = f"""
        set output to ""
        set AppleScript's text item delimiters to "{DELIM_RECORD}"
        tell application "Notes"
            set allNotes to every note
            set noteDataList to {{}}
            repeat with aNote in allNotes
                set noteID to id of aNote
                set noteName to name of aNote
                set noteBody to body of aNote
                set end of noteDataList to (noteID & "{DELIM_FIELD}" & noteName & "{DELIM_FIELD}" & noteBody)
            end repeat
            set output to noteDataList as string
        end tell
        return output
        """
        
        result = await execute_applescript(script)
        if result.startswith("error:"):
            raise RuntimeError(f"Failed to fetch notes: {result[6:]}")
        
        return NoteReader._parse_batch_result(result, DELIM_RECORD, DELIM_FIELD)

    @staticmethod
    def _parse_batch_result(result: str, rec_delim: str, fld_delim: str) -> List[Dict[str, str]]:
        if not result.strip():
            return []

        notes = []
        records = result.split(rec_delim)
        for record in records:
            if not record.strip():
                continue
            parts = record.split(fld_delim)
            if len(parts) >= 3:
                full_id = parts[0]
                name = parts[1]
                body = parts[2]
                notes.append({
                    "note_id": NoteReader.extract_primary_key(full_id),
                    "full_id": full_id,
                    "name": name,
                    "body": body
                })
        return notes

    # Keeping these for backward compatibility if needed, but they are no longer the primary path
    @staticmethod
    async def list_all_notes() -> List[Dict[str, str]]:
        """List notes (names and IDs) only."""
        notes = await NoteReader.fetch_all_notes_batch()
        return [{"note_id": n["note_id"], "name": n["name"], "full_id": n["full_id"]} for n in notes]

    @staticmethod
    async def read_note_by_id_and_name(note_id: str, note_name: str) -> Dict:
        """Fetch a single note. Note: This is now inefficient compared to batching."""
        # For simplicity in this refactor, we just fetch all and filter, 
        # but in practice, the GraphBuilder should call fetch_all_notes_batch once.
        all_notes = await NoteReader.fetch_all_notes_batch()
        for n in all_notes:
            if n["note_id"] == note_id:
                return n
        raise RuntimeError(f"Note {note_id} not found")
