export type NodeCategory = 'people' | 'projects' | 'preferences' | 'alerts' | 'tech';

export interface NeuralNode {
  id: string;
  label: string;
  category: NodeCategory;
  description: string;
  learnedAt?: string;
  connections: string[];
  // D3 simulation fields
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  index?: number;
}

export interface NeuralLink {
  source: string | NeuralNode;
  target: string | NeuralNode;
  strength?: number;
}

export const CATEGORY_COLORS: Record<NodeCategory, string> = {
  people: '#3b82f6',
  projects: '#22c55e',
  preferences: '#f59e0b',
  alerts: '#ef4444',
  tech: '#7c3aed',
};

export const CATEGORY_LABELS: Record<NodeCategory, string> = {
  people: 'Pessoas',
  projects: 'Projetos',
  preferences: 'Preferencias',
  alerts: 'Alertas',
  tech: 'Tecnologia',
};
