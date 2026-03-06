/**
 * Coverage data — single source of truth for TheoRadarChart + Coverage page
 * TODO: Replace with API endpoint when backend coverage service is built
 */

export interface CoverageDimension {
  key: string;
  potential: number;
  real: number;
  agent: string;
  icon: string;
  description: string;
  action: string;
}

export const COVERAGE_DIMENSIONS: CoverageDimension[] = [
  {
    key: 'Financeiro',
    potential: 0.9,
    real: 0.3,
    agent: 'Leo (CFO)',
    icon: '💰',
    description: 'Controle de custos, alertas de budget',
    action: 'Configurar alertas de budget e relatórios semanais do Leo',
  },
  {
    key: 'Projetos',
    potential: 0.85,
    real: 0.4,
    agent: 'Marco (COO)',
    icon: '📋',
    description: 'Notion, tarefas, prazos',
    action: 'Conectar Notion API e definir workflows do Marco',
  },
  {
    key: 'Família',
    potential: 1.0,
    real: 0.85,
    agent: 'Theo',
    icon: '👨‍👩‍👧',
    description: 'Julia, Larissa, alertas de rotina',
    action: 'Manter alertas da Julia e Larissa funcionando',
  },
  {
    key: 'Infra & Tech',
    potential: 0.9,
    real: 0.5,
    agent: 'Bruno (CTO)',
    icon: '🖥️',
    description: 'VPS, deploy, GitHub',
    action: 'Expandir monitoramento de VPS e CI/CD',
  },
  {
    key: 'Automações',
    potential: 0.8,
    real: 0.6,
    agent: 'Sistema',
    icon: '⚙️',
    description: 'Cronjobs ativos e executados',
    action: 'Criar novos cronjobs para tarefas recorrentes',
  },
  {
    key: 'Memória',
    potential: 0.75,
    real: 0.45,
    agent: 'Neural Map',
    icon: '🧠',
    description: 'Nós, conexões, MEMORY.md',
    action: 'Expandir MEMORY.md com mais nós e conexões',
  },
  {
    key: 'Comunicação',
    potential: 0.85,
    real: 0.55,
    agent: 'Theo',
    icon: '💬',
    description: 'Telegram/Discord mensagens',
    action: 'Integrar notificações Telegram/Discord',
  },
  {
    key: 'Estratégia',
    potential: 0.7,
    real: 0.2,
    agent: 'Theo',
    icon: '🎯',
    description: 'Decisões, OKRs, metas 2026',
    action: 'Definir OKRs Q2 2026 e criar tracking automático',
  },
];

/** Get top N gaps sorted by severity */
export function getTopGaps(n = 3): CoverageDimension[] {
  return [...COVERAGE_DIMENSIONS]
    .sort((a, b) => {
      const gapA = a.potential > 0 ? (a.potential - a.real) / a.potential : 0;
      const gapB = b.potential > 0 ? (b.potential - b.real) / b.potential : 0;
      return gapB - gapA;
    })
    .slice(0, n);
}

/** Overall coverage percentage */
export function getOverallCoverage(): number {
  const totalPotential = COVERAGE_DIMENSIONS.reduce((s, d) => s + d.potential, 0);
  const totalReal = COVERAGE_DIMENSIONS.reduce((s, d) => s + d.real, 0);
  return totalPotential > 0 ? (totalReal / totalPotential) * 100 : 0;
}

/** Count of domains with >50% real coverage */
export function getActiveDomainCount(): number {
  return COVERAGE_DIMENSIONS.filter((d) => d.real > 0.5).length;
}
