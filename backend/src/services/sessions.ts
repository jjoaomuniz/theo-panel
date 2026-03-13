import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { config, AGENTS } from '../config.js';
import { cache } from './cache.js';

// ─── Types ────────────────────────────────────────────────────
interface UsageEntry {
  agentId: string;
  date: string;        // YYYY-MM-DD local time
  model: string;
  costTotal: number;   // USD
  tokensInput: number;
  tokensOutput: number;
}

/** Convert UTC ISO timestamp to local date string (YYYY-MM-DD) */
function utcToLocalDate(isoStr: string): string {
  if (!isoStr) return 'unknown';
  // new Date() parses ISO correctly; toLocaleDateString gives local date
  const d = new Date(isoStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ─── Read all session files and extract usage ─────────────────
async function parseAllSessions(): Promise<UsageEntry[]> {
  const cached = cache.get<UsageEntry[]>('sessions:all');
  if (cached) return cached;

  const entries: UsageEntry[] = [];
  const agentsDir = path.join(config.openclawDir, 'agents');

  if (!fs.existsSync(agentsDir)) {
    cache.set('sessions:all', entries, config.cacheTTL.files);
    return entries;
  }

  const agentDirs = fs.readdirSync(agentsDir);

  await Promise.all(agentDirs.map(async (agentDir) => {
    const sessionsPath = path.join(agentsDir, agentDir, 'sessions');
    if (!fs.existsSync(sessionsPath)) return;

    // Include both active sessions and deleted ones (deleted = session that was archived)
    const files = fs.readdirSync(sessionsPath).filter(f => f.includes('.jsonl'));

    await Promise.all(files.map(async (file) => {
      const filePath = path.join(sessionsPath, file);
      try {
        const rl = readline.createInterface({
          input: fs.createReadStream(filePath),
          crlfDelay: Infinity,
        });

        let currentModel = '';
        for await (const line of rl) {
          if (!line.trim()) continue;
          try {
            const d = JSON.parse(line);

            if (d.type === 'model_change' && d.modelId) {
              currentModel = d.modelId;
            }

            if (d.type === 'message' && d.message?.role === 'assistant') {
              const usage = d.message.usage;
              if (!usage?.cost?.total) continue;

              const ts = d.timestamp || '';
              const date = utcToLocalDate(ts);

              entries.push({
                agentId: agentDir === 'main' ? 'main' : agentDir,
                date,
                model: currentModel,
                costTotal: usage.cost.total,
                tokensInput: usage.input || 0,
                tokensOutput: usage.output || 0,
              });
            }
          } catch {
            // skip malformed lines
          }
        }
      } catch {
        // skip unreadable files
      }
    }));
  }));

  // Sort by date
  entries.sort((a, b) => a.date.localeCompare(b.date));

  cache.set('sessions:all', entries, config.cacheTTL.files);
  return entries;
}

// ─── Public: daily costs grouped by agent ────────────────────
export async function getDailyCostsByAgent(days: number = 30) {
  const cacheKey = `sessions:daily-by-agent:${days}`;
  const cached = cache.get<{ date: string; theo: number; bruno: number; leo: number; marco: number; total: number }[]>(cacheKey);
  if (cached) return cached;

  const entries = await parseAllSessions();

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = utcToLocalDate(cutoff.toISOString());

  const byDate = new Map<string, Record<string, number>>();

  for (const e of entries) {
    if (e.date < cutoffStr) continue;
    const row = byDate.get(e.date) || {};
    row[e.agentId] = (row[e.agentId] || 0) + e.costTotal;
    row['__total'] = (row['__total'] || 0) + e.costTotal;
    byDate.set(e.date, row);
  }

  const result = Array.from(byDate.entries())
    .map(([date, row]) => ({
      date,
      theo:  Math.round((row['main'] || 0) * 100000) / 100000,
      bruno: Math.round((row['bruno'] || 0) * 100000) / 100000,
      leo:   Math.round((row['leo'] || 0) * 100000) / 100000,
      marco: Math.round((row['marco'] || 0) * 100000) / 100000,
      total: Math.round((row['__total'] || 0) * 100000) / 100000,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  cache.set(cacheKey, result, config.cacheTTL.files);
  return result;
}

// ─── Public: cost breakdown by model ─────────────────────────
export async function getModelBreakdown(days: number = 30) {
  const cacheKey = `sessions:model-breakdown:${days}`;
  const cached = cache.get<{ model: string; name: string; cost: number; tokens: number; requests: number; pct: number }[]>(cacheKey);
  if (cached) return cached;

  const entries = await parseAllSessions();

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = utcToLocalDate(cutoff.toISOString());

  const byModel = new Map<string, { cost: number; tokens: number; requests: number }>();

  for (const e of entries) {
    if (e.date < cutoffStr || !e.model) continue;
    const existing = byModel.get(e.model) || { cost: 0, tokens: 0, requests: 0 };
    existing.cost += e.costTotal;
    existing.tokens += e.tokensInput + e.tokensOutput;
    existing.requests += 1;
    byModel.set(e.model, existing);
  }

  const totalCost = Array.from(byModel.values()).reduce((s, v) => s + v.cost, 0);

  const result = Array.from(byModel.entries())
    .map(([model, data]) => ({
      model,
      name: model.split('/').pop() || model,
      cost: Math.round(data.cost * 100000) / 100000,
      tokens: data.tokens,
      requests: data.requests,
      pct: totalCost > 0 ? Math.round((data.cost / totalCost) * 100) : 0,
    }))
    .sort((a, b) => b.cost - a.cost);

  cache.set(cacheKey, result, config.cacheTTL.files);
  return result;
}

// ─── Public: history by period (daily/weekly/monthly) ────────
export async function getHistoryByPeriod() {
  const cacheKey = 'sessions:history-periods';
  const cached = cache.get<{
    daily: { date: string; cost: number }[];
    weekly: { date: string; cost: number }[];
    monthly: { date: string; cost: number }[];
  }>(cacheKey);
  if (cached) return cached;

  const entries = await parseAllSessions();

  // Daily — last 30 days
  const byDate = new Map<string, number>();
  for (const e of entries) {
    byDate.set(e.date, (byDate.get(e.date) || 0) + e.costTotal);
  }
  const daily = Array.from(byDate.entries())
    .map(([date, cost]) => ({ date, cost: Math.round(cost * 100000) / 100000 }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  // Weekly — group by week starting Monday
  const byWeek = new Map<string, number>();
  for (const e of entries) {
    const d = new Date(e.date + 'T12:00:00Z');
    const day = d.getUTCDay(); // 0=Sun
    const diff = day === 0 ? -6 : 1 - day; // shift to Monday
    const weekStart = new Date(d);
    weekStart.setUTCDate(d.getUTCDate() + diff);
    const weekKey = utcToLocalDate(weekStart.toISOString());
    byWeek.set(weekKey, (byWeek.get(weekKey) || 0) + e.costTotal);
  }
  const weekly = Array.from(byWeek.entries())
    .map(([date, cost]) => ({ date, cost: Math.round(cost * 100000) / 100000 }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-8);

  // Monthly
  const byMonth = new Map<string, number>();
  for (const e of entries) {
    const monthKey = e.date.slice(0, 7);
    byMonth.set(monthKey, (byMonth.get(monthKey) || 0) + e.costTotal);
  }
  const monthly = Array.from(byMonth.entries())
    .map(([date, cost]) => ({ date, cost: Math.round(cost * 100000) / 100000 }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-6);

  const result = { daily, weekly, monthly };
  cache.set(cacheKey, result, config.cacheTTL.files);
  return result;
}

// ─── Public: today's cost per agent (for dashboard) ──────────
export async function getTodayCostByAgent(): Promise<Record<string, number>> {
  const today = utcToLocalDate(new Date().toISOString());
  const entries = await parseAllSessions();

  const result: Record<string, number> = {};
  for (const e of entries) {
    if (e.date !== today) continue;
    const agentId = e.agentId === 'main' ? 'theo' : e.agentId;
    result[agentId] = (result[agentId] || 0) + e.costTotal;
  }
  return result;
}
