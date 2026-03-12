import { Router } from 'express';
import { getAgents, getAvailableModels, updateAgentModel } from '../services/openclaw.js';
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

agentsRouter.get('/agents/models', async (_req, res) => {
  try {
    const models = await getAvailableModels();
    res.json(models);
  } catch (error) {
    console.error('[Agents] Models error:', error);
    res.status(500).json(errorResponse('Failed to fetch models', 'MODELS_ERROR'));
  }
});

agentsRouter.patch('/agents/:id/model', async (req, res) => {
  try {
    const { id } = req.params;
    const { model } = req.body as { model?: string };
    if (!model || typeof model !== 'string') {
      res.status(400).json(errorResponse('model field required', 'VALIDATION_ERROR'));
      return;
    }
    await updateAgentModel(id, model);
    const agents = await getAgents();
    const updated = agents.find(a => a.id === id);
    res.json(updated || { ok: true });
  } catch (error) {
    console.error('[Agents] Model update error:', error);
    res.status(500).json(errorResponse('Failed to update model', 'UPDATE_ERROR'));
  }
});
