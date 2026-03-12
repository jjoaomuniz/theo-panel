import type { NeuralNode, NeuralLink } from '@/types/neural';
import type { Agent, ActivityItem, CronJob } from '@/types/agents';

// ─── Neural Map Nodes ───────────────────────────────────────
export const mockNodes: NeuralNode[] = [
  // Pessoas
  { id: 'joao', label: 'Joao Muniz', category: 'people', description: 'CEO, empreendedor, pai da Julia', learnedAt: '2024-01-01', connections: ['julia', 'larissa', 'posto', 'fazenda', 'fortaleza', 'theo'] },
  { id: 'julia', label: 'Julia Muniz', category: 'people', description: 'Filha do Joao, nasceu 24/02/2023', learnedAt: '2024-01-01', connections: ['joao', 'escola', 'ballet'] },
  { id: 'larissa', label: 'Larissa', category: 'people', description: 'Esposa do Joao, gravida', learnedAt: '2024-01-01', connections: ['joao', 'gravidez', 'morfologica'] },

  // Projetos
  { id: 'posto', label: 'Posto', category: 'projects', description: 'Negocio do Joao — posto de combustivel', learnedAt: '2024-01-15', connections: ['joao', 'fortaleza'] },
  { id: 'fazenda', label: 'Fazenda Itarema', category: 'projects', description: 'Propriedade rural em Itarema', learnedAt: '2024-01-15', connections: ['joao'] },
  { id: 'painel', label: 'Painel Theo', category: 'projects', description: 'Dashboard de controle do Theo Muniz', learnedAt: '2025-03-01', connections: ['theo', 'neural-map', 'tokens', 'subagentes'] },
  { id: 'controle-fin', label: 'Controle Financeiro', category: 'projects', description: 'Sistema de controle financeiro', learnedAt: '2025-02-01', connections: ['leo', 'meta-2026', 'openrouter-custos'] },

  // Preferencias
  { id: 'escola', label: 'Escola Julia', category: 'preferences', description: 'Escola da Julia — alerta diario 07h10', learnedAt: '2024-02-01', connections: ['julia'] },
  { id: 'ballet', label: 'Ballet Julia', category: 'preferences', description: 'Aula de ballet da Julia', learnedAt: '2024-03-01', connections: ['julia'] },
  { id: 'gravidez', label: 'Gravidez', category: 'preferences', description: 'Larissa gravida, parto previsto set/2026', learnedAt: '2025-01-01', connections: ['larissa', 'morfologica'] },
  { id: 'morfologica', label: 'Morfologica', category: 'preferences', description: 'Exame morfologico do bebe', learnedAt: '2025-02-15', connections: ['larissa', 'gravidez'] },
  { id: 'fortaleza', label: 'Fortaleza', category: 'preferences', description: 'Cidade base — Fortaleza, CE', learnedAt: '2024-01-01', connections: ['joao', 'posto'] },
  { id: 'meta-2026', label: 'Meta 2026', category: 'preferences', description: 'Objetivos financeiros para 2026', learnedAt: '2025-01-01', connections: ['controle-fin', 'leo'] },

  // Tecnologia
  { id: 'theo', label: 'Theo Muniz', category: 'tech', description: 'IA orquestradora principal — Claude Haiku / Kimi K2', learnedAt: '2024-01-01', connections: ['bruno', 'leo', 'marco', 'openrouter', 'openclaw', 'painel', 'joao'] },
  { id: 'bruno', label: 'Bruno (CTO)', category: 'tech', description: 'Subagente CTO — dev, infra, codigo', learnedAt: '2024-01-01', connections: ['theo', 'subagentes'] },
  { id: 'leo', label: 'Leo (CFO)', category: 'tech', description: 'Subagente CFO — financeiro, custos, metricas', learnedAt: '2024-01-01', connections: ['theo', 'subagentes', 'controle-fin', 'meta-2026', 'openrouter-custos'] },
  { id: 'marco', label: 'Marco (COO)', category: 'tech', description: 'Subagente COO — operacoes, cron, automacao', learnedAt: '2024-01-01', connections: ['theo', 'subagentes'] },
  { id: 'openrouter', label: 'OpenRouter', category: 'tech', description: 'Gateway de LLMs — API principal', learnedAt: '2024-01-01', connections: ['theo', 'openrouter-custos'] },
  { id: 'openclaw', label: 'OpenClaw', category: 'tech', description: 'Framework de agentes rodando na VPS', learnedAt: '2024-06-01', connections: ['theo'] },
  { id: 'subagentes', label: 'Subagentes', category: 'tech', description: 'Sistema de 3 subagentes especializados', learnedAt: '2024-01-01', connections: ['bruno', 'leo', 'marco', 'painel'] },
  { id: 'neural-map', label: 'Neural Map', category: 'tech', description: 'Visualizacao de grafo do conhecimento do Theo', learnedAt: '2025-03-01', connections: ['painel'] },
  { id: 'tokens', label: 'Tokens/Custos', category: 'tech', description: 'Monitoramento de tokens e custos da API', learnedAt: '2025-02-01', connections: ['painel', 'openrouter-custos'] },

  // Alertas
  { id: 'openrouter-custos', label: 'Custo API Alto', category: 'alerts', description: 'Alerta: custo OpenRouter acima do limite', learnedAt: '2025-02-20', connections: ['openrouter', 'leo', 'controle-fin', 'tokens'] },
];

