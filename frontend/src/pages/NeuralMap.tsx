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

      {/* Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-5">

        {/* Top bar */}
        <div className="flex items-start justify-between">
          {/* Title + stats */}
          <div className="pointer-events-auto animate-fade-in">
            <div className="glass rounded-2xl px-5 py-3.5">
              <div className="flex items-center gap-3 mb-1">
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent-purple" />
                  <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-accent-purple animate-pulse-ring" />
                </div>
                <h1 className="text-base font-semibold tracking-wide text-gradient">NEURAL MAP</h1>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-text-muted font-mono">
                <span>{nodeCount} nos</span>
                <span className="text-white/10">|</span>
                <span>{linkCount} conexoes</span>
                <span className="text-white/10">|</span>
                <span>{time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="pointer-events-auto animate-fade-in">
            <div className="glass rounded-2xl px-4 py-3 flex items-center gap-5">
              {(Object.entries(CATEGORY_COLORS) as [NodeCategory, string][]).map(([category, color]) => (
                <div key={category} className="flex items-center gap-2 group">
                  <div className="w-2 h-2 rounded-full transition-transform group-hover:scale-150" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}40` }} />
                  <span className="text-[10px] text-text-secondary font-mono tracking-wide uppercase">{CATEGORY_LABELS[category]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom stats bar */}
        <div className="flex items-end justify-between">
          {/* Category breakdown */}
          {categories.length > 0 && (
            <div className="pointer-events-auto animate-slide-up">
              <div className="glass rounded-2xl px-4 py-3 flex items-center gap-5">
                {categories.map(([cat, count]) => {
                  const color = CATEGORY_COLORS[cat as NodeCategory] ?? '#8b5cf6';
                  return (
                    <div key={cat} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-xs font-mono text-text-secondary">{count}</span>
                    </div>
                  );
                })}
                <div className="h-3 w-px bg-white/5" />
                <span className="text-[10px] font-mono text-text-muted">{nodeCount} total</span>
              </div>
            </div>
          )}

          {/* System status */}
          <div className="pointer-events-auto animate-slide-up">
            <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-status-pulse" />
                <span className="text-[10px] font-mono text-text-muted">ONLINE</span>
              </div>
              <div className="h-3 w-px bg-white/5" />
              <span className="text-[10px] font-mono text-text-muted">THEO v1.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
