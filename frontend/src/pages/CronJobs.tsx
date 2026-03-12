import { useState } from 'react';
import { useAPI } from '@/hooks/useAPI';
import { useWebSocket } from '@/hooks/useWebSocket';
import { api } from '@/lib/api';
import type { CronJob } from '@/types/agents';

const SCHEDULE_PRESETS = [
  { label: 'Todo dia 06:15', value: '06h15' },
  { label: 'Todo dia 08:00', value: '08h00' },
  { label: 'Todo dia 00:00', value: '00h00' },
  { label: 'A cada 5 min',   value: '*/5min' },
  { label: 'A cada 30 min',  value: '*/30min' },
  { label: 'A cada 60 min',  value: '*/60min' },
];

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    if (d.getFullYear() < 2000) return '—';
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch { return '—'; }
}

function StatusBadge({ status }: { status: CronJob['lastRunStatus'] }) {
  const map = {
    ok:      { label: 'OK',       bg: 'rgba(52,211,153,0.10)', color: '#34d399' },
    error:   { label: 'ERRO',     bg: 'rgba(248,113,113,0.10)', color: '#f87171' },
    skipped: { label: 'SKIP',     bg: 'rgba(71,85,105,0.15)',   color: '#475569' },
    running: { label: 'RODANDO',  bg: 'rgba(34,211,238,0.10)',  color: '#22d3ee' },
  };
  const s = map[status] ?? map.skipped;
  return (
    <span
      className="text-[9px] font-mono px-2 py-0.5 rounded-full tracking-wide"
      style={{ background: s.bg, color: s.color }}
    >{s.label}</span>
  );
}

const emptyForm = { name: '', schedule: '06h15', command: '', customSchedule: false };

