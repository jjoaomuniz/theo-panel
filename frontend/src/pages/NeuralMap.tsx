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

  const nodeCount = neuralData?.nodes?.length ?? 0;
  const linkCount = neuralData?.links?.length ?? 0;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Neural Graph — full background */}
      <div className="absolute inset-0 z-0">
        <NeuralGraph />
      </div>

      {/* Overlay container */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4">

        {/* Top row: Title + Legend */}
        <div className="flex items-start justify-between">
          {/* Title */}
          <div className="pointer-events-auto">
            <h1 className="text-lg font-semibold text-text-primary/80">Neural Map</h1>
            <p className="text-xs text-text-muted font-mono">{nodeCount} nos | {linkCount} conexoes</p>
          </div>

          {/* Legend */}
          <div className="pointer-events-auto bg-bg-card/70 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-2.5 flex items-center gap-4">
            {(Object.entries(CATEGORY_COLORS) as [NodeCategory, string][]).map(([category, color]) => (
              <div key={category} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-text-secondary">{CATEGORY_LABELS[category]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
