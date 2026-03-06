import { Router } from 'express';
import { getActivities } from '../services/openclaw.js';
import { parseIntParam, errorResponse } from '../lib/validate.js';

export const activitiesRouter = Router();

activitiesRouter.get('/activities', async (req, res) => {
  try {
    const limit = parseIntParam(req.query.limit, 50, 1, 200);
    const activities = await getActivities(limit);
    res.json(activities);
  } catch (error) {
    console.error('[Activities] Error:', error);
    res.status(500).json(errorResponse('Failed to fetch activities', 'ACTIVITIES_ERROR'));
  }
});
