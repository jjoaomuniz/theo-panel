import { Router } from 'express';
import { getCronJobs, toggleCronJob } from '../services/cronjob.js';
import { isSafeId, errorResponse } from '../lib/validate.js';

export const cronjobsRouter = Router();

cronjobsRouter.get('/cronjobs', async (_req, res) => {
  try {
    const jobs = await getCronJobs();
    res.json(jobs);
  } catch (error) {
    console.error('[CronJobs] Error:', error);
    res.status(500).json(errorResponse('Failed to fetch cron jobs', 'CRONJOBS_ERROR'));
  }
});

cronjobsRouter.put('/cronjobs/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isSafeId(id)) {
      res.status(400).json(errorResponse('Invalid cron job ID', 'INVALID_ID'));
      return;
    }

    const job = await toggleCronJob(id);
    if (!job) {
      res.status(404).json(errorResponse('Cron job not found', 'NOT_FOUND'));
      return;
    }
    res.json(job);
  } catch (error) {
    console.error('[CronJobs] Toggle error:', error);
    res.status(500).json(errorResponse('Failed to toggle cron job', 'TOGGLE_ERROR'));
  }
});
