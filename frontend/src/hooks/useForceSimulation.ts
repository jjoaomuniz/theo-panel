import { useEffect, useRef, useState, useCallback } from 'react';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY,
  type Simulation,
} from 'd3-force';
import type { NeuralNode, NeuralLink } from '@/types/neural';

interface UseForceSimulationProps {
  nodes: NeuralNode[];
  links: NeuralLink[];
  width: number;
  height: number;
}

interface SimulationState {
  nodes: NeuralNode[];
  links: NeuralLink[];
}

export function useForceSimulation({ nodes, links, width, height }: UseForceSimulationProps) {
  const simulationRef = useRef<Simulation<NeuralNode, NeuralLink> | null>(null);
  const [state, setState] = useState<SimulationState>({ nodes: [], links: [] });

  useEffect(() => {
    if (width === 0 || height === 0 || nodes.length === 0) return;

    const nodesCopy = nodes.map(n => ({ ...n }));
    const linksCopy = links.map(l => ({ ...l }));

    const simulation = forceSimulation<NeuralNode>(nodesCopy)
      .force('link', forceLink<NeuralNode, NeuralLink>(linksCopy)
        .id(d => d.id)
        .distance(100)
        .strength(0.3)
      )
      .force('charge', forceManyBody<NeuralNode>()
        .strength(d => -120 - (d.connections.length * 15))
      )
      .force('center', forceCenter(width / 2, height / 2).strength(0.05))
      .force('collide', forceCollide<NeuralNode>()
        .radius(d => 12 + d.connections.length * 3)
        .strength(0.7)
      )
      .force('x', forceX(width / 2).strength(0.03))
      .force('y', forceY(height / 2).strength(0.03))
      .alphaDecay(0.02)
      .velocityDecay(0.3);

    simulation.on('tick', () => {
      setState({
        nodes: [...nodesCopy],
        links: [...linksCopy],
      });
    });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
      simulationRef.current = null;
    };
  }, [nodes, links, width, height]);

  const reheat = useCallback((alpha = 0.3) => {
    simulationRef.current?.alpha(alpha).restart();
  }, []);

  const dragStart = useCallback((node: NeuralNode) => {
    simulationRef.current?.alphaTarget(0.3).restart();
    node.fx = node.x;
    node.fy = node.y;
  }, []);

  const dragging = useCallback((node: NeuralNode, x: number, y: number) => {
    node.fx = x;
    node.fy = y;
  }, []);

  const dragEnd = useCallback((node: NeuralNode) => {
    simulationRef.current?.alphaTarget(0);
    node.fx = null;
    node.fy = null;
  }, []);

  return {
    simulatedNodes: state.nodes,
    simulatedLinks: state.links,
    simulation: simulationRef,
    reheat,
    dragStart,
    dragging,
    dragEnd,
  };
}
