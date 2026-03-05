import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useForceSimulation } from '@/hooks/useForceSimulation';
import { useAPI } from '@/hooks/useAPI';
import { api } from '@/lib/api';
import { mockNodes, mockLinks } from '@/data/mockData';
import type { NeuralNode } from '@/types/neural';
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

  // Fetch neural data from API (fallback to mock)
  const { data: neuralData } = useAPI(
    api.neural,
    { nodes: mockNodes, links: mockLinks },
    { pollInterval: 30_000 }
  );

  // Measure container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
        setContainerRect(container.getBoundingClientRect());
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const nodes = neuralData?.nodes ?? mockNodes;
  const links = neuralData?.links ?? mockLinks;

  const { simulatedNodes, simulatedLinks, dragStart, dragging, dragEnd } = useForceSimulation({
    nodes,
    links,
    width: dimensions.width,
    height: dimensions.height,
  });

  // Build connection set for highlight logic
  const connectionSet = useMemo(() => {
    const set = new Set<string>();
    const activeId = hoveredId ?? selectedId;
    if (!activeId) return set;

    const activeNode = nodes.find(n => n.id === activeId);
    if (activeNode) {
      for (const connId of activeNode.connections) {
        set.add(connId);
      }
    }
    return set;
  }, [hoveredId, selectedId]);

  const isLinkHighlighted = useCallback((link: { source: string | NeuralNode; target: string | NeuralNode }) => {
    const activeId = hoveredId ?? selectedId;
    if (!activeId) return false;
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;
    return sourceId === activeId || targetId === activeId;
  }, [hoveredId, selectedId]);

  // Hovered node for tooltip
  const hoveredNode = hoveredId ? simulatedNodes.find(n => n.id === hoveredId) : null;

  // Floating particles
  const particles = useMemo(() => {
    return simulatedLinks
      .filter((_, i) => i % 3 === 0)
      .map((link, i) => ({ link, speed: 3000 + i * 800, delay: i * 400 }));
  }, [simulatedLinks]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0"
      >
        <NeuralFilters />

        {/* Background gradient */}
        <rect
          width={dimensions.width}
          height={dimensions.height}
          fill="url(#bg-gradient)"
        />

        {/* Links */}
        <g>
          {simulatedLinks.map((link, i) => (
            <NeuralLinkLine
              key={i}
              link={link}
              highlighted={isLinkHighlighted(link)}
            />
          ))}
        </g>

        {/* Floating particles along links */}
        <g>
          {particles.map(({ link, speed, delay }, i) => {
            const source = link.source as NeuralNode;
            const target = link.target as NeuralNode;
            if (!source.x || !source.y || !target.x || !target.y) return null;

            return (
              <circle key={`particle-${i}`} r="1.5" fill="#06b6d4" opacity="0">
                <animateMotion
                  dur={`${speed}ms`}
                  repeatCount="indefinite"
                  begin={`${delay}ms`}
                  path={`M${source.x},${source.y} L${target.x},${target.y}`}
                />
                <animate
                  attributeName="opacity"
                  values="0;0.5;0.5;0"
                  keyTimes="0;0.1;0.9;1"
                  dur={`${speed}ms`}
                  repeatCount="indefinite"
                  begin={`${delay}ms`}
                />
              </circle>
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
      </svg>

      {/* Tooltip overlay */}
      {hoveredNode && (
        <NeuralTooltip node={hoveredNode} containerRect={containerRect} />
      )}
    </div>
  );
}
