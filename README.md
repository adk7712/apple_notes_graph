# Apple Notes Graph View (Proof of Concept)

**⚠️ Important: This project is a Proof of Concept (POC).** It is intended to demonstrate the feasibility of adding graph visualization to Apple Notes and is not a production-ready application.

This application adds an interactive knowledge graph visualization to your Apple Notes. It extracts backlinks using an Obsidian-style `[[Note Name]]` syntax to build a visual network of your thoughts and ideas.

## How it Works

The application follows a simple three-step workflow:

1.  **Direct Extraction**: The backend uses AppleScript to perform a lightning-fast batch fetch of every note across all your Apple Notes accounts and folders.
2.  **Backlink Parsing**: Each note's content is cleaned and scanned for the `[[Note Name]]` syntax. The app automatically resolves these names to create connections.
3.  **Visualization**: Data is rendered in an interactive, fluid physics-based graph using the Euler layout engine.

## Key Features

-   **Gruvbox Theme**: Dedicated Light and Dark themes.
-   **Semantic Coloring**: Nodes are colored based on their "importance" (backlink count), allowing for instant visual identification of core ideas.
-   **Intelligent Filtering**: Toggle **Hide Orphans** to focus only on connected clusters, or use the **Search Bar** to highlight specific notes.
-   **Customization**: Real-time sliders to adjust node size, node opacity, edge thickness, and edge darkness.
-   **Interactive Highlighting**: Hovering over nodes or edges triggers vibrant highlights for easy traceability of connections.

## Quick Start

### 1. Prerequisites
- macOS (required for AppleScript integration)
- Python 3.9+
- Node.js 18+

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
Open `http://localhost:5173` in the browser and click the **Sync Notes** button.

## Usage Tips

-   **Create a Link**: In any Apple Note, simply type `[[Target Note Name]]`. The next time you sync, an edge will appear connecting the two.
-   **Navigation**: Use your mouse wheel or trackpad to zoom. Click and drag nodes to move them; the physics engine will fluidly pull them back into the cluster.
-   **Smart Reveal**: Note labels are hidden when zoomed out to prevent clutter, and automatically reveal as you zoom in closer.
-   **Note Preview**: Click any node to open a sidebar containing the cleaned text of the note and its specific metadata (no attachment support yet).

## Known Limitations

-   **macOS Only**: Relies on `osascript` to interface with the local Apple Notes application.
-   **Read-Only**: This POC only performs the R of CRUD. It can only read your notes. It cannot create, edit, or delete notes in your Apple Notes app.
-   **Performance**: Again, this is just an unoptimized POC; parsing speed is limited by the overhead of AppleScript communication and my unwillingness to optimize the code.
-   **Simple Resolution**: Backlink matching is based on exact note titles. If you have duplicate titles, the link will resolve to the first match found.
