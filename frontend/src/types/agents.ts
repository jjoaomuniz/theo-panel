export type AgentStatus = 'active' | 'idle' | 'executing' | 'error';

export interface Agent {
  id: string;
  name: string;
  role: string;
  emoji: string;
  status: AgentStatus;
  model: string;
  lastAction: string;
  lastActionTime: string;
  tokensToday: number;
  tokensWeek: number;
  tokensMonth: number;
  activeTask?: string;
}

export type ActivityType = 'info' | 'success' | 'warning' | 'error';

export interface ActivityItem {
  id: string;
  agentId: string;
  agentName: string;
  emoji: string;
  action: string;
  timestamp: string;
  type: ActivityType;
}

export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  lastRun: string;
  lastRunStatus: 'ok' | 'error' | 'skipped';
  nextRun: string;
  enabled: boolean;
}
