import datetime
from typing import List, Dict, Set
from .note_reader import NoteReader
from .content_cleaner import strip_html
from .backlink_parser import extract_backlinks
from .models import Graph, GraphNode, GraphEdge, Note

class GraphBuilder:
    def __init__(self):
        self.reader = NoteReader()
        self.notes_cache: Dict[str, Note] = {}

    async def build_graph(self) -> Graph:
        """
        Orchestrate the full process: batch fetch -> clean -> parse backlinks -> build graph
        """
        print("Starting batch fetch of all notes...")
        # 1. Fetch all notes in one call (significant performance improvement)
        all_notes_data = await self.reader.fetch_all_notes_batch()
        print(f"Fetched {len(all_notes_data)} notes. Processing...")
        
        # 2. Process notes and build name resolution map
        processed_notes: List[Note] = []
        resolution_map: Dict[str, str] = {}
        
        for n in all_notes_data:
            note_id = n['note_id']
            original_name = n['name']
            body = n.get('body', '')
            
            # Clean and parse
            clean_body = strip_html(body)
            backlinks = extract_backlinks(clean_body)
            
            note_data: Note = {
                "note_id": note_id,
                "name": original_name,
                "full_id": n['full_id'],
                "body": body,
                "clean_body": clean_body,
                "backlinks": backlinks
            }
            
            processed_notes.append(note_data)
            self.notes_cache[note_id] = note_data
            
            # Resolution map for backlinks
            # We prefer the first note found for a given name if duplicates exist
            if original_name not in resolution_map:
                resolution_map[original_name] = note_id

        # 3. Build Nodes and Edges
        nodes: List[GraphNode] = []
        edges: List[GraphEdge] = []
        
        # Track backlink counts for node sizing
        backlinks_count: Dict[str, int] = {n['note_id']: 0 for n in processed_notes}
        
        # Deduplicate edges (source, target)
        unique_edges: Set[tuple] = set()

        for note in processed_notes:
            source_id = note['note_id']
            for target_name in note['backlinks']:
                target_id = resolution_map.get(target_name)
                if target_id and (source_id, target_id) not in unique_edges:
                    edges.append({
                        "source": source_id,
                        "target": target_id
                    })
                    unique_edges.add((source_id, target_id))
                    backlinks_count[target_id] = backlinks_count.get(target_id, 0) + 1

        for note in processed_notes:
            nodes.append({
                "id": note['note_id'],
                "label": note['name'],
                "backlinks_count": backlinks_count.get(note['note_id'], 0)
            })

        print(f"Graph built with {len(nodes)} nodes and {len(edges)} edges.")
        return {
            "nodes": nodes,
            "edges": edges,
            "sync_time": datetime.datetime.now().isoformat()
        }
