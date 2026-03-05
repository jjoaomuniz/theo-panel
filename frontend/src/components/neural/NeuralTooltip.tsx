import type { NeuralNode } from '@/types/neural';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/types/neural';

interface Props {
  node: NeuralNode;
  containerRect: DOMRect | null;
}

export default function NeuralTooltip({ node, containerRect }: Props) {
  if (!node.x || !node.y || !containerRect) return null;

  const color = CATEGORY_COLORS[node.category];

  // Position tooltip to avoid going off screen
  const tooltipWidth = 220;
  const tooltipHeight = 100;
  let left = node.x + 20;
  let top = node.y - 20;

  if (left + tooltipWidth > containerRect.width) {
    left = node.x - tooltipWidth - 10;
  }
  if (top + tooltipHeight > containerRect.height) {
    top = containerRect.height - tooltipHeight - 10;
  }
  if (top < 10) top = 10;

  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{ left, top }}
    >
      <div className="bg-bg-card/95 backdrop-blur-sm border border-border rounded-xl p-3 shadow-2xl min-w-[200px]">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-sm font-semibold">{node.label}</span>
        </div>

        {/* Category badge */}
        <div
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono mb-2"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {CATEGORY_LABELS[node.category]}
        </div>

        {/* Description */}
        <p className="text-xs text-text-secondary leading-relaxed">{node.description}</p>

        {/* Meta */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
          <span className="text-xs text-text-muted font-mono">
            {node.connections.length} conexoes
          </span>
          {node.learnedAt && (
            <span className="text-xs text-text-muted font-mono">
              {node.learnedAt}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
