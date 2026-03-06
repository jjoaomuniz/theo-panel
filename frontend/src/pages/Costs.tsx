import { useAPI } from '@/hooks/useAPI';
import { api } from '@/lib/api';
import { mockDailyCosts, mockAgents } from '@/data/mockData';
import { formatBRL } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const AGENT_COLORS: Record<string, string> = {
  theo: '#f59e0b',   // amber/gold — orchestrator
  bruno: '#7c3aed',  // purple — CTO
  leo: '#06b6d4',    // cyan — CFO
  marco: '#22c55e',  // green — COO
};

export default function Costs() {
  const { data: costData } = useAPI(api.costs, {
    daily: mockDailyCosts,
    summary: {
      total: mockDailyCosts.reduce((s, d) => s + d.total, 0),
      average: mockDailyCosts.reduce((s, d) => s + d.total, 0) / 30,
      projection: mockDailyCosts.reduce((s, d) => s + d.total, 0),
    },
    credits: null,
  }, { pollInterval: 60_000 });

  const { data: agents } = useAPI(api.agents, mockAgents, { pollInterval: 30_000 });

  const dailyCosts = costData?.daily ?? mockDailyCosts;
  const totalMonth = costData?.summary?.total ?? dailyCosts.reduce((s, d) => s + d.total, 0);
  const avgDay = costData?.summary?.average ?? totalMonth / 30;
  const projection = costData?.summary?.projection ?? avgDay * 30;

  // Build per-agent cost breakdown including Theo
  const theoCost = +dailyCosts.reduce((s, d) => s + (d.theo ?? 0), 0).toFixed(2);
  const agentCosts = [
    { name: 'Theo', cost: theoCost, color: AGENT_COLORS.theo },
    ...(agents ?? []).map(a => ({
      name: a.name,
      cost: +(a.tokensMonth * 0.000015).toFixed(2),
      color: AGENT_COLORS[a.id] ?? '#64748b',
    })),
  ];

  return (
    <div className="h-full overflow-y-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Monitor de Custos</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <p className="text-xs text-text-muted uppercase">Total Mês</p>
          <p className="text-2xl font-bold mt-2 font-mono text-accent-purple">{formatBRL(totalMonth)}</p>
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <p className="text-xs text-text-muted uppercase">Média Diária</p>
          <p className="text-2xl font-bold mt-2 font-mono text-accent-cyan">{formatBRL(avgDay)}</p>
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <p className="text-xs text-text-muted uppercase">Projeção Mês</p>
          <p className="text-2xl font-bold mt-2 font-mono text-warning">{formatBRL(projection)}</p>
        </div>
      </div>

      {/* Daily Chart */}
      <div className="bg-bg-card border border-border rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm text-text-secondary">Custo Diário por Agente</h2>
          <div className="flex items-center gap-4">
            {Object.entries(AGENT_COLORS).map(([name, color]) => (
              <div key={name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-text-muted font-mono capitalize">{name}</span>
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={dailyCosts}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v: string) => v.slice(5)} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: 8, color: '#e2e8f0' }} />
            <Area type="monotone" dataKey="theo" stackId="1" stroke={AGENT_COLORS.theo} fill={AGENT_COLORS.theo} fillOpacity={0.3} />
            <Area type="monotone" dataKey="bruno" stackId="1" stroke={AGENT_COLORS.bruno} fill={AGENT_COLORS.bruno} fillOpacity={0.3} />
            <Area type="monotone" dataKey="leo" stackId="1" stroke={AGENT_COLORS.leo} fill={AGENT_COLORS.leo} fillOpacity={0.3} />
            <Area type="monotone" dataKey="marco" stackId="1" stroke={AGENT_COLORS.marco} fill={AGENT_COLORS.marco} fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Agent Breakdown */}
      <div className="bg-bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm text-text-secondary mb-4">Custo por Agente (Mês)</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={agentCosts} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis dataKey="name" type="category" tick={{ fill: '#e2e8f0', fontSize: 12 }} width={60} />
            <Tooltip contentStyle={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: 8, color: '#e2e8f0' }} />
            <Bar dataKey="cost" radius={[0, 4, 4, 0]}>
              {agentCosts.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
