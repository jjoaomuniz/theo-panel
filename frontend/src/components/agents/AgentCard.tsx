import type { Agent } from '@/types/agents';
import StatusBadge from '@/components/shared/StatusBadge';
import { timeAgo, formatTokens } from '@/lib/utils';

export default function AgentCard({ agent, expanded = false }: { agent: Agent; expanded?: boolean }) {
  const isActive = agent.status === 'active' || agent.status === 'executing';

  return (
    <div className={`bg-bg-card border border-white/[0.04] rounded-2xl p-4 card-hover group relative overflow-hidden ${
      isActive ? 'glow-purple' : ''
    }`}>
      {/* Top accent line */}
      <div className={`absolute top-0 left-4 right-4 h-px ${
        isActive
          ? 'bg-gradient-to-r from-transparent via-accent-purple/40 to-transparent'
          : 'bg-gradient-to-r from-transparent via-white/5 to-transparent'
      }`} />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{agent.emoji}</span>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{agent.name}</h3>
            <p className="text-[10px] text-text-muted font-mono tracking-wide">{agent.role}</p>
          </div>
        </div>
        <StatusBadge status={agent.status} />
      </div>

      {/* Active Task */}
      {agent.activeTask && (
        <div className="bg-accent-purple-dim border border-accent-purple/10 rounded-xl px-3 py-2 mb-3">
          <p className="text-[10px] text-accent-purple font-mono truncate" title={agent.activeTask}>{agent.activeTask}</p>
        </div>
      )}

      {/* Last Action */}
      <div className="mb-3">
        <p className="text-xs text-text-secondary truncate" title={agent.lastAction}>"{agent.lastAction}"</p>
        <p className="text-[10px] text-text-muted mt-1">{timeAgo(agent.lastActionTime)}</p>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
        <div>
          <p className="text-[10px] text-text-muted">Tokens hoje</p>
          <p className="text-xs font-mono text-accent-cyan font-medium">{formatTokens(agent.tokensToday)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-text-muted">Modelo</p>
          <p className="text-[10px] font-mono text-text-secondary">{agent.model}</p>
        </div>
      </div>

      {/* Expanded stats */}
      {expanded && (
        <div className="flex items-center gap-4 border-t border-white/[0.04] pt-3 mt-3">
          <div>
            <p className="text-[10px] text-text-muted">Semana</p>
            <p className="text-[10px] font-mono text-text-secondary">{formatTokens(agent.tokensWeek)}</p>
          </div>
          <div>
            <p className="text-[10px] text-text-muted">Mes</p>
            <p className="text-[10px] font-mono text-text-secondary">{formatTokens(agent.tokensMonth)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
