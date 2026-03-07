import type { NeuralNode } from '@/types/neural';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/types/neural';

interface Props {
  node: NeuralNode;
  containerRect: DOMRect | null;
}

export default function NeuralTooltip({ node, containerRect }: Props) {
  if (!node.x || !node.y || !containerRect) return null;

  const color = CATEGORY_COLORS[node.category];

  const tooltipWidth = 240;
  const tooltipHeight = 120;
  let left = node.x + 24;
  let top = node.y - 24;

  if (left + tooltipWidth > containerRect.width) left = node.x - tooltipWidth - 14;
  if (top + tooltipHeight > containerRect.height) top = containerRect.height - tooltipHeight - 14;
  if (top < 14) top = 14;

  return (
    <div className="absolute pointer-events-none z-50 animate-fade-in" style={{ left, top }}>
      <div className="glass rounded-2xl p-4 shadow-2xl min-w-[220px]" style={{ borderColor: `${color}20` }}>
        {/* Accent bar */}
        <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full" style={{ background: `linear-gradient(90deg, ${color}60, transparent)` }} />

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}40` }} />
          <span className="text-sm font-semibold text-text-primary">{node.label}</span>
        </div>

        {/* Category badge */}
        <div
          className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium tracking-wide uppercase mb-2.5"
          style={{ backgroundColor: `${color}12`, color, border: `1px solid ${color}20` }}
        >
          {CATEGORY_LABELS[node.category]}
        </div>

        {/* Description */}
        <p className="text-xs text-text-secondary leading-relaxed">{node.description}</p>

        {/* Meta */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5">
          <span className="text-[10px] text-text-muted font-mono">
            {node.connections.length} conexoes
          </span>
          {node.learnedAt && (
            <span className="text-[10px] text-text-muted font-mono">
              {node.learnedAt}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
