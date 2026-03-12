import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { config, AGENTS } from '../config.js';
import { cache } from './cache.js';
import type { Agent, AgentStatus, ActivityItem, ActivityType } from '../types/index.js';

const execAsync = promisify(exec);

// ─── JSONL Entry types (OpenClaw session format) ────────────
interface SessionEntry {
  type?: string;
  role?: 'human' | 'assistant' | 'system' | 'tool';
  message?: {
    role?: string;
    content?: string | Array<{ type: string; text?: string; name?: string }>;
    model?: string;
  };
  timestamp?: string;
  costUSD?: number;
  durationMs?: number;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    cost?: {
      total?: number;
    };
  };
  sessionId?: string;
  // Tool use fields
  tool_name?: string;
  tool_input?: unknown;
  result?: string;
  error?: string;
}

// ─── Session file helpers ───────────────────────────────────

/** List all session JSONL files for an agent, sorted by modification time (newest first) */
async function getSessionFiles(agentDir: string): Promise<string[]> {
  const sessionsDir = path.join(config.openclawDir, 'agents', agentDir, 'sessions');
  try {
    const files = await fs.readdir(sessionsDir);
    const jsonlFiles = files.filter((f) => f.endsWith('.jsonl'));

    // Sort by modification time, newest first
    const withStats = await Promise.all(
      jsonlFiles.map(async (f) => {
        const fullPath = path.join(sessionsDir, f);
        const stat = await fs.stat(fullPath);
        return { file: fullPath, mtime: stat.mtimeMs };
      })
    );

    return withStats.sort((a, b) => b.mtime - a.mtime).map((s) => s.file);
  } catch {
    return [];
  }
}

/** Parse a JSONL file into entries */
async function parseJsonlFile(filePath: string): Promise<SessionEntry[]> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => {
        try {
          return JSON.parse(line) as SessionEntry;
        } catch {
          return null;
        }
      })
      .filter((entry): entry is SessionEntry => entry !== null);
  } catch {
    return [];
  }
}

/** Extract text content from a message entry */
function extractText(entry: SessionEntry): string {
  if (!entry.message) return '';
  const content = entry.message.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    const textPart = content.find((c) => c.type === 'text');
    return textPart?.text || '';
  }
  return '';
}

// ─── Public API ─────────────────────────────────────────────

/** Read current model assignment from openclaw.json */
async function getCurrentModels(): Promise<Record<string, string>> {
  try {
    const content = await fs.readFile(path.join(config.openclawDir, 'openclaw.json'), 'utf-8');
    const data = JSON.parse(content);
    const models: Record<string, string> = {};
    const defaultModel = data.agents?.defaults?.model?.primary || '';
    if (defaultModel) models['__default'] = defaultModel;
    for (const agent of data.agents?.list || []) {
      if (agent.id && agent.model?.primary) {
        models[agent.id] = agent.model.primary;
      }
    }
    return models;
  } catch {
    return {};
  }
}

/** Get list of available models from openclaw.json */
export async function getAvailableModels(): Promise<{ id: string; name: string; priceIn: number; priceOut: number }[]> {
  try {
    const content = await fs.readFile(path.join(config.openclawDir, 'openclaw.json'), 'utf-8');
    const data = JSON.parse(content);
    const models = data.models?.providers?.openrouter?.models || [];
    return models.map((m: { id: string; name: string; cost?: { input?: number; output?: number } }) => ({
      id: `openrouter/${m.id}`,
      name: m.name || m.id,
      priceIn: m.cost?.input || 0,
      priceOut: m.cost?.output || 0,
    }));
  } catch {
    return [];
  }
}

/** Update an agent's model in openclaw.json */
export async function updateAgentModel(agentId: string, newModel: string): Promise<void> {
  const filePath = path.join(config.openclawDir, 'openclaw.json');
  const content = await fs.readFile(filePath, 'utf-8');
  const data = JSON.parse(content);

  let found = false;
  for (const agent of data.agents?.list || []) {
    if (agent.id === agentId) {
      if (!agent.model) agent.model = {};
      agent.model.primary = newModel;
      found = true;
      break;
    }
  }

  if (!found) {
    throw new Error(`Agent ${agentId} not found in openclaw.json`);
  }

  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');

  // Fix file ownership so the container can read it
  await execAsync('chown 1000 ' + filePath).catch(() => {});

  // Invalidate caches
  cache.invalidatePrefix('openclaw:');
}

