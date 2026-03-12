import { useAPI } from '@/hooks/useAPI';
import { api } from '@/lib/api';

function NotConfigured() {
  return (
    <div className="h-full overflow-y-auto p-6 mesh-gradient flex items-center justify-center">
      <div className="bg-bg-card border border-white/[0.04] rounded-2xl p-8 max-w-md w-full text-center relative overflow-hidden">
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <div className="text-4xl mb-4">🟢</div>
        <h2 className="text-base font-semibold text-text-primary mb-2">Supabase não configurado</h2>
        <p className="text-xs text-text-muted mb-4">
          Adicione seu token no arquivo <code className="text-accent-purple font-mono">.env</code>:
        </p>
        <div className="bg-bg-primary border border-white/[0.04] rounded-xl p-3 text-left font-mono text-xs text-accent-cyan">
          SUPABASE_TOKEN=sbp_xxxxxxxxxxxx
        </div>
        <p className="text-[10px] text-text-muted mt-4">
          Gere em: Supabase → Account → Access Tokens
        </p>
      </div>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE_HEALTHY: 'text-success',
  ACTIVE_UNHEALTHY: 'text-warning',
  INACTIVE: 'text-text-muted',
  PAUSED: 'text-text-muted',
  COMING_UP: 'text-accent-cyan',
  GOING_DOWN: 'text-warning',
  RESTORING: 'text-warning',
  UNKNOWN: 'text-text-muted',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE_HEALTHY: 'Ativo',
  ACTIVE_UNHEALTHY: 'Degradado',
  INACTIVE: 'Inativo',
  PAUSED: 'Pausado',
  COMING_UP: 'Iniciando',
  GOING_DOWN: 'Parando',
  RESTORING: 'Restaurando',
  UNKNOWN: 'Desconhecido',
};

const REGION_FLAGS: Record<string, string> = {
  'us-east-1': '🇺🇸',
  'us-west-1': '🇺🇸',
  'us-west-2': '🇺🇸',
  'eu-west-1': '🇮🇪',
  'eu-west-2': '🇬🇧',
  'eu-central-1': '🇩🇪',
  'ap-southeast-1': '🇸🇬',
  'ap-northeast-1': '🇯🇵',
  'ap-southeast-2': '🇦🇺',
  'sa-east-1': '🇧🇷',
};

export default function Supabase() {
  const { data, loading, error } = useAPI(api.supabase, null, { pollInterval: 60_000 });

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-text-muted text-xs font-mono animate-pulse">Carregando Supabase...</div>
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

  const { projects, organizations } = data;

  const activeProjects = (projects ?? []).filter((p: any) => p.status === 'ACTIVE_HEALTHY').length;
  const totalProjects = (projects ?? []).length;

  return (
    <div className="h-full overflow-y-auto p-6 mesh-gradient">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xl">🟢</span>
        <h1 className="text-xl font-semibold tracking-wide">Supabase</h1>
        <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent" />
        {organizations?.[0] && (
          <div className="flex items-center gap-2 bg-bg-card border border-white/[0.04] rounded-xl px-3 py-1.5 text-xs text-text-muted">
            {organizations[0].name}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Projetos', value: totalProjects, color: 'text-accent-purple' },
          { label: 'Ativos', value: activeProjects, color: 'text-success' },
          { label: 'Organizações', value: organizations?.length ?? 0, color: 'text-accent-cyan' },
        ].map((stat) => (
          <div key={stat.label} className="bg-bg-card border border-white/[0.04] rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            <p className="text-[10px] text-text-muted uppercase tracking-widest font-mono">{stat.label}</p>
            <p className={`text-2xl font-bold mt-2 font-mono ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Projects */}
      <div className="bg-bg-card border border-white/[0.04] rounded-2xl p-4 relative overflow-hidden">
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-accent-cyan/20 to-transparent" />
        <h3 className="text-[10px] text-text-muted uppercase tracking-widest font-mono mb-3">Projetos</h3>
        <div className="grid grid-cols-2 gap-2">
          {(projects ?? []).map((project: any) => (
            <a
              key={project.id}
              href={`https://supabase.com/dashboard/project/${project.ref}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-bg-primary/50 border border-white/[0.03] rounded-xl hover:border-white/10 transition-all group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-text-primary group-hover:text-accent-cyan transition-colors truncate">
                    {project.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-text-muted">
                    {REGION_FLAGS[project.region] ?? '🌐'} {project.region}
                  </span>
                  {project.dbVersion && (
                    <span className="text-[9px] font-mono text-text-muted border border-white/[0.06] rounded px-1">
                      pg {project.dbVersion.split('.')[0]}
                    </span>
                  )}
                </div>
              </div>
              <span className={`text-[10px] font-mono shrink-0 ml-3 ${STATUS_COLORS[project.status] ?? 'text-text-muted'}`}>
                {STATUS_LABELS[project.status] ?? project.status}
              </span>
            </a>
          ))}
          {(!projects || projects.length === 0) && (
            <p className="text-xs text-text-muted py-4 col-span-2 text-center">Nenhum projeto encontrado</p>
          )}
        </div>
      </div>

      {/* Organizations */}
      {organizations && organizations.length > 1 && (
        <div className="bg-bg-card border border-white/[0.04] rounded-2xl p-4 mt-3 relative overflow-hidden">
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-accent-purple/20 to-transparent" />
          <h3 className="text-[10px] text-text-muted uppercase tracking-widest font-mono mb-3">Organizações</h3>
          <div className="flex flex-col gap-2">
            {organizations.map((org: any) => (
              <div key={org.id} className="flex items-center gap-3 p-3 bg-bg-primary/50 border border-white/[0.03] rounded-xl">
                <div className="w-7 h-7 rounded-lg bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-sm">
                  🏢
                </div>
                <div>
                  <p className="text-xs font-medium text-text-primary">{org.name}</p>
                  <p className="text-[10px] text-text-muted font-mono">{org.slug}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
