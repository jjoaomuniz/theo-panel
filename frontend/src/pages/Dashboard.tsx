import { useAPI } from '@/hooks/useAPI';
import { api } from '@/lib/api';
import { formatTokens, formatBRL } from '@/lib/utils';
import { mockAgents, mockDailyCosts } from '@/data/mockData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AgentCard from '@/components/agents/AgentCard';
import ActivityFeed from '@/components/activity/ActivityFeed';

export default function Dashboard() {
  const { data: agents } = useAPI(api.agents, mockAgents, { pollInterval: 10_000 });
  const { data: costData } = useAPI(api.costs, {
    daily: mockDailyCosts,
    summary: { total: mockDailyCosts.reduce((s, d) => s + d.total, 0), average: 0, projection: 0 },
    credits: null,
  }, { pollInterval: 60_000 });
  const { data: neuralData } = useAPI(api.neural, null, { pollInterval: 30_000 });

  const dailyCosts = costData?.daily ?? mockDailyCosts;
  const activeAgents = (agents ?? []).filter(a => a.status === 'active' || a.status === 'executing').length;
  const totalAgents = (agents ?? []).length;
  const tokensToday = (agents ?? []).reduce((s, a) => s + a.tokensToday, 0);
  const monthlyCost = costData?.summary?.total ?? dailyCosts.reduce((s, d) => s + d.total, 0);
  const nodeCount = neuralData?.nodes?.length ?? 0;

  const stats = [
    { label: 'Nos Neurais', value: nodeCount > 0 ? String(nodeCount) : '\u2014', color: 'text-accent-purple', glow: 'glow-purple' },
    { label: 'Agentes Ativos', value: `${activeAgents}/${totalAgents}`, color: 'text-success', glow: '' },
    { label: 'Tokens Hoje', value: formatTokens(tokensToday), color: 'text-accent-cyan', glow: 'glow-cyan' },
    { label: 'Custo Mensal', value: formatBRL(monthlyCost, 0), color: 'text-warning', glow: '' },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 mesh-gradient">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold tracking-wide">Dashboard</h1>
        <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent" />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className={`bg-bg-card border border-white/[0.04] rounded-2xl p-5 card-hover relative overflow-hidden ${stat.glow}`}>
            <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            <p className="text-[10px] text-text-muted uppercase tracking-widest font-mono">{stat.label}</p>
            <p className={`text-2xl font-bold mt-2 font-mono ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Agent Cards + Activity Feed */}
      <div className="grid grid-cols-[1fr_300px] gap-3 mb-6">
        <div className="grid grid-cols-3 gap-3">
          {(agents ?? []).map(agent => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>

        <div className="bg-bg-card border border-white/[0.04] rounded-2xl p-4 flex flex-col max-h-[340px] relative overflow-hidden">
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-accent-cyan/20 to-transparent" />
          <h3 className="text-[10px] text-text-muted uppercase tracking-widest font-mono mb-3 shrink-0">
            Atividade Recente
          </h3>
          <div className="flex-1 overflow-hidden">
            <ActivityFeed compact />
          </div>
        </div>
      </div>

      {/* Cost Chart */}
      <div className="bg-bg-card border border-white/[0.04] rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-accent-purple/20 to-transparent" />
        <h2 className="text-xs text-text-secondary mb-4 font-medium">Custo Diario (30 dias)</h2>
        {dailyCosts.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailyCosts}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
              <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 9 }} tickFormatter={(v: string) => v.slice(5)} />
              <YAxis tick={{ fill: '#475569', fontSize: 9 }} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(13,13,22,0.95)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 12,
                  color: '#f1f5f9',
                  backdropFilter: 'blur(8px)',
                }}
              />
              <Area type="monotone" dataKey="total" stroke="#8b5cf6" fill="url(#chart-gradient)" strokeWidth={2} />
              <defs>
                <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-text-muted text-xs">
            Sem dados de custo disponiveis
          </div>
        )}
      </div>
    </div>
  );
}