/** Get all agents with their current status */
export async function getAgents(): Promise<Agent[]> {
  const cached = cache.get<Agent[]>('openclaw:agents');
  if (cached) return cached;

  const currentModels = await getCurrentModels();

  const agents = await Promise.all(
    AGENTS.map(async (agentConfig) => {
      const sessionFiles = await getSessionFiles(agentConfig.dirName);

      let status: AgentStatus = 'idle';
      let lastAction = 'Nenhuma ação registrada';
      let lastActionTime = new Date().toISOString();
      let activeTask: string | undefined;
      let tokensToday = 0;
      let tokensWeek = 0;
      let tokensMonth = 0;

      if (sessionFiles.length > 0) {
        // Check most recent session for status
        const latestFile = sessionFiles[0];
        try {
          const stat = await fs.stat(latestFile);
          const ageMs = Date.now() - stat.mtimeMs;

          // Active if modified in last 2 minutes
          if (ageMs < 2 * 60 * 1000) {
            status = 'executing';
          } else if (ageMs < 10 * 60 * 1000) {
            status = 'active';
          }
        } catch {
          // ignore
        }

        // Parse latest session for last action
        const entries = await parseJsonlFile(latestFile);
        const assistantEntries = entries.filter(
          (e) => e.role === 'assistant' || e.message?.role === 'assistant'
        );

        if (assistantEntries.length > 0) {
          const last = assistantEntries[assistantEntries.length - 1];
          const text = extractText(last);
          lastAction = text.slice(0, 120) || 'Processando...';
          lastActionTime = last.timestamp || new Date().toISOString();

          // Check if there's an active task (tool call without result)
          const lastToolUse = [...entries].reverse().find((e: SessionEntry) => e.type === 'tool_use' || e.tool_name);
          const lastToolResult = [...entries].reverse().find((e: SessionEntry) => e.type === 'tool_result' || e.result);
          if (
            lastToolUse &&
            (!lastToolResult ||
              entries.indexOf(lastToolUse) > entries.indexOf(lastToolResult))
          ) {
            activeTask = `Executando: ${lastToolUse.tool_name || 'ferramenta'}`;
          }
        }

        // Calculate token usage across sessions
        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;
        const todayStart = now - dayMs;
        const weekStart = now - 7 * dayMs;
        const monthStart = now - 30 * dayMs;

        // Process recent session files for token counts
        for (const sessionFile of sessionFiles.slice(0, 20)) {
          try {
            const stat = await fs.stat(sessionFile);
            if (stat.mtimeMs < monthStart) break; // Skip older files

            const entries = await parseJsonlFile(sessionFile);
            for (const entry of entries) {
              const tokens =
                (entry.usage?.input_tokens || 0) + (entry.usage?.output_tokens || 0);
              const ts = entry.timestamp ? new Date(entry.timestamp).getTime() : stat.mtimeMs;

              if (ts >= todayStart) tokensToday += tokens;
              if (ts >= weekStart) tokensWeek += tokens;
              if (ts >= monthStart) tokensMonth += tokens;
            }
          } catch {
            // Skip unreadable files
          }
        }
      }

      return {
        id: agentConfig.id,
        name: agentConfig.name,
        role: agentConfig.role,
        emoji: agentConfig.emoji,
        status,
        model: currentModels[agentConfig.id] || currentModels['__default'] || agentConfig.model,
        lastAction,
        lastActionTime,
        tokensToday,
        tokensWeek,
        tokensMonth,
        activeTask,
      } satisfies Agent;
    })
  );

  cache.set('openclaw:agents', agents, config.cacheTTL.files);
  return agents;
}

/** Get recent activity items across all agents */
export async function getActivities(limit: number = 50): Promise<ActivityItem[]> {
  const cached = cache.get<ActivityItem[]>('openclaw:activities');
  if (cached) return cached;

  const allActivities: ActivityItem[] = [];

  for (const agentConfig of AGENTS) {
    const sessionFiles = await getSessionFiles(agentConfig.dirName);

    for (const sessionFile of sessionFiles.slice(0, 5)) {
      const entries = await parseJsonlFile(sessionFile);

      for (const entry of entries) {
        if (!entry.timestamp) continue;

        let action = '';
        let type: ActivityType = 'info';

        if (entry.type === 'tool_use' || entry.tool_name) {
          action = `Executou ferramenta: ${entry.tool_name || 'desconhecida'}`;
          type = 'info';
        } else if (entry.error) {
          action = `Erro: ${entry.error.slice(0, 80)}`;
          type = 'error';
        } else if (entry.role === 'assistant' || entry.message?.role === 'assistant') {
          const text = extractText(entry);
          if (!text) continue;
          action = text.slice(0, 100);
          type = 'success';
        } else if (entry.type === 'tool_result' || entry.result) {
          action = `Resultado: ${(entry.result || '').slice(0, 80)}`;
          type = 'success';
        } else if (entry.costUSD && entry.costUSD > 0.05) {
          action = `Custo elevado: $${entry.costUSD.toFixed(4)}`;
          type = 'warning';
        } else {
          continue; // Skip entries we can't display
        }

        allActivities.push({
          id: `${agentConfig.id}-${entry.timestamp}-${Math.random().toString(36).slice(2, 6)}`,
          agentId: agentConfig.id,
          agentName: agentConfig.name,
          emoji: agentConfig.emoji,
          action,
          timestamp: entry.timestamp,
          type,
        });
      }
    }
  }

  // Sort by timestamp descending, take the latest N
  const result = allActivities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);

  cache.set('openclaw:activities', result, config.cacheTTL.files);
  return result;
}