// Generate links from node connections
export const mockLinks: NeuralLink[] = (() => {
  const linkSet = new Set<string>();
  const links: NeuralLink[] = [];

  for (const node of mockNodes) {
    for (const targetId of node.connections) {
      const key = [node.id, targetId].sort().join('--');
      if (!linkSet.has(key) && mockNodes.some(n => n.id === targetId)) {
        linkSet.add(key);
        links.push({ source: node.id, target: targetId });
      }
    }
  }

  return links;
})();

// ─── Agents ─────────────────────────────────────────────────
export const mockAgents: Agent[] = [
  {
    id: 'theo',
    name: 'Theo Muniz',
    role: 'Orchestrator',
    emoji: '🧠',
    status: 'active',
    model: 'gemini-2.5-pro',
    lastAction: 'Briefing matinal enviado via Telegram',
    lastActionTime: new Date(Date.now() - 5 * 60_000).toISOString(),
    tokensToday: 28_400,
    tokensWeek: 187_200,
    tokensMonth: 634_800,
    activeTask: 'Orquestrando equipe',
  },
  {
    id: 'bruno',
    name: 'Bruno',
    role: 'CTO',
    emoji: '⚡',
    status: 'active',
    model: 'claude-sonnet-4-5',
    lastAction: 'Verificando PRs no GitHub',
    lastActionTime: new Date(Date.now() - 3 * 60_000).toISOString(),
    tokensToday: 18_400,
    tokensWeek: 97_200,
    tokensMonth: 334_800,
    activeTask: 'Code review do painel',
  },
  {
    id: 'leo',
    name: 'Leo',
    role: 'CFO',
    emoji: '📊',
    status: 'idle',
    model: 'qwen3-235b-a22b',
    lastAction: 'Relatório de custos gerado',
    lastActionTime: new Date(Date.now() - 45 * 60_000).toISOString(),
    tokensToday: 4_200,
    tokensWeek: 28_900,
    tokensMonth: 112_500,
  },
  {
    id: 'marco',
    name: 'Marco',
    role: 'COO',
    emoji: '⚙️',
    status: 'active',
    model: 'gemini-2.5-pro',
    lastAction: 'Atualizando cron do briefing',
    lastActionTime: new Date(Date.now() - 12 * 60_000).toISOString(),
    tokensToday: 8_100,
    tokensWeek: 45_600,
    tokensMonth: 178_300,
    activeTask: 'Configurando alerta Telegram',
  },
  {
    id: 'carla',
    name: 'Carla',
    role: 'CHRO',
    emoji: '👥',
    status: 'idle',
    model: 'qwen3-235b-a22b',
    lastAction: 'Onboarding de novo processo documentado',
    lastActionTime: new Date(Date.now() - 120 * 60_000).toISOString(),
    tokensToday: 1_800,
    tokensWeek: 9_400,
    tokensMonth: 38_200,
  },
  {
    id: 'rafael',
    name: 'Rafael',
    role: 'CLO',
    emoji: '⚖️',
    status: 'idle',
    model: 'deepseek-r1',
    lastAction: 'Análise de contrato de fornecedor',
    lastActionTime: new Date(Date.now() - 240 * 60_000).toISOString(),
    tokensToday: 2_100,
    tokensWeek: 11_200,
    tokensMonth: 44_800,
  },
  {
    id: 'salomao-onchain',
    name: 'Salomão',
    role: 'Trader DeFi',
    emoji: '💰',
    status: 'active',
    model: 'qwen3-235b-a22b',
    lastAction: 'Harvest USDC — Kamino Finance',
    lastActionTime: new Date(Date.now() - 8 * 60_000).toISOString(),
    tokensToday: 3_400,
    tokensWeek: 21_200,
    tokensMonth: 88_400,
    activeTask: 'Monitorando posições DeFi',
  },
  {
    id: 'joao',
    name: 'João',
    role: 'Analista Vendas',
    emoji: '📈',
    status: 'idle',
    model: 'qwen3-235b-a22b',
    lastAction: 'Relatório mensal de aditivos gerado',
    lastActionTime: new Date(Date.now() - 180 * 60_000).toISOString(),
    tokensToday: 1_600,
    tokensWeek: 8_900,
    tokensMonth: 35_200,
  },
  {
    id: 'argus',
    name: 'Argus',
    role: 'SRE',
    emoji: '🔭',
    status: 'active',
    model: 'gemini-2.5-flash',
    lastAction: 'Health check concluído — todos os serviços OK',
    lastActionTime: new Date(Date.now() - 5 * 60_000).toISOString(),
    tokensToday: 2_100,
    tokensWeek: 14_800,
    tokensMonth: 58_200,
    activeTask: 'Monitorando containers',
  },
];

