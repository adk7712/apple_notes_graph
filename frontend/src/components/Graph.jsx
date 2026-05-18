import { useMemo, useState, useEffect } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import euler from 'cytoscape-euler';

// Register euler extension
cytoscape.use(euler);

const Graph = ({ data, onNodeClick, edgeThickness = 1.0, edgeOpacity = 0.3, darkMode = false }) => {
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

  const stylesheet = useMemo(() => {
    const nodeColor = darkMode ? '#cccccc' : '#555555';
    const nodeBg = darkMode ? '#666666' : '#999999';
    const edgeColor = darkMode ? '#888888' : '#666666';
    const activeColor = darkMode ? '#0a84ff' : '#0071e3';
    const borderColor = darkMode ? '#121212' : '#ffffff';

    return [
      {
        selector: 'node',
        style: {
          'label': 'data(label)',
          'background-color': nodeBg,
          'color': nodeColor,
          'text-valign': 'bottom',
          'text-halign': 'center',
          'text-margin-y': '4px',
          'width': 'mapData(weight, 1, 10, 6, 24)',
          'height': 'mapData(weight, 1, 10, 6, 24)',
          'font-size': '10px',
          'min-zoomed-font-size': '40px',
          'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          'text-opacity': 1,
          'overlay-padding': '6px',
          'z-index': 10,
          'border-width': 1,
          'border-color': borderColor,
          'border-opacity': 0.5,
          'text-wrap': 'ellipsis',
          'text-max-width': '80px'
        }
      },
      {
        selector: 'node:selected',
        style: {
          'background-color': activeColor,
          'text-opacity': 1,
          'font-weight': 'bold',
          'font-size': '12px',
          'border-width': 2,
          'border-color': activeColor,
          'border-opacity': 1,
          'min-zoomed-font-size': '0px'
        }
      },
      {
        selector: 'node:active',
        style: {
          'overlay-color': activeColor,
          'overlay-opacity': 0.1,
          'overlay-padding': '8px'
        }
      },
      {
        selector: 'edge',
        style: {
          'width': edgeThickness,
          'line-color': edgeColor,
          'target-arrow-color': edgeColor,
          'target-arrow-shape': 'none',
          'curve-style': 'haystack',
          'haystack-radius': 0,
          'opacity': edgeOpacity,
          'z-index': 1
        }
      },
      {
        selector: 'edge:selected',
        style: {
          'width': edgeThickness * 2,
          'line-color': activeColor,
          'opacity': Math.min(edgeOpacity * 2.5, 1.0)
        }
      },
      {
        selector: 'node[weight > 2]',
        style: {
          'background-color': darkMode ? '#888888' : '#666666',
          'font-size': '10px',
          'text-opacity': 1,
          'min-zoomed-font-size': '40px'
        }
      },
      {
        selector: 'node[weight > 5]',
        style: {
          'background-color': darkMode ? '#aaaaaa' : '#444444',
          'font-size': '12px',
          'text-opacity': 1,
          'min-zoomed-font-size': '40px'
        }
      }
    ];
  }, [edgeThickness, edgeOpacity, darkMode]);

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

    console.log(`Rendering graph with ${elements.length} elements using euler`);

    const layout = cy.layout({
      name: 'euler',
      
      // Spring physics simulation parameters
      mass: node => node.data('weight') * 1.5 + 1,
      drag: 0.4, // Increased drag for "viscosity" to prevent jitter
      springCoeff: () => 0.0005, // Softer springs
      springLength: () => 100, // Longer edges
      theta: 0.66,
      gravity: -1.0, // Reduced repulsion for stability
      pull: 0.005, // Pull to center for circularity
      
      // Animation parameters
      timeStep: 10, // Smaller timeStep for more stable simulation
      infinite: true, // Keep the simulation "alive" for fluidity
      randomize: false, // Prevent jumping on subsequent updates
      ungrabifyWhileSimulating: false,
      fit: false,
      padding: 50,
      animate: true,
      
      // Stop condition
      maxIterations: 1000,
      maxTime: 4000
    });

    layout.run();
    cy.fit(elements, 50);

    return () => layout.stop();
  }, [cy, elements]);

  useEffect(() => {
    if (!cy) return;

    // Mouse over/out effects for better interactivity
    const handleMouseOver = (evt) => {
      const node = evt.target;
      node.style({
        'text-opacity': 1,
        'font-size': '12px',
        'min-zoomed-font-size': '0px', // Show label on hover regardless of zoom
        'background-color': '#333'
      });
      node.connectedEdges().style({
        'opacity': 0.8,
        'width': 1.5,
        'line-color': '#999'
      });
    };

    const handleMouseOut = (evt) => {
      const node = evt.target;
      // Revert to original style by removing overrides
      node.removeStyle();
      node.connectedEdges().removeStyle();
    };

    cy.on('mouseover', 'node', handleMouseOver);
    cy.on('mouseout', 'node', handleMouseOut);

    return () => {
      cy.off('mouseover', 'node', handleMouseOver);
      cy.off('mouseout', 'node', handleMouseOut);
    };
  }, [cy]);

  return (
    <div className="graph-container">
      <CytoscapeComponent
        elements={elements}
        style={{ width: '100%', height: '100%' }}
        stylesheet={stylesheet}
        layout={{ name: 'preset' }}
        cy={(cy) => {
          setCy(cy);
        }}
        userZoomingEnabled={true}
        userPanningEnabled={true}
        boxSelectionEnabled={true}
        wheelSensitivity={0.5}
      />
    </div>

  );
};

export default Graph;
