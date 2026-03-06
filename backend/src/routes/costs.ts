import { Router } from 'express';
import { getDailyCostsByAgent, getCredits } from '../services/openrouter.js';
import { parseIntParam, errorResponse } from '../lib/validate.js';

export const costsRouter = Router();

costsRouter.get('/costs', async (req, res) => {
  try {
    const days = parseIntParam(req.query.days, 30, 1, 90);

    const [daily, credits] = await Promise.all([
      getDailyCostsByAgent(days),
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
    res.status(500).json(errorResponse('Failed to fetch cost data', 'COSTS_ERROR'));
  }
});
