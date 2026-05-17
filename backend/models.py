from typing import List, Dict, TypedDict, Optional

class Note(TypedDict):
    note_id: str
    name: str
    full_id: str
    body: Optional[str]  # Raw HTML
    clean_body: Optional[str]  # After HTML stripping
    backlinks: List[str]  # Target note names

class GraphNode(TypedDict):
    id: str
    label: str
    backlinks_count: int

class GraphEdge(TypedDict):
    source: str
    target: str

class Graph(TypedDict):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    sync_time: str