// ─── Activity Feed ──────────────────────────────────────────
export const mockActivities: ActivityItem[] = [
  { id: 'a1',  agentId: 'theo',            agentName: 'Theo',    emoji: '🌅', action: 'Briefing matinal enviado para Telegram', timestamp: new Date(Date.now() - 2 * 60_000).toISOString(),   type: 'success' },
  { id: 'a2',  agentId: 'salomao-onchain', agentName: 'Salomão', emoji: '💰', action: 'Harvest $0.87 USDC — Kamino Finance',    timestamp: new Date(Date.now() - 8 * 60_000).toISOString(),   type: 'success' },
  { id: 'a3',  agentId: 'theo',            agentName: 'Theo',    emoji: '🔴', action: 'Alerta Julia escola disparado 07h10',    timestamp: new Date(Date.now() - 15 * 60_000).toISOString(),  type: 'warning' },
  { id: 'a4',  agentId: 'bruno',           agentName: 'Bruno',   emoji: '⚡', action: 'Verificando issues GitHub (theo-panel)', timestamp: new Date(Date.now() - 32 * 60_000).toISOString(),  type: 'info' },
  { id: 'a5',  agentId: 'marco',           agentName: 'Marco',   emoji: '⚙️', action: 'Cron briefing noturno executado ok',     timestamp: new Date(Date.now() - 55 * 60_000).toISOString(),  type: 'success' },
  { id: 'a6',  agentId: 'leo',             agentName: 'Leo',     emoji: '📊', action: 'Relatório diário de custos OpenRouter',  timestamp: new Date(Date.now() - 72 * 60_000).toISOString(),  type: 'success' },
  { id: 'a7',  agentId: 'rafael',          agentName: 'Rafael',  emoji: '⚖️', action: 'Análise LGPD — política de dados',       timestamp: new Date(Date.now() - 90 * 60_000).toISOString(),  type: 'info' },
  { id: 'a8',  agentId: 'joao',            agentName: 'João',    emoji: '📈', action: 'Relatório de aditivos novembro gerado',  timestamp: new Date(Date.now() - 120 * 60_000).toISOString(), type: 'success' },
  { id: 'a9',  agentId: 'carla',           agentName: 'Carla',   emoji: '👥', action: 'Onboarding Rafael documentado',          timestamp: new Date(Date.now() - 150 * 60_000).toISOString(), type: 'info' },
  { id: 'a10', agentId: 'salomao-onchain', agentName: 'Salomão', emoji: '💰', action: 'Copy trade executado: +$0.12 USDC',      timestamp: new Date(Date.now() - 180 * 60_000).toISOString(), type: 'success' },
  { id: 'a11', agentId: 'bruno',           agentName: 'Bruno',   emoji: '⚡', action: 'PR #42 merged: neural map component',    timestamp: new Date(Date.now() - 240 * 60_000).toISOString(), type: 'success' },
  { id: 'a12', agentId: 'theo',            agentName: 'Theo',    emoji: '🌅', action: 'Sessão de memória consolidada (12 nós)', timestamp: new Date(Date.now() - 300 * 60_000).toISOString(), type: 'info' },
  { id: 'a13', agentId: 'argus', agentName: 'Argus', emoji: '🔭', action: 'Health check: gateway UP, latência 42ms', timestamp: new Date(Date.now() - 25 * 60_000).toISOString(), type: 'success' },
];

// ─── Cron Jobs ──────────────────────────────────────────────
export const mockCronJobs: CronJob[] = [
  { id: 'cron1', name: 'Briefing Matinal', schedule: '06h15', lastRun: 'hoje 06:15', lastRunStatus: 'ok', nextRun: 'amanha 06:15', enabled: true },
  { id: 'cron2', name: 'Alerta Julia Escola', schedule: '07h10', lastRun: 'hoje 07:10', lastRunStatus: 'ok', nextRun: 'amanha 07:10', enabled: true },
  { id: 'cron3', name: 'Briefing Noturno', schedule: '23h00', lastRun: 'ontem 23:00', lastRunStatus: 'ok', nextRun: 'hoje 23:00', enabled: true },
  { id: 'cron4', name: 'Relatorio Custos', schedule: '08h00', lastRun: 'hoje 08:00', lastRunStatus: 'ok', nextRun: 'amanha 08:00', enabled: true },
  { id: 'cron5', name: 'Backup Memoria', schedule: '03h00', lastRun: 'hoje 03:00', lastRunStatus: 'ok', nextRun: 'amanha 03:00', enabled: true },
];

// ─── Cost Data (for charts) ────────────────────────────────
export const mockDailyCosts = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toISOString().split('T')[0],
    theo: +(Math.random() * 1.2 + 0.3).toFixed(2),
    bruno: +(Math.random() * 2 + 0.5).toFixed(2),
    leo: +(Math.random() * 1.5 + 0.3).toFixed(2),
    marco: +(Math.random() * 1.8 + 0.4).toFixed(2),
    total: 0,
  };
}).map(d => ({ ...d, total: +(d.theo + d.bruno + d.leo + d.marco).toFixed(2) }));
