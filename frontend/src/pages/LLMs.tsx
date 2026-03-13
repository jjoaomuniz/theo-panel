import { useState, useCallback } from 'react';
import { useAPI } from '@/hooks/useAPI';
import { api } from '@/lib/api';
import type { Agent } from '@/types/agents';

// ─── Models Catalog ───────────────────────────────────────────────────────────
type Category = 'free' | 'cheap' | 'mid' | 'premium';

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  context: string;
  priceIn: string;
  priceOut: string;
  category: Category;
  notes: string;
}

const MODELS: ModelInfo[] = [
  // GRATUITOS
  { id: 'openrouter/openrouter/hunter-alpha',                   name: 'Hunter Alpha',               provider: 'OpenRouter',    context: '1.05M', priceIn: '$0',     priceOut: '$0',    category: 'free',    notes: 'Orquestrador Agentic' },
  { id: 'openrouter/openrouter/healer-alpha',                   name: 'Healer Alpha',               provider: 'OpenRouter',    context: '262K',  priceIn: '$0',     priceOut: '$0',    category: 'free',    notes: 'Omnimodal (texto/imagem/áudio)' },
  { id: 'openrouter/nvidia/llama-3.1-nemotron-super-49b-v1:free', name: 'NVIDIA Nemotron 3 Super', provider: 'NVIDIA',        context: '262K',  priceIn: '$0',     priceOut: '$0',    category: 'free',    notes: 'Coding avançado, multi-agente' },
  { id: 'openrouter/stepfun/step-3.5-flash:free',               name: 'Step 3.5 Flash (free)',      provider: 'StepFun',       context: '256K',  priceIn: '$0',     priceOut: '$0',    category: 'free',    notes: 'Raciocínio rápido MoE 196B' },
  { id: 'openrouter/openai/gpt-oss-120b:free',                  name: 'GPT-OSS 120B (free)',        provider: 'OpenAI',        context: '131K',  priceIn: '$0',     priceOut: '$0',    category: 'free',    notes: 'Generalista poderoso open-weight' },
  { id: 'openrouter/openai/gpt-oss-20b:free',                   name: 'GPT-OSS 20B (free)',         provider: 'OpenAI',        context: '131K',  priceIn: '$0',     priceOut: '$0',    category: 'free',    notes: 'Tasks rápidas MoE 21B' },
  { id: 'openrouter/z-ai/glm-4.5-air:free',                    name: 'GLM 4.5 Air (free)',         provider: 'Z.ai',          context: '262K',  priceIn: '$0',     priceOut: '$0',    category: 'free',    notes: 'Coder agentic, automação' },
  { id: 'openrouter/arcee-ai/arcee-trinity-mini:free',          name: 'Arcee Trinity Mini (free)',  provider: 'Arcee AI',      context: '131K',  priceIn: '$0',     priceOut: '$0',    category: 'free',    notes: 'Reasoning compacto, function calling' },
  { id: 'openrouter/nvidia/llama-3.1-nemotron-nano-8b-v1:free', name: 'Nemotron Nano 9B V2 (free)', provider: 'NVIDIA',       context: '128K',  priceIn: '$0',     priceOut: '$0',    category: 'free',    notes: 'Dual-mode reasoning/direct' },
  { id: 'openrouter/deepseek/deepseek-r1:free',                 name: 'DeepSeek R1 (free)',         provider: 'DeepSeek',      context: '164K',  priceIn: '$0',     priceOut: '$0',    category: 'free',    notes: 'Reasoning open-source, chain-of-thought' },
  { id: 'openrouter/qwen/qwq-32b:free',                         name: 'QwQ 32B (free)',             provider: 'Qwen',          context: '131K',  priceIn: '$0',     priceOut: '$0',    category: 'free',    notes: 'Reasoning profundo, math e código' },
  { id: 'openrouter/meta-llama/llama-4-scout:free',             name: 'Llama 4 Scout (free)',       provider: 'Meta',          context: '512K',  priceIn: '$0',     priceOut: '$0',    category: 'free',    notes: 'MoE eficiente Meta, contexto 512K' },
  { id: 'openrouter/google/gemini-2.0-flash-thinking-exp:free', name: 'Gemini 2.0 Flash Thinking (free)', provider: 'Google', context: '1.05M', priceIn: '$0',    priceOut: '$0',    category: 'free',    notes: 'Thinking experimental Google' },
  { id: 'openrouter/mistralai/mistral-small-3.2:free',          name: 'Mistral Small 3.2 (free)',   provider: 'Mistral AI',    context: '128K',  priceIn: '$0',     priceOut: '$0',    category: 'free',    notes: 'Compacto eficiente, excelente custo-benefício' },

  // MUITO BARATO
  { id: 'openrouter/nvidia/llama-3.1-nemotron-nano-8b-v1',      name: 'Nemotron Nano 9B V2',        provider: 'NVIDIA',        context: '128K',  priceIn: '$0.04',  priceOut: '$0.16', category: 'cheap',   notes: 'Reasoning controlável produção' },
  { id: 'openrouter/openai/gpt-oss-120b',                       name: 'GPT-OSS 120B',               provider: 'OpenAI',        context: '131K',  priceIn: '$0.039', priceOut: '$0.19', category: 'cheap',   notes: 'Workflows complexos produção' },
  { id: 'openrouter/qwen/qwen3-30b-a3b:thinking',               name: 'Qwen3 30B Thinking',         provider: 'Qwen',          context: '33K',   priceIn: '$0.051', priceOut: '$0.34', category: 'cheap',   notes: 'Tarefas cognitivas profundas' },
  { id: 'openrouter/openai/gpt-5-nano',                         name: 'GPT-5 Nano',                 provider: 'OpenAI',        context: '400K',  priceIn: '$0.05',  priceOut: '$0.40', category: 'cheap',   notes: 'Nano rápido oficial GPT-5' },
  { id: 'openrouter/qwen/qwen3-8b',                             name: 'Qwen3 8B',                   provider: 'Qwen',          context: '40K',   priceIn: '$0.06',  priceOut: '$0.20', category: 'cheap',   notes: 'Ultra-econômico alto volume' },
  { id: 'openrouter/z-ai/glm-4.5-air',                         name: 'GLM 4.5 Air',                provider: 'Z.ai',          context: '203K',  priceIn: '$0.06',  priceOut: '$0.40', category: 'cheap',   notes: 'Código, automação, pipelines' },
  { id: 'openrouter/qwen/qwen3-32b',                            name: 'Qwen3 32B',                  provider: 'Qwen',          context: '41K',   priceIn: '$0.08',  priceOut: '$0.24', category: 'cheap',   notes: 'Raciocínio + diálogo natural' },
  { id: 'openrouter/meta-llama/llama-4-scout',                  name: 'Llama 4 Scout',              provider: 'Meta',          context: '512K',  priceIn: '$0.08',  priceOut: '$0.30', category: 'cheap',   notes: 'MoE eficiente Meta, contexto gigante' },
  { id: 'openrouter/openai/gpt-4o-mini',                        name: 'GPT-4o Mini',                provider: 'OpenAI',        context: '128K',  priceIn: '$0.15',  priceOut: '$0.60', category: 'cheap',   notes: 'Rápido e barato, ampla cobertura de tasks' },

  // INTERMEDIÁRIO
  { id: 'openrouter/xiaomi/mimo-v2-flash',                      name: 'MiMo-V2-Flash',              provider: 'Xiaomi',        context: '262K',  priceIn: '$0.09',  priceOut: '$0.29', category: 'mid',     notes: 'Multi-domínio: finanças, saúde, código' },
  { id: 'openrouter/stepfun/step-3.5-flash',                    name: 'Step 3.5 Flash',             provider: 'StepFun',       context: '256K',  priceIn: '$0.10',  priceOut: '$0.30', category: 'mid',     notes: 'Raciocínio veloz open-source' },
  { id: 'openrouter/qwen/qwen3.5-flash',                        name: 'Qwen3.5-Flash',              provider: 'Qwen',          context: '1M',    priceIn: '$0.10',  priceOut: '$0.40', category: 'mid',     notes: '1M contexto, documentos longos' },
  { id: 'openrouter/qwen/qwen3-235b-a22b:thinking',             name: 'Qwen3 235B Thinking',        provider: 'Qwen',          context: '262K',  priceIn: '$0.11',  priceOut: '$0.60', category: 'mid',     notes: 'Flagship MoE Thinking, benchmark líder' },
  { id: 'openrouter/qwen/qwq-32b',                              name: 'QwQ 32B',                    provider: 'Qwen',          context: '131K',  priceIn: '$0.12',  priceOut: '$0.48', category: 'mid',     notes: 'Reasoning profundo open-source' },
  { id: 'openrouter/nousresearch/nous-hermes-4-70b',            name: 'Nous Hermes 4 70B',          provider: 'Nous Research', context: '131K',  priceIn: '$0.13',  priceOut: '$0.40', category: 'mid',     notes: 'Hybrid reasoning open-source Llama' },
  { id: 'openrouter/tencent/hunyuan-a13b-instruct',             name: 'Hunyuan A13B',               provider: 'Tencent',       context: '131K',  priceIn: '$0.14',  priceOut: '$0.57', category: 'mid',     notes: 'MoE 80B/13B econômico' },
  { id: 'openrouter/deepseek/deepseek-v3-1',                    name: 'DeepSeek V3.1',              provider: 'DeepSeek',      context: '33K',   priceIn: '$0.15',  priceOut: '$0.75', category: 'mid',     notes: 'Think/No-Think híbrido, forte em código' },
  { id: 'openrouter/meta-llama/llama-4-maverick',               name: 'Llama 4 Maverick',           provider: 'Meta',          context: '1M',    priceIn: '$0.19',  priceOut: '$0.53', category: 'mid',     notes: 'Flagship Meta, 1M contexto, multimodal' },
  { id: 'openrouter/x-ai/grok-4.1-fast',                       name: 'Grok 4.1 Fast',              provider: 'xAI',           context: '2M',    priceIn: '$0.20',  priceOut: '$0.50', category: 'mid',     notes: '2M contexto, tool calling excelente' },
  { id: 'openrouter/deepseek/deepseek-v3-2-experimental',       name: 'DeepSeek V3.2 Exp',          provider: 'DeepSeek',      context: '164K',  priceIn: '$0.21',  priceOut: '$0.79', category: 'mid',     notes: 'Versão experimental mais recente' },
  { id: 'openrouter/qwen/qwen3-235b-a22b',                      name: 'Qwen3 235B Instruct',        provider: 'Qwen',          context: '262K',  priceIn: '$0.22',  priceOut: '$0.80', category: 'mid',     notes: 'Instruct giant multilingual' },
  { id: 'openrouter/google/gemini-2.5-flash',                   name: 'Gemini 2.5 Flash',           provider: 'Google',        context: '1.05M', priceIn: '$0.30',  priceOut: '$2.50', category: 'mid',     notes: 'Mais popular OpenRouter, multimodal' },
  { id: 'openrouter/deepseek/deepseek-r1',                      name: 'DeepSeek R1',                provider: 'DeepSeek',      context: '164K',  priceIn: '$0.55',  priceOut: '$2.19', category: 'mid',     notes: 'Reasoning open-source, chain-of-thought' },

  // PREMIUM
  { id: 'openrouter/anthropic/claude-haiku-4-5',                name: 'Claude Haiku 4.5',           provider: 'Anthropic',     context: '200K',  priceIn: '$1',     priceOut: '$5',    category: 'premium', notes: 'Anthropic mais rápido e barato' },
  { id: 'openrouter/openai/o4-mini',                            name: 'o4 Mini',                    provider: 'OpenAI',        context: '200K',  priceIn: '$1.10',  priceOut: '$4.40', category: 'premium', notes: 'Reasoning compacto, matemática e código' },
  { id: 'openrouter/openai/gpt-5.1',                            name: 'GPT-5.1',                    provider: 'OpenAI',        context: '400K',  priceIn: '$1.25',  priceOut: '$10',   category: 'premium', notes: 'Frontier GPT-5, alta qualidade geral' },
  { id: 'openrouter/google/gemini-2.5-pro',                     name: 'Gemini 2.5 Pro',             provider: 'Google',        context: '1.05M', priceIn: '$1.25',  priceOut: '$10',   category: 'premium', notes: 'Flagship Google, multimodal avançado' },
  { id: 'openrouter/openai/gpt-4o',                             name: 'GPT-4o',                     provider: 'OpenAI',        context: '128K',  priceIn: '$2.50',  priceOut: '$10',   category: 'premium', notes: 'Multimodal, amplamente usado em produção' },
  { id: 'openrouter/openai/o3',                                 name: 'o3',                         provider: 'OpenAI',        context: '200K',  priceIn: '$2',     priceOut: '$8',    category: 'premium', notes: 'Raciocínio profundo multi-step' },
  { id: 'openrouter/mistralai/mistral-large-2411',              name: 'Mistral Large 2411',         provider: 'Mistral AI',    context: '128K',  priceIn: '$2',     priceOut: '$6',    category: 'premium', notes: 'Flagship Mistral, multilingue, forte em código' },
  { id: 'openrouter/anthropic/claude-sonnet-4-5',               name: 'Claude Sonnet 4.5',          provider: 'Anthropic',     context: '1M',    priceIn: '$3',     priceOut: '$15',   category: 'premium', notes: 'Melhor para agentes, código e análise' },
  { id: 'openrouter/anthropic/claude-sonnet-4-6',               name: 'Claude Sonnet 4.6',          provider: 'Anthropic',     context: '1M',    priceIn: '$3',     priceOut: '$15',   category: 'premium', notes: 'Sonnet atual, top uso OpenRouter' },
  { id: 'openrouter/anthropic/claude-opus-4-6',                 name: 'Claude Opus 4.6',            provider: 'Anthropic',     context: '1M',    priceIn: '$5',     priceOut: '$25',   category: 'premium', notes: 'Max quality Anthropic' },
  { id: 'openrouter/anthropic/claude-opus-4-1',                 name: 'Claude Opus 4.1',            provider: 'Anthropic',     context: '200K',  priceIn: '$15',    priceOut: '$75',   category: 'premium', notes: 'Engenharia extremamente complexa' },
  { id: 'openrouter/openai/o1',                                 name: 'o1',                         provider: 'OpenAI',        context: '200K',  priceIn: '$15',    priceOut: '$60',   category: 'premium', notes: 'Reasoning pesado, predecessor o3' },
  { id: 'openrouter/openai/gpt-5.4-pro',                        name: 'GPT-5.4 Pro',                provider: 'OpenAI',        context: '1.05M', priceIn: '$30',    priceOut: '$180',  category: 'premium', notes: 'Topo absoluto OpenAI, uso executivo' },
];

