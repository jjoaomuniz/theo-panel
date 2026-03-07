import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useForceSimulation } from '@/hooks/useForceSimulation';
import { useAPI } from '@/hooks/useAPI';
import { api } from '@/lib/api';
import { mockNodes, mockLinks } from '@/data/mockData';
import type { NeuralNode } from '@/types/neural';
import { CATEGORY_COLORS } from '@/types/neural';
import NeuralFilters from './NeuralFilters';
import NeuralLinkLine from './NeuralLink';
import NeuralNodeCircle from './NeuralNode';
import NeuralTooltip from './NeuralTooltip';

export default function NeuralGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);

  const { data: neuralData } = useAPI(
    api.neural,
    { nodes: mockNodes, links: mockLinks },
    { pollInterval: 30_000 }
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
        setContainerRect(container.getBoundingClientRect());
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const nodes = neuralData?.nodes ?? mockNodes;
  const links = neuralData?.links ?? mockLinks;

  const { simulatedNodes, simulatedLinks, dragStart, dragging, dragEnd } = useForceSimulation({
    nodes, links, width: dimensions.width, height: dimensions.height,
  });

  const connectionSet = useMemo(() => {
    const set = new Set<string>();
    const activeId = hoveredId ?? selectedId;
    if (!activeId) return set;
    const activeNode = nodes.find(n => n.id === activeId);
    if (activeNode) for (const connId of activeNode.connections) set.add(connId);
    return set;
  }, [hoveredId, selectedId, nodes]);

  const isLinkHighlighted = useCallback((link: { source: string | NeuralNode; target: string | NeuralNode }) => {
    const activeId = hoveredId ?? selectedId;
    if (!activeId) return false;
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;
    return sourceId === activeId || targetId === activeId;
  }, [hoveredId, selectedId]);

  const hoveredNode = hoveredId ? simulatedNodes.find(n => n.id === hoveredId) : null;

  // Particles — every other link
  const particles = useMemo(() => {
    return simulatedLinks
      .filter((_, i) => i % 2 === 0)
      .map((link, i) => {
        const source = link.source as NeuralNode;
        const color = CATEGORY_COLORS[source.category] ?? '#8b5cf6';
        return { link, speed: 2500 + i * 600, delay: i * 300, color };
      });
  }, [simulatedLinks]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0"
      >
        <NeuralFilters />

        {/* Ambient background */}
        <rect width={dimensions.width} height={dimensions.height} fill="url(#bg-gradient)" />

        {/* Subtle grid */}
        <rect width={dimensions.width} height={dimensions.height} fill="url(#grid)" opacity="0.5" />

        {/* Links */}
        <g>
          {simulatedLinks.map((link, i) => (
            <NeuralLinkLine key={i} link={link} highlighted={isLinkHighlighted(link)} />
          ))}
        </g>

        {/* Flowing particles along links */}
        <g>
          {particles.map(({ link, speed, delay, color }, i) => {
            const source = link.source as NeuralNode;
            const target = link.target as NeuralNode;
            if (!source.x || !source.y || !target.x || !target.y) return null;

            return (
              <g key={`particle-${i}`}>
                {/* Particle glow */}
                <circle r="3" fill={color} opacity="0">
                  <animateMotion
                    dur={`${speed}ms`} repeatCount="indefinite" begin={`${delay}ms`}
                    path={`M${source.x},${source.y} L${target.x},${target.y}`}
                  />
                  <animate attributeName="opacity" values="0;0.15;0.15;0" keyTimes="0;0.1;0.9;1" dur={`${speed}ms`} repeatCount="indefinite" begin={`${delay}ms`} />
                </circle>
                {/* Bright core */}
                <circle r="1.2" fill={color} opacity="0">
                  <animateMotion
                    dur={`${speed}ms`} repeatCount="indefinite" begin={`${delay}ms`}
                    path={`M${source.x},${source.y} L${target.x},${target.y}`}
                  />
                  <animate attributeName="opacity" values="0;0.6;0.6;0" keyTimes="0;0.1;0.9;1" dur={`${speed}ms`} repeatCount="indefinite" begin={`${delay}ms`} />
                </circle>
              </g>
            );
          })}
        </g>

        {/* Nodes */}
        <g>
          {simulatedNodes.map((node) => (
            <NeuralNodeCircle
              key={node.id}
              node={node}
              isHovered={hoveredId === node.id}
              isSelected={selectedId === node.id}
              isConnectedToHovered={connectionSet.has(node.id)}
              onHover={setHoveredId}
              onSelect={setSelectedId}
              onDragStart={dragStart}
              onDrag={dragging}
              onDragEnd={dragEnd}
            />
          ))}
        </g>

        {/* Vignette overlay for cinematic depth */}
        <rect width={dimensions.width} height={dimensions.height} fill="url(#vignette)" />
      </svg>

      {hoveredNode && <NeuralTooltip node={hoveredNode} containerRect={containerRect} />}
    </div>
  );
}
