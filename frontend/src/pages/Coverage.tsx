import TheoRadarChart from '@/components/coverage/TheoRadarChart';

interface GapItem {
  dimension: string;
  potential: number;
  real: number;
  agent: string;
  icon: string;
  action: string;
}

const potentialData: Record<string, number> = {
  Financeiro: 0.9,
  Projetos: 0.85,
  Família: 1.0,
  'Infra & Tech': 0.9,
  Automações: 0.8,
  Memória: 0.75,
  Comunicação: 0.85,
  Estratégia: 0.7,
};

const realData: Record<string, number> = {
  Financeiro: 0.3,
  Projetos: 0.4,
  Família: 0.85,
  'Infra & Tech': 0.5,
  Automações: 0.6,
  Memória: 0.45,
  Comunicação: 0.55,
  Estratégia: 0.2,
};

const agentMap: Record<string, { agent: string; icon: string; action: string }> = {
  Financeiro: { agent: 'Leo (CFO)', icon: '💰', action: 'Configurar alertas de budget e relatórios semanais do Leo' },
  Projetos: { agent: 'Marco (COO)', icon: '📋', action: 'Conectar Notion API e definir workflows do Marco' },
  Família: { agent: 'Theo', icon: '👨‍👩‍👧', action: 'Manter alertas da Julia e Larissa funcionando' },
  'Infra & Tech': { agent: 'Bruno (CTO)', icon: '🖥️', action: 'Expandir monitoramento de VPS e CI/CD' },
  Automações: { agent: 'Sistema', icon: '⚙️', action: 'Criar novos cronjobs para tarefas recorrentes' },
  Memória: { agent: 'Neural Map', icon: '🧠', action: 'Expandir MEMORY.md com mais nós e conexões' },
  Comunicação: { agent: 'Theo', icon: '💬', action: 'Integrar notificações Telegram/Discord' },
  Estratégia: { agent: 'Theo', icon: '🎯', action: 'Definir OKRs Q2 2026 e criar tracking automático' },
};

function getGaps(): GapItem[] {
  return Object.keys(potentialData)
    .map((dim) => {
      const potential = potentialData[dim];
      const real = realData[dim];
      return {
        dimension: dim,
        potential,
        real,
        agent: agentMap[dim].agent,
        icon: agentMap[dim].icon,
        action: agentMap[dim].action,
      };
    })
    .sort((a, b) => {
      const gapA = (a.potential - a.real) / a.potential;
      const gapB = (b.potential - b.real) / b.potential;
      return gapB - gapA;
    });
}

function GapSeverity({ potential, real }: { potential: number; real: number }) {
  const gap = potential > 0 ? ((potential - real) / potential) * 100 : 0;
  const color = gap > 50 ? 'text-error' : gap > 30 ? 'text-warning' : 'text-success';
  const bg = gap > 50 ? 'bg-error/10' : gap > 30 ? 'bg-warning/10' : 'bg-success/10';
  const label = gap > 50 ? 'Crítico' : gap > 30 ? 'Atenção' : 'Bom';

  return (
    <span className={`${bg} ${color} px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase`}>
      {label} — {gap.toFixed(0)}%
    </span>
  );
}

function CoverageBar({ potential, real }: { potential: number; real: number }) {
  return (
    <div className="w-full h-2 bg-bg-primary rounded-full overflow-hidden relative">
      {/* Potential bar */}
      <div
        className="absolute inset-y-0 left-0 bg-accent-cyan/20 rounded-full"
        style={{ width: `${potential * 100}%` }}
      />
      {/* Real bar */}
      <div
        className="absolute inset-y-0 left-0 bg-accent-purple rounded-full transition-all duration-700"
        style={{ width: `${real * 100}%` }}
      />
    </div>
  );
}

