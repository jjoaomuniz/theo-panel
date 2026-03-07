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
  node, isHovered, isSelected, isConnectedToHovered,
  onHover, onSelect, onDragStart, onDrag, onDragEnd,
}: Props) {
  const dragRef = useRef(false);

  if (node.x == null || node.y == null) return null;

  const baseRadius = 6 + node.connections.length * 2.5;
  const radius = isHovered ? baseRadius * 1.4 : isSelected ? baseRadius * 1.2 : baseRadius;
  const color = CATEGORY_COLORS[node.category];
  const active = isHovered || isSelected;
  const dimmed = !active && !isConnectedToHovered;

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as SVGElement).setPointerCapture(e.pointerId);
    dragRef.current = false;
    onDragStart(node);
  }, [node, onDragStart]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!(e.target as SVGElement).hasPointerCapture(e.pointerId)) return;
    dragRef.current = true;
    const svg = (e.target as SVGElement).closest('svg');
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    onDrag(node, e.clientX - rect.left, e.clientY - rect.top);
  }, [node, onDrag]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    (e.target as SVGElement).releasePointerCapture(e.pointerId);
    onDragEnd(node);
    if (!dragRef.current) onSelect(isSelected ? null : node.id);
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
      {/* Animated ripple rings on hover/select */}
      {active && (
        <>
          <circle cx={node.x} cy={node.y} r={radius} fill="none" stroke={color} strokeWidth="1" opacity="0">
            <animate attributeName="r" from={String(radius)} to={String(radius * 3)} dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx={node.x} cy={node.y} r={radius} fill="none" stroke={color} strokeWidth="0.5" opacity="0">
            <animate attributeName="r" from={String(radius)} to={String(radius * 4.5)} dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.2" to="0" dur="3s" repeatCount="indefinite" />
          </circle>
        </>
      )}

      {/* Diffuse glow halo */}
      <circle
        cx={node.x} cy={node.y}
        r={radius + 10}
        fill={color}
        opacity={active ? 0.1 : isConnectedToHovered ? 0.04 : 0}
        style={{ transition: 'opacity 0.4s' }}
      />

      {/* Outer dashed ring */}
      <circle
        cx={node.x} cy={node.y}
        r={radius + 3}
        fill="none"
        stroke={color}
        strokeWidth={active ? 1.5 : isConnectedToHovered ? 0.8 : 0}
        opacity={active ? 0.5 : 0.2}
        strokeDasharray={active ? 'none' : '2 4'}
        style={{ transition: 'all 0.4s' }}
      />

      {/* Main body */}
      <circle
        cx={node.x} cy={node.y}
        r={radius}
        fill={color}
        opacity={dimmed ? 0.18 : active ? 1 : 0.6}
        filter={`url(#glow-${node.category})`}
        className="animate-node-birth"
        style={{ transition: 'opacity 0.4s, r 0.3s' }}
      />

      {/* Inner glow core */}
      <circle
        cx={node.x} cy={node.y}
        r={radius * 0.45}
        fill="white"
        opacity={dimmed ? 0.05 : active ? 0.55 : 0.2}
        style={{ transition: 'opacity 0.4s' }}
      />

      {/* Center bright dot */}
      <circle
        cx={node.x} cy={node.y}
        r={active ? 2 : 1}
        fill="white"
        opacity={dimmed ? 0.1 : 0.9}
        style={{ transition: 'all 0.3s' }}
      />

      {/* Label */}
      <text
        x={node.x} y={node.y + radius + 16}
        textAnchor="middle"
        fill="#f1f5f9"
        fontSize={active ? 11 : 9}
        fontFamily="'Inter', sans-serif"
        fontWeight={active ? 600 : 400}
        opacity={dimmed ? 0.1 : active ? 1 : isConnectedToHovered ? 0.65 : 0.35}
        style={{ transition: 'all 0.4s', pointerEvents: 'none', userSelect: 'none' }}
      >
        {node.label}
      </text>
      {/* Glowing text shadow on active */}
      {active && (
        <text
          x={node.x} y={node.y + radius + 16}
          textAnchor="middle"
          fill={color} fontSize={11}
          fontFamily="'Inter', sans-serif" fontWeight={600}
          opacity={0.12} filter="url(#glow-subtle)"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {node.label}
        </text>
      )}
    </g>
  );
}
