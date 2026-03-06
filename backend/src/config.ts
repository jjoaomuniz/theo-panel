import dotenv from 'dotenv';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import type { AgentConfig } from './types/index.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Agent definitions ──────────────────────────────────────
export const AGENTS: AgentConfig[] = [
  {
    id: 'bruno',
    name: 'Bruno',
    role: 'CTO — Infra & Código',
    emoji: '🧠',
    model: 'moonshotai/kimi-k2.5',
    dirName: 'bruno',
  },
  {
    id: 'leo',
    name: 'Leo',
    role: 'CFO — Finanças & Custos',
    emoji: '📊',
    model: 'moonshotai/kimi-k2.5',
    dirName: 'leo',
  },
  {
    id: 'marco',
    name: 'Marco',
    role: 'COO — Operações & Processos',
    emoji: '⚙️',
    model: 'moonshotai/kimi-k2.5',
    dirName: 'marco',
  },
];

// ─── Environment ─────────────────────────────────────────────
const homeDir = os.homedir(); // cross-platform (Windows + Linux)

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // OpenRouter
  openrouterApiKey: process.env.OPENROUTER_API_KEY || '',
  openrouterBaseUrl: 'https://openrouter.ai',

  // OpenClaw paths
  openclawDir: process.env.OPENCLAW_DIR || path.join(homeDir, '.openclaw'),
  memoryFile: process.env.MEMORY_FILE || path.join(homeDir, '.openclaw', 'MEMORY.md'),

  // Cron jobs config
  cronjobsFile: process.env.CRONJOBS_FILE || path.join(__dirname, '..', 'cronjobs.json'),

  // Cache TTLs (milliseconds)
  cacheTTL: {
    api: 60_000,    // 60s for external API calls
    files: 10_000,  // 10s for local file reads
  },
} as const;

// ─── Startup validation ─────────────────────────────────────
export function validateConfig(): string[] {
  const warnings: string[] = [];

  if (!config.openrouterApiKey) {
    warnings.push('OPENROUTER_API_KEY not set — cost/model endpoints will return empty data');
  }

  if (config.port < 1 || config.port > 65535) {
    warnings.push(`Invalid PORT: ${config.port}, using 3001`);
  }

  return warnings;
}
