import { Router } from 'express';
import { getDailyCostsByAgent, getCredits } from '../services/openrouter.js';

export const costsRouter = Router();

costsRouter.get('/costs', async (_req, res) => {
  try {
    const [daily, credits] = await Promise.all([
      getDailyCostsByAgent(30),
      getCredits().catch(() => null),
    ]);

    const total = daily.reduce((sum, d) => sum + d.total, 0);
    const average = daily.length > 0 ? total / daily.length : 0;
    const daysInMonth = 30;
    const daysSoFar = daily.length || 1;
    const projection = (total / daysSoFar) * daysInMonth;

    res.json({
      daily,
      summary: {
        total: Math.round(total * 100) / 100,
        average: Math.round(average * 100) / 100,
        projection: Math.round(projection * 100) / 100,
      },
      credits: credits
        ? {
            remaining: credits.total_credits - credits.total_usage,
            total: credits.total_credits,
            used: credits.total_usage,
          }
        : null,
    });
  } catch (error) {
    console.error('[Costs] Error:', error);
    res.status(500).json({
      daily: [],
      summary: { total: 0, average: 0, projection: 0 },
      credits: null,
    });
  }
});
