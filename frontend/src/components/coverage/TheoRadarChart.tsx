import { useState, useEffect } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface DimensionData {
  dimension: string;
  potential: number;
  real: number;
  agent: string;
  description: string;
}

const DIMENSION_META: Record<string, { agent: string; description: string }> = {
  Financeiro: { agent: 'Leo (CFO)', description: 'Controle de custos, alertas de budget' },
  Projetos: { agent: 'Marco (COO)', description: 'Notion, tarefas, prazos' },
  Família: { agent: 'Theo', description: 'Julia, Larissa, alertas de rotina' },
  'Infra & Tech': { agent: 'Bruno (CTO)', description: 'VPS, deploy, GitHub' },
  Automações: { agent: 'Sistema', description: 'Cronjobs ativos e executados' },
  Memória: { agent: 'Neural Map', description: 'Nós, conexões, MEMORY.md' },
  Comunicação: { agent: 'Theo', description: 'Telegram/Discord mensagens' },
  Estratégia: { agent: 'Theo', description: 'Decisões, OKRs, metas 2026' },
};

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

function buildChartData(): DimensionData[] {
  return Object.keys(potentialData).map((dim) => ({
    dimension: dim,
    potential: potentialData[dim] * 100,
    real: realData[dim] * 100,
    agent: DIMENSION_META[dim].agent,
    description: DIMENSION_META[dim].description,
  }));
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: DimensionData }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const gap = d.potential - d.real;
  const gapPct = d.potential > 0 ? (gap / d.potential) * 100 : 0;

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 shadow-2xl min-w-[220px]">
      <p className="font-semibold text-text-primary text-sm mb-2">{d.dimension}</p>
      <div className="space-y-1.5 text-xs font-mono">
        <div className="flex justify-between">
          <span className="text-accent-cyan">● Potencial</span>
          <span className="text-text-primary">{d.potential.toFixed(0)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-accent-purple">● Cobertura</span>
          <span className="text-text-primary">{d.real.toFixed(0)}%</span>
        </div>
        <div className="border-t border-border my-1.5 pt-1.5 flex justify-between">
          <span className="text-text-muted">Gap</span>
          <span className={gapPct > 50 ? 'text-error' : gapPct > 30 ? 'text-warning' : 'text-success'}>
            {gapPct.toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-border">
        <p className="text-[10px] text-text-muted">Responsável: <span className="text-text-secondary">{d.agent}</span></p>
        <p className="text-[10px] text-text-muted mt-0.5">{d.description}</p>
      </div>
    </div>
  );
}

function CustomAxisTick({ payload, x, y, cx, cy }: { payload: { value: string }; x: number; y: number; cx: number; cy: number }) {
  const dim = payload.value;
  const real = realData[dim] ?? 0;
  const potential = potentialData[dim] ?? 0;
  const gap = potential > 0 ? ((potential - real) / potential) : 0;
  const isHighGap = gap > 0.5;

  // Offset the label outward from center
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const nudge = 18;
  const nx = dist > 0 ? x + (dx / dist) * nudge : x;
  const ny = dist > 0 ? y + (dy / dist) * nudge : y;

  return (
    <g>
      <text
        x={nx}
        y={ny}
        textAnchor="middle"
        dominantBaseline="central"
        className={`text-[11px] font-mono ${isHighGap ? 'animate-pulse' : ''}`}
        fill={isHighGap ? '#ef4444' : '#94a3b8'}
        fontWeight={isHighGap ? 600 : 400}
      >
        {dim}
      </text>
    </g>
  );
}

export default function TheoRadarChart() {
  const [animScale, setAnimScale] = useState(0);
  const data = buildChartData();

  useEffect(() => {
    const timer = setTimeout(() => setAnimScale(1), 100);
    return () => clearTimeout(timer);
  }, []);

  const animatedData = data.map((d) => ({
    ...d,
    potential: d.potential * animScale,
    real: d.real * animScale,
  }));

  return (
    <div className="w-full" style={{ aspectRatio: '1 / 1', maxHeight: 520 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={animatedData} cx="50%" cy="50%" outerRadius="68%">
          <PolarGrid stroke="#1e1e2e" strokeWidth={1} />
          <PolarAngleAxis
            dataKey="dimension"
            tick={(props: { payload: { value: string }; x: number; y: number; cx: number; cy: number }) => <CustomAxisTick {...props} />}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#64748b', fontSize: 9 }}
            tickCount={5}
            stroke="#1e1e2e"
          />
          {/* Potential polygon — cyan/blue */}
          <Radar
            name="Potencial Teórico"
            dataKey="potential"
            stroke="#06b6d4"
            fill="#06b6d4"
            fillOpacity={0.12}
            strokeWidth={2}
            dot={{ r: 3, fill: '#06b6d4', strokeWidth: 0 }}
            animationDuration={800}
            animationEasing="ease-out"
          />
          {/* Real polygon — purple */}
          <Radar
            name="Cobertura Real"
            dataKey="real"
            stroke="#7c3aed"
            fill="#7c3aed"
            fillOpacity={0.2}
            strokeWidth={2}
            dot={{ r: 4, fill: '#7c3aed', strokeWidth: 2, stroke: '#0a0a0f' }}
            animationDuration={800}
            animationEasing="ease-out"
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
