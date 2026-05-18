import { useMemo, useState, useEffect } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import euler from 'cytoscape-euler';

// Register euler extension
cytoscape.use(euler);

const Graph = ({ 
  data, 
  onNodeClick, 
  edgeThickness = 1.0, 
  edgeOpacity = 0.3, 
  nodeSize = 1.0,
  nodeOpacity = 1.0,
  darkMode = false 
}) => {
  const [cy, setCy] = useState(null);

  const elements = useMemo(() => {
    // Gruvbox accent colors ranked by "energy"
    const colors = darkMode 
      ? ['#a89984', '#b8bb26', '#83a598', '#8ec07c', '#fabd2f', '#fe8019', '#d3869b'] // gray -> green -> blue -> aqua -> yellow -> orange -> purple
      : ['#7c6f64', '#98971a', '#458588', '#689d6a', '#d79921', '#af3a03', '#b16286'];

    const nodes = data.nodes.map((node) => {
      const weight = (node.backlinks_count || 0);
      // Map weight to color index: 0->0, 1->1, 2->2, 3->3, 4->4, 5->5, 6+ -> 6
      const colorIndex = Math.min(weight, colors.length - 1);
      
      return {
        data: { 
          id: node.id, 
          label: node.label,
          weight: weight + 1,
          color: colors[colorIndex]
        }
      };
    });

    const edges = data.edges.map((edge, index) => ({
      data: { 
        id: `e${index}`,
        source: edge.source, 
        target: edge.target 
      }
    }));

    return [...nodes, ...edges];
  }, [data, darkMode]);

  const stylesheet = useMemo(() => {
    const nodeColor = darkMode ? '#ebdbb2' : '#3c3836';
    const edgeColor = darkMode ? '#928374' : '#a89984';
    const activeColor = darkMode ? '#fe8019' : '#af3a03';
    const borderColor = darkMode ? '#1d2021' : '#f9f5d7';
    const hoverEdgeColor = darkMode ? '#fabd2f' : '#d79921'; // Bright Yellow/Gold for hover visibility

    return [
      {
        selector: 'node',
        style: {
          'label': 'data(label)',
          'background-color': 'data(color)',
          'color': nodeColor,
          'text-valign': 'bottom',
          'text-halign': 'center',
          'text-margin-y': '4px',
          'width': el => (Math.sqrt(el.data('weight')) * 8 + 4) * nodeSize,
          'height': el => (Math.sqrt(el.data('weight')) * 8 + 4) * nodeSize,
          'opacity': nodeOpacity,
          'font-size': '10px',
          'min-zoomed-font-size': '40px',
          'font-family': "'JetBrains Mono', 'Fira Code', monospace",
          'text-opacity': 1,
          'overlay-padding': '6px',
          'z-index': 10,
          'border-width': 1,
          'border-color': borderColor,
          'border-opacity': 0.8,
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
          'opacity': 1,
          'min-zoomed-font-size': '0px',
          'z-index': 100
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
          'target-arrow-shape': 'triangle', // Add arrows back since we're using bezier
          'arrow-scale': 0.6,
          'curve-style': 'bezier', // Better visual support than haystack
          'opacity': edgeOpacity,
          'z-index': 1
        }
      },
      {
        selector: 'edge:selected',
        style: {
          'width': edgeThickness * 2,
          'line-color': activeColor,
          'target-arrow-color': activeColor,
          'opacity': Math.min(edgeOpacity * 2.5, 1.0),
          'z-index': 2
        }
      },
      {
        selector: 'edge.hover',
        style: {
          'line-color': hoverEdgeColor,
          'target-arrow-color': hoverEdgeColor,
          'opacity': 1.0,
          'width': Math.max(edgeThickness * 2, 2.0),
          'z-index': 3
        }
      }
    ];
  }, [edgeThickness, edgeOpacity, nodeSize, nodeOpacity, darkMode]);

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
    const handleMouseOverNode = (evt) => {
      const node = evt.target;
      node.style({
        'text-opacity': 1,
        'font-size': '12px',
        'min-zoomed-font-size': '0px', // Show label on hover regardless of zoom
        'opacity': 1
      });
      node.connectedEdges().addClass('hover');
    };

    const handleMouseOutNode = (evt) => {
      const node = evt.target;
      node.removeStyle();
      node.connectedEdges().removeClass('hover');
    };

    const handleMouseOverEdge = (evt) => {
      evt.target.addClass('hover');
    };

    const handleMouseOutEdge = (evt) => {
      evt.target.removeClass('hover');
    };

    cy.on('mouseover', 'node', handleMouseOverNode);
    cy.on('mouseout', 'node', handleMouseOutNode);
    cy.on('mouseover', 'edge', handleMouseOverEdge);
    cy.on('mouseout', 'edge', handleMouseOutEdge);

    return () => {
      cy.off('mouseover', 'node', handleMouseOverNode);
      cy.off('mouseout', 'node', handleMouseOutNode);
      cy.off('mouseover', 'edge', handleMouseOverEdge);
      cy.off('mouseout', 'edge', handleMouseOutEdge);
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