export default function Coverage() {
  const gaps = getGaps();
  const topGaps = gaps.slice(0, 3);
  const otherGaps = gaps.slice(3);

  // Overall coverage score
  const totalPotential = Object.values(potentialData).reduce((s, v) => s + v, 0);
  const totalReal = Object.values(realData).reduce((s, v) => s + v, 0);
  const overallPct = totalPotential > 0 ? (totalReal / totalPotential) * 100 : 0;
  const activeDomains = Object.values(realData).filter((v) => v > 0.5).length;

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">🎯</span>
          <h1 className="text-2xl font-semibold">Cobertura do Theo</h1>
        </div>
        <p className="text-text-secondary text-sm">Potencial teórico vs realidade atual por domínio</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <p className="text-xs text-text-muted uppercase tracking-wider">Cobertura Geral</p>
          <p className={`text-2xl font-bold mt-2 font-mono ${overallPct > 60 ? 'text-success' : overallPct > 40 ? 'text-warning' : 'text-error'}`}>
            {overallPct.toFixed(0)}%
          </p>
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <p className="text-xs text-text-muted uppercase tracking-wider">Domínios Ativos</p>
          <p className="text-2xl font-bold mt-2 font-mono text-accent-cyan">{activeDomains}/8</p>
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <p className="text-xs text-text-muted uppercase tracking-wider">Maior Gap</p>
          <p className="text-2xl font-bold mt-2 font-mono text-error">{topGaps[0]?.dimension ?? '—'}</p>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="bg-bg-card border border-border rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm text-text-secondary">Radar de Cobertura</h2>
          <div className="flex items-center gap-6 text-xs font-mono">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-accent-cyan" />
              Potencial Teórico
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-accent-purple" />
              Cobertura Real
            </span>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="w-full max-w-[520px]">
            <TheoRadarChart />
          </div>
        </div>
      </div>

      {/* Top gaps */}
      <div className="mb-8">
        <h2 className="text-sm text-text-secondary mb-4 uppercase tracking-wider flex items-center gap-2">
          <span className="text-error">▼</span> Gaps Identificados — Top 3
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {topGaps.map((gap) => {
            const gapPct = gap.potential > 0 ? ((gap.potential - gap.real) / gap.potential) * 100 : 0;
            return (
              <div
                key={gap.dimension}
                className={`bg-bg-card border rounded-xl p-5 transition-all ${
                  gapPct > 50 ? 'border-error/30' : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{gap.icon}</span>
                    <span className="font-semibold text-sm">{gap.dimension}</span>
                  </div>
                  <GapSeverity potential={gap.potential} real={gap.real} />
                </div>

                <CoverageBar potential={gap.potential} real={gap.real} />

                <div className="flex justify-between text-[10px] font-mono text-text-muted mt-1 mb-3">
                  <span>Real: {(gap.real * 100).toFixed(0)}%</span>
                  <span>Potencial: {(gap.potential * 100).toFixed(0)}%</span>
                </div>

                <div className="border-t border-border pt-3">
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Responsável</p>
                  <p className="text-xs text-text-secondary font-mono">{gap.agent}</p>
                </div>
                <div className="mt-2">
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Ação Sugerida</p>
                  <p className="text-xs text-text-secondary">{gap.action}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Other dimensions */}
      <div>
        <h2 className="text-sm text-text-secondary mb-4 uppercase tracking-wider">Todos os Domínios</h2>
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          {otherGaps.map((gap, i) => (
            <div
              key={gap.dimension}
              className={`flex items-center gap-4 px-5 py-4 ${i < otherGaps.length - 1 ? 'border-b border-border' : ''}`}
            >
              <span className="text-lg w-8 text-center">{gap.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-sm font-medium">{gap.dimension}</span>
                  <GapSeverity potential={gap.potential} real={gap.real} />
                </div>
                <CoverageBar potential={gap.potential} real={gap.real} />
                <div className="flex justify-between text-[10px] font-mono text-text-muted mt-1">
                  <span>Real: {(gap.real * 100).toFixed(0)}%</span>
                  <span>Potencial: {(gap.potential * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] text-text-muted">{gap.agent}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
