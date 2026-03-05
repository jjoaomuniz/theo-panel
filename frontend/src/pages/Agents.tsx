import { useAPI } from '@/hooks/useAPI';
import { api } from '@/lib/api';
import { mockAgents } from '@/data/mockData';
import AgentCard from '@/components/agents/AgentCard';

export default function Agents() {
  const { data: agents } = useAPI(api.agents, mockAgents, { pollInterval: 10_000 });

  return (
    <div className="h-full overflow-y-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Subagentes</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {(agents ?? []).map((agent) => (
          <AgentCard key={agent.id} agent={agent} expanded />
        ))}
      </div>
    </div>
  );
}
