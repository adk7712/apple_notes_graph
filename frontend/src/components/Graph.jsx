import { useMemo, useState, useEffect } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';

const Graph = ({ data, onNodeClick }) => {
  const [cy, setCy] = useState(null);

  const elements = useMemo(() => {
    const nodes = data.nodes.map(node => ({
      data: { 
        id: node.id, 
        label: node.label,
        weight: (node.backlinks_count || 0) + 1
      }
    }));

    const edges = data.edges.map((edge, index) => ({
      data: { 
        id: `e${index}`,
        source: edge.source, 
        target: edge.target 
      }
    }));

    return [...nodes, ...edges];
  }, [data]);

  useEffect(() => {
    if (!cy) return;

    const handleTap = (evt) => {
      const target = evt.target;
      if (target.isNode && target.isNode()) {
        onNodeClick(target.id());
      }
    };

    cy.on('tap', 'node', handleTap);

    return () => {
      cy.off('tap', 'node', handleTap);
    };
  }, [cy, onNodeClick]);

  // Run layout when elements change
  useEffect(() => {
    if (!cy || elements.length === 0) return;

    console.log(`Rendering graph with ${elements.length} elements`);

    // For graphs with no edges, 'grid' is much faster and reliable
    const hasEdges = elements.some(el => el.data.source !== undefined);
    const layoutName = hasEdges ? 'cose' : 'grid';

    const layout = cy.layout({
      name: layoutName,
      animate: true,
      refresh: 20,
      fit: true,
      padding: 30,
      randomize: true,
      nodeRepulsion: 400000,
      idealEdgeLength: 100,
      nodeOverlap: 20,
      componentSpacing: 100,
    });

    layout.run();
  }, [cy, elements]);

  const stylesheet = [
    {
      selector: 'node',
      style: {
        'label': 'data(label)',
        'background-color': '#666',
        'color': '#fff',
        'text-valign': 'center',
        'text-halign': 'center',
        'width': 'mapData(weight, 1, 10, 20, 60)',
        'height': 'mapData(weight, 1, 10, 20, 60)',
        'font-size': '10px'
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': '#ccc',
        'target-arrow-color': '#ccc',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier'
      }
    }
  ];

  return (
    <div className="graph-container">
      <CytoscapeComponent
        elements={elements}
        style={{ width: '100%', height: '100%' }}
        stylesheet={stylesheet}
        layout={{ name: 'cose', animate: true }}
        cy={(cy) => {
          setCy(cy);
        }}
      />
    </div>
  );
};

export default Graph;
