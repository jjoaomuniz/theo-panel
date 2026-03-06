import { Router } from 'express';
import { getModelMetrics } from '../services/openrouter.js';
import { errorResponse } from '../lib/validate.js';

export const llmsRouter = Router();

llmsRouter.get('/llms', async (_req, res) => {
  try {
    const models = await getModelMetrics();
    res.json(models);
  } catch (error) {
    console.error('[LLMs] Error:', error);
    res.status(500).json(errorResponse('Failed to fetch LLM metrics', 'LLMS_ERROR'));
  }
});
