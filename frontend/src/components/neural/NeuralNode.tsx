import { useRef, useCallback } from 'react';
import type { NeuralNode as NeuralNodeType } from '@/types/neural';
import { CATEGORY_COLORS } from '@/types/neural';

interface Props {
  node: NeuralNodeType;
  isHovered: boolean;
  isSelected: boolean;
  isConnectedToHovered: boolean;
  onHover: (nodeId: string | null) => void;
  onSelect: (nodeId: string | null) => void;
  onDragStart: (node: NeuralNodeType) => void;
  onDrag: (node: NeuralNodeType, x: number, y: number) => void;
  onDragEnd: (node: NeuralNodeType) => void;
}

export default function NeuralNodeCircle({
  node,
  isHovered,
  isSelected,
  isConnectedToHovered,
  onHover,
  onSelect,
  onDragStart,
  onDrag,
  onDragEnd,
}: Props) {
  const dragRef = useRef(false);
  const offsetRef = useRef({ x: 0, y: 0 });

  if (node.x == null || node.y == null) return null;

  const baseRadius = 8 + node.connections.length * 2.5;
  const radius = isHovered ? baseRadius * 1.3 : baseRadius;
  const color = CATEGORY_COLORS[node.category];
  const dimmed = !isHovered && !isSelected && !isConnectedToHovered;

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as SVGElement).setPointerCapture(e.pointerId);
    dragRef.current = false;
    offsetRef.current = { x: e.clientX - (node.x ?? 0), y: e.clientY - (node.y ?? 0) };
    onDragStart(node);
  }, [node, onDragStart]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!(e.target as SVGElement).hasPointerCapture(e.pointerId)) return;
    dragRef.current = true;

    // Get the SVG element and its transform
    const svg = (e.target as SVGElement).closest('svg');
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    onDrag(node, x, y);
  }, [node, onDrag]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    (e.target as SVGElement).releasePointerCapture(e.pointerId);
    onDragEnd(node);
    if (!dragRef.current) {
      onSelect(isSelected ? null : node.id);
    }
  }, [node, isSelected, onSelect, onDragEnd]);

  return (
    <g
      onPointerEnter={() => onHover(node.id)}
      onPointerLeave={() => onHover(null)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ cursor: 'grab', touchAction: 'none' }}
    >
      {/* Outer glow ring */}
      <circle
        cx={node.x}
        cy={node.y}
        r={radius + 4}
        fill="none"
        stroke={color}
        strokeWidth={isHovered || isSelected ? 1.5 : 0}
        opacity={isHovered || isSelected ? 0.3 : 0}
        style={{ transition: 'opacity 0.3s, stroke-width 0.3s' }}
      />

      {/* Main circle */}
      <circle
        cx={node.x}
        cy={node.y}
        r={radius}
        fill={color}
        opacity={dimmed ? 0.25 : isHovered || isSelected ? 1 : 0.75}
        filter={`url(#glow-${node.category})`}
        className="animate-node-birth"
        style={{ transition: 'opacity 0.3s, r 0.2s' }}
      />

      {/* Inner bright core */}
      <circle
        cx={node.x}
        cy={node.y}
        r={radius * 0.35}
        fill="white"
        opacity={dimmed ? 0.1 : 0.4}
        style={{ transition: 'opacity 0.3s' }}
      />

      {/* Label */}
      <text
        x={node.x}
        y={node.y + radius + 14}
        textAnchor="middle"
        fill="#e2e8f0"
        fontSize={isHovered || isSelected ? 11 : 9}
        fontFamily="'Inter', sans-serif"
        fontWeight={isHovered || isSelected ? 600 : 400}
        opacity={dimmed ? 0.2 : isHovered || isSelected || isConnectedToHovered ? 0.9 : 0.5}
        style={{ transition: 'opacity 0.3s, font-size 0.2s', pointerEvents: 'none', userSelect: 'none' }}
      >
        {node.label}
      </text>
    </g>
  );
}
