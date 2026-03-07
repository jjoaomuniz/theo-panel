import type { AgentStatus } from '@/types/agents';

const statusConfig: Record<AgentStatus, { color: string; bg: string; label: string; pulse: boolean }> = {
  active: { color: 'text-success', bg: 'bg-success/10', label: 'Ativo', pulse: true },
  idle: { color: 'text-warning', bg: 'bg-warning/10', label: 'Idle', pulse: false },
  executing: { color: 'text-accent-cyan', bg: 'bg-accent-cyan/10', label: 'Executando', pulse: true },
  error: { color: 'text-error', bg: 'bg-error/10', label: 'Erro', pulse: false },
};

export default function StatusBadge({ status }: { status: AgentStatus }) {
  const config = statusConfig[status];

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${config.bg}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${config.color.replace('text-', 'bg-')} ${config.pulse ? 'animate-status-pulse' : ''}`} />
      <span className={`text-[10px] font-mono font-medium ${config.color}`}>{config.label}</span>
    </div>
  );
}
