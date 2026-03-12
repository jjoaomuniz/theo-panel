import { useState } from 'react';
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

const DETAILS: Record<string, { model: string; channel: string; workspace: string; subagentOf?: string }> = {
  theo:             { model: 'kimi-k2.5', channel: 'Telegram · Discord · WhatsApp',     workspace: '/root/.openclaw/workspace' },
  bruno:            { model: 'kimi-k2.5', channel: 'Discord (@Bruno-CTO)',               workspace: '/root/.openclaw/workspace-bruno',         subagentOf: 'theo' },
  leo:              { model: 'kimi-k2.5', channel: 'Discord (@Leo-CFO)',                 workspace: '/root/.openclaw/workspace-leo',            subagentOf: 'theo' },
  marco:            { model: 'kimi-k2.5', channel: 'Discord (@Marco-COO)',               workspace: '/root/.openclaw/workspace-marco',          subagentOf: 'theo' },
  carla:            { model: 'kimi-k2.5', channel: 'Discord (@Carla-CHRO)',              workspace: '/root/.openclaw/workspace-carla',          subagentOf: 'theo' },
  rafael:           { model: 'kimi-k2.5', channel: 'Discord (@Rafael-CLO)',              workspace: '/root/.openclaw/workspace-rafael',         subagentOf: 'theo' },
  'salomao-onchain':{ model: 'kimi-k2.5', channel: 'Discord (@Salomão)',                workspace: '/root/.openclaw/workspace/theo-trader',    subagentOf: 'theo' },
  joao:             { model: 'kimi-k2.5', channel: 'Discord (@João)',                   workspace: '/root/.openclaw/workspace-joao',           subagentOf: 'theo' },
};

interface CardProps {
  agent: PanelAgent;
  expanded: boolean;
  onToggle: () => void;
  isLead?: boolean;
}

