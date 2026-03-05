import { Router } from 'express';
import { getModelMetrics } from '../services/openrouter.js';

export const llmsRouter = Router();

llmsRouter.get('/llms', async (_req, res) => {
  try {
    const models = await getModelMetrics();
    res.json(models);
  } catch (error) {
    console.error('[LLMs] Error:', error);
    // Return fallback data when OpenRouter is unavailable
    res.json([
      {
        id: 'moonshotai/kimi-k2.5',
        name: 'Kimi K2.5',
        provider: 'moonshotai',
        requestsToday: 0,
        avgLatency: '—',
        tokensPerSec: 0,
        costPer1k: '—',
        status: 'offline',
      },
      {
        id: 'moonshotai/kimi-k2',
        name: 'Kimi K2',
        provider: 'moonshotai',
        requestsToday: 0,
        avgLatency: '—',
        tokensPerSec: 0,
        costPer1k: '—',
        status: 'offline',
      },
      {
        id: 'anthropic/claude-3.5-haiku',
        name: 'Claude 3.5 Haiku',
        provider: 'anthropic',
        requestsToday: 0,
        avgLatency: '—',
        tokensPerSec: 0,
        costPer1k: '—',
        status: 'offline',
      },
      {
        id: 'anthropic/claude-sonnet-4',
        name: 'Claude Sonnet 4',
        provider: 'anthropic',
        requestsToday: 0,
        avgLatency: '—',
        tokensPerSec: 0,
        costPer1k: '—',
        status: 'offline',
      },
    ]);
  }
});
