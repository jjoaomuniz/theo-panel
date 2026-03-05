import { Router } from 'express';
import { getCronJobs, toggleCronJob } from '../services/cronjob.js';

export const cronjobsRouter = Router();

cronjobsRouter.get('/cronjobs', async (_req, res) => {
  try {
    const jobs = await getCronJobs();
    res.json(jobs);
  } catch (error) {
    console.error('[CronJobs] Error:', error);
    res.status(500).json([]);
  }
});

cronjobsRouter.put('/cronjobs/:id/toggle', async (req, res) => {
  try {
    const job = await toggleCronJob(req.params.id);
    if (!job) {
      res.status(404).json({ error: 'Cron job not found' });
      return;
    }
    res.json(job);
  } catch (error) {
    console.error('[CronJobs] Toggle error:', error);
    res.status(500).json({ error: 'Failed to toggle cron job' });
  }
});
