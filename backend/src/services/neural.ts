import fs from 'fs/promises';
import { config } from '../config.js';
import { cache } from './cache.js';
import type { NeuralNode, NeuralLink, NodeCategory, NeuralData } from '../types/index.js';

// ─── Section → Category mapping ─────────────────────────────
const SECTION_CATEGORY_MAP: Record<string, NodeCategory> = {
  // Portuguese section names (as expected in MEMORY.md)
  pessoas: 'people',
  familia: 'people',
  contatos: 'people',
  people: 'people',

  projetos: 'projects',
  negocios: 'projects',
  empresas: 'projects',
  projects: 'projects',

  preferencias: 'preferences',
  gostos: 'preferences',
  rotinas: 'preferences',
  preferences: 'preferences',

  alertas: 'alerts',
  avisos: 'alerts',
  atencao: 'alerts',
  alerts: 'alerts',

  tecnologia: 'tech',
  tech: 'tech',
  ferramentas: 'tech',
  agentes: 'tech',
  infraestrutura: 'tech',
  stack: 'tech',
};

/** Normalize a string for ID and matching (remove accents, lowercase) */
function normalize(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Infer category from section heading */
function inferCategory(heading: string): NodeCategory {
  const normalized = normalize(heading);
  for (const [key, category] of Object.entries(SECTION_CATEGORY_MAP)) {
    if (normalized.includes(key)) return category;
  }
  return 'tech'; // default
}

// ─── MEMORY.md Parser ───────────────────────────────────────

/** Parse MEMORY.md into neural graph data */
export async function parseMemoryFile(): Promise<NeuralData> {
  const cacheKey = 'neural:data';
  const cached = cache.get<NeuralData>(cacheKey);
  if (cached) return cached;

  let content: string;
  try {
    content = await fs.readFile(config.memoryFile, 'utf-8');
  } catch {
    console.warn(`[Neural] MEMORY.md not found at ${config.memoryFile}, using fallback`);
    return getFallbackData();
  }

  const nodes: NeuralNode[] = [];
  const nodeIds = new Set<string>();

  // Parse sections
  const lines = content.split('\n');
  let currentCategory: NodeCategory = 'tech';
  let currentSection = '';

  for (const line of lines) {
    // Detect ## headings as sections
    const headingMatch = line.match(/^#{1,3}\s+(.+)/);
    if (headingMatch) {
      currentSection = headingMatch[1].trim();
      currentCategory = inferCategory(currentSection);
      continue;
    }

    // Detect list items as nodes: "- Label: Description" or "- Label"
    const itemMatch = line.match(/^[-*]\s+\*?\*?(.+?)\*?\*?(?::\s*(.+))?$/);
    if (itemMatch) {
      const label = itemMatch[1].replace(/\*\*/g, '').trim();
      const description = itemMatch[2]?.trim() || `${currentSection} — ${label}`;
      const id = normalize(label);

      if (id && !nodeIds.has(id)) {
        nodeIds.add(id);
        nodes.push({
          id,
          label,
          category: currentCategory,
          description,
          learnedAt: new Date().toISOString().split('T')[0],
          connections: [],
        });
      }
    }
  }

  // Infer connections: nodes mentioned in other nodes' descriptions
  for (const node of nodes) {
    for (const other of nodes) {
      if (node.id === other.id) continue;

      // Check if this node's label appears in the other's description or vice versa
      const nodeLabel = node.label.toLowerCase();
      const otherDesc = other.description.toLowerCase();
      const otherLabel = other.label.toLowerCase();
      const nodeDesc = node.description.toLowerCase();

      if (otherDesc.includes(nodeLabel) || nodeDesc.includes(otherLabel)) {
        if (!node.connections.includes(other.id)) {
          node.connections.push(other.id);
        }
        if (!other.connections.includes(node.id)) {
          other.connections.push(node.id);
        }
      }
    }
  }

  // Add a central "Theo" node if not present, connected to all tech nodes
  if (!nodeIds.has('theo')) {
    const theoNode: NeuralNode = {
      id: 'theo',
      label: 'Theo',
      category: 'tech',
      description: 'Assistente IA principal — Theo Muniz',
      learnedAt: '2024-01-01',
      connections: [],
    };

    // Connect Theo to all other nodes with 'tech' category
    for (const node of nodes) {
      if (node.category === 'tech') {
        theoNode.connections.push(node.id);
        node.connections.push('theo');
      }
    }

    // Connect to first few people nodes
    const peopleNodes = nodes.filter((n) => n.category === 'people').slice(0, 3);
    for (const person of peopleNodes) {
      theoNode.connections.push(person.id);
      person.connections.push('theo');
    }

    nodes.unshift(theoNode);
  }

  // Generate links from connections (deduplicated)
  const linkSet = new Set<string>();
  const links: NeuralLink[] = [];

  for (const node of nodes) {
    for (const connId of node.connections) {
      const key = [node.id, connId].sort().join('::');
      if (!linkSet.has(key)) {
        linkSet.add(key);
        links.push({ source: node.id, target: connId });
      }
    }
  }

  const result: NeuralData = { nodes, links };
  cache.set(cacheKey, result, config.cacheTTL.files);
  return result;
}

// ─── Fallback data (when MEMORY.md is not available) ────────
function getFallbackData(): NeuralData {
  const nodes: NeuralNode[] = [
    { id: 'theo', label: 'Theo', category: 'tech', description: 'Assistente IA principal', connections: ['bruno', 'leo', 'marco', 'openrouter'] },
    { id: 'bruno', label: 'Bruno', category: 'tech', description: 'CTO — Infra & Código', connections: ['theo'] },
    { id: 'leo', label: 'Leo', category: 'tech', description: 'CFO — Finanças & Custos', connections: ['theo'] },
    { id: 'marco', label: 'Marco', category: 'tech', description: 'COO — Operações & Processos', connections: ['theo'] },
    { id: 'openrouter', label: 'OpenRouter', category: 'tech', description: 'Gateway de API LLM', connections: ['theo'] },
  ];

  const linkSet = new Set<string>();
  const links: NeuralLink[] = [];
  for (const node of nodes) {
    for (const connId of node.connections) {
      const key = [node.id, connId].sort().join('::');
      if (!linkSet.has(key)) {
        linkSet.add(key);
        links.push({ source: node.id, target: connId });
      }
    }
  }

  return { nodes, links };
}
