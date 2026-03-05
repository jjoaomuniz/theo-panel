import { useAPI } from '@/hooks/useAPI';
import { api } from '@/lib/api';
import { mockCronJobs } from '@/data/mockData';

export default function CronJobs() {
  const { data: cronJobs, refetch } = useAPI(api.cronjobs, mockCronJobs, { pollInterval: 30_000 });

  const handleToggle = async (id: string) => {
    try {
      await api.toggleCronjob(id);
      refetch();
    } catch (err) {
      console.warn('Failed to toggle cron job:', err);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Cron Jobs</h1>

      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3 text-left text-xs text-text-muted uppercase tracking-wider font-mono">Job</th>
              <th className="px-5 py-3 text-left text-xs text-text-muted uppercase tracking-wider font-mono">Horario</th>
              <th className="px-5 py-3 text-left text-xs text-text-muted uppercase tracking-wider font-mono">Ultimo Run</th>
              <th className="px-5 py-3 text-left text-xs text-text-muted uppercase tracking-wider font-mono">Status</th>
              <th className="px-5 py-3 text-left text-xs text-text-muted uppercase tracking-wider font-mono">Proximo Run</th>
              <th className="px-5 py-3 text-center text-xs text-text-muted uppercase tracking-wider font-mono">Ativo</th>
            </tr>
          </thead>
          <tbody>
            {(cronJobs ?? []).map((job) => (
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
                    {job.lastRunStatus === 'ok' ? '\u2705' : job.lastRunStatus === 'error' ? '\u274C' : '\u23ED\uFE0F'} {job.lastRunStatus.toUpperCase()}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm font-mono text-text-secondary">{job.nextRun}</td>
                <td className="px-5 py-4 text-center">
                  <div onClick={() => handleToggle(job.id)} className={`w-8 h-4 rounded-full mx-auto cursor-pointer transition-colors ${
                    job.enabled ? 'bg-accent-purple' : 'bg-border'
                  }`}>
                    <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                      job.enabled ? 'translate-x-4' : 'translate-x-0.5'
                    } translate-y-[1px]`} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
