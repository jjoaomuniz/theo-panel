import { Router } from 'express';
import { getAgents } from '../services/openclaw.js';

export const agentsRouter = Router();

agentsRouter.get('/agents', async (_req, res) => {
  try {
    const agents = await getAgents();
    res.json(agents);
  } catch (error) {
    console.error('[Agents] Error:', error);
    res.status(500).json([]);
  }
});
