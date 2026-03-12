import { useState, useCallback } from 'react';
import { useAPI } from '@/hooks/useAPI';
import { api } from '@/lib/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import ActivityFeed from '@/components/activity/ActivityFeed';
import type { Agent } from '@/types/agents';

const DAILY_META = 3.50;

const MODEL_PRICE: Record<string, { in: number; out: number }> = {
  'gemini-2.5-pro':    { in: 1.25, out: 10.0 },
  'claude-sonnet-4-5': { in: 3.0,  out: 15.0 },
  'qwen3-235b-a22b':   { in: 0.13, out: 0.6  },
  'deepseek-r1':       { in: 0.55, out: 2.19 },
  'gemini-2.5-flash':  { in: 0.15, out: 0.6  },
  'kimi-k2.5':         { in: 0.14, out: 0.14 },
};

const AGENT_COLORS: Record<string, string> = {
  main: '#c9a84c', theo: '#c9a84c',
  bruno: '#00d4ff', leo: '#00ff88', marco: '#8b5cf6',
  carla: '#f472b6', rafael: '#fb923c',
  'salomao-onchain': '#fbbf24', joao: '#4ade80', argus: '#e879f9',
};

function getModelPrice(m: string) {
  for (const [k, p] of Object.entries(MODEL_PRICE)) if (m.includes(k)) return p;
  return { in: 0.5, out: 2.0 };
}
function estimateCost(a: Agent) {
  const p = getModelPrice(a.model);
  return a.tokensToday * (0.3 * p.in + 0.7 * p.out) / 1_000_000;
}
function shortModel(m: string) { return m.split('/').pop() ?? m; }

// ── Credit arc gauge ─────────────────────────────────────────
function CreditGauge({ remaining, total }: { remaining: number; total: number }) {
  const usedPct = total > 0 ? (total - remaining) / total : 0;
  const r = 52;
  const cx = 70, cy = 65;
  const startAngle = Math.PI;
  const endAngle = 0;
  const sweep = endAngle - startAngle; // -π to 0 = π range total
  const filledAngle = startAngle + sweep * usedPct; // goes from π toward 0 as used increases

  const toXY = (angle: number) => ({
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  });

  const bgStart = toXY(startAngle);
  const bgEnd   = toXY(endAngle);
  const fgEnd   = toXY(filledAngle);

  const bgPath = `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 0 1 ${bgEnd.x} ${bgEnd.y}`;
  const fgPath = usedPct > 0
    ? `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 0 1 ${fgEnd.x} ${fgEnd.y}`
    : '';

  const remainingPct = total > 0 ? (remaining / total) * 100 : 0;
  const gaugeColor = remainingPct > 30 ? '#34d399' : remainingPct > 10 ? '#fbbf24' : '#f87171';
  const isHealthy = remainingPct > 30;

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="72" viewBox="0 0 140 72" className={isHealthy ? 'gauge-healthy' : ''}>
        {/* Track */}
        <path d={bgPath} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" strokeLinecap="round" />
        {/* Fill */}
        {fgPath && (
          <path d={fgPath} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" strokeLinecap="round" />
        )}
        {/* Remaining arc (right portion = remaining) */}
        {usedPct < 1 && (
          <path
            d={`M ${fgEnd.x} ${fgEnd.y} A ${r} ${r} 0 0 1 ${bgEnd.x} ${bgEnd.y}`}
            fill="none"
            stroke={gaugeColor}
            strokeWidth="8"
            strokeLinecap="round"
          />
        )}
        {/* Center text */}
        <text x={cx} y={cy - 12} textAnchor="middle" fill={gaugeColor} fontSize="18" fontFamily="JetBrains Mono, monospace" fontWeight="700">
          ${remaining.toFixed(0)}
        </text>
        <text x={cx} y={cy + 4} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8" fontFamily="JetBrains Mono, monospace">
          RESTANTE
        </text>
      </svg>
      <div className="flex items-center justify-between w-full px-2 -mt-1">
        <span className="text-[8px] font-mono text-text-muted/50">usado ${(total - remaining).toFixed(2)}</span>
        <span className="text-[8px] font-mono text-text-muted/50">total ${total.toFixed(2)}</span>
      </div>
    </div>
  );
}

// ── Period toggle ─────────────────────────────────────────────
type Period = 'daily' | 'weekly' | 'monthly';

