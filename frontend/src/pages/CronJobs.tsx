import { useState } from 'react';
import { useAPI } from '@/hooks/useAPI';
import { api } from '@/lib/api';
import { mockCronJobs } from '@/data/mockData';
import { EmptyState } from '@/components/shared/LoadingSkeleton';

export default function CronJobs() {
  const { data: cronJobs, loading, refetch } = useAPI(api.cronjobs, mockCronJobs, { pollInterval: 30_000 });
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async (id: string) => {
    if (togglingId) return; // prevent spam clicks
    setTogglingId(id);
    setError(null);
    try {
      await api.toggleCronjob(id);
      await refetch();
    } catch (err) {
      console.warn('Failed to toggle cron job:', err);
      setError(`Falha ao alternar job. Tente novamente.`);
      setTimeout(() => setError(null), 4000);
    } finally {
      setTogglingId(null);
    }
  };

  const jobs = cronJobs ?? [];

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Cron Jobs</h1>
        <span className="text-xs font-mono text-text-muted">{jobs.filter(j => j.enabled).length}/{jobs.length} ativos</span>
      </div>

      {/* Error toast */}
      {error && (
        <div className="mb-4 bg-error/10 border border-error/30 text-error text-sm rounded-lg px-4 py-3 flex items-center gap-2 animate-slide-in">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {jobs.length === 0 && !loading ? (
        <EmptyState icon="⏰" title="Nenhum cron job configurado" description="Jobs aparecerão aqui quando o backend estiver conectado." />
      ) : (
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="px-5 py-3 text-left text-xs text-text-muted uppercase tracking-wider font-mono">Job</th>
                <th scope="col" className="px-5 py-3 text-left text-xs text-text-muted uppercase tracking-wider font-mono">Horário</th>
                <th scope="col" className="px-5 py-3 text-left text-xs text-text-muted uppercase tracking-wider font-mono">Último Run</th>
                <th scope="col" className="px-5 py-3 text-left text-xs text-text-muted uppercase tracking-wider font-mono">Status</th>
                <th scope="col" className="px-5 py-3 text-left text-xs text-text-muted uppercase tracking-wider font-mono">Próximo Run</th>
                <th scope="col" className="px-5 py-3 text-center text-xs text-text-muted uppercase tracking-wider font-mono">Ativo</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => {
                const isToggling = togglingId === job.id;
                return (
                  <tr key={job.id} className="border-b border-border/50 hover:bg-bg-card-hover transition-colors">
                    <td className="px-5 py-4 text-sm font-medium">{job.name}</td>
                    <td className="px-5 py-4 text-sm font-mono text-text-secondary">{job.schedule}</td>
                    <td className="px-5 py-4 text-sm font-mono text-text-secondary">{job.lastRun}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded-full ${
                        job.lastRunStatus === 'ok'
                          ? 'bg-success/10 text-success'
                          : job.lastRunStatus === 'error'
                          ? 'bg-error/10 text-error'
                          : 'bg-warning/10 text-warning'
                      }`}>
                        {job.lastRunStatus === 'ok' ? '✅' : job.lastRunStatus === 'error' ? '❌' : '⏭️'} {job.lastRunStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-mono text-text-secondary">{job.nextRun}</td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleToggle(job.id)}
                        disabled={isToggling}
                        aria-label={`${job.enabled ? 'Desativar' : 'Ativar'} ${job.name}`}
                        className={`w-8 h-4 rounded-full mx-auto cursor-pointer transition-all ${
                          isToggling ? 'opacity-50 cursor-wait' : ''
                        } ${job.enabled ? 'bg-accent-purple' : 'bg-border'}`}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                          job.enabled ? 'translate-x-4' : 'translate-x-0.5'
                        } translate-y-[1px]`} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
