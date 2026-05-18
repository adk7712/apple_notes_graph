import { useState } from 'react';
import { useGraph } from './hooks/useGraph';
import Graph from './components/Graph';
import NotePreview from './components/NotePreview';
import SearchBar from './components/SearchBar';
import SyncButton from './components/SyncButton';
import './styles.css';

function App() {
  const { graphData, loading, error, syncGraph } = useGraph();
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [edgeThickness, setEdgeThickness] = useState(1.0);
  const [edgeOpacity, setEdgeOpacity] = useState(0.3);
  const [nodeSize, setNodeSize] = useState(1.0);
  const [nodeOpacity, setNodeOpacity] = useState(1.0);
  const [darkMode, setDarkMode] = useState(false);
  const [hideOrphans, setHideOrphans] = useState(false);

  const filteredData = (function() {
    let nodes = graphData.nodes;
    let edges = graphData.edges;

    // Filter by orphan status if requested
    if (hideOrphans) {
      const connectedNodeIds = new Set();
      edges.forEach(edge => {
        connectedNodeIds.add(edge.source);
        connectedNodeIds.add(edge.target);
      });
      nodes = nodes.filter(node => connectedNodeIds.has(node.id));
    }

    // Filter by search query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      nodes = nodes.filter(node =>
        node.label.toLowerCase().includes(lowerQuery)
      );
    }

    // Ensure edges only point to existing nodes
    const nodeIds = new Set(nodes.map(n => n.id));
    edges = edges.filter(edge =>
      nodeIds.has(edge.source) && nodeIds.has(edge.target)
    );

    return { nodes, edges };
  })();

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
      <header className="app-header">
        <div className="header-left">
          <h1>Apple Notes Graph</h1>
          <div className="stats">
            {filteredData.nodes.length} nodes, {filteredData.edges.length} edges
            {hideOrphans && ` (${graphData.nodes.length - filteredData.nodes.length} orphans hidden)`}
          </div>
        </div>
        <div className="controls">
          <div className="control-group">
            <label className="toggle-control">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
              />
              Dark Mode
            </label>
            <label className="toggle-control">
              <input
                type="checkbox"
                checked={hideOrphans}
                onChange={(e) => setHideOrphans(e.target.checked)}
              />
              Hide Orphans
            </label>
          </div>

          <div className="control-group">
            <div className="slider-control">
              <label htmlFor="node-size">Node Size</label>
              <input
                id="node-size"
                type="range"
                min="0.5"
                max="4.0"
                step="0.1"
                value={nodeSize}
                onChange={(e) => setNodeSize(parseFloat(e.target.value))}
              />
              <span className="slider-value">{nodeSize.toFixed(1)}</span>
            </div>
            <div className="slider-control">
              <label htmlFor="node-opacity">Node Opacity</label>
              <input
                id="node-opacity"
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={nodeOpacity}
                onChange={(e) => setNodeOpacity(parseFloat(e.target.value))}
              />
              <span className="slider-value">{nodeOpacity.toFixed(2)}</span>
            </div>
          </div>

          <div className="control-group">
            <div className="slider-control">
              <label htmlFor="edge-thickness">Edge Thick</label>
              <input
                id="edge-thickness"
                type="range"
                min="0.1"
                max="5.0"
                step="0.1"
                value={edgeThickness}
                onChange={(e) => setEdgeThickness(parseFloat(e.target.value))}
              />
              <span className="slider-value">{edgeThickness.toFixed(1)}</span>
            </div>
            <div className="slider-control">
              <label htmlFor="edge-opacity">Edge Alpha</label>
              <input
                id="edge-opacity"
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={edgeOpacity}
                onChange={(e) => setEdgeOpacity(parseFloat(e.target.value))}
              />
              <span className="slider-value">{edgeOpacity.toFixed(2)}</span>
            </div>
          </div>

          <SearchBar onSearch={setSearchQuery} />
          <SyncButton onSync={syncGraph} loading={loading} />
        </div>
      </header>

      <main className="app-main">
        {error && <div className="error-message">{error}</div>}
        <Graph
          data={filteredData}
          onNodeClick={setSelectedNoteId}
          edgeThickness={edgeThickness}
          edgeOpacity={edgeOpacity}
          nodeSize={nodeSize}
          nodeOpacity={nodeOpacity}
          darkMode={darkMode}
        />
        <NotePreview
          noteId={selectedNoteId}
          onClose={() => setSelectedNoteId(null)}
        />
      </main>
    </div>
  );
}

export default App;
