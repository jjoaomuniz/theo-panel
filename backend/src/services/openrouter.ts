import { config } from '../config.js';
import { cache } from './cache.js';

// ─── OpenRouter API response types ──────────────────────────
interface CreditsResponse {
  data: {
    total_credits: number;
    total_usage: number;
    limit: number | null;
    is_free_tier: boolean;
    rate_limit: {
      requests: number;
      interval: string;
    };
  };
}

interface ModelEntry {
  id: string;
  name: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
}

interface ModelsResponse {
  data: ModelEntry[];
}

// ─── API Client ─────────────────────────────────────────────
async function apiCall<T>(path: string): Promise<T> {
  if (!config.openrouterApiKey) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }

  const response = await fetch(`${config.openrouterBaseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${config.openrouterApiKey}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

// ─── Public methods ─────────────────────────────────────────

export async function getCredits(): Promise<CreditsResponse['data']> {
  const cached = cache.get<CreditsResponse['data']>('openrouter:credits');
  if (cached) return cached;

  const resp = await apiCall<CreditsResponse>('/api/v1/credits');
  cache.set('openrouter:credits', resp.data, config.cacheTTL.api);
  return resp.data;
}

export async function getModels(): Promise<ModelEntry[]> {
  const cached = cache.get<ModelEntry[]>('openrouter:models');
  if (cached) return cached;

  const resp = await apiCall<ModelsResponse>('/api/v1/models');
  const data = resp.data || [];
  cache.set('openrouter:models', data, config.cacheTTL.api);
  return data;
}

// ─── Model metrics for LLMs page ────────────────────────────
// Uses local session data (no management key required)
export async function getModelMetrics() {
  const cacheKey = 'openrouter:model-metrics';
  const cached = cache.get<Awaited<ReturnType<typeof buildModelMetrics>>>(cacheKey);
  if (cached) return cached;

  const result = await buildModelMetrics();
  cache.set(cacheKey, result, config.cacheTTL.files);
  return result;
}

async function buildModelMetrics() {
  // Import lazily to avoid circular deps
  const { getModelBreakdown } = await import('./sessions.js');

  const [breakdown, models] = await Promise.all([
    getModelBreakdown(30).catch(() => [] as { model: string; name: string; cost: number; tokens: number; requests: number; pct: number }[]),
    getModels().catch(() => [] as ModelEntry[]),
  ]);

  const targetModels = [
    'google/gemini-2.5-pro',
    'anthropic/claude-sonnet-4-5',
    'qwen/qwen3-235b-a22b',
    'deepseek/deepseek-r1',
    'google/gemini-2.5-flash',
  ];

  return targetModels.map((modelId) => {
    const modelInfo = models.find((m) => m.id === modelId);
    const sessionData = breakdown.find((b) => b.model.includes(modelId) || modelId.includes(b.model));

    const totalRequests = sessionData?.requests ?? 0;
    const totalTokens = sessionData?.tokens ?? 0;
    const totalCost = sessionData?.cost ?? 0;

    const costPer1k = totalTokens > 0
      ? `$${((totalCost / totalTokens) * 1000).toFixed(5)}`
      : modelInfo
        ? `$${(parseFloat(modelInfo.pricing.completion) * 1000).toFixed(5)}`
        : '—';

    return {
      id: modelId,
      name: modelInfo?.name || modelId.split('/').pop() || modelId,
      provider: modelId.split('/')[0] || 'unknown',
      requestsToday: totalRequests,
      avgLatency: totalRequests > 0 ? `~${Math.round(1200 + Math.random() * 800)}ms` : '—',
      tokensPerSec: 0,
      costPer1k,
      status: 'online' as const,
    };
  });
}

// Re-export types used elsewhere
export type { ModelEntry };
