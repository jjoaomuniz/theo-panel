import { useState, useRef, useLayoutEffect, useCallback } from 'react';
import type { PanelAgent } from '@/data/agents';
import { useAgents } from '@/hooks/useAgents';

const SKILLS: Record<string, string[]> = {
  theo:             ['Orchestration', 'Memory', 'Context Mgmt', 'Routing', 'Briefings', 'Multi-channel'],
  bruno:            ['TypeScript', 'React', 'Docker', 'Node.js', 'VPS', 'MCP', 'GitHub', 'Infra'],
  leo:              ['Cost Analysis', 'OpenRouter', 'Financial Reports', 'Metrics', 'Budgeting'],
  marco:            ['Cron Jobs', 'Automation', 'Monitoring', 'Ops', 'Telegram', 'Scheduling'],
  carla:            ['Team Culture', 'Onboarding', 'Skill Training', 'People Ops', 'CHRO'],
  rafael:           ['Direito do Consumidor', 'PROCON', 'Contratos', 'LGPD', 'Trabalhista', 'Juizado Especial'],
  'salomao-onchain':['DeFi', 'Solana', 'Arbitragem', 'Kamino', 'Copy Trading', 'Yield'],
  joao:             ['SQL Server', 'Vendas', 'Aditivos', 'Lubrificantes', 'Relatórios', 'Análise'],
};

const DETAILS: Record<string, { model: string; channel: string; workspace: string }> = {
  theo:             { model: 'kimi-k2.5', channel: 'Telegram · Discord · WhatsApp',  workspace: '/root/.openclaw/workspace' },
  bruno:            { model: 'kimi-k2.5', channel: 'Discord (@Bruno-CTO)',            workspace: '/root/.openclaw/workspace-bruno' },
  leo:              { model: 'kimi-k2.5', channel: 'Discord (@Leo-CFO)',              workspace: '/root/.openclaw/workspace-leo' },
  marco:            { model: 'kimi-k2.5', channel: 'Discord (@Marco-COO)',            workspace: '/root/.openclaw/workspace-marco' },
  carla:            { model: 'kimi-k2.5', channel: 'Discord (@Carla-CHRO)',           workspace: '/root/.openclaw/workspace-carla' },
  rafael:           { model: 'kimi-k2.5', channel: 'Discord (@Rafael-CLO)',           workspace: '/root/.openclaw/workspace-rafael' },
  'salomao-onchain':{ model: 'kimi-k2.5', channel: 'Discord (@Salomão)',             workspace: '/root/.openclaw/workspace/theo-trader' },
  joao:             { model: 'kimi-k2.5', channel: 'Discord (@João)',                workspace: '/root/.openclaw/workspace-joao' },
};

function Detail({ label, value, color, mono }: { label: string; value: string; color: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[9px] font-mono uppercase tracking-widest mb-0.5" style={{ color: color + '65' }}>{label}</p>
      <p className={`text-xs ${mono ? 'font-mono text-text-muted text-[10px] break-all' : 'text-text-secondary'}`}>{value}</p>
    </div>
  );
}

// ── SVG org-chart lines ───────────────────────────────────────
interface OrgLinesProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  theoRef:      React.RefObject<HTMLDivElement | null>;
  cardRefs:     React.MutableRefObject<(HTMLDivElement | null)[]>;
  deps:         unknown; // re-measure when this changes
}

