import dotenv from 'dotenv';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Known agent metadata (role/emoji for display) ──────────
// Agents not listed here will use generic fallbacks.
export const KNOWN_AGENT_METADATA: Record<string, { name: string; role: string; emoji: string }> = {
  main:   { name: 'Theo',   role: 'CEO — Estratégia & Decisões',    emoji: '👑' },
  bruno:  { name: 'Bruno',  role: 'CTO — Infra & Código',            emoji: '🧠' },
  leo:    { name: 'Leo',    role: 'CFO — Finanças & Custos',         emoji: '📊' },
  marco:  { name: 'Marco',  role: 'COO — Operações & Processos',     emoji: '⚙️' },
  carla:  { name: 'Carla',  role: 'CHRO — Pessoas & Cultura',        emoji: '🌟' },
  rafael: { name: 'Rafael', role: 'CLO — Jurídico & Compliance',     emoji: '⚖️' },
  'salomao-onchain': { name: 'Salomão', role: 'Trader DeFi — Solana',                emoji: '💰' },
  joao:              { name: 'João',    role: 'Analista de Vendas — Lubrificantes', emoji: '📈' },
};

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

  // Integrations (MCP tokens)
  githubToken: process.env.GITHUB_TOKEN || '',
  vercelToken: process.env.VERCEL_TOKEN || '',
  supabaseToken: process.env.SUPABASE_TOKEN || '',

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