export default function CronJobs() {
  const { data: cronJobs, loading, refetch } = useAPI(api.cronjobs, [], { pollInterval: 15_000 });
  const [togglingId, setTogglingId]   = useState<string | null>(null);
  const [runningId, setRunningId]     = useState<string | null>(null);
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState(emptyForm);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // Live updates from WebSocket
  useWebSocket({
    onMessage: (evt) => {
      if (evt.type === 'cronjob:update') refetch();
    },
  });

  const jobs: CronJob[] = cronJobs ?? [];

  const handleToggle = async (id: string) => {
    if (togglingId) return;
    setTogglingId(id);
    try { await api.toggleCronjob(id); await refetch(); }
    catch { setError('Falha ao alternar job.'); setTimeout(() => setError(null), 3000); }
    finally { setTogglingId(null); }
  };

  const handleRun = async (id: string) => {
    if (runningId) return;
    setRunningId(id);
    try { await api.runCronjob(id); await refetch(); }
    catch { setError('Falha ao executar job.'); setTimeout(() => setError(null), 3000); }
    finally { setRunningId(null); }
  };

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    setDeletingId(id);
    try { await api.deleteCronjob(id); await refetch(); }
    catch { setError('Falha ao deletar job.'); setTimeout(() => setError(null), 3000); }
    finally { setDeletingId(null); }
  };

  const handleCreate = async () => {
    if (!form.name.trim() || !form.schedule.trim()) return;
    setSaving(true);
    try {
      await api.createCronjob({ name: form.name, schedule: form.schedule, command: form.command || undefined });
      await refetch();
      setForm(emptyForm);
      setShowForm(false);
    } catch { setError('Falha ao criar job.'); setTimeout(() => setError(null), 3000); }
    finally { setSaving(false); }
  };

  const activeCount = jobs.filter(j => j.enabled).length;

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 mesh-gradient">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-[11px] font-mono font-bold tracking-[0.2em] text-gradient">CRON JOBS</h1>
        <div className="h-px flex-1 bg-gradient-to-r from-white/[0.05] to-transparent" />
        <span className="text-[10px] font-mono text-text-muted">{activeCount}/{jobs.length} ativos</span>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono transition-all"
          style={{ background: 'rgba(139,92,246,0.10)', border: '1px solid rgba(139,92,246,0.25)', color: '#8b5cf6' }}
        >
          {showForm ? '✕ Cancelar' : '+ Novo Job'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl border border-error/25 bg-error/8 text-error text-xs font-mono animate-slide-in">
          {error}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="mb-5 p-4 rounded-xl border border-white/[0.05] bg-bg-card animate-slide-in">
          <p className="text-[9px] font-mono text-text-muted uppercase tracking-widest mb-3">Novo Cron Job</p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <input
              className="col-span-2 px-3 py-2 rounded-lg bg-bg-elevated border border-border text-xs text-text-primary placeholder:text-text-muted font-mono focus:outline-none focus:border-border-hover"
              placeholder="Nome do job..."
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              autoFocus
            />

            {/* Schedule selector */}
            <select
              className="px-3 py-2 rounded-lg bg-bg-elevated border border-border text-xs text-text-primary font-mono focus:outline-none"
              value={form.customSchedule ? '__custom' : form.schedule}
              onChange={e => {
                if (e.target.value === '__custom') setForm(f => ({ ...f, customSchedule: true, schedule: '' }));
                else setForm(f => ({ ...f, customSchedule: false, schedule: e.target.value }));
              }}
            >
              {SCHEDULE_PRESETS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
              <option value="__custom">Personalizado...</option>
            </select>

            {form.customSchedule ? (
              <input
                className="px-3 py-2 rounded-lg bg-bg-elevated border border-border text-xs text-text-primary font-mono focus:outline-none focus:border-border-hover"
                placeholder="ex: 14h30 ou */15min"
                value={form.schedule}
                onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))}
              />
            ) : (
              <div className="flex items-center px-3 py-2 rounded-lg bg-bg-elevated border border-border text-[10px] font-mono text-text-muted">
                {form.schedule}
              </div>
            )}

            <input
              className="col-span-2 px-3 py-2 rounded-lg bg-bg-elevated border border-border text-xs text-text-primary placeholder:text-text-muted font-mono focus:outline-none focus:border-border-hover"
              placeholder="Comando (opcional): ex: curl http://host.docker.internal:18789/healthz"
              value={form.command}
              onChange={e => setForm(f => ({ ...f, command: e.target.value }))}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={saving || !form.name.trim() || !form.schedule.trim()}
              className="px-4 py-1.5 rounded-lg text-[10px] font-mono bg-accent-purple/15 text-accent-purple border border-accent-purple/25 hover:bg-accent-purple/25 transition-colors disabled:opacity-40"
            >
              {saving ? 'Salvando...' : 'Criar Job'}
            </button>
            <button
              onClick={() => { setShowForm(false); setForm(emptyForm); }}
              className="px-4 py-1.5 rounded-lg text-[10px] font-mono text-text-muted border border-border hover:border-border-hover transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Jobs list */}
      {loading && jobs.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-text-muted text-[10px] font-mono">carregando...</div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-muted">
          <span className="text-3xl mb-3">⏰</span>
          <p className="text-xs font-mono">Nenhum cron job configurado</p>
        </div>
      ) : (
        <div className="rounded-xl border border-white/[0.04] overflow-hidden bg-bg-card">
          {jobs.map((job, i) => {
            const isRunning = runningId === job.id || job.lastRunStatus === 'running';
            return (
              <div
                key={job.id}
                className={`flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-bg-card-hover ${
                  i < jobs.length - 1 ? 'border-b border-white/[0.03]' : ''
                }`}
              >
                {/* Toggle */}
                <button
                  onClick={() => handleToggle(job.id)}
                  disabled={!!togglingId}
                  className={`w-8 h-4 rounded-full shrink-0 transition-all relative ${togglingId === job.id ? 'opacity-50' : ''}`}
                  style={{ background: job.enabled ? '#8b5cf6' : '#1a1a2e' }}
                >
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-200 ${job.enabled ? 'left-4' : 'left-0.5'}`} />
                </button>

                {/* Name + schedule */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs font-medium ${job.enabled ? 'text-text-primary' : 'text-text-muted'}`}>
                      {job.name}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded text-text-muted/60 border border-white/[0.04]">
                      {job.schedule}
                    </span>
                    {job.command && (
                      <span className="text-[9px] font-mono text-text-muted/40 truncate max-w-[180px]" title={job.command}>
                        $ {job.command.slice(0, 40)}{job.command.length > 40 ? '…' : ''}
                      </span>
                    )}
                  </div>
                  {job.lastRunOutput && (
                    <p className="text-[9px] font-mono text-text-muted/50 truncate max-w-[320px]">{job.lastRunOutput}</p>
                  )}
                </div>

                {/* Last run */}
                <div className="text-right shrink-0 hidden sm:block">
                  <p className="text-[9px] font-mono text-text-muted">último: {formatDate(job.lastRun)}</p>
                  <p className="text-[9px] font-mono text-text-muted/50">próx: {formatDate(job.nextRun)}</p>
                </div>

                {/* Status */}
                <StatusBadge status={job.lastRunStatus} />

                {/* Run now */}
                <button
                  onClick={() => handleRun(job.id)}
                  disabled={isRunning}
                  title="Executar agora"
                  className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-all text-text-muted hover:text-accent-cyan hover:bg-accent-cyan/8 disabled:opacity-40"
                >
                  {isRunning ? (
                    <span className="text-[10px] animate-pulse-glow text-accent-cyan">●</span>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  )}
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(job.id)}
                  disabled={deletingId === job.id}
                  title="Remover"
                  className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-all text-text-muted hover:text-error hover:bg-error/8 disabled:opacity-40"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6" />
                    <path d="M19,6l-1,14H6L5,6" />
                    <path d="M10,11v6M14,11v6M9,6V4h6v2" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