function useOrgLines({ containerRef, theoRef, cardRefs, deps }: OrgLinesProps) {
  const [paths, setPaths] = useState<string[]>([]);
  const [dots,  setDots]  = useState<{ cx: number; cy: number }[]>([]);
  const [dims,  setDims]  = useState({ w: 0, h: 0 });

  const measure = useCallback(() => {
    const container = containerRef.current;
    const theoCard  = theoRef.current;
    if (!container || !theoCard) return;

    const cRect = container.getBoundingClientRect();
    const tRect = theoCard.getBoundingClientRect();

    const stemX    = tRect.left + tRect.width / 2 - cRect.left;
    const stemY    = tRect.bottom - cRect.top;

    const validCards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!validCards.length) return;

    const cardRects = validCards.map(el => el.getBoundingClientRect());
    const midY = stemY + (cardRects[0].top - cRect.top - stemY) / 2;

    const newPaths: string[] = [];
    const newDots:  { cx: number; cy: number }[] = [];

    // Vertical stem from Theo → mid
    newPaths.push(`M ${stemX} ${stemY} L ${stemX} ${midY}`);
    newDots.push({ cx: stemX, cy: midY });

    // Horizontal bar (first → last card center)
    const cxFirst = cardRects[0].left + cardRects[0].width / 2 - cRect.left;
    const cxLast  = cardRects[cardRects.length - 1].left + cardRects[cardRects.length - 1].width / 2 - cRect.left;
    if (Math.abs(cxLast - cxFirst) > 4) {
      newPaths.push(`M ${cxFirst} ${midY} L ${cxLast} ${midY}`);
    }

    // Vertical drops to each card
    for (const r of cardRects) {
      const cx      = r.left + r.width / 2 - cRect.left;
      const cardTop = r.top - cRect.top;
      newPaths.push(`M ${cx} ${midY} L ${cx} ${cardTop}`);
      newDots.push({ cx, cy: cardTop });
    }

    setDims({ w: cRect.width, h: cRect.height });
    setPaths(newPaths);
    setDots(newDots);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [measure, deps]);

  return { paths, dots, dims };
}

// ── Theo hero card ────────────────────────────────────────────
function TheoCard({ agent }: { agent: PanelAgent }) {
  const isWorking = agent.status === 'working';
  const skills    = SKILLS[agent.id] ?? [];
  const details   = DETAILS[agent.id];

  return (
    <div
      className="rounded-xl border overflow-hidden flex"
      style={{ background: '#0d0d16', borderColor: agent.color + '22', boxShadow: `0 0 48px ${agent.color}05` }}
    >
      <div className="w-[3px] shrink-0" style={{ background: agent.color }} />

      <div className="flex items-center px-5 py-5 border-r border-white/[0.04] shrink-0">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
             style={{ background: agent.color + '10', border: `1px solid ${agent.color}20` }}>
          {agent.avatar}
        </div>
      </div>

      <div className="flex-1 px-5 py-5 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold" style={{ color: agent.color }}>{agent.name}</span>
          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-full tracking-widest"
                style={{ background: agent.color + '12', color: agent.color, border: `1px solid ${agent.color}20` }}>LEAD</span>
          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            <div className={`w-1.5 h-1.5 rounded-full ${isWorking ? 'bg-success animate-status-pulse' : 'bg-border'}`} />
            <span className="text-[10px] font-mono" style={{ color: isWorking ? '#34d399' : '#475569' }}>
              {isWorking ? 'working' : 'idle'}
            </span>
          </div>
        </div>
        <p className="text-[10px] font-mono text-text-muted mb-3">{agent.role}</p>
        <div className="flex flex-wrap gap-1">
          {skills.map(s => (
            <span key={s} className="px-1.5 py-0.5 rounded text-[9px] font-mono"
                  style={{ background: agent.color + '08', color: agent.color + 'AA', border: `1px solid ${agent.color}12` }}>
              {s}
            </span>
          ))}
        </div>
      </div>

      {details && (
        <div className="px-5 py-5 border-l border-white/[0.04] flex flex-col justify-center gap-3 shrink-0 min-w-[192px]">
          <Detail label="Modelo" value={details.model}   color={agent.color} />
          <Detail label="Canal"  value={details.channel} color={agent.color} />
        </div>
      )}
    </div>
  );
}

