import TheoRadarChart from '@/components/coverage/TheoRadarChart';
import { COVERAGE_DIMENSIONS, getTopGaps, getOverallCoverage, getActiveDomainCount } from '@/data/coverageData';
import type { CoverageDimension } from '@/data/coverageData';

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
      <div className="absolute inset-y-0 left-0 bg-accent-cyan/20 rounded-full" style={{ width: `${potential * 100}%` }} />
      <div className="absolute inset-y-0 left-0 bg-accent-purple rounded-full transition-all duration-700" style={{ width: `${real * 100}%` }} />
    </div>
  );
}

function GapCard({ dim }: { dim: CoverageDimension }) {
  const gapPct = dim.potential > 0 ? ((dim.potential - dim.real) / dim.potential) * 100 : 0;
  return (
    <div className={`bg-bg-card border rounded-xl p-5 transition-all ${gapPct > 50 ? 'border-error/30' : 'border-border'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{dim.icon}</span>
          <span className="font-semibold text-sm">{dim.key}</span>
        </div>
        <GapSeverity potential={dim.potential} real={dim.real} />
      </div>
      <CoverageBar potential={dim.potential} real={dim.real} />
      <div className="flex justify-between text-[10px] font-mono text-text-muted mt-1 mb-3">
        <span>Real: {(dim.real * 100).toFixed(0)}%</span>
        <span>Potencial: {(dim.potential * 100).toFixed(0)}%</span>
      </div>
      <div className="border-t border-border pt-3">
        <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Responsável</p>
        <p className="text-xs text-text-secondary font-mono">{dim.agent}</p>
      </div>
      <div className="mt-2">
        <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Ação Sugerida</p>
        <p className="text-xs text-text-secondary">{dim.action}</p>
      </div>
    </div>
  );
}

export default function Coverage() {
  const topGaps = getTopGaps(3);
  const overallPct = getOverallCoverage();
  const activeDomains = getActiveDomainCount();

  const allSorted = [...COVERAGE_DIMENSIONS].sort((a, b) => {
    const gapA = a.potential > 0 ? (a.potential - a.real) / a.potential : 0;
    const gapB = b.potential > 0 ? (b.potential - b.real) / b.potential : 0;
    return gapB - gapA;
  });
  const otherDims = allSorted.slice(3);

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
          <p className="text-2xl font-bold mt-2 font-mono text-error">{topGaps[0]?.key ?? '—'}</p>
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

      {/* Top 3 gaps */}
      <div className="mb-8">
        <h2 className="text-sm text-text-secondary mb-4 uppercase tracking-wider flex items-center gap-2">
          <span className="text-error">▼</span> Gaps Identificados — Top 3
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {topGaps.map((dim) => (
            <GapCard key={dim.key} dim={dim} />
          ))}
        </div>
      </div>

      {/* All domains */}
      <div>
        <h2 className="text-sm text-text-secondary mb-4 uppercase tracking-wider">Todos os Domínios</h2>
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          {otherDims.map((dim, i) => (
            <div key={dim.key} className={`flex items-center gap-4 px-5 py-4 ${i < otherDims.length - 1 ? 'border-b border-border' : ''}`}>
              <span className="text-lg w-8 text-center">{dim.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-sm font-medium">{dim.key}</span>
                  <GapSeverity potential={dim.potential} real={dim.real} />
                </div>
                <CoverageBar potential={dim.potential} real={dim.real} />
                <div className="flex justify-between text-[10px] font-mono text-text-muted mt-1">
                  <span>Real: {(dim.real * 100).toFixed(0)}%</span>
                  <span>Potencial: {(dim.potential * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] text-text-muted">{dim.agent}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
