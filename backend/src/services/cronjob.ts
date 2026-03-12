import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import { config } from '../config.js';
import { cache } from './cache.js';
import type { CronJob } from '../types/index.js';

const execAsync = promisify(exec);

// ─── Default cron jobs ───────────────────────────────────────
const DEFAULT_CRONJOBS: CronJob[] = [
  {
    id: 'cron-1',
    name: 'Sync MEMORY.md',
    schedule: '06h15',
    command: '',
    lastRun: new Date(Date.now() - 3_600_000).toISOString(),
    lastRunStatus: 'ok',
    nextRun: getNextRunTime('06:15'),
    enabled: true,
  },
  {
    id: 'cron-2',
    name: 'Relatório de Custos',
    schedule: '08h00',
    command: '',
    lastRun: new Date(Date.now() - 7_200_000).toISOString(),
    lastRunStatus: 'ok',
    nextRun: getNextRunTime('08:00'),
    enabled: true,
  },
  {
    id: 'cron-3',
    name: 'Backup Sessions',
    schedule: '02h00',
    command: '',
    lastRun: new Date(Date.now() - 86_400_000).toISOString(),
    lastRunStatus: 'ok',
    nextRun: getNextRunTime('02:00'),
    enabled: true,
  },
  {
    id: 'cron-4',
    name: 'Check API Health',
    schedule: '*/30min',
    command: '',
    lastRun: new Date(Date.now() - 1_800_000).toISOString(),
    lastRunStatus: 'ok',
    nextRun: new Date(Date.now() + 1_800_000).toISOString(),
    enabled: true,
  },
  {
    id: 'cron-5',
    name: 'Limpar Cache',
    schedule: '00h00',
    command: '',
    lastRun: new Date(Date.now() - 43_200_000).toISOString(),
    lastRunStatus: 'skipped',
    nextRun: getNextRunTime('00:00'),
    enabled: false,
  },
];

// ─── Schedule parsing ────────────────────────────────────────

function getNextRunTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const next = new Date();
  next.setHours(hours, minutes, 0, 0);
  if (next.getTime() <= Date.now()) next.setDate(next.getDate() + 1);
  return next.toISOString();
}

interface ScheduleParsed {
  firstMs: number;
  intervalMs: number;
}

function parseSchedule(schedule: string): ScheduleParsed | null {
  // Interval: "*/30min", "*/5min", "*/60min"
  const intervalMatch = schedule.match(/^\*\/(\d+)min$/);
  if (intervalMatch) {
    const ms = parseInt(intervalMatch[1]) * 60_000;
    return { firstMs: ms, intervalMs: ms };
  }

  // Daily time: "06h15", "02h00"
  const timeMatch = schedule.match(/^(\d{2})h(\d{2})$/);
  if (timeMatch) {
    const h = parseInt(timeMatch[1]);
    const m = parseInt(timeMatch[2]);
    const now = new Date();
    const target = new Date();
    target.setHours(h, m, 0, 0);
    if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
    return { firstMs: target.getTime() - now.getTime(), intervalMs: 24 * 60 * 60_000 };
  }

  return null;
}

// ─── Command execution ───────────────────────────────────────

async function executeCommand(command: string): Promise<{ success: boolean; output: string }> {
  if (!command?.trim()) return { success: true, output: 'No command configured' };
  try {
    const { stdout, stderr } = await execAsync(command, { timeout: 30_000 });
    return { success: true, output: (stdout + stderr).trim().slice(0, 500) || 'Done' };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, output: msg.slice(0, 500) };
  }
}

// ─── File persistence ────────────────────────────────────────