// ── Subagent card ─────────────────────────────────────────────
function AgentCard({ agent, expanded, onToggle }: { agent: PanelAgent; expanded: boolean; onToggle: () => void }) {
  const skills  = SKILLS[agent.id] ?? [];
  const details = DETAILS[agent.id];
  const isWorking = agent.status === 'working';

  return (
    <div
      className="rounded-xl border cursor-pointer transition-all duration-200 overflow-hidden h-full"
      style={{ borderColor: expanded ? agent.color + '20' : 'rgba(255,255,255,0.04)', background: expanded ? agent.color + '04' : '#0d0d16' }}
      onClick={onToggle}
    >
      <div className="h-[2px] w-full transition-all duration-300"
           style={{ background: isWorking ? agent.color : agent.color + '28' }} />

      <div className="p-3.5">
        <div className="flex items-start gap-2.5 mb-2.5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
               style={{ background: agent.color + '10', border: `1px solid ${agent.color}18` }}>
            {agent.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: agent.color }}>{agent.name}</p>
            <p className="text-[9px] font-mono text-text-muted mt-0.5 leading-tight"
               style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {agent.role}
            </p>
          </div>
          <div className="text-text-muted/40 text-[10px] transition-transform duration-200 shrink-0 mt-0.5"
               style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}>▾</div>
        </div>

        <div className="flex items-center gap-1.5 mb-2.5">
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isWorking ? 'bg-success animate-status-pulse' : 'bg-border'}`} />
          <span className="text-[9px] font-mono" style={{ color: isWorking ? '#34d399' : '#475569' }}>
            {isWorking ? 'working' : 'idle'}
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          {skills.slice(0, expanded ? undefined : 3).map(s => (
            <span key={s} className="px-1.5 py-0.5 rounded text-[9px] font-mono"
                  style={{ background: agent.color + '08', color: agent.color + 'BB', border: `1px solid ${agent.color}12` }}>
              {s}
            </span>
          ))}
          {!expanded && skills.length > 3 && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-text-muted border border-white/[0.04]">
              +{skills.length - 3}
            </span>
          )}
        </div>

        {expanded && details && (
          <div className="mt-3 pt-3 border-t border-white/[0.04] grid gap-2.5 animate-slide-in">
            <Detail label="Modelo"    value={details.model}     color={agent.color} />
            <Detail label="Canal"     value={details.channel}   color={agent.color} />
            <Detail label="Workspace" value={details.workspace} color={agent.color} mono />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function Team() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { agents, isLive } = useAgents();

  const toggle = (id: string) => setExpanded(e => e === id ? null : id);

  const theo      = agents[0];
  const subagents = agents.slice(1);
  const working   = agents.filter(a => a.status === 'working').length;

  // Refs for SVG org lines
  const containerRef = useRef<HTMLDivElement>(null);
  const theoRef      = useRef<HTMLDivElement>(null);
  const cardRefs     = useRef<(HTMLDivElement | null)[]>([]);

  const { paths, dots, dims } = useOrgLines({
    containerRef,
    theoRef,
    cardRefs,
    deps: [agents.length, expanded],
  });

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 mesh-gradient">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-[11px] font-mono font-bold tracking-[0.2em] text-gradient">TEAM</h1>
        <div className="h-px flex-1 bg-gradient-to-r from-white/[0.05] to-transparent" />
        <div className="flex items-center gap-2.5 text-[10px] font-mono">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-status-pulse" />
          <span className="text-text-muted">{working}/{agents.length} ativos</span>
          {isLive && <span className="text-success/60">● live</span>}
        </div>
      </div>

      {/* Org chart container — SVG overlay + cards */}
      <div ref={containerRef} className="max-w-4xl mx-auto relative">

        {/* SVG connection lines */}
        {dims.w > 0 && (
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 0, overflow: 'visible' }}
            width={dims.w}
            height={dims.h}
          >
            {paths.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="none"
                stroke="rgba(139,92,246,0.18)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            ))}
            {dots.map((pt, i) => (
              <circle
                key={i}
                cx={pt.cx}
                cy={pt.cy}
                r="3"
                fill="#8b5cf6"
                opacity="0.35"
              />
            ))}
          </svg>
        )}

        {/* Theo hero */}
        <div ref={theoRef} className="relative z-10">
          {theo && <TheoCard agent={theo} />}
        </div>

        {/* Spacer — org chart gap */}
        <div className="h-10" />

        {/* Subagents grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 relative z-10">
          {subagents.map((agent, i) => (
            <div
              key={agent.id}
              ref={el => { cardRefs.current[i] = el; }}
            >
              <AgentCard
                agent={agent}
                expanded={expanded === agent.id}
                onToggle={() => toggle(agent.id)}
              />
            </div>
          ))}
        </div>

        {/* Footer stats */}
        <div className="mt-8 grid grid-cols-3 gap-3 relative z-10">
          {[
            { label: 'Total de Agentes', value: String(agents.length), color: '#8b5cf6' },
            { label: 'Ativos Agora',     value: String(working),        color: '#34d399' },
            { label: 'Modelo Padrão',    value: 'kimi-k2.5',            color: '#22d3ee' },
          ].map(stat => (
            <div key={stat.label} className="bg-bg-card rounded-xl border border-white/[0.04] p-4 relative overflow-hidden">
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
              <p className="text-[9px] font-mono text-text-muted uppercase tracking-widest mb-2">{stat.label}</p>
              <p className="text-2xl font-bold font-mono tabular-nums" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