// ─── Agent Recommendations ────────────────────────────────────────────────────
const RECOMMENDATIONS: Record<string, { primary: string; secondary: string }> = {
  main:            { primary: 'openrouter/anthropic/claude-sonnet-4-6', secondary: 'openrouter/x-ai/grok-4.1-fast' },
  bruno:           { primary: 'openrouter/anthropic/claude-sonnet-4-6', secondary: 'openrouter/openai/gpt-5-nano' },
  leo:             { primary: 'openrouter/qwen/qwen3-235b-a22b:thinking', secondary: 'openrouter/qwen/qwen3-30b-a3b:thinking' },
  marco:           { primary: 'openrouter/x-ai/grok-4.1-fast', secondary: 'openrouter/nvidia/llama-3.1-nemotron-nano-8b-v1' },
  carla:           { primary: 'openrouter/anthropic/claude-haiku-4-5', secondary: 'openrouter/qwen/qwen3-32b' },
  rafael:          { primary: 'openrouter/anthropic/claude-opus-4-6', secondary: 'openrouter/qwen/qwen3.5-flash' },
  'salomao-onchain': { primary: 'openrouter/openai/o3', secondary: 'openrouter/qwen/qwen3-30b-a3b:thinking' },
  joao:            { primary: 'openrouter/xiaomi/mimo-v2-flash', secondary: 'openrouter/stepfun/step-3.5-flash:free' },
  argus:           { primary: 'openrouter/x-ai/grok-4.1-fast', secondary: 'openrouter/z-ai/glm-4.5-air:free' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<Category, string> = {
  free:    'Gratuito',
  cheap:   'Muito Barato',
  mid:     'Intermediário',
  premium: 'Premium',
};

const CATEGORY_COLORS: Record<Category, string> = {
  free:    'text-success bg-success/10',
  cheap:   'text-accent-cyan bg-accent-cyan/10',
  mid:     'text-warning bg-warning/10',
  premium: 'text-accent-purple bg-accent-purple/10',
};

function modelById(id: string): ModelInfo | undefined {
  return MODELS.find(m => m.id === id);
}

function shortModelName(fullId: string): string {
  const m = modelById(fullId);
  if (m) return m.name;
  // Fallback: strip openrouter/ prefix and show last segment
  const parts = fullId.replace(/^openrouter\//, '').split('/');
  return parts[parts.length - 1] ?? fullId;
}

// ─── Agent Card ───────────────────────────────────────────────────────────────
interface AgentCardProps {
  agent: Agent;
  onModelSaved: (agentId: string, model: string) => void;
}

function AgentCard({ agent, onModelSaved }: AgentCardProps) {
  const [selected, setSelected] = useState(agent.model);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<'ok' | 'err' | null>(null);

  const rec = RECOMMENDATIONS[agent.id];
  const currentModel = modelById(agent.model);
  const currentCategory = currentModel?.category ?? 'mid';

  const isDirty = selected !== agent.model;

  const save = useCallback(async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await api.updateAgentModel(agent.id, selected);
      setFeedback('ok');
      onModelSaved(agent.id, selected);
      setTimeout(() => setFeedback(null), 2000);
    } catch {
      setFeedback('err');
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setSaving(false);
    }
  }, [agent.id, selected, onModelSaved]);

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
      {/* Agent Header */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">{agent.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{agent.name}</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[currentCategory]}`}>
              {CATEGORY_LABELS[currentCategory]}
            </span>
          </div>
          <div className="text-[11px] text-text-muted truncate">{agent.role}</div>
        </div>
      </div>

      {/* Current Model */}
      <div className="text-[11px] font-mono text-text-muted">
        Atual: <span className="text-text-secondary">{shortModelName(agent.model)}</span>
      </div>

      {/* Model Selector */}
      <select
        value={selected}
        onChange={e => setSelected(e.target.value)}
        className="w-full bg-bg-card border border-border rounded-lg px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-accent-purple/50 focus:ring-1 focus:ring-accent-purple/20 cursor-pointer"
      >
        {(['free', 'cheap', 'mid', 'premium'] as Category[]).map(cat => (
          <optgroup key={cat} label={`── ${CATEGORY_LABELS[cat]} ──`}>
            {MODELS.filter(m => m.category === cat).map(m => {
              const isRecPrimary = rec?.primary === m.id;
              const isRecSecondary = rec?.secondary === m.id;
              const suffix = isRecPrimary ? ' ★ Recomendado' : isRecSecondary ? ' ◆ Econômico' : '';
              return (
                <option key={m.id} value={m.id}>
                  {m.name}{suffix} — {m.priceIn}/M in
                </option>
              );
            })}
          </optgroup>
        ))}
      </select>

      {/* Recommendations hint */}
      {rec && (
        <div className="text-[10px] text-text-muted/60 font-mono leading-relaxed">
          <span className="text-accent-purple">★</span> {shortModelName(rec.primary)}
          {'  '}
          <span className="text-accent-cyan">◆</span> {shortModelName(rec.secondary)}
        </div>
      )}

      {/* Save Button */}
      {isDirty && (
        <button
          onClick={save}
          disabled={saving}
          className={`w-full py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
            saving
              ? 'bg-accent-purple/20 text-accent-purple/50 cursor-not-allowed'
              : 'bg-accent-purple/15 text-accent-purple hover:bg-accent-purple/25 border border-accent-purple/20'
          }`}
        >
          {saving ? 'Salvando…' : 'Salvar'}
        </button>
      )}

      {/* Feedback */}
      {feedback === 'ok' && (
        <div className="text-[11px] font-mono text-success text-center">Modelo atualizado</div>
      )}
      {feedback === 'err' && (
        <div className="text-[11px] font-mono text-error text-center">Erro ao salvar</div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const FALLBACK_AGENTS: Agent[] = [];

type TabFilter = 'all' | Category;

export default function LLMs() {
  const { data: agentsData, refetch } = useAPI(api.agents, FALLBACK_AGENTS);
  const agents = agentsData ?? FALLBACK_AGENTS;
  const [catalogTab, setCatalogTab] = useState<TabFilter>('all');
  const [search, setSearch] = useState('');

  const handleModelSaved = useCallback((_agentId: string, _model: string) => {
    refetch();
  }, [refetch]);

  const filteredModels = MODELS.filter(m => {
    if (catalogTab !== 'all' && m.category !== catalogTab) return false;
    if (search) {
      const q = search.toLowerCase();
      return m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q) || m.notes.toLowerCase().includes(q);
    }
    return true;
  });

  const TABS: { key: TabFilter; label: string; count: number }[] = [
    { key: 'all',     label: 'Todos',        count: MODELS.length },
    { key: 'free',    label: 'Gratuito',     count: MODELS.filter(m => m.category === 'free').length },
    { key: 'cheap',   label: 'Muito Barato', count: MODELS.filter(m => m.category === 'cheap').length },
    { key: 'mid',     label: 'Intermediário',count: MODELS.filter(m => m.category === 'mid').length },
    { key: 'premium', label: 'Premium',      count: MODELS.filter(m => m.category === 'premium').length },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Modelos de LLMs OpenRouter</h1>
          <p className="text-xs text-text-muted mt-1 font-mono">
            {MODELS.length} modelos disponíveis · {agents.length} agentes configurados
          </p>
        </div>
        <span className="text-[10px] font-mono text-text-muted/50 text-right leading-relaxed">
          Fonte: OpenRouter.ai<br />Março 2026
        </span>
      </div>

      {/* ── Agents Section ─────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold font-mono text-text-muted uppercase tracking-wider mb-4">
          Agentes — Modelo Ativo
        </h2>
        {agents.length === 0 ? (
          <div className="text-sm text-text-muted font-mono py-8 text-center">Carregando agentes…</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
            {agents.map(agent => (
              <AgentCard key={agent.id} agent={agent} onModelSaved={handleModelSaved} />
            ))}
          </div>
        )}
      </section>

      {/* ── Catalog Section ────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold font-mono text-text-muted uppercase tracking-wider mb-4">
          Catálogo OpenRouter
        </h2>

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex gap-1 flex-wrap">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setCatalogTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  catalogTab === tab.key
                    ? 'bg-accent-purple/15 text-accent-purple border border-accent-purple/20'
                    : 'text-text-muted hover:text-text-primary hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                {tab.label}
                <span className="ml-1.5 opacity-50">{tab.count}</span>
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Buscar modelo…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="sm:ml-auto bg-bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-mono text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-accent-purple/40 w-full sm:w-52"
          />
        </div>

        {/* Table */}
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-[10px] text-text-muted uppercase tracking-wider font-mono">Modelo</th>
                  <th className="px-4 py-3 text-left text-[10px] text-text-muted uppercase tracking-wider font-mono">Provedor</th>
                  <th className="px-4 py-3 text-left text-[10px] text-text-muted uppercase tracking-wider font-mono">Contexto</th>
                  <th className="px-4 py-3 text-left text-[10px] text-text-muted uppercase tracking-wider font-mono">Input/M</th>
                  <th className="px-4 py-3 text-left text-[10px] text-text-muted uppercase tracking-wider font-mono">Output/M</th>
                  <th className="px-4 py-3 text-left text-[10px] text-text-muted uppercase tracking-wider font-mono hidden lg:table-cell">Notas</th>
                  <th className="px-4 py-3 text-center text-[10px] text-text-muted uppercase tracking-wider font-mono">Tier</th>
                </tr>
              </thead>
              <tbody>
                {filteredModels.map((m, i) => (
                  <tr
                    key={m.id}
                    className={`border-b border-border/40 hover:bg-white/[0.015] transition-colors ${
                      i === filteredModels.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="text-xs font-medium">{m.name}</div>
                      <div className="text-[10px] font-mono text-text-muted/50 mt-0.5 truncate max-w-[220px]">{m.id.replace('openrouter/', '')}</div>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-text-secondary">{m.provider}</td>
                    <td className="px-4 py-3 text-xs font-mono text-accent-cyan">{m.context}</td>
                    <td className="px-4 py-3 text-xs font-mono text-text-secondary">
                      {m.priceIn === '$0' ? (
                        <span className="text-success font-semibold">FREE</span>
                      ) : m.priceIn}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-text-muted">
                      {m.priceOut === '$0' ? '—' : m.priceOut}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-text-muted/70 hidden lg:table-cell max-w-[200px]">{m.notes}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${CATEGORY_COLORS[m.category]}`}>
                        {CATEGORY_LABELS[m.category]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredModels.length === 0 && (
            <div className="text-sm text-text-muted font-mono py-10 text-center">Nenhum modelo encontrado</div>
          )}
        </div>

        {/* Cost Summary */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'ZERO COST', sub: 'Nemotron, Step Flash, GPT-OSS', color: 'text-success border-success/20 bg-success/5' },
            { label: 'ULTRA LOW', sub: '< $10 / 100M tokens', color: 'text-accent-cyan border-accent-cyan/20 bg-accent-cyan/5' },
            { label: 'BALANCED', sub: '$10–$50 / 100M tokens', color: 'text-warning border-warning/20 bg-warning/5' },
            { label: 'PREMIUM',  sub: '$50+ / 100M tokens',   color: 'text-accent-purple border-accent-purple/20 bg-accent-purple/5' },
          ].map(s => (
            <div key={s.label} className={`border rounded-xl p-3 ${s.color}`}>
              <div className="text-[10px] font-mono font-bold tracking-widest">{s.label}</div>
              <div className="text-[10px] text-text-muted mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
