import { useAPI } from '@/hooks/useAPI';
import { api } from '@/lib/api';

function NotConfigured() {
  return (
    <div className="h-full overflow-y-auto p-6 mesh-gradient flex items-center justify-center">
      <div className="bg-bg-card border border-white/[0.04] rounded-2xl p-8 max-w-md w-full text-center relative overflow-hidden">
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <div className="text-4xl mb-4">🐙</div>
        <h2 className="text-base font-semibold text-text-primary mb-2">GitHub não configurado</h2>
        <p className="text-xs text-text-muted mb-4">
          Adicione seu token no arquivo <code className="text-accent-purple font-mono">.env</code>:
        </p>
        <div className="bg-bg-primary border border-white/[0.04] rounded-xl p-3 text-left font-mono text-xs text-accent-cyan">
          GITHUB_TOKEN=ghp_xxxxxxxxxxxx
        </div>
        <p className="text-[10px] text-text-muted mt-4">
          Gere em: GitHub → Settings → Developer Settings → Personal access tokens
        </p>
      </div>
    </div>
  );
}

const EVENT_LABELS: Record<string, string> = {
  PushEvent: 'Push',
  PullRequestEvent: 'Pull Request',
  IssuesEvent: 'Issue',
  CreateEvent: 'Create',
  DeleteEvent: 'Delete',
  ForkEvent: 'Fork',
  WatchEvent: 'Star',
  IssueCommentEvent: 'Comentário',
};

export default function GitHub() {
  const { data, loading, error } = useAPI(api.github, null, { pollInterval: 60_000 });

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-text-muted text-xs font-mono animate-pulse">Carregando GitHub...</div>
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

  const { user, repos, events } = data;

  return (
    <div className="h-full overflow-y-auto p-6 mesh-gradient">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xl">🐙</span>
        <h1 className="text-xl font-semibold tracking-wide">GitHub</h1>
        <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent" />
        <a
          href={`https://github.com/${user.login}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-bg-card border border-white/[0.04] rounded-xl px-3 py-1.5 text-xs text-text-muted hover:text-text-primary hover:border-white/10 transition-all"
        >
          <img src={user.avatar} alt={user.login} className="w-4 h-4 rounded-full" />
          {user.name || user.login}
        </a>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Repositórios', value: user.publicRepos, color: 'text-accent-purple' },
          { label: 'Seguidores', value: user.followers, color: 'text-accent-cyan' },
          { label: 'Seguindo', value: user.following, color: 'text-text-secondary' },
        ].map((stat) => (
          <div key={stat.label} className="bg-bg-card border border-white/[0.04] rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            <p className="text-[10px] text-text-muted uppercase tracking-widest font-mono">{stat.label}</p>
            <p className={`text-2xl font-bold mt-2 font-mono ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-3">
        {/* Repos */}
        <div className="bg-bg-card border border-white/[0.04] rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-accent-purple/20 to-transparent" />
          <h3 className="text-[10px] text-text-muted uppercase tracking-widest font-mono mb-3">
            Repositórios Recentes
          </h3>
          <div className="flex flex-col gap-2">
            {(repos ?? []).map((repo: any) => (
              <a
                key={repo.id}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-bg-primary/50 border border-white/[0.03] rounded-xl hover:border-white/10 transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-text-primary group-hover:text-accent-purple transition-colors truncate">
                      {repo.name}
                    </span>
                    {repo.private && (
                      <span className="text-[9px] font-mono text-text-muted border border-white/[0.06] rounded px-1">
                        private
                      </span>
                    )}
                  </div>
                  {repo.description && (
                    <p className="text-[10px] text-text-muted mt-0.5 truncate">{repo.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 ml-3 shrink-0">
                  {repo.language && (
                    <span className="text-[10px] text-text-muted font-mono">{repo.language}</span>
                  )}
                  <span className="text-[10px] text-text-muted flex items-center gap-1">
                    ⭐ {repo.stars}
                  </span>
                  {repo.openIssues > 0 && (
                    <span className="text-[10px] text-warning flex items-center gap-1">
                      ⚠ {repo.openIssues}
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div className="bg-bg-card border border-white/[0.04] rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-accent-cyan/20 to-transparent" />
          <h3 className="text-[10px] text-text-muted uppercase tracking-widest font-mono mb-3">
            Atividade Recente
          </h3>
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[400px]">
            {(events ?? []).map((event: any) => (
              <div key={event.id} className="p-2.5 bg-bg-primary/50 border border-white/[0.03] rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-accent-cyan">
                    {EVENT_LABELS[event.type] ?? event.type}
                  </span>
                  <span className="text-[9px] text-text-muted">
                    {new Date(event.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="text-[10px] text-text-muted truncate">{event.repo}</p>
                {event.payload.title && (
                  <p className="text-[10px] text-text-secondary mt-0.5 truncate">{event.payload.title}</p>
                )}
                {event.payload.commits > 0 && (
                  <p className="text-[10px] text-text-muted mt-0.5">{event.payload.commits} commits</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
