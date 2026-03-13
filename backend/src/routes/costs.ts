import { Router } from 'express';
import { getCredits } from '../services/openrouter.js';
import { getDailyCostsByAgent, getModelBreakdown, getHistoryByPeriod, getTodayCostByAgent } from '../services/sessions.js';
import { parseIntParam, errorResponse } from '../lib/validate.js';

export const costsRouter = Router();

costsRouter.get('/costs', async (req, res) => {
  try {
    const days = parseIntParam(req.query.days, 30, 1, 90);

    const [daily, credits, byModel, history, todayByAgent] = await Promise.all([
      getDailyCostsByAgent(days).catch(() => []),
      getCredits().catch(() => null),
      getModelBreakdown(days).catch(() => []),
      getHistoryByPeriod().catch(() => ({ daily: [], weekly: [], monthly: [] })),
      getTodayCostByAgent().catch(() => ({} as Record<string, number>)),
    ]);

    const total = daily.reduce((sum, d) => sum + d.total, 0);
    const average = daily.length > 0 ? total / daily.length : 0;
    const daysSoFar = daily.length || 1;
    const projection = (total / daysSoFar) * 30;

    res.json({
      daily,
      summary: {
        total: Math.round(total * 10000) / 10000,
        average: Math.round(average * 10000) / 10000,
        projection: Math.round(projection * 10000) / 10000,
      },
      credits: credits
        ? {
            remaining: Math.round((credits.total_credits - credits.total_usage) * 100) / 100,
            total: credits.total_credits,
            used: Math.round(credits.total_usage * 100) / 100,
            isFreeTier: credits.is_free_tier,
          }
        : null,
      byModel,
      history,
      todayByAgent,
    });
  } catch (error) {
    console.error('[Costs] Error:', error);
    res.status(500).json(errorResponse('Failed to fetch cost data', 'COSTS_ERROR'));
  }
});
