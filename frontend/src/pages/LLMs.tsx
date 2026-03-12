import { useAPI } from '@/hooks/useAPI';
import { api, type LLMModel } from '@/lib/api';
import { EmptyState } from '@/components/shared/LoadingSkeleton';

const fallbackLLMs: LLMModel[] = [
  { id: 'google/gemini-2.5-pro',      name: 'Gemini 2.5 Pro',    provider: 'Google',    requestsToday: 0, avgLatency: '—', tokensPerSec: 0, costPer1k: '$0.010', status: 'online' },
  { id: 'anthropic/claude-sonnet-4-5', name: 'Claude Sonnet 4.5', provider: 'Anthropic', requestsToday: 0, avgLatency: '—', tokensPerSec: 0, costPer1k: '$0.015', status: 'online' },
  { id: 'qwen/qwen3-235b-a22b',        name: 'Qwen3 235B',        provider: 'Alibaba',   requestsToday: 0, avgLatency: '—', tokensPerSec: 0, costPer1k: '$0.001', status: 'online' },
  { id: 'deepseek/deepseek-r1',        name: 'DeepSeek R1',       provider: 'DeepSeek',  requestsToday: 0, avgLatency: '—', tokensPerSec: 0, costPer1k: '$0.002', status: 'online' },
  { id: 'google/gemini-2.5-flash',     name: 'Gemini 2.5 Flash',  provider: 'Google',    requestsToday: 0, avgLatency: '—', tokensPerSec: 0, costPer1k: '$0.001', status: 'online' },
];

export default function LLMs() {
  const { data: llms, loading } = useAPI(api.llms, fallbackLLMs, { pollInterval: 60_000 });
  const models = llms ?? [];
  const onlineCount = models.filter(m => m.status === 'online').length;

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Monitor de LLMs</h1>
        <span className="text-xs font-mono text-text-muted">{onlineCount}/{models.length} online</span>
      </div>

      {/* API Status */}
      <div className="bg-bg-card border border-border rounded-xl p-5 mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${onlineCount > 0 ? 'bg-success animate-status-pulse' : 'bg-error'}`} />
          <span className="text-sm font-mono">OpenRouter API</span>
          <span className={`text-xs font-mono ml-auto ${onlineCount > 0 ? 'text-success' : 'text-error'}`}>
            {onlineCount > 0 ? 'Operacional' : 'Indisponível'}
          </span>
        </div>
      </div>

      {models.length === 0 && !loading ? (
        <EmptyState icon="⚡" title="Nenhum modelo encontrado" description="Modelos LLM aparecerão aqui quando o backend estiver conectado." />
      ) : (
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="px-5 py-3 text-left text-xs text-text-muted uppercase tracking-wider font-mono">Modelo</th>
                <th scope="col" className="px-5 py-3 text-left text-xs text-text-muted uppercase tracking-wider font-mono">Requests Hoje</th>
                <th scope="col" className="px-5 py-3 text-left text-xs text-text-muted uppercase tracking-wider font-mono">Latência Média</th>
                <th scope="col" className="px-5 py-3 text-left text-xs text-text-muted uppercase tracking-wider font-mono">Tokens/s</th>
                <th scope="col" className="px-5 py-3 text-left text-xs text-text-muted uppercase tracking-wider font-mono">Custo/1k</th>
                <th scope="col" className="px-5 py-3 text-center text-xs text-text-muted uppercase tracking-wider font-mono">Status</th>
              </tr>
            </thead>
            <tbody>
              {models.map((llm) => (
                <tr key={llm.id} className="border-b border-border/50 hover:bg-bg-card-hover transition-colors">
                  <td className="px-5 py-4">
                    <div className="text-sm font-medium">{llm.name}</div>
                    <div className="text-xs text-text-muted">{llm.provider}</div>
                  </td>
                  <td className="px-5 py-4 text-sm font-mono text-text-secondary">{llm.requestsToday}</td>
                  <td className="px-5 py-4 text-sm font-mono text-text-secondary">{llm.avgLatency}</td>
                  <td className="px-5 py-4 text-sm font-mono text-accent-cyan">{llm.tokensPerSec}</td>
                  <td className="px-5 py-4 text-sm font-mono text-text-secondary">{llm.costPer1k}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded-full ${
                      llm.status === 'online' ? 'bg-success/10 text-success' : llm.status === 'degraded' ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'
                    }`}>
                      {llm.status === 'online' ? 'UP' : llm.status === 'degraded' ? 'SLOW' : 'DOWN'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
