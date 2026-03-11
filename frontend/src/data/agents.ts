export interface TheoAgent {
  id: string;
  name: string;
  role: string;
  color: string;
  avatar: string;
  status: 'working' | 'idle';
  skills: string[];
}

export const AGENTS: TheoAgent[] = [
  { id: 'theo', name: 'Theo Muniz', role: 'Chief of Staff / Orchestrator', color: '#c9a84c', avatar: '\u{1F9E0}', status: 'working', skills: ['Orquestracao', 'Briefings', 'Alertas', 'Memoria', 'Decisoes'] },
  { id: 'bruno', name: 'Bruno', role: 'CTO — Tecnologia & Dev', color: '#00d4ff', avatar: '\u{26A1}', status: 'working', skills: ['Codigo', 'Deploy', 'Infra', 'GitHub', 'Code Review'] },
  { id: 'leo', name: 'Leo', role: 'CFO — Financas & Controle', color: '#00ff88', avatar: '\u{1F4CA}', status: 'idle', skills: ['Custos', 'Relatorios', 'OpenRouter', 'Metricas', 'Budget'] },
  { id: 'marco', name: 'Marco', role: 'COO — Operacoes', color: '#8b5cf6', avatar: '\u{2699}\u{FE0F}', status: 'working', skills: ['Cron Jobs', 'Automacao', 'Telegram', 'Monitoramento', 'Logs'] },
  { id: 'carla', name: 'Carla', role: 'CHRO — Pessoas & Cultura', color: '#f472b6', avatar: '\u{1F465}', status: 'idle', skills: ['Familia', 'Agenda Pessoal', 'Saude', 'Educacao', 'Bem-estar'] },
];

export const AGENT_MAP = Object.fromEntries(AGENTS.map(a => [a.id, a]));
