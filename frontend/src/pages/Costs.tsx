import { useAPI } from '@/hooks/useAPI';
import { api } from '@/lib/api';
import { mockDailyCosts, mockAgents } from '@/data/mockData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

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

  const agentCosts = (agents ?? []).map(a => ({
    name: a.name,
    tokens: a.tokensMonth,
    cost: +(a.tokensMonth * 0.000015).toFixed(2),
  }));

  return (
    <div className="h-full overflow-y-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Monitor de Custos</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <p className="text-xs text-text-muted uppercase">Total Mes</p>
          <p className="text-2xl font-bold mt-2 font-mono text-accent-purple">R$ {totalMonth.toFixed(2)}</p>
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <p className="text-xs text-text-muted uppercase">Media Diaria</p>
          <p className="text-2xl font-bold mt-2 font-mono text-accent-cyan">R$ {avgDay.toFixed(2)}</p>
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <p className="text-xs text-text-muted uppercase">Projecao Mes</p>
          <p className="text-2xl font-bold mt-2 font-mono text-warning">R$ {projection.toFixed(2)}</p>
        </div>
      </div>

      {/* Daily Chart */}
      <div className="bg-bg-card border border-border rounded-xl p-5 mb-6">
        <h2 className="text-sm text-text-secondary mb-4">Custo Diario por Agente</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={dailyCosts}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v: string) => v.slice(5)} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: 8, color: '#e2e8f0' }} />
            <Area type="monotone" dataKey="bruno" stackId="1" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.3} />
            <Area type="monotone" dataKey="leo" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
            <Area type="monotone" dataKey="marco" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Agent Breakdown */}
      <div className="bg-bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm text-text-secondary mb-4">Custo por Agente (Mes)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={agentCosts} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis dataKey="name" type="category" tick={{ fill: '#e2e8f0', fontSize: 12 }} width={60} />
            <Tooltip contentStyle={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: 8, color: '#e2e8f0' }} />
            <Bar dataKey="cost" fill="#7c3aed" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