async function loadCronJobs(): Promise<CronJob[]> {
  try {
    const content = await fs.readFile(config.cronjobsFile, 'utf-8');
    return JSON.parse(content) as CronJob[];
  } catch {
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

export async function createCronJob(data: { name: string; schedule: string; command?: string; agentId?: string }): Promise<CronJob> {
  const jobs = await loadCronJobs();
  const parsed = parseSchedule(data.schedule);
  const newJob: CronJob = {
    id: `cron-${Date.now()}`,
    name: data.name,
    schedule: data.schedule,
    command: data.command || '',
    agentId: data.agentId,
    lastRun: new Date(0).toISOString(),
    lastRunStatus: 'skipped',
    nextRun: parsed ? new Date(Date.now() + parsed.firstMs).toISOString() : new Date().toISOString(),
    enabled: true,
  };
  jobs.push(newJob);
  await saveCronJobs(jobs);
  // Schedule this new job immediately
  scheduleJob(newJob);
  return newJob;
}

export async function deleteCronJob(id: string): Promise<boolean> {
  const jobs = await loadCronJobs();
  const idx = jobs.findIndex((j) => j.id === id);
  if (idx === -1) return false;
  jobs.splice(idx, 1);
  await saveCronJobs(jobs);
  // Clear timer if exists
  const timer = activeTimers.get(id);
  if (timer) { clearTimeout(timer); activeTimers.delete(id); }
  return true;
}

export async function runCronJobNow(id: string): Promise<CronJob | null> {
  const jobs = await loadCronJobs();
  const job = jobs.find((j) => j.id === id);
  if (!job) return null;
  await executeJob(job, jobs);
  return jobs.find((j) => j.id === id) ?? null;
}

// ─── Scheduler ───────────────────────────────────────────────

// Import broadcast lazily to avoid circular dependency
let _broadcast: ((msg: { type: string; data: unknown; timestamp: string }) => void) | null = null;

export function setBroadcast(fn: (msg: { type: string; data: unknown; timestamp: string }) => void) {
  _broadcast = fn;
}

const activeTimers = new Map<string, NodeJS.Timeout>();

async function executeJob(job: CronJob, jobs?: CronJob[]): Promise<void> {
  console.log(`[Cron] Running job: ${job.name} (${job.id})`);

  // Load fresh jobs list if not provided
  const allJobs = jobs ?? await loadCronJobs();
  const target = allJobs.find((j) => j.id === job.id);
  if (!target) return;

  // Mark as running
  target.lastRun = new Date().toISOString();
  target.lastRunStatus = 'running';
  await saveCronJobs(allJobs);
  _broadcast?.({ type: 'cronjob:update', data: target, timestamp: new Date().toISOString() });

  // Execute command
  const result = await executeCommand(target.command || '');

  // Update result
  target.lastRunStatus = result.success ? 'ok' : 'error';
  target.lastRunOutput = result.output;

  // Update nextRun
  const parsed = parseSchedule(target.schedule);
  if (parsed) {
    target.nextRun = new Date(Date.now() + parsed.intervalMs).toISOString();
  }

  await saveCronJobs(allJobs);
  _broadcast?.({ type: 'cronjob:update', data: target, timestamp: new Date().toISOString() });
  console.log(`[Cron] Job ${job.name} finished: ${target.lastRunStatus}`);
}

function scheduleJob(job: CronJob): void {
  if (!job.enabled) return;

  const parsed = parseSchedule(job.schedule);
  if (!parsed) {
    console.warn(`[Cron] Unknown schedule format: ${job.schedule} for job ${job.name}`);
    return;
  }

  // Clear existing timer
  const existing = activeTimers.get(job.id);
  if (existing) clearTimeout(existing);

  const fire = async () => {
    try {
      await executeJob(job);
    } catch (err) {
      console.error(`[Cron] Error executing job ${job.name}:`, err);
    }
    // Schedule next run
    const timer = setTimeout(fire, parsed.intervalMs);
    activeTimers.set(job.id, timer);
  };

  const timer = setTimeout(fire, parsed.firstMs);
  activeTimers.set(job.id, timer);
  console.log(`[Cron] Scheduled "${job.name}" — first run in ${Math.round(parsed.firstMs / 60_000)}min`);
}

export async function startScheduler(): Promise<void> {
  console.log('[Cron] Starting scheduler...');
  const jobs = await loadCronJobs();
  let scheduled = 0;
  for (const job of jobs) {
    if (job.enabled) {
      scheduleJob(job);
      scheduled++;
    }
  }
  console.log(`[Cron] Scheduler started — ${scheduled}/${jobs.length} jobs active`);
}
