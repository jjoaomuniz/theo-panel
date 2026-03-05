import { Router } from 'express';
import { getActivities } from '../services/openclaw.js';

export const activitiesRouter = Router();

activitiesRouter.get('/activities', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const activities = await getActivities(limit);
    res.json(activities);
  } catch (error) {
    console.error('[Activities] Error:', error);
    res.status(500).json([]);
  }
});
