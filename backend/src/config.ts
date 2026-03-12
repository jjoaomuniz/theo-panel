import dotenv from 'dotenv';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Agent config type ───────────────────────────────────────
export interface AgentConfig {
  id: string;
  dirName: string;
  name: string;
  role: string;
  emoji: string;
  model: string;
  modelPriceIn: number;   // USD per 1M input tokens
  modelPriceOut: number;  // USD per 1M output tokens
}

// ─── Agent list (order = display order) ─────────────────────
export const AGENTS: AgentConfig[] = [
  { id: 'main',            dirName: 'main',            name: 'Theo',    role: 'Chief of Staff — Orchestrator',     emoji: '🧠', model: 'openrouter/google/gemini-2.5-pro',    modelPriceIn: 1.25,  modelPriceOut: 10.0  },
  { id: 'bruno',           dirName: 'bruno',           name: 'Bruno',   role: 'CTO — Tecnologia & Dev',            emoji: '⚡', model: 'openrouter/anthropic/claude-sonnet-4-5', modelPriceIn: 3.0, modelPriceOut: 15.0  },
  { id: 'leo',             dirName: 'leo',             name: 'Leo',     role: 'CFO — Finanças & Controle',         emoji: '📊', model: 'openrouter/qwen/qwen3-235b-a22b',     modelPriceIn: 0.13,  modelPriceOut: 0.6   },
  { id: 'marco',           dirName: 'marco',           name: 'Marco',   role: 'COO — Operações',                   emoji: '⚙️', model: 'openrouter/google/gemini-2.5-pro',    modelPriceIn: 1.25,  modelPriceOut: 10.0  },
  { id: 'carla',           dirName: 'carla',           name: 'Carla',   role: 'CHRO — Pessoas & Cultura',          emoji: '👥', model: 'openrouter/qwen/qwen3-235b-a22b',     modelPriceIn: 0.13,  modelPriceOut: 0.6   },
  { id: 'rafael',          dirName: 'rafael',          name: 'Rafael',  role: 'CLO — Jurídico & Compliance',       emoji: '⚖️', model: 'openrouter/deepseek/deepseek-r1',      modelPriceIn: 0.55,  modelPriceOut: 2.19  },
  { id: 'salomao-onchain', dirName: 'salomao-onchain', name: 'Salomão', role: 'Trader DeFi — Solana',              emoji: '💰', model: 'openrouter/qwen/qwen3-235b-a22b',     modelPriceIn: 0.13,  modelPriceOut: 0.6   },
  { id: 'joao',            dirName: 'joao',            name: 'João',    role: 'Analista de Vendas — Lubrificantes', emoji: '📈', model: 'openrouter/qwen/qwen3-235b-a22b',    modelPriceIn: 0.13,  modelPriceOut: 0.6   },
  { id: 'argus',           dirName: 'argus',           name: 'Argus',   role: 'SRE — Monitoramento & Infraestrutura', emoji: '🔭', model: 'openrouter/google/gemini-2.5-flash', modelPriceIn: 0.15, modelPriceOut: 0.6   },
];

// ─── Known agent metadata (role/emoji for display) ──────────
export const KNOWN_AGENT_METADATA: Record<string, { name: string; role: string; emoji: string }> =
  Object.fromEntries(AGENTS.map(a => [a.id, { name: a.name, role: a.role, emoji: a.emoji }]));

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

  // Panel auth
  panelUsername: process.env.PANEL_USERNAME || 'admin',
  panelPassword: process.env.PANEL_PASSWORD || 'admin',

  // Integrations
  githubToken: process.env.GITHUB_TOKEN || '',
  vercelToken: process.env.VERCEL_TOKEN || '',

  // Supabase
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || '',

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
