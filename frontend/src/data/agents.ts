export interface PanelAgent {
  id: string;
  name: string;
  role: string;
  color: string;
  avatar: string;
  status: 'working' | 'idle';
  activeTask?: string;
  lastAction?: string;
  lastActionTime?: string;
}

export const AGENTS: PanelAgent[] = [
  { id: 'theo',  name: 'Theo Muniz', role: 'Chief of Staff / Orchestrator', color: '#c9a84c', avatar: '🧠', status: 'working' },
  { id: 'bruno', name: 'Bruno',      role: 'CTO — Tecnologia & Dev',        color: '#00d4ff', avatar: '⚡', status: 'working' },
  { id: 'leo',   name: 'Leo',        role: 'CFO — Finanças & Controle',     color: '#00ff88', avatar: '📊', status: 'idle'    },
  { id: 'marco', name: 'Marco',      role: 'COO — Operações',               color: '#8b5cf6', avatar: '⚙️', status: 'working' },
  { id: 'carla',           name: 'Carla',   role: 'CHRO — Pessoas & Cultura',       color: '#f472b6', avatar: '👥', status: 'idle' },
  { id: 'rafael',          name: 'Rafael',  role: 'CLO — Jurídico & Compliance',    color: '#fb923c', avatar: '⚖️', status: 'idle' },
  { id: 'salomao-onchain', name: 'Salomão', role: 'Trader DeFi — Solana',           color: '#fbbf24', avatar: '💰', status: 'idle' },
  { id: 'joao',            name: 'João',    role: 'Analista de Vendas — Lubrificantes', color: '#4ade80', avatar: '📈', status: 'idle' },
];
