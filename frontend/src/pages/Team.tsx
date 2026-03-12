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
  theo:             { model: 'kimi-k2.5', channel: 'Telegram · Discord · WhatsApp',  workspace: '/root/.openclaw/workspace' },
  bruno:            { model: 'kimi-k2.5', channel: 'Discord (@Bruno-CTO)',            workspace: '/root/.openclaw/workspace-bruno',        subagentOf: 'theo' },
  leo:              { model: 'kimi-k2.5', channel: 'Discord (@Leo-CFO)',              workspace: '/root/.openclaw/workspace-leo',          subagentOf: 'theo' },
  marco:            { model: 'kimi-k2.5', channel: 'Discord (@Marco-COO)',            workspace: '/root/.openclaw/workspace-marco',        subagentOf: 'theo' },
  carla:            { model: 'kimi-k2.5', channel: 'Discord (@Carla-CHRO)',           workspace: '/root/.openclaw/workspace-carla',        subagentOf: 'theo' },
  rafael:           { model: 'kimi-k2.5', channel: 'Discord (@Rafael-CLO)',           workspace: '/root/.openclaw/workspace-rafael',       subagentOf: 'theo' },
  'salomao-onchain':{ model: 'kimi-k2.5', channel: 'Discord (@Salomão)',             workspace: '/root/.openclaw/workspace/theo-trader',  subagentOf: 'theo' },
  joao:             { model: 'kimi-k2.5', channel: 'Discord (@João)',                workspace: '/root/.openclaw/workspace-joao',         subagentOf: 'theo' },
};

function Detail({ label, value, color, mono }: { label: string; value: string; color: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[9px] font-mono uppercase tracking-widest mb-0.5" style={{ color: color + '65' }}>{label}</p>
      <p className={`text-xs ${mono ? 'font-mono text-text-muted text-[10px] break-all' : 'text-text-secondary'}`}>{value}</p>
    </div>
  );
}

// ── Theo hero — horizontal card ───────────────────────────────────────────────
function TheoCard({ agent }: { agent: PanelAgent }) {
  const isWorking = agent.status === 'working';
  const skills = SKILLS[agent.id] ?? [];
  const details = DETAILS[agent.id];

  return (
    <div
      className="rounded-xl border overflow-hidden flex"
      style={{
        background: '#0d0d16',
        borderColor: agent.color + '22',
        boxShadow: `0 0 48px ${agent.color}05`,
      }}
    >
      {/* Left accent bar */}
      <div className="w-[3px] shrink-0" style={{ background: agent.color }} />

      {/* Avatar */}
      <div className="flex items-center px-5 py-5 border-r border-white/[0.04] shrink-0">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: agent.color + '10', border: `1px solid ${agent.color}20` }}
        >
          {agent.avatar}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 px-5 py-5 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold" style={{ color: agent.color }}>{agent.name}</span>
          <span
            className="text-[8px] font-mono px-1.5 py-0.5 rounded-full tracking-widest"
            style={{ background: agent.color + '12', color: agent.color, border: `1px solid ${agent.color}20` }}
          >LEAD</span>
          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            <div className={`w-1.5 h-1.5 rounded-full ${isWorking ? 'bg-success animate-status-pulse' : 'bg-border'}`} />
            <span className="text-[10px] font-mono" style={{ color: isWorking ? '#34d399' : '#475569' }}>
              {isWorking ? 'working' : 'idle'}
            </span>
          </div>
        </div>
        <p className="text-[10px] font-mono text-text-muted mb-3">{agent.role}</p>
        <div className="flex flex-wrap gap-1">
          {skills.map(skill => (
            <span
              key={skill}
              className="px-1.5 py-0.5 rounded text-[9px] font-mono"
              style={{ background: agent.color + '08', color: agent.color + 'AA', border: `1px solid ${agent.color}12` }}
            >{skill}</span>
          ))}
        </div>
      </div>

      {/* Details column */}
      {details && (
        <div className="px-5 py-5 border-l border-white/[0.04] flex flex-col justify-center gap-3 shrink-0 min-w-[192px]">
          <Detail label="Modelo" value={details.model} color={agent.color} />
          <Detail label="Canal"  value={details.channel} color={agent.color} />
        </div>
      )}
    </div>
  );
}

// ── Subagent card ─────────────────────────────────────────────────────────────
function AgentCard({ agent, expanded, onToggle }: { agent: PanelAgent; expanded: boolean; onToggle: () => void }) {
  const skills = SKILLS[agent.id] ?? [];
  const details = DETAILS[agent.id];
  const isWorking = agent.status === 'working';

  return (
    <div
      className="rounded-xl border cursor-pointer transition-all duration-200 overflow-hidden"
      style={{
        borderColor: expanded ? agent.color + '20' : 'rgba(255,255,255,0.04)',
        background: expanded ? agent.color + '04' : '#0d0d16',
      }}
      onClick={onToggle}
    >
      {/* Top accent — full color when working, dim when idle */}
      <div
        className="h-[2px] w-full transition-all duration-300"
        style={{ background: isWorking ? agent.color : agent.color + '28' }}
      />

      <div className="p-3.5">
        {/* Header */}
        <div className="flex items-start gap-2.5 mb-2.5">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
            style={{ background: agent.color + '10', border: `1px solid ${agent.color}18` }}
          >
            {agent.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: agent.color }}>{agent.name}</p>
            <p className="text-[9px] font-mono text-text-muted mt-0.5 leading-tight overflow-hidden"
               style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {agent.role}
            </p>
          </div>
          <div
            className="text-text-muted/40 text-[10px] transition-transform duration-200 shrink-0 mt-0.5"
            style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
          >▾</div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isWorking ? 'bg-success animate-status-pulse' : 'bg-border'}`} />
          <span className="text-[9px] font-mono" style={{ color: isWorking ? '#34d399' : '#475569' }}>
            {isWorking ? 'working' : 'idle'}
          </span>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1">
          {skills.slice(0, expanded ? undefined : 3).map(skill => (
            <span
              key={skill}
              className="px-1.5 py-0.5 rounded text-[9px] font-mono"
              style={{ background: agent.color + '08', color: agent.color + 'BB', border: `1px solid ${agent.color}12` }}
            >{skill}</span>
          ))}
          {!expanded && skills.length > 3 && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-text-muted border border-white/[0.04]">
              +{skills.length - 3}
            </span>
          )}
        </div>

        {/* Expanded details */}
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

export default function Team() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { agents, isLive } = useAgents();

  const toggle = (id: string) => setExpanded(e => e === id ? null : id);

  const theo      = agents[0];
  const subagents = agents.slice(1);
  const working   = agents.filter(a => a.status === 'working').length;

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

      <div className="max-w-4xl mx-auto">

        {/* Theo hero card */}
        {theo && <TheoCard agent={theo} />}

        {/* Org divider */}
        <div className="relative my-6">
          <div className="h-px bg-white/[0.04]" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span
              className="px-3 text-[9px] font-mono tracking-[0.2em] uppercase text-text-muted/35"
              style={{ background: '#06060b' }}
            >coordena</span>
          </div>
        </div>

        {/* Subagents — max 4 columns so cards stay readable */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {subagents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              expanded={expanded === agent.id}
              onToggle={() => toggle(agent.id)}
            />
          ))}
        </div>

        {/* Footer stats */}
        <div className="mt-8 grid grid-cols-3 gap-3">
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
