import type { AgentStatus } from '@/types/agents';

const statusConfig: Record<AgentStatus, { color: string; label: string; pulse: boolean }> = {
  active: { color: 'bg-success', label: 'Ativo', pulse: true },
  idle: { color: 'bg-warning', label: 'Idle', pulse: false },
  executing: { color: 'bg-accent-cyan', label: 'Executando', pulse: true },
  error: { color: 'bg-error', label: 'Erro', pulse: false },
};

export default function StatusBadge({ status }: { status: AgentStatus }) {
  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${config.color} ${config.pulse ? 'animate-status-pulse' : ''}`} />
      <span className="text-xs font-mono text-text-secondary">{config.label}</span>
    </div>
  );
}
