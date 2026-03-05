import { Router } from 'express';
import { parseMemoryFile } from '../services/neural.js';

export const neuralRouter = Router();

neuralRouter.get('/neural', async (_req, res) => {
  try {
    const data = await parseMemoryFile();
    res.json(data);
  } catch (error) {
    console.error('[Neural] Error:', error);
    res.status(500).json({ error: 'Failed to load neural data', nodes: [], links: [] });
  }
});
