// ─── Neural Map Types ───────────────────────────────────────
export type NodeCategory = 'people' | 'projects' | 'preferences' | 'alerts' | 'tech';

export interface NeuralNode {
  id: string;
  label: string;
  category: NodeCategory;
  description: string;
  learnedAt?: string;
  connections: string[];
}

export interface NeuralLink {
  source: string;
  target: string;
  strength?: number;
}

export interface NeuralData {
  nodes: NeuralNode[];
  links: NeuralLink[];
}

// ─── Agent Types ────────────────────────────────────────────
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

// ─── Activity Types ─────────────────────────────────────────
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

// ─── Cron Job Types ─────────────────────────────────────────
export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  lastRun: string;
  lastRunStatus: 'ok' | 'error' | 'skipped';
  nextRun: string;
  enabled: boolean;
}

// ─── Cost Types ─────────────────────────────────────────────
export interface DailyCost {
  date: string;
  theo: number;
  bruno: number;
  leo: number;
  marco: number;
  total: number;
}

export interface CostData {
  daily: DailyCost[];
  summary: {
    total: number;
    average: number;
    projection: number;
  };
}

// ─── LLM Types ──────────────────────────────────────────────
export interface LLMModel {
  id: string;
  name: string;
  provider: string;
  requestsToday: number;
  avgLatency: string;
  tokensPerSec: number;
  costPer1k: string;
  status: 'online' | 'degraded' | 'offline';
}

// ─── Health Types ───────────────────────────────────────────
export interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  uptime: number;
  openrouter: boolean;
  openclaw: boolean;
  timestamp: string;
}

// ─── Agent Config ───────────────────────────────────────────
export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  emoji: string;
  model: string;
  dirName: string; // directory name in OpenClaw
}

// ─── WebSocket Events ───────────────────────────────────────
export type WSEventType = 'agent:update' | 'activity:new' | 'neural:update' | 'costs:update';

export interface WSMessage {
  type: WSEventType;
  data: unknown;
  timestamp: string;
}
