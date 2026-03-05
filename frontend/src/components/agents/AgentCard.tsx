import type { Agent } from '@/types/agents';
import StatusBadge from '@/components/shared/StatusBadge';

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `ha ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `ha ${hrs}h`;
  return `ha ${Math.floor(hrs / 24)}d`;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export default function AgentCard({ agent, expanded = false }: { agent: Agent; expanded?: boolean }) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 transition-all duration-300 hover:border-accent-purple/50 hover:shadow-[0_0_20px_rgba(124,58,237,0.08)] group">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{agent.emoji}</span>
          <div>
            <h3 className="text-sm font-semibold">{agent.name}</h3>
            <p className="text-xs text-text-muted">{agent.role}</p>
          </div>
        </div>
        <StatusBadge status={agent.status} />
      </div>

      {/* Active Task */}
      {agent.activeTask && (
        <div className="bg-accent-purple/5 border border-accent-purple/20 rounded-lg px-3 py-2 mb-3">
          <p className="text-xs text-accent-purple font-mono truncate">{agent.activeTask}</p>
        </div>
      )}

      {/* Last Action */}
      <div className="mb-3">
        <p className="text-xs text-text-secondary truncate">"{agent.lastAction}"</p>
        <p className="text-xs text-text-muted mt-0.5">{timeAgo(agent.lastActionTime)}</p>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between border-t border-border/50 pt-3">
        <div>
          <p className="text-xs text-text-muted">Tokens hoje</p>
          <p className="text-sm font-mono text-accent-cyan font-medium">{formatTokens(agent.tokensToday)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-text-muted">Modelo</p>
          <p className="text-xs font-mono text-text-secondary">{agent.model}</p>
        </div>
      </div>

      {/* Expanded stats */}
      {expanded && (
        <div className="flex items-center gap-4 border-t border-border/50 pt-3 mt-3">
          <div>
            <p className="text-xs text-text-muted">Semana</p>
            <p className="text-xs font-mono text-text-secondary">{formatTokens(agent.tokensWeek)}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Mes</p>
            <p className="text-xs font-mono text-text-secondary">{formatTokens(agent.tokensMonth)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
