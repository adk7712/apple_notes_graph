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
          <SearchBar onSearch={setSearchQuery} />
          <SyncButton onSync={syncGraph} loading={loading} />
        </div>
      </header>

      <main className="app-main">
        {error && <div className="error-message">{error}</div>}
        <Graph 
          data={filteredData} 
          onNodeClick={setSelectedNoteId} 
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
