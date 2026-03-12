import { useState, useEffect } from 'react';
import NeuralGraph from '@/components/neural/NeuralGraph';
import { useAPI } from '@/hooks/useAPI';
import { api } from '@/lib/api';
import { mockNodes, mockLinks } from '@/data/mockData';
import { CATEGORY_COLORS, CATEGORY_LABELS, type NodeCategory } from '@/types/neural';

export default function NeuralMap() {
  const { data: neuralData } = useAPI(
    api.neural,
    { nodes: mockNodes, links: mockLinks },
    { pollInterval: 30_000 }
  );

  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const nodeCount = neuralData?.nodes?.length ?? 0;
  const linkCount = neuralData?.links?.length ?? 0;
  const categories = neuralData?.nodes
    ? Object.entries(
        neuralData.nodes.reduce<Record<string, number>>((acc, n) => {
          acc[n.category] = (acc[n.category] ?? 0) + 1;
          return acc;
        }, {})
      )
    : [];

  return (
    <div className="relative w-full h-full overflow-hidden bg-bg-primary">
      {/* Neural Graph — full background */}
      <div className="absolute inset-0 z-0">
        <NeuralGraph />
      </div>

      {/* TOP HUD — unified mission-control bar */}
      <div
        className="absolute top-0 left-0 right-0 z-10 flex items-stretch border-b border-white/[0.03] animate-fade-in"
        style={{ background: 'rgba(6,6,11,0.90)', backdropFilter: 'blur(20px) saturate(1.2)' }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-2.5 border-r border-white/[0.03] shrink-0">
          <div className="relative shrink-0">
            <div className="w-2 h-2 rounded-full bg-accent-purple" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-accent-purple animate-pulse-ring" />
          </div>
          <span className="text-[11px] font-mono font-bold tracking-[0.22em] text-gradient whitespace-nowrap">
            NEURAL MAP
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 px-5 py-2.5 border-r border-white/[0.03] shrink-0 text-[10px] font-mono">
          <span className="text-text-secondary tabular-nums">
            {nodeCount}
            <span className="text-text-muted/40 ml-1">nós</span>
          </span>
          <span className="text-white/[0.07]">·</span>
          <span className="text-text-secondary tabular-nums">
            {linkCount}
            <span className="text-text-muted/40 ml-1">conexões</span>
          </span>
        </div>

        {/* Legend — fills remaining space */}
        <div className="flex items-center gap-5 px-5 py-2.5 flex-1 overflow-hidden">
          {(Object.entries(CATEGORY_COLORS) as [NodeCategory, string][]).map(([category, color]) => (
            <div key={category} className="flex items-center gap-2 shrink-0">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}55` }}
              />
              <span className="text-[9px] text-text-muted font-mono tracking-wide uppercase">
                {CATEGORY_LABELS[category]}
              </span>
            </div>
          ))}
        </div>

        {/* Clock + status */}
        <div className="flex items-center gap-3 px-5 py-2.5 border-l border-white/[0.03] shrink-0 text-[10px] font-mono text-text-muted">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-status-pulse" />
            <span>ONLINE</span>
          </div>
          <span className="text-white/[0.07]">·</span>
          <span className="tabular-nums">
            {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>

      {/* BOTTOM — category distribution strip */}
      {categories.length > 0 && (
        <div
          className="absolute bottom-0 left-0 right-0 z-10 flex items-center gap-4 px-5 py-2 border-t border-white/[0.03] animate-slide-up"
          style={{ background: 'rgba(6,6,11,0.80)', backdropFilter: 'blur(12px)' }}
        >
          <span className="text-[9px] font-mono text-text-muted/35 tracking-widest uppercase shrink-0">dist</span>
          <div className="w-px h-3 bg-white/[0.05] shrink-0" />
          {categories.map(([cat, count]) => {
            const color = CATEGORY_COLORS[cat as NodeCategory] ?? '#8b5cf6';
            return (
              <div key={cat} className="flex items-center gap-1.5 shrink-0">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[9px] font-mono text-text-secondary">
                  {CATEGORY_LABELS[cat as NodeCategory] ?? cat}
                </span>
                <span className="text-[9px] font-mono text-text-muted tabular-nums">{count}</span>
              </div>
            );
          })}
          <div className="flex-1" />
          <span className="text-[9px] font-mono text-text-muted/40 tabular-nums shrink-0">{nodeCount} total</span>
        </div>
      )}
    </div>
  );
}
