import NeuralGraph from '@/components/neural/NeuralGraph';
import AgentCard from '@/components/agents/AgentCard';
import ActivityFeed from '@/components/activity/ActivityFeed';
import { useAPI } from '@/hooks/useAPI';
import { api } from '@/lib/api';
import { mockAgents, mockNodes, mockLinks } from '@/data/mockData';
import { CATEGORY_COLORS, CATEGORY_LABELS, type NodeCategory } from '@/types/neural';

export default function NeuralMap() {
  const { data: agents } = useAPI(api.agents, mockAgents, { pollInterval: 10_000 });
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

      {/* Overlay container — pointer-events none, children opt-in */}
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

        {/* Bottom row: Agent Cards + Activity Feed */}
        <div className="flex items-end gap-4">
          {/* Agent Cards */}
          <div className="pointer-events-auto flex gap-3 flex-1 max-w-[750px]">
            {(agents ?? []).map(agent => (
              <div key={agent.id} className="flex-1 min-w-0">
                <AgentCard agent={agent} />
              </div>
            ))}
          </div>

          {/* Activity Feed */}
          <div className="pointer-events-auto w-72 h-80 bg-bg-card/70 backdrop-blur-sm border border-border/50 rounded-xl p-3 flex flex-col">
            <h3 className="text-xs text-text-muted uppercase tracking-wider font-mono mb-2 shrink-0">
              Atividade Recente
            </h3>
            <div className="flex-1 overflow-hidden">
              <ActivityFeed compact />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
