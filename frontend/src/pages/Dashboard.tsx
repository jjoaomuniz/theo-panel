import { useAPI } from '@/hooks/useAPI';
import { api } from '@/lib/api';
import { mockAgents, mockDailyCosts } from '@/data/mockData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { data: agents } = useAPI(api.agents, mockAgents, { pollInterval: 10_000 });
  const { data: costData } = useAPI(api.costs, {
    daily: mockDailyCosts,
    summary: { total: mockDailyCosts.reduce((s, d) => s + d.total, 0), average: 0, projection: 0 },
    credits: null,
  }, { pollInterval: 60_000 });

  const dailyCosts = costData?.daily ?? mockDailyCosts;
  const activeAgents = (agents ?? []).filter(a => a.status === 'active' || a.status === 'executing').length;
  const totalAgents = (agents ?? []).length;
  const tokensToday = (agents ?? []).reduce((s, a) => s + a.tokensToday, 0);
  const monthlyCost = costData?.summary?.total ?? dailyCosts.reduce((s, d) => s + d.total, 0);

  const stats = [
    { label: 'Nos Neurais', value: '23', color: 'text-accent-purple' },
    { label: 'Agentes Ativos', value: `${activeAgents}/${totalAgents}`, color: 'text-success' },
    { label: 'Tokens Hoje', value: `${(tokensToday / 1000).toFixed(1)}k`, color: 'text-accent-cyan' },
    { label: 'Custo Mensal', value: `R$ ${monthlyCost.toFixed(0)}`, color: 'text-warning' },
  ];

  return (
    <div className="h-full overflow-y-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-bg-card border border-border rounded-xl p-5">
            <p className="text-xs text-text-muted uppercase tracking-wider">{stat.label}</p>
            <p className={`text-2xl font-bold mt-2 font-mono ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Cost Chart Preview */}
      <div className="bg-bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm text-text-secondary mb-4">Custo Diario (30 dias)</h2>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={dailyCosts}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v: string) => v.slice(5)} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: 8, color: '#e2e8f0' }} />
            <Area type="monotone" dataKey="total" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.15} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
