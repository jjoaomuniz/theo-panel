import { useAPI } from '@/hooks/useAPI';
import { api } from '@/lib/api';

function NotConfigured() {
  return (
    <div className="h-full overflow-y-auto p-6 mesh-gradient flex items-center justify-center">
      <div className="bg-bg-card border border-white/[0.04] rounded-2xl p-8 max-w-md w-full text-center relative overflow-hidden">
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <div className="text-4xl mb-4">▲</div>
        <h2 className="text-base font-semibold text-text-primary mb-2">Vercel não configurado</h2>
        <p className="text-xs text-text-muted mb-4">
          Adicione seu token no arquivo <code className="text-accent-purple font-mono">.env</code>:
        </p>
        <div className="bg-bg-primary border border-white/[0.04] rounded-xl p-3 text-left font-mono text-xs text-accent-cyan">
          VERCEL_TOKEN=xxxxxxxxxxxxxxxx
        </div>
        <p className="text-[10px] text-text-muted mt-4">
          Gere em: Vercel → Settings → Tokens
        </p>
      </div>
    </div>
  );
}

const STATE_COLORS: Record<string, string> = {
  READY: 'text-success',
  ERROR: 'text-error',
  BUILDING: 'text-warning',
  QUEUED: 'text-text-muted',
  CANCELED: 'text-text-muted',
};

const STATE_LABELS: Record<string, string> = {
  READY: 'Pronto',
  ERROR: 'Erro',
  BUILDING: 'Construindo',
  QUEUED: 'Na fila',
  CANCELED: 'Cancelado',
};

export default function Vercel() {
  const { data, loading, error } = useAPI(api.vercel, null, { pollInterval: 60_000 });

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-text-muted text-xs font-mono animate-pulse">Carregando Vercel...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-error text-xs font-mono">{error ?? 'Erro ao carregar'}</div>
      </div>
    );
  }

  if (!data.configured) return <NotConfigured />;

  const { user, projects, deployments } = data;

  return (
    <div className="h-full overflow-y-auto p-6 mesh-gradient">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xl">▲</span>
        <h1 className="text-xl font-semibold tracking-wide">Vercel</h1>
        <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent" />
        {user && (
          <div className="flex items-center gap-2 bg-bg-card border border-white/[0.04] rounded-xl px-3 py-1.5 text-xs text-text-muted">
            {user.avatar && (
              <img src={user.avatar} alt={user.username} className="w-4 h-4 rounded-full" />
            )}
            {user.name || user.username}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: 'Projetos', value: projects?.length ?? 0, color: 'text-accent-purple' },
          { label: 'Deploys Recentes', value: deployments?.length ?? 0, color: 'text-accent-cyan' },
        ].map((stat) => (
          <div key={stat.label} className="bg-bg-card border border-white/[0.04] rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            <p className="text-[10px] text-text-muted uppercase tracking-widest font-mono">{stat.label}</p>
            <p className={`text-2xl font-bold mt-2 font-mono ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-3">
        {/* Projects */}
        <div className="bg-bg-card border border-white/[0.04] rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-accent-purple/20 to-transparent" />
          <h3 className="text-[10px] text-text-muted uppercase tracking-widest font-mono mb-3">Projetos</h3>
          <div className="flex flex-col gap-2">
            {(projects ?? []).map((project: any) => {
              const latest = project.latestDeployments?.[0];
              return (
                <div key={project.id} className="flex items-center justify-between p-3 bg-bg-primary/50 border border-white/[0.03] rounded-xl">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-text-primary truncate">{project.name}</span>
                      {project.framework && (
                        <span className="text-[9px] font-mono text-text-muted border border-white/[0.06] rounded px-1">
                          {project.framework}
                        </span>
                      )}
                    </div>
                    {latest && (
                      <p className="text-[10px] text-text-muted mt-0.5 font-mono truncate">
                        {latest.url}
                      </p>
                    )}
                  </div>
                  {latest && (
                    <span className={`text-[10px] font-mono ml-3 shrink-0 ${STATE_COLORS[latest.state] ?? 'text-text-muted'}`}>
                      {STATE_LABELS[latest.state] ?? latest.state}
                    </span>
                  )}
                </div>
              );
            })}
            {(!projects || projects.length === 0) && (
              <p className="text-xs text-text-muted text-center py-4">Nenhum projeto encontrado</p>
            )}
          </div>
        </div>

        {/* Deployments */}
        <div className="bg-bg-card border border-white/[0.04] rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-accent-cyan/20 to-transparent" />
          <h3 className="text-[10px] text-text-muted uppercase tracking-widest font-mono mb-3">Deploys Recentes</h3>
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[400px]">
            {(deployments ?? []).map((d: any) => (
              <div key={d.uid} className="p-2.5 bg-bg-primary/50 border border-white/[0.03] rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-text-primary truncate">{d.name}</span>
                  <span className={`text-[10px] font-mono shrink-0 ml-2 ${STATE_COLORS[d.state] ?? 'text-text-muted'}`}>
                    {STATE_LABELS[d.state] ?? d.state}
                  </span>
                </div>
                {d.url && (
                  <p className="text-[10px] text-text-muted font-mono truncate">{d.url}</p>
                )}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[9px] text-text-muted">{d.target ?? 'preview'}</span>
                  <span className="text-[9px] text-text-muted">
                    {d.createdAt ? new Date(d.createdAt).toLocaleDateString('pt-BR') : ''}
                  </span>
                </div>
              </div>
            ))}
            {(!deployments || deployments.length === 0) && (
              <p className="text-xs text-text-muted text-center py-4">Nenhum deploy encontrado</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
