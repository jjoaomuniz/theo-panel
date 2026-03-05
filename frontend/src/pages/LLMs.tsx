import { useAPI } from '@/hooks/useAPI';
import { api, type LLMModel } from '@/lib/api';

const fallbackLLMs: LLMModel[] = [
  { id: 'moonshotai/kimi-k2.5', name: 'kimi-k2.5', provider: 'OpenRouter', requestsToday: 342, avgLatency: '1.2s', tokensPerSec: 85, costPer1k: '$0.015', status: 'online' },
  { id: 'moonshotai/kimi-k2', name: 'kimi-k2', provider: 'OpenRouter', requestsToday: 128, avgLatency: '0.9s', tokensPerSec: 120, costPer1k: '$0.010', status: 'online' },
  { id: 'anthropic/claude-3.5-haiku', name: 'claude-haiku', provider: 'OpenRouter', requestsToday: 56, avgLatency: '0.6s', tokensPerSec: 150, costPer1k: '$0.025', status: 'online' },
  { id: 'anthropic/claude-sonnet-4', name: 'claude-sonnet', provider: 'OpenRouter', requestsToday: 12, avgLatency: '1.8s', tokensPerSec: 65, costPer1k: '$0.300', status: 'online' },
];

export default function LLMs() {
  const { data: llms } = useAPI(api.llms, fallbackLLMs, { pollInterval: 60_000 });

  return (
    <div className="h-full overflow-y-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Monitor de LLMs</h1>

      {/* API Status */}
      <div className="bg-bg-card border border-border rounded-xl p-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-success animate-status-pulse" />
          <span className="text-sm font-mono">OpenRouter API</span>
          <span className="text-xs text-success font-mono ml-auto">Operacional</span>
        </div>
      </div>

      {/* LLM Table */}
      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3 text-left text-xs text-text-muted uppercase tracking-wider font-mono">Modelo</th>
              <th className="px-5 py-3 text-left text-xs text-text-muted uppercase tracking-wider font-mono">Requests Hoje</th>
              <th className="px-5 py-3 text-left text-xs text-text-muted uppercase tracking-wider font-mono">Latencia Media</th>
              <th className="px-5 py-3 text-left text-xs text-text-muted uppercase tracking-wider font-mono">Tokens/s</th>
              <th className="px-5 py-3 text-left text-xs text-text-muted uppercase tracking-wider font-mono">Custo/1k</th>
              <th className="px-5 py-3 text-center text-xs text-text-muted uppercase tracking-wider font-mono">Status</th>
            </tr>
          </thead>
          <tbody>
            {(llms ?? []).map((llm) => (
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
    </div>
  );
}
