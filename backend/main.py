import uvicorn
import argparse
import asyncio
from .graph_builder import GraphBuilder

async def run_sync():
    builder = GraphBuilder()
    print("Starting sync...")
    graph = await builder.build_graph()
    print(f"Sync complete. Found {len(graph['nodes'])} nodes and {len(graph['edges'])} edges.")
    import json
    with open("graph.json", "w") as f:
        json.dump(graph, f, indent=2)
    print("Graph saved to graph.json")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Apple Notes Graph POC")
    parser.add_argument("command", choices=["serve", "sync"], help="Command to run")
    args = parser.parse_args()

    if args.command == "serve":
        uvicorn.run("backend.api:app", host="0.0.0.0", port=8000, reload=True)
    elif args.command == "sync":
        asyncio.run(run_sync())