function AgentCard({ agent, expanded, onToggle, isLead }: CardProps) {
  const skills = SKILLS[agent.id] ?? [];
  const details = DETAILS[agent.id];
  const isWorking = agent.status === 'working';

  return (
    <div
      className={`rounded-2xl border cursor-pointer transition-all duration-300 ${isLead ? 'w-full max-w-xs' : 'w-full'}`}
      style={{
        borderColor: expanded ? agent.color + '40' : 'rgba(255,255,255,0.04)',
        background: expanded ? agent.color + '06' : '#0d0d16',
        boxShadow: expanded ? `0 0 40px ${agent.color}0A` : undefined,
      }}
      onClick={onToggle}
    >
      {/* Card header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div
              className={`flex items-center justify-center rounded-xl ${isLead ? 'w-14 h-14 text-2xl' : 'w-11 h-11 text-xl'}`}
              style={{ background: agent.color + '12', border: `1px solid ${agent.color}28` }}
            >
              {agent.avatar}
            </div>
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-bg-card ${
                isWorking ? 'bg-success animate-status-pulse' : 'bg-border'
              }`}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`font-semibold ${isLead ? 'text-base' : 'text-sm'}`} style={{ color: agent.color }}>
                {agent.name}
              </span>
              {isLead && (
                <span
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded-full"
                  style={{ background: agent.color + '20', color: agent.color }}
                >LEAD</span>
              )}
            </div>
            <p className="text-[10px] font-mono text-text-muted leading-relaxed">{agent.role}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <div className={`w-1.5 h-1.5 rounded-full ${isWorking ? 'bg-success' : 'bg-border'}`} />
              <span className="text-[10px] font-mono" style={{ color: isWorking ? '#34d399' : '#475569' }}>
                {isWorking ? 'working' : 'idle'}
              </span>
            </div>
          </div>

          <div
            className="text-text-muted text-xs transition-transform duration-300 mt-1 shrink-0"
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >▾</div>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1 mt-3">
          {skills.slice(0, expanded ? undefined : 3).map(skill => (
            <span
              key={skill}
              className="px-2 py-0.5 rounded-full text-[9px] font-mono"
              style={{ background: agent.color + '10', color: agent.color + 'CC', border: `1px solid ${agent.color}1A` }}
            >{skill}</span>
          ))}
          {!expanded && skills.length > 3 && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono text-text-muted border border-white/[0.05]">
              +{skills.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && details && (
        <div className="px-4 pb-4 pt-3 border-t border-white/[0.04] animate-slide-in">
          <div className="grid grid-cols-1 gap-3">
            <Detail label="Modelo"     value={details.model}      color={agent.color} />
            <Detail label="Canal"      value={details.channel}    color={agent.color} />
            <Detail label="Workspace"  value={details.workspace}  color={agent.color} mono />
            {details.subagentOf && (
              <Detail label="Subagente de" value="Theo Muniz (main)" color={agent.color} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value, color, mono }: { label: string; value: string; color: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[9px] font-mono uppercase tracking-widest mb-0.5" style={{ color: color + '80' }}>{label}</p>
      <p className={`text-xs ${mono ? 'font-mono text-text-muted text-[10px] break-all' : 'text-text-secondary'}`}>{value}</p>
    </div>
  );
}

// ─── Organograma — linhas de conexão (só desktop xl+) ────────────────────────
function OrgChart({ count }: { count: number }) {
  const stemGold   = 'rgba(201,168,76,0.7)';
  const lineColor  = 'rgba(139,92,246,0.5)';
  const dotColor   = 'rgba(139,92,246,0.85)';
  const dotGlow    = '0 0 10px rgba(139,92,246,0.55)';

  return (
    <div className="w-full select-none" style={{ paddingTop: 2 }}>

      {/* ── Stem: Theo → horizontal bar ── */}
      <div className="flex justify-center" style={{ height: 44 }}>
        <div className="relative flex flex-col items-center" style={{ width: 2 }}>
          {/* Stem line */}
          <div
            className="flex-1 w-full"
            style={{ background: `linear-gradient(to bottom, ${stemGold}, ${lineColor})` }}
          />
          {/* Node where stem meets bar */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10 rounded-full"
            style={{ width: 14, height: 14, background: dotColor, boxShadow: dotGlow, border: '2px solid rgba(139,92,246,0.3)' }}
          />
        </div>
      </div>

      {/* ── Horizontal bar + vertical drops ── */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${count}, 1fr)`, marginTop: 7 }}
      >
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="relative" style={{ height: 48 }}>

            {/* Horizontal bar segment */}
            <div
              className="absolute"
              style={{
                top: 5,
                height: 2,
                left:  i === 0         ? '50%' : '-8px',
                right: i === count - 1 ? '50%' : '-8px',
                background: lineColor,
              }}
            />

            {/* Junction dot */}
            <div
              className="absolute z-10 rounded-full"
              style={{
                top: -1,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 12,
                height: 12,
                background: dotColor,
                boxShadow: dotGlow,
                border: '1px solid rgba(139,92,246,0.3)',
              }}
            />

            {/* Vertical drop */}
            <div
              className="absolute"
              style={{
                top: 12,
                bottom: 4,
                left: '50%',
                width: 2,
                transform: 'translateX(-50%)',
                background: lineColor,
              }}
            />

            {/* Bottom connector dot */}
            <div
              className="absolute rounded-full"
              style={{
                bottom: -3,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 8,
                height: 8,
                background: 'rgba(139,92,246,0.5)',
                border: '1px solid rgba(139,92,246,0.3)',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Team() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { agents, isLive } = useAgents();

  const toggle = (id: string) => setExpanded(e => e === id ? null : id);

  const theo = agents[0];
  const subagents = agents.slice(1);
  const working = agents.filter(a => a.status === 'working').length;

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-5 mesh-gradient">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold tracking-wide">Team</h1>
        <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent" />
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-status-pulse" />
          <span className="text-text-muted">{working}/{agents.length} ativos</span>
          {isLive && <span className="text-success">● live</span>}
        </div>
      </div>

      <div className="max-w-5xl mx-auto">

        {/* ── Theo (lead) ── */}
        <div className="flex justify-center mb-0">
          {theo && (
            <AgentCard
              agent={theo}
              expanded={expanded === theo.id}
              onToggle={() => toggle(theo.id)}
              isLead
            />
          )}
        </div>

        {/* ── Organograma (xl+: linhas completas com 7 colunas) ── */}
        <div className="hidden xl:block">
          <OrgChart count={subagents.length} />
        </div>

        {/* ── Divisor mobile/tablet ── */}
        <div className="xl:hidden flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: 'rgba(139,92,246,0.12)' }} />
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(139,92,246,0.4)' }} />
            <span className="text-[9px] font-mono text-text-muted tracking-[0.2em] uppercase">Coordena</span>
            <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(139,92,246,0.4)' }} />
          </div>
          <div className="flex-1 h-px" style={{ background: 'rgba(139,92,246,0.12)' }} />
        </div>

        {/* ── Subagentes grid ──
              mobile:  2 colunas
              sm:      3 colunas
              lg:      4 colunas
              xl:      7 colunas (alinhado com o organograma)            ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {subagents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              expanded={expanded === agent.id}
              onToggle={() => toggle(agent.id)}
            />
          ))}
        </div>

        {/* ── Footer stats ── */}
        <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { label: 'Total de Agentes', value: String(agents.length),  color: 'text-accent-purple' },
            { label: 'Ativos Agora',     value: String(working),         color: 'text-success'       },
            { label: 'Modelo Padrão',    value: 'kimi-k2.5',             color: 'text-accent-cyan'   },
          ].map(stat => (
            <div key={stat.label} className="bg-bg-card rounded-2xl border border-white/[0.04] p-3 sm:p-4 relative overflow-hidden">
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
              <p className="text-[9px] font-mono text-text-muted uppercase tracking-widest mb-2">{stat.label}</p>
              <p className={`text-xl sm:text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
