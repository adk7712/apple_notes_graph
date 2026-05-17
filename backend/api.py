from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .graph_builder import GraphBuilder
from .models import Graph, Note
from typing import Dict, Optional

app = FastAPI()

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
builder = GraphBuilder()
current_graph: Optional[Graph] = None

@app.get("/api/graph")
async def get_graph():
    if current_graph is None:
        return {"nodes": [], "edges": [], "sync_time": None}
    return current_graph

@app.post("/api/sync")
async def sync_graph():
    global current_graph
    try:
        current_graph = await builder.build_graph()
        return current_graph
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/notes/{note_id}")
async def get_note_content(note_id: str):
    note = builder.notes_cache.get(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found in cache. Please sync first.")
    return note
