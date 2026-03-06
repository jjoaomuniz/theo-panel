import { Router } from 'express';
import { getAgents } from '../services/openclaw.js';
import { errorResponse } from '../lib/validate.js';

export const agentsRouter = Router();

agentsRouter.get('/agents', async (_req, res) => {
  try {
    const agents = await getAgents();
    res.json(agents);
  } catch (error) {
    console.error('[Agents] Error:', error);
    res.status(500).json(errorResponse('Failed to fetch agents', 'AGENTS_ERROR'));
  }
});
