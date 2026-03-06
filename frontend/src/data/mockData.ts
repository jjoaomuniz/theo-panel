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
    id: 'bruno',
    name: 'Bruno',
    role: 'CTO',
    emoji: '\u{1F916}',
    status: 'active',
    model: 'kimi-k2.5',
    lastAction: 'Verificando PRs no GitHub',
    lastActionTime: new Date(Date.now() - 3 * 60_000).toISOString(),
    tokensToday: 12_400,
    tokensWeek: 67_200,
    tokensMonth: 234_800,
    activeTask: 'Code review do painel',
  },
  {
    id: 'leo',
    name: 'Leo',
    role: 'CFO',
    emoji: '\u{1F4CA}',
    status: 'idle',
    model: 'kimi-k2.5',
    lastAction: 'Relatorio de custos gerado',
    lastActionTime: new Date(Date.now() - 45 * 60_000).toISOString(),
    tokensToday: 4_200,
    tokensWeek: 28_900,
    tokensMonth: 112_500,
  },
  {
    id: 'marco',
    name: 'Marco',
    role: 'COO',
    emoji: '\u{2699}\u{FE0F}',
    status: 'active',
    model: 'kimi-k2.5',
    lastAction: 'Atualizando cron do briefing',
    lastActionTime: new Date(Date.now() - 12 * 60_000).toISOString(),
    tokensToday: 8_100,
    tokensWeek: 45_600,
    tokensMonth: 178_300,
    activeTask: 'Configurando alerta Telegram',
  },
];

// ─── Activity Feed ──────────────────────────────────────────
export const mockActivities: ActivityItem[] = [
  { id: 'a1', agentId: 'theo', agentName: 'Theo', emoji: '\u{1F305}', action: 'Briefing matinal enviado para Telegram', timestamp: new Date(Date.now() - 2 * 60_000).toISOString(), type: 'success' },
  { id: 'a2', agentId: 'theo', agentName: 'Theo', emoji: '\u{1F534}', action: 'Alerta Julia escola disparado', timestamp: new Date(Date.now() - 15 * 60_000).toISOString(), type: 'warning' },
  { id: 'a3', agentId: 'bruno', agentName: 'Bruno', emoji: '\u{1F916}', action: 'Verificando issues GitHub (openclaw-painel)', timestamp: new Date(Date.now() - 32 * 60_000).toISOString(), type: 'info' },
  { id: 'a4', agentId: 'theo', agentName: 'Theo', emoji: '\u{1F534}', action: 'Alerta ballet Julia disparado', timestamp: new Date(Date.now() - 55 * 60_000).toISOString(), type: 'warning' },
  { id: 'a5', agentId: 'leo', agentName: 'Leo', emoji: '\u{1F4CA}', action: 'Relatorio diario de custos OpenRouter gerado', timestamp: new Date(Date.now() - 72 * 60_000).toISOString(), type: 'success' },
  { id: 'a6', agentId: 'marco', agentName: 'Marco', emoji: '\u{2699}\u{FE0F}', action: 'Cron briefing noturno executado com sucesso', timestamp: new Date(Date.now() - 95 * 60_000).toISOString(), type: 'success' },
  { id: 'a7', agentId: 'bruno', agentName: 'Bruno', emoji: '\u{1F916}', action: 'Deploy frontend v2.3 concluido', timestamp: new Date(Date.now() - 120 * 60_000).toISOString(), type: 'success' },
  { id: 'a8', agentId: 'leo', agentName: 'Leo', emoji: '\u{1F4CA}', action: 'Alerta: custo diario OpenRouter > R$5', timestamp: new Date(Date.now() - 150 * 60_000).toISOString(), type: 'error' },
  { id: 'a9', agentId: 'theo', agentName: 'Theo', emoji: '\u{1F305}', action: 'Novo conceito aprendido: morfologica', timestamp: new Date(Date.now() - 180 * 60_000).toISOString(), type: 'info' },
  { id: 'a10', agentId: 'marco', agentName: 'Marco', emoji: '\u{2699}\u{FE0F}', action: 'Job alerta-escola reconfigurado para 07:10', timestamp: new Date(Date.now() - 210 * 60_000).toISOString(), type: 'info' },
  { id: 'a11', agentId: 'bruno', agentName: 'Bruno', emoji: '\u{1F916}', action: 'PR #42 merged: neural map component', timestamp: new Date(Date.now() - 240 * 60_000).toISOString(), type: 'success' },
  { id: 'a12', agentId: 'theo', agentName: 'Theo', emoji: '\u{1F305}', action: 'Sessao de memoria consolidada (12 nos)', timestamp: new Date(Date.now() - 300 * 60_000).toISOString(), type: 'info' },
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
