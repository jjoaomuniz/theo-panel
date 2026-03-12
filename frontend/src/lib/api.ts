const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

// ─── Typed API methods ──────────────────────────────────────
import type { NeuralNode, NeuralLink } from '@/types/neural';
import type { Agent, ActivityItem, CronJob } from '@/types/agents';

export interface NeuralData {
  nodes: NeuralNode[];
  links: NeuralLink[];
}

export interface DailyCost {
  date: string;
  theo: number;
  bruno: number;
  leo: number;
  marco: number;
  total: number;
}

export interface ModelCostEntry {
  model: string;
  name: string;
  cost: number;
  tokens: number;
  requests: number;
  pct: number;
}

export interface CostData {
  daily: DailyCost[];
  summary: { total: number; average: number; projection: number };
  credits: { remaining: number; total: number; used: number; isFreeTier?: boolean } | null;
  byModel?: ModelCostEntry[];
  history?: {
    daily: { date: string; cost: number }[];
    weekly: { date: string; cost: number }[];
    monthly: { date: string; cost: number }[];
  };
}

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

export const api = {
  neural: () => apiFetch<NeuralData>('/neural'),
  agents: () => apiFetch<Agent[]>('/agents'),
  activities: (limit = 50) => apiFetch<ActivityItem[]>(`/activities?limit=${limit}`),
  costs: () => apiFetch<CostData>('/costs'),
  cronjobs: () => apiFetch<CronJob[]>('/cronjobs'),
  toggleCronjob: (id: string) => apiFetch<CronJob>(`/cronjobs/${id}/toggle`, { method: 'PUT' }),
  createCronjob: (data: { name: string; schedule: string; command?: string; agentId?: string }) =>
    apiFetch<CronJob>('/cronjobs', { method: 'POST', body: JSON.stringify(data) }),
  deleteCronjob: (id: string) =>
    apiFetch<{ ok: boolean }>(`/cronjobs/${id}`, { method: 'DELETE' }),
  runCronjob: (id: string) =>
    apiFetch<CronJob>(`/cronjobs/${id}/run`, { method: 'POST' }),
  agentModels: () => apiFetch<Array<{ id: string; name: string; priceIn: number; priceOut: number }>>('/agents/models'),
  updateAgentModel: (agentId: string, model: string) =>
    apiFetch<{ ok: boolean } | object>(`/agents/${agentId}/model`, {
      method: 'PATCH',
      body: JSON.stringify({ model }),
    }),
  llms: () => apiFetch<LLMModel[]>('/llms'),
  health: () => apiFetch<{ status: string; uptime: number; openrouter: boolean; openclaw: boolean }>('/health'),
  login: (email: string, password: string) =>
    apiFetch<{ token: string; refreshToken: string; email: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: () => apiFetch<void>('/auth/logout', { method: 'POST' }),
  github: () => apiFetch<any>('/github'),
  vercel: () => apiFetch<any>('/vercel'),
  supabase: () => apiFetch<any>('/supabase'),
};