function PeriodToggle({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  return (
    <div className="flex items-center gap-1">
      {(['daily', 'weekly', 'monthly'] as Period[]).map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`period-pill ${value === p ? 'active' : ''}`}
        >
          {p === 'daily' ? 'Diário' : p === 'weekly' ? 'Semanal' : 'Mensal'}
        </button>
      ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function Dashboard() {
  const [period, setPeriod] = useState<Period>('daily');
  const [updatingModel, setUpdatingModel] = useState<string | null>(null);
  const [modelMsg, setModelMsg] = useState<{ id: string; ok: boolean } | null>(null);

  const { data: agents, refetch: refetchAgents } = useAPI(api.agents, [], { pollInterval: 15_000 });
  const { data: costData } = useAPI(api.costs, { daily: [], summary: { total: 0, average: 0, projection: 0 }, credits: null }, { pollInterval: 60_000 });
  const { data: availableModelsRaw } = useAPI(api.agentModels, [], {});
  const availableModels = availableModelsRaw ?? [];

  const liveAgents: Agent[] = agents ?? [];
  const totalDailyCost = liveAgents.reduce((s, a) => s + estimateCost(a), 0);
  const pct = Math.min((totalDailyCost / DAILY_META) * 100, 100);
  const barColor = pct >= 100 ? '#f87171' : pct >= 80 ? '#fbbf24' : '#34d399';

  const credits = costData?.credits;
  const byModel = costData?.byModel ?? [];
  const history = costData?.history;
  const chartData = history?.[period] ?? costData?.daily?.map(d => ({ date: d.date, cost: d.total })) ?? [];

  const handleModelChange = useCallback(async (agentId: string, newModel: string) => {
    setUpdatingModel(agentId);
    setModelMsg(null);
    try {
      await api.updateAgentModel(agentId, newModel);
      setModelMsg({ id: agentId, ok: true });
      await refetchAgents();
    } catch {
      setModelMsg({ id: agentId, ok: false });
    } finally {
      setUpdatingModel(null);
      setTimeout(() => setModelMsg(null), 2500);
    }
  }, [refetchAgents]);

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 mesh-gradient">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-[11px] font-mono font-bold tracking-[0.2em] text-gradient">DASHBOARD</h1>
        <div className="h-px flex-1 bg-gradient-to-r from-white/[0.05] to-transparent" />
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-text-muted">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-status-pulse" />
          live
        </div>
      </div>

      {/* ── Row 1: Meta + Credits ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-3 mb-3">

        {/* Meta vs custo */}
        <div className="bg-bg-card border border-white/[0.04] rounded-2xl p-5 relative overflow-hidden shimmer-top">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[9px] font-mono uppercase tracking-widest text-text-muted mb-1">Meta vs Custo Diário</p>
              <p className="text-[10px] font-mono text-text-muted/50">tokens reais × preço do modelo</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-mono text-text-muted uppercase tracking-widest mb-1">Cobertura</p>
              <p className="text-2xl font-bold font-mono tabular-nums" style={{ color: barColor }}>
                {liveAgents.length > 0 ? `${pct.toFixed(0)}%` : '—'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-black/20 rounded-xl p-3 border border-white/[0.03]">
              <p className="text-[9px] font-mono text-text-muted uppercase tracking-widest mb-2">Custo Hoje (Est.)</p>
              <p className="text-xl font-bold font-mono tabular-nums text-warning">
                ${totalDailyCost > 0 ? totalDailyCost.toFixed(4) : '—'}
                <span className="text-xs font-normal text-text-muted ml-0.5">/dia</span>
              </p>
              <p className="text-[9px] font-mono text-text-muted/60 mt-1">
                ${(totalDailyCost * 30).toFixed(2)}/mês proj.
              </p>
            </div>
            <div className="bg-black/20 rounded-xl p-3 border border-white/[0.03]">
              <p className="text-[9px] font-mono text-text-muted uppercase tracking-widest mb-2">Meta DeFi (Salomão)</p>
              <p className="text-xl font-bold font-mono tabular-nums text-success">
                $3.50<span className="text-xs font-normal text-text-muted ml-0.5">/dia</span>
              </p>
              <p className="text-[9px] font-mono text-text-muted/60 mt-1">$105.00/mês alvo</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[9px] font-mono text-text-muted/60 mb-1.5">
              <span>$0</span>
              {totalDailyCost > 0 && <span style={{ color: barColor }}>${totalDailyCost.toFixed(4)} atual</span>}
              <span className="text-success">$3.50 meta</span>
            </div>
            <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${barColor}66, ${barColor})` }}
              />
            </div>
            {totalDailyCost > 0 && (
              <p className="mt-1.5 text-[9px] font-mono text-text-muted/50">
                Margem <span className="text-success">${(DAILY_META - totalDailyCost).toFixed(4)}/dia</span>
                · {liveAgents.reduce((s, a) => s + a.tokensToday, 0).toLocaleString()} tokens hoje
              </p>
            )}
          </div>
        </div>

        {/* Credit balance */}
        <div className="bg-bg-card border border-white/[0.04] rounded-2xl p-4 relative overflow-hidden shimmer-top flex flex-col">
          <p className="text-[9px] font-mono uppercase tracking-widest text-text-muted mb-3">Saldo OpenRouter</p>
          {credits ? (
            <>
              <div className="flex-1 flex items-center justify-center">
                <CreditGauge remaining={credits.remaining} total={credits.total} />
              </div>
              <div className="mt-2 pt-2 border-t border-white/[0.03] grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[9px] font-mono text-text-muted/50 uppercase tracking-wider">Usado</p>
                  <p className="text-xs font-mono tabular-nums text-text-secondary">${credits.used.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-mono text-text-muted/50 uppercase tracking-wider">Total</p>
                  <p className="text-xs font-mono tabular-nums text-text-secondary">${credits.total.toFixed(2)}</p>
                </div>
              </div>
              {credits.isFreeTier && (
                <p className="mt-1.5 text-[9px] font-mono text-accent-cyan/60 text-center">free tier</p>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-4">
              <div className="w-12 h-12 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-xl">💳</div>
              <p className="text-[10px] font-mono text-text-muted text-center">Sem dados de crédito</p>
              <p className="text-[9px] font-mono text-text-muted/50 text-center">Configure OPENROUTER_API_KEY</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 2: Agent costs + LLM selector | Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-3 mb-3">

        {/* Agent costs + LLM selector */}
        <div className="bg-bg-card border border-white/[0.04] rounded-2xl overflow-hidden relative">
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-accent-purple/20 to-transparent" />
          <div className="px-4 py-3 border-b border-white/[0.03]">
            <p className="text-[9px] font-mono uppercase tracking-widest text-text-muted">Agentes — Custo Diário × Modelo LLM</p>
          </div>
          {liveAgents.length === 0 ? (
            <div className="py-10 text-center text-text-muted text-xs font-mono">Conectando ao gateway...</div>
          ) : (
            <div>
              {liveAgents.map(agent => {
                const agentKey = agent.id === 'main' ? 'theo' : agent.id;
                const color = AGENT_COLORS[agentKey] ?? '#8b5cf6';
                const cost = estimateCost(agent);
                const totalForBar = liveAgents.reduce((s, a) => s + estimateCost(a), 0);
                const costPct = totalForBar > 0 ? (cost / totalForBar) * 100 : 0;
                const isUpdating = updatingModel === agent.id;
                const msg = modelMsg?.id === agent.id ? modelMsg : null;

                return (
                  <div key={agent.id} className="data-row">
                    <span className="text-base shrink-0 w-5 text-center">{agent.emoji}</span>
                    <div className="w-16 shrink-0">
                      <p className="text-[11px] font-mono font-semibold leading-tight" style={{ color }}>{agent.name}</p>
                      <p className="text-[8px] font-mono text-text-muted/50 truncate">{agent.status === 'executing' || agent.status === 'active' ? '● ativo' : '○ idle'}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${costPct}%`, background: color + '88' }} />
                      </div>
                      <p className="text-[8px] font-mono text-text-muted/40 mt-0.5">{agent.tokensToday.toLocaleString()} tokens</p>
                    </div>
                    <div className="w-16 shrink-0 text-right">
                      <p className="text-[11px] font-mono tabular-nums text-text-secondary">${cost.toFixed(4)}</p>
                    </div>
                    <div className="shrink-0 flex items-center gap-1.5" style={{ minWidth: 180 }}>
                      <select
                        value={agent.model}
                        disabled={isUpdating || availableModels.length === 0}
                        onChange={e => handleModelChange(agent.id, e.target.value)}
                        className="flex-1 text-[9px] font-mono surface-inset rounded-lg px-2 py-1.5 outline-none focus:border-accent-purple/30 cursor-pointer disabled:opacity-40 transition-colors"
                        style={{ color: color + 'CC' }}
                      >
                        {availableModels.length === 0 ? (
                          <option value={agent.model}>{shortModel(agent.model)}</option>
                        ) : availableModels.map(m => (
                          <option key={m.id} value={m.id} style={{ background: '#0d0d16', color: '#f1f5f9' }}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                      {isUpdating && <div className="w-3 h-3 border border-accent-purple/60 border-t-transparent rounded-full animate-spin shrink-0" />}
                      {msg && <span className={`text-[8px] font-mono shrink-0 ${msg.ok ? 'text-success' : 'text-error'}`}>{msg.ok ? '✓' : '✗'}</span>}
                    </div>
                  </div>
                );
              })}
              <div className="data-row border-t border-white/[0.04]">
                <div className="flex-1" />
                <span className="text-[9px] font-mono text-text-muted uppercase tracking-widest">Total</span>
                <p className="text-sm font-bold font-mono tabular-nums text-warning w-16 text-right">${totalDailyCost.toFixed(4)}</p>
                <div style={{ minWidth: 180 }} />
              </div>
            </div>
          )}
        </div>

        {/* Activity */}
        <div className="bg-bg-card border border-white/[0.04] rounded-2xl overflow-hidden relative">
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-accent-cyan/20 to-transparent" />
          <div className="px-4 py-3 border-b border-white/[0.03]">
            <p className="text-[9px] font-mono uppercase tracking-widest text-text-muted">Log dos Agentes</p>
          </div>
          <div className="h-[300px] lg:h-[calc(100%-44px)] overflow-hidden">
            <ActivityFeed compact />
          </div>
        </div>
      </div>

      {/* ── Row 3: Per-model cost breakdown ── */}
      {byModel.length > 0 && (
        <div className="bg-bg-card border border-white/[0.04] rounded-2xl overflow-hidden mb-3 relative">
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-accent-cyan/15 to-transparent" />
          <div className="px-4 py-3 border-b border-white/[0.03] flex items-center justify-between">
            <p className="text-[9px] font-mono uppercase tracking-widest text-text-muted">Custo por Modelo — OpenRouter Real</p>
            <span className="text-[9px] font-mono text-text-muted/50">{byModel.length} modelos ativos</span>
          </div>
          <div>
            {byModel.map((m, i) => (
              <div key={m.model} className="data-row">
                <div className="w-4 text-[9px] font-mono text-text-muted/40 tabular-nums text-right shrink-0">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-mono text-text-secondary truncate">{m.name}</p>
                  <p className="text-[8px] font-mono text-text-muted/40 truncate">{m.model}</p>
                </div>
                <div className="w-32 shrink-0">
                  <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-accent-purple/60" style={{ width: `${m.pct}%` }} />
                  </div>
                </div>
                <div className="w-10 text-right shrink-0">
                  <p className="text-[9px] font-mono text-text-muted/60">{m.pct}%</p>
                </div>
                <div className="w-20 text-right shrink-0">
                  <p className="text-[11px] font-mono tabular-nums text-text-secondary">${m.cost.toFixed(4)}</p>
                </div>
                <div className="w-24 text-right shrink-0">
                  <p className="text-[9px] font-mono text-text-muted/50">{m.tokens.toLocaleString()} tk</p>
                </div>
                <div className="w-16 text-right shrink-0">
                  <p className="text-[9px] font-mono text-text-muted/50">{m.requests} req</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Row 4: Cost chart with period selector ── */}
      <div className="bg-bg-card border border-white/[0.04] rounded-2xl overflow-hidden relative">
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-accent-purple/20 to-transparent" />
        <div className="px-4 py-3 border-b border-white/[0.03] flex items-center justify-between">
          <div>
            <p className="text-[9px] font-mono uppercase tracking-widest text-text-muted">Histórico de Custo — OpenRouter API</p>
            {costData?.summary && costData.summary.total > 0 && (
              <p className="text-[9px] font-mono text-text-muted/50 mt-0.5">
                Total: <span className="text-text-secondary">${costData.summary.total.toFixed(4)}</span>
                · Média: <span className="text-text-secondary">${costData.summary.average.toFixed(4)}/dia</span>
                · Projeção: <span className="text-warning">${costData.summary.projection.toFixed(2)}/mês</span>
              </p>
            )}
          </div>
          <PeriodToggle value={period} onChange={setPeriod} />
        </div>
        <div className="p-4">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
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
                  tickFormatter={(v: number) => `$${v.toFixed(2)}`}
                />
                <Tooltip
                  contentStyle={{ background: 'rgba(10,10,20,0.96)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, color: '#f1f5f9', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
                  formatter={(v: number | undefined) => [`$${(v ?? 0).toFixed(5)}`, 'Custo']}
                />
                <ReferenceLine y={DAILY_META} stroke="#34d399" strokeDasharray="3 3" strokeOpacity={0.5} />
                <defs>
                  <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="cost" stroke="#8b5cf6" fill="url(#cg)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex flex-col items-center justify-center gap-2">
              <span className="text-xl opacity-30">📊</span>
              <p className="text-[10px] font-mono text-text-muted">Sem dados — configure OPENROUTER_API_KEY</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
