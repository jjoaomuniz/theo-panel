import { Router } from 'express';
import { getCronJobs, toggleCronJob, createCronJob, deleteCronJob, runCronJobNow } from '../services/cronjob.js';
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

cronjobsRouter.post('/cronjobs', async (req, res) => {
  try {
    const { name, schedule, command, agentId } = req.body ?? {};
    if (!name || !schedule) {
      res.status(400).json(errorResponse('name e schedule são obrigatórios', 'VALIDATION_ERROR'));
      return;
    }
    const job = await createCronJob({ name, schedule, command, agentId });
    res.status(201).json(job);
  } catch (error) {
    console.error('[CronJobs] Create error:', error);
    res.status(500).json(errorResponse('Failed to create cron job', 'CRONJOBS_ERROR'));
  }
});

cronjobsRouter.delete('/cronjobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isSafeId(id)) { res.status(400).json(errorResponse('Invalid ID', 'VALIDATION_ERROR')); return; }
    const deleted = await deleteCronJob(id);
    if (!deleted) { res.status(404).json(errorResponse('Job not found', 'NOT_FOUND')); return; }
    res.json({ ok: true });
  } catch (error) {
    console.error('[CronJobs] Delete error:', error);
    res.status(500).json(errorResponse('Failed to delete cron job', 'CRONJOBS_ERROR'));
  }
});

cronjobsRouter.post('/cronjobs/:id/run', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isSafeId(id)) { res.status(400).json(errorResponse('Invalid ID', 'VALIDATION_ERROR')); return; }
    const job = await runCronJobNow(id);
    if (!job) { res.status(404).json(errorResponse('Job not found', 'NOT_FOUND')); return; }
    res.json(job);
  } catch (error) {
    console.error('[CronJobs] Run error:', error);
    res.status(500).json(errorResponse('Failed to run cron job', 'CRONJOBS_ERROR'));
  }
});
