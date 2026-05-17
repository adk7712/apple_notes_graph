# Apple Notes Graph View (Proof of Concept)

**⚠️ Important: This project is a Proof of Concept (POC).** It is intended to demonstrate the feasibility of adding graph visualization to Apple Notes and is not a production-ready application.

This application adds an interactive knowledge graph visualization to your Apple Notes. By extracting backlinks using an Obsidian-style `[[Note Name]]` syntax, it builds a visual network of your thoughts and ideas.

## How it Works

The application follows a simple three-step workflow to turn your notes into a graph:

1.  **Direct Extraction**: The backend uses AppleScript to perform a lightning-fast batch fetch of every note across all your Apple Notes accounts and folders.
2.  **Backlink Parsing**: Each note's content is cleaned and scanned for the `[[Note Name]]` syntax. The app automatically resolves these names to create connections (edges) between nodes.
3.  **Fluid Visualization**: The parsed data is sent to a web-based frontend that renders an interactive, physics-based graph. All notes appear as nodes; those with links are connected, while others float as orphan nodes.

## Quick Start

### 1. Prerequisites
- macOS (required for AppleScript integration)
- Python 3.8+
- Node.js 16+

### 2. Launch the Backend
From the root directory:
```bash
python3 -m backend.main serve
```

### 3. Launch the Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in the browser and click the **Sync** button.

## Usage Tips

-   **Create a Link**: In any Apple Note, simply type `[[Target Note Name]]`. The next time you sync, an edge will appear connecting the two.
-   **Navigation**: Use your mouse wheel or trackpad to zoom. Click and drag nodes to move them; the physics engine will fluidly pull them back into the cluster.
-   **Search**: Use the search bar in the header to highlight specific notes in the "sea" of nodes.

## Known Limitations

-   **macOS Only**: Relies on `osascript` to interface with the local Apple Notes application.
-   **Read-Only**: This POC only performs the R of CRUD. It can only read your notes. It cannot create, edit, or delete notes in your Apple Notes app.
-   **Performance**: Again, this is just a POC and the parsing of the notes is extremely slow.
-   **Simple Resolution**: Backlink matching is based on exact note titles. If you have duplicate titles, the link will resolve to the first match found.
