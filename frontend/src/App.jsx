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

  const filteredData = (function() {
    if (!searchQuery) return graphData;
    const lowerQuery = searchQuery.toLowerCase();
    const filteredNodes = graphData.nodes.filter(node => 
      node.label.toLowerCase().includes(lowerQuery)
    );
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = graphData.edges.filter(edge => 
      nodeIds.has(edge.source) && nodeIds.has(edge.target)
    );
    return { nodes: filteredNodes, edges: filteredEdges };
  })();

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <h1>Apple Notes Graph</h1>
          <div className="stats">
            {graphData.nodes.length} nodes, {graphData.edges.length} edges
          </div>
        </div>
        <div className="controls">
          <div className="slider-control">
            <label htmlFor="edge-thickness">Edge Thickness</label>
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
