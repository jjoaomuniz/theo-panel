import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Agent } from '@/types/agents';
import type { PanelAgent } from '@/data/agents';
import { AGENTS as STATIC_AGENTS } from '@/data/agents';
import { useWebSocket } from './useWebSocket';

// Maps backend agent IDs to display colors (frontend-only concern)
// Note: backend uses 'main' for Theo — mapped to 'theo' below
const AGENT_COLORS: Record<string, string> = {
  theo:             '#c9a84c',
  bruno:            '#00d4ff',
  leo:              '#00ff88',
  marco:            '#8b5cf6',
  carla:            '#f472b6',
  rafael:           '#fb923c',
  'salomao-onchain':'#fbbf24',
  joao:             '#4ade80',
};

const AGENT_AVATARS: Record<string, string> = {
  theo:             '🧠',
  bruno:            '⚡',
  leo:              '📊',
  marco:            '⚙️',
  carla:            '👥',
  rafael:           '⚖️',
  'salomao-onchain':'💰',
  joao:             '📈',
};

const AGENT_FULL_ROLES: Record<string, string> = {
  theo:             'Chief of Staff / Orchestrator',
  bruno:            'CTO — Tecnologia & Dev',
  leo:              'CFO — Finanças & Controle',
  marco:            'COO — Operações',
  carla:            'CHRO — Pessoas & Cultura',
  rafael:           'CLO — Jurídico & Compliance',
  'salomao-onchain':'Trader DeFi — Solana',
  joao:             'Analista de Vendas — Lubrificantes',
};

const SORT_ORDER = ['theo', 'bruno', 'leo', 'marco', 'carla', 'rafael', 'salomao-onchain', 'joao'];

function toPanel(agent: Agent): PanelAgent {
  // Backend uses 'main' as the ID for the main Theo agent
  const rawId = agent.id.toLowerCase();
  const id = rawId === 'main' ? 'theo' : rawId;
  return {
    id,
    name: agent.name,
    role: AGENT_FULL_ROLES[id] ?? agent.role,
    color: AGENT_COLORS[id] ?? '#8b5cf6',
    avatar: AGENT_AVATARS[id] ?? agent.emoji ?? '🤖',
    status: agent.status === 'executing' || agent.status === 'active' ? 'working' : 'idle',
    activeTask: agent.activeTask,
    lastAction: agent.lastAction,
    lastActionTime: agent.lastActionTime,
  };
}

/**
 * Fetches real agent data from the backend and keeps it live via WebSocket.
 * Falls back to static AGENTS if API is unavailable.
 */
export function useAgents(): { agents: PanelAgent[]; isLive: boolean } {
  const [agents, setAgents] = useState<PanelAgent[]>(STATIC_AGENTS);
  const [isLive, setIsLive] = useState(false);

  const fetchAgents = useCallback(async () => {
    try {
      const data = await api.agents();
      const mapped = data.map(toPanel);
      // Preserve ordering: theo first, then subagents
      mapped.sort((a, b) => {
        const ai = SORT_ORDER.indexOf(a.id);
        const bi = SORT_ORDER.indexOf(b.id);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      });
      setAgents(mapped);
      setIsLive(true);
    } catch {
      // Keep current data (static fallback on first load)
    }
  }, []);

  // Initial fetch + 10s polling
  useEffect(() => {
    fetchAgents();
    const timer = setInterval(fetchAgents, 10_000);
    return () => clearInterval(timer);
  }, [fetchAgents]);

  // WebSocket real-time updates
  useWebSocket({
    onMessage: (event) => {
      if (event.type === 'agent:update' && event.data) {
        const updated = event.data as Agent;
        setAgents(prev =>
          prev.map(a => a.id === updated.id.toLowerCase() ? toPanel(updated) : a)
        );
        setIsLive(true);
      }
    },
  });

  return { agents, isLive };
}
