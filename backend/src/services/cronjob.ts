import fs from 'fs/promises';
import { config } from '../config.js';
import { cache } from './cache.js';
import type { CronJob } from '../types/index.js';

// ─── Default cron jobs (pre-seeded) ─────────────────────────
const DEFAULT_CRONJOBS: CronJob[] = [
  {
    id: 'cron-1',
    name: 'Sync MEMORY.md',
    schedule: '06h15',
    lastRun: new Date(Date.now() - 3600000).toISOString(),
    lastRunStatus: 'ok',
    nextRun: getNextRun('06:15'),
    enabled: true,
  },
  {
    id: 'cron-2',
    name: 'Relatório de Custos',
    schedule: '08h00',
    lastRun: new Date(Date.now() - 7200000).toISOString(),
    lastRunStatus: 'ok',
    nextRun: getNextRun('08:00'),
    enabled: true,
  },
  {
    id: 'cron-3',
    name: 'Backup Sessions',
    schedule: '02h00',
    lastRun: new Date(Date.now() - 86400000).toISOString(),
    lastRunStatus: 'ok',
    nextRun: getNextRun('02:00'),
    enabled: true,
  },
  {
    id: 'cron-4',
    name: 'Check API Health',
    schedule: '*/30min',
    lastRun: new Date(Date.now() - 1800000).toISOString(),
    lastRunStatus: 'ok',
    nextRun: new Date(Date.now() + 1800000).toISOString(),
    enabled: true,
  },
  {
    id: 'cron-5',
    name: 'Limpar Cache',
    schedule: '00h00',
    lastRun: new Date(Date.now() - 43200000).toISOString(),
    lastRunStatus: 'skipped',
    nextRun: getNextRun('00:00'),
    enabled: false,
  },
];

function getNextRun(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const next = new Date();
  next.setHours(hours, minutes, 0, 0);
  if (next.getTime() <= Date.now()) {
    next.setDate(next.getDate() + 1);
  }
  return next.toISOString();
}

// ─── File persistence ───────────────────────────────────────

async function loadCronJobs(): Promise<CronJob[]> {
  try {
    const content = await fs.readFile(config.cronjobsFile, 'utf-8');
    return JSON.parse(content) as CronJob[];
  } catch {
    // File doesn't exist, create with defaults
    await saveCronJobs(DEFAULT_CRONJOBS);
    return DEFAULT_CRONJOBS;
  }
}

async function saveCronJobs(jobs: CronJob[]): Promise<void> {
  await fs.writeFile(config.cronjobsFile, JSON.stringify(jobs, null, 2), 'utf-8');
  cache.invalidate('cronjobs:list');
}

// ─── Public API ─────────────────────────────────────────────

export async function getCronJobs(): Promise<CronJob[]> {
  const cached = cache.get<CronJob[]>('cronjobs:list');
  if (cached) return cached;

  const jobs = await loadCronJobs();
  cache.set('cronjobs:list', jobs, config.cacheTTL.files);
  return jobs;
}

export async function toggleCronJob(id: string): Promise<CronJob | null> {
  const jobs = await loadCronJobs();
  const job = jobs.find((j) => j.id === id);
  if (!job) return null;

  job.enabled = !job.enabled;
  await saveCronJobs(jobs);
  return job;
}
