import { useState } from 'react';
import { useAPI } from '@/hooks/useAPI';
import { api } from '@/lib/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

type Period = 'daily' | 'weekly' | 'monthly';

function PeriodToggle({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  return (
    <div className="flex items-center gap-1">
      {(['daily', 'weekly', 'monthly'] as Period[]).map(p => (
        <button key={p} onClick={() => onChange(p)} className={`period-pill ${value === p ? 'active' : ''}`}>
          {p === 'daily' ? 'Diário' : p === 'weekly' ? 'Semanal' : 'Mensal'}
        </button>
      ))}
    </div>
  );
}

export default function Costs() {
  const [period, setPeriod] = useState<Period>('daily');
  const { data: costData } = useAPI(api.costs, { daily: [], summary: { total: 0, average: 0, projection: 0 }, credits: null }, { pollInterval: 60_000 });

  const credits = costData?.credits;
  const summary = costData?.summary;
  const byModel = costData?.byModel ?? [];
  const history = costData?.history;

  const chartData = history?.[period] ?? [];
  const creditPct = credits && credits.total > 0 ? (credits.used / credits.total) * 100 : 0;
  const creditColor = creditPct < 70 ? '#34d399' : creditPct < 90 ? '#fbbf24' : '#f87171';

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 mesh-gradient">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-[11px] font-mono font-bold tracking-[0.2em] text-gradient">CUSTOS</h1>
        <div className="h-px flex-1 bg-gradient-to-r from-white/[0.05] to-transparent" />
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-text-muted">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-status-pulse" />
          OpenRouter API
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Total (período)', value: summary?.total ? `$${summary.total.toFixed(4)}` : '—', color: '#8b5cf6' },
          { label: 'Média Diária', value: summary?.average ? `$${summary.average.toFixed(4)}` : '—', color: '#22d3ee' },
          { label: 'Projeção Mensal', value: summary?.projection ? `$${summary.projection.toFixed(2)}` : '—', color: '#fbbf24' },
          { label: 'Saldo Restante', value: credits ? `$${credits.remaining.toFixed(2)}` : '—', color: creditColor },
        ].map(s => (
          <div key={s.label} className="bg-bg-card border border-white/[0.04] rounded-2xl p-4 relative overflow-hidden shimmer-top">
            <p className="text-[9px] font-mono uppercase tracking-widest text-text-muted mb-2">{s.label}</p>
            <p className="text-xl font-bold font-mono tabular-nums" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Credits detail */}
      {credits && (
        <div className="bg-bg-card border border-white/[0.04] rounded-2xl p-4 mb-4 relative overflow-hidden">
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-success/20 to-transparent" />
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-mono uppercase tracking-widest text-text-muted">Créditos OpenRouter</p>
            {credits.isFreeTier && (
              <span className="text-[8px] font-mono px-2 py-0.5 rounded-full border border-accent-cyan/20 text-accent-cyan/60">FREE TIER</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-[9px] font-mono mb-1.5">
                <span className="text-text-muted/60">Utilizado</span>
                <span style={{ color: creditColor }}>{creditPct.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${creditPct}%`, background: `linear-gradient(90deg, ${creditColor}66, ${creditColor})` }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono mt-1.5">
                <span className="text-text-muted/50">$0</span>
                <span className="text-text-muted/50">Total: <span className="text-text-secondary">${credits.total.toFixed(2)}</span></span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 shrink-0">
              <div className="text-center">
                <p className="text-[8px] font-mono text-text-muted/50 uppercase tracking-wider">Usado</p>
                <p className="text-sm font-mono tabular-nums font-bold text-error">${credits.used.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-[8px] font-mono text-text-muted/50 uppercase tracking-wider">Restante</p>
                <p className="text-sm font-mono tabular-nums font-bold" style={{ color: creditColor }}>${credits.remaining.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <p className="text-[9px] font-mono text-text-muted/40 mt-2">
            Histórico de depósitos não disponível via API pública do OpenRouter.
          </p>
        </div>
      )}

      {/* Per-model breakdown */}
      <div className="bg-bg-card border border-white/[0.04] rounded-2xl overflow-hidden mb-4 relative">
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-accent-purple/20 to-transparent" />
        <div className="px-4 py-3 border-b border-white/[0.03] flex items-center justify-between">
          <p className="text-[9px] font-mono uppercase tracking-widest text-text-muted">Custo por Modelo</p>
          <span className="text-[9px] font-mono text-text-muted/50">{byModel.length > 0 ? `${byModel.length} modelos` : 'Sem dados'}</span>
        </div>
        {byModel.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-[10px] font-mono text-text-muted">Sem dados de uso — OPENROUTER_API_KEY necessária</p>
          </div>
        ) : (
          <div>
            {byModel.map((m, i) => (
              <div key={m.model} className="data-row">
                <div className="w-5 text-[9px] font-mono text-text-muted/40 tabular-nums text-center shrink-0">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-mono text-text-primary truncate">{m.name}</p>
                  <p className="text-[8px] font-mono text-text-muted/40 truncate">{m.model}</p>
                </div>
                <div className="w-28 shrink-0">
                  <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-accent-purple/50" style={{ width: `${m.pct}%` }} />
                  </div>
                  <p className="text-[8px] font-mono text-text-muted/40 mt-0.5 text-right">{m.pct}%</p>
                </div>
                <div className="w-20 text-right shrink-0">
                  <p className="text-[11px] font-mono tabular-nums font-semibold text-text-secondary">${m.cost.toFixed(5)}</p>
                </div>
                <div className="w-24 text-right shrink-0 hidden sm:block">
                  <p className="text-[9px] font-mono text-text-muted/50">{m.tokens.toLocaleString()} tk</p>
                </div>
                <div className="w-16 text-right shrink-0 hidden sm:block">
                  <p className="text-[9px] font-mono text-text-muted/50">{m.requests} req</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History chart */}
      <div className="bg-bg-card border border-white/[0.04] rounded-2xl overflow-hidden relative">
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-accent-purple/20 to-transparent" />
        <div className="px-4 py-3 border-b border-white/[0.03] flex items-center justify-between">
          <p className="text-[9px] font-mono uppercase tracking-widest text-text-muted">Histórico de Consumo</p>
          <PeriodToggle value={period} onChange={setPeriod} />
        </div>
        <div className="p-4">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#475569', fontSize: 8, fontFamily: 'JetBrains Mono, monospace' }}
                  tickFormatter={(v: string) => period === 'monthly' ? v.slice(0, 7) : v.slice(5)}
                  tickLine={false} axisLine={false}
                />
                <YAxis
                  tick={{ fill: '#475569', fontSize: 8, fontFamily: 'JetBrains Mono, monospace' }}
                  tickLine={false} axisLine={false}
                  tickFormatter={(v: number) => `$${v.toFixed(3)}`}
                />
                <Tooltip
                  contentStyle={{ background: 'rgba(10,10,20,0.96)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, color: '#f1f5f9', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
                  formatter={(v: number | undefined) => [`$${(v ?? 0).toFixed(5)}`, 'Custo']}
                />
                <ReferenceLine y={3.5} stroke="#34d399" strokeDasharray="3 3" strokeOpacity={0.4} />
                <defs>
                  <linearGradient id="cg2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="cost" stroke="#22d3ee" fill="url(#cg2)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center gap-2">
              <span className="text-2xl opacity-20">📈</span>
              <p className="text-[10px] font-mono text-text-muted">Sem dados históricos disponíveis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
