import { useState, useEffect, useMemo, useCallback } from 'react';
import { AGENTS } from '@/data/agents';
import { api } from '@/lib/api';
import type { CronJob } from '@/types/agents';

interface CalendarCron {
  id: string;
  name: string;
  frequency: string;
  agentId: string;
  days: number[]; // 0=Dom 1=Seg ... 6=Sáb (JavaScript getDay())
  enabled: boolean;
  time: string;
}

// Display order: Mon → Sun (for the weekly grid)
const WEEK_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
// For the day picker (Sun-based like getDay())
const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const STORAGE_KEY = 'theo-calendar-crons';

const defaultCrons: CalendarCron[] = [
  { id: '1', name: 'Briefing Matinal',     frequency: 'Diário',     agentId: 'theo',  days: [1,2,3,4,5],     enabled: true,  time: '06:15' },
  { id: '2', name: 'Alerta Julia Escola',  frequency: 'Dias úteis', agentId: 'theo',  days: [1,2,3,4,5],     enabled: true,  time: '07:10' },
  { id: '3', name: 'Briefing Noturno',     frequency: 'Diário',     agentId: 'theo',  days: [0,1,2,3,4,5,6], enabled: true,  time: '23:00' },
  { id: '4', name: 'Relatório de Custos',  frequency: 'Diário',     agentId: 'leo',   days: [1,2,3,4,5],     enabled: true,  time: '08:00' },
  { id: '5', name: 'Backup de Memória',    frequency: 'Diário',     agentId: 'marco', days: [0,1,2,3,4,5,6], enabled: true,  time: '03:00' },
];

function getWeekDays(): Date[] {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const emptyForm = { name: '', frequency: 'Diário', agentId: 'theo', days: [] as number[], time: '09:00' };

/** Parse a cron expression "min hour * * dow" → { time, days } */
function parseCronSchedule(schedule: string): { time: string; days: number[] } {
  const parts = schedule.trim().split(/\s+/);
  const [min = '0', hour = '0', , , dowPart = '*'] = parts;
  const h = parseInt(hour, 10);
  const m = parseInt(min, 10);
  const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

  let days: number[] = [];
  if (dowPart === '*') {
    days = [0, 1, 2, 3, 4, 5, 6];
  } else if (dowPart.includes('-')) {
    const [s, e] = dowPart.split('-').map(Number);
    for (let i = s; i <= e; i++) days.push(i % 7);
  } else if (dowPart.includes(',')) {
    days = dowPart.split(',').map(d => Number(d) % 7);
  } else {
    days = [Number(dowPart) % 7];
  }
  return { time, days };
}

function guessAgentId(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('leo') || n.includes('cust') || n.includes('financ')) return 'leo';
  if (n.includes('marco') || n.includes('backup') || n.includes('monitor')) return 'marco';
  if (n.includes('bruno') || n.includes('deploy') || n.includes('code')) return 'bruno';
  if (n.includes('carla') || n.includes('onboard')) return 'carla';
  return 'theo';
}

function cronJobToCalendar(job: CronJob): CalendarCron {
  const { time, days } = parseCronSchedule(job.schedule);
  return {
    id: `remote:${job.id}`,
    name: job.name,
    frequency: days.length === 7 ? 'Diário' : days.length >= 5 ? 'Dias úteis' : 'Semanal',
    agentId: guessAgentId(job.name),
    days,
    enabled: job.enabled,
    time,
  };
}

export default function Calendar() {
  const [localCrons, setLocalCrons] = useState<CalendarCron[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as CalendarCron[]) : defaultCrons;
    } catch { return defaultCrons; }
  });
  const [remoteCrons, setRemoteCrons] = useState<CalendarCron[]>([]);
  const [isLive, setIsLive] = useState(false);

  // Merged view: remote crons first, then local additions
  const crons = useMemo(() => {
    const remoteIds = new Set(remoteCrons.map(c => c.id));
    const localOnly = localCrons.filter(c => !remoteIds.has(`remote:${c.id}`));
    return [...remoteCrons, ...localOnly];
  }, [remoteCrons, localCrons]);

  const fetchRemote = useCallback(async () => {
    try {
      const jobs = await api.cronjobs();
      setRemoteCrons(jobs.map(cronJobToCalendar));
      setIsLive(true);
    } catch { /* keep local */ }
  }, []);

  useEffect(() => {
    fetchRemote();
    const t = setInterval(fetchRemote, 30_000);
    return () => clearInterval(t);
  }, [fetchRemote]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const weekDays = useMemo(() => getWeekDays(), []);
  const todayDow = new Date().getDay();
  // Convert Sun-based getDay() to Mon-based index (0=Mon, 6=Sun)
  const todayGridIdx = (todayDow + 6) % 7;

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(localCrons)); }
    catch { /* ignore */ }
  }, [localCrons]);

  const addCron = () => {
    if (!form.name.trim()) return;
    const cron: CalendarCron = { ...form, id: Date.now().toString(), enabled: true };
    setLocalCrons(prev => [...prev, cron]);
    setForm(emptyForm);
    setShowForm(false);
  };

  const toggleCron = async (id: string) => {
    if (id.startsWith('remote:')) {
      const remoteId = id.replace('remote:', '');
      try {
        await api.toggleCronjob(remoteId);
        fetchRemote();
      } catch { /* ignore */ }
    } else {
      setLocalCrons(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
    }
  };

  const deleteCron = (id: string) => {
    if (id.startsWith('remote:')) return; // remote crons managed via backend
    setLocalCrons(prev => prev.filter(c => c.id !== id));
  };

  const toggleFormDay = (day: number) =>
    setForm(f => ({ ...f, days: f.days.includes(day) ? f.days.filter(d => d !== day) : [...f.days, day] }));

  return (
    <div className="h-full flex flex-col overflow-hidden p-5">
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <h1 className="text-xl font-semibold tracking-wide">Calendar</h1>
        <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent" />
        {isLive && <span className="text-[10px] font-mono text-success">● live</span>}
        <span className="text-[10px] font-mono text-text-muted">{crons.filter(c => c.enabled).length} ativos</span>
        <button
          onClick={() => setShowForm(v => !v)}
          className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
          style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c' }}
        >
          + Cron
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-hidden min-h-0">
        {/* Weekly grid */}
        <div className="bg-bg-card rounded-2xl border border-white/[0.04] p-4 shrink-0">
          <div className="text-[10px] font-mono text-text-muted uppercase tracking-widest mb-3">Semana Atual</div>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((date, idx) => {
              const isToday = idx === todayGridIdx;
              const dayDow = date.getDay(); // 0=Sun, for cron matching
              const activeCrons = crons.filter(c => c.enabled && c.days.includes(dayDow));
              return (
                <div
                  key={idx}
                  className={`rounded-xl p-2.5 border transition-all ${
                    isToday
                      ? 'border-accent-purple/40 bg-accent-purple/5'
                      : 'border-white/[0.04] bg-bg-elevated'
                  }`}
                >
                  <div className={`text-[10px] font-mono mb-1 ${isToday ? 'text-accent-purple' : 'text-text-muted'}`}>
                    {WEEK_LABELS[idx]}
                  </div>
                  <div className={`text-xl font-bold font-mono mb-2 ${isToday ? 'text-accent-purple' : 'text-text-secondary'}`}>
                    {date.getDate()}
                  </div>
                  <div className="flex flex-col gap-1">
                    {activeCrons.slice(0, 3).map(cron => {
                      const agent = AGENTS.find(a => a.id === cron.agentId);
                      return (
                        <div
                          key={cron.id}
                          className="text-[8px] font-mono px-1 py-0.5 rounded truncate"
                          style={{ background: (agent?.color ?? '#8b5cf6') + '15', color: agent?.color ?? '#8b5cf6' }}
                        >
                          {cron.time} {cron.name}
                        </div>
                      );
                    })}
                    {activeCrons.length > 3 && (
                      <div className="text-[8px] font-mono text-text-muted">+{activeCrons.length - 3}</div>
                    )}
                    {activeCrons.length === 0 && (
                      <div className="text-[8px] font-mono text-text-muted opacity-30">—</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cron list */}
        <div className="flex-1 overflow-hidden flex flex-col bg-bg-card rounded-2xl border border-white/[0.04] min-h-0">
          <div className="px-4 py-3 border-b border-white/[0.03] flex items-center justify-between shrink-0">
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Cron Jobs ({crons.length})</span>
          </div>

          {/* Add form */}
          {showForm && (
            <div className="px-4 py-3 border-b border-white/[0.03] bg-bg-elevated animate-slide-in shrink-0">
              <div className="flex gap-2 mb-2 flex-wrap">
                <input
                  className="flex-1 min-w-32 px-3 py-1.5 rounded-lg bg-bg-card border border-border text-xs text-text-primary placeholder:text-text-muted font-mono focus:outline-none"
                  placeholder="Nome do cron..."
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addCron()}
                  autoFocus
                />
                <input
                  type="time"
                  className="px-3 py-1.5 rounded-lg bg-bg-card border border-border text-xs text-text-primary font-mono focus:outline-none"
                  value={form.time}
                  onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                />
                <select
                  className="px-3 py-1.5 rounded-lg bg-bg-card border border-border text-xs text-text-primary font-mono focus:outline-none"
                  value={form.agentId}
                  onChange={e => setForm(f => ({ ...f, agentId: e.target.value }))}
                >
                  {AGENTS.map(a => <option key={a.id} value={a.id}>{a.avatar} {a.name.split(' ')[0]}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex gap-1">
                  {DAY_LABELS.map((label, i) => (
                    <button
                      key={i}
                      onClick={() => toggleFormDay(i)}
                      className="w-7 h-7 rounded-md text-[9px] font-mono transition-all"
                      style={{
                        background: form.days.includes(i) ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${form.days.includes(i) ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.05)'}`,
                        color: form.days.includes(i) ? '#8b5cf6' : '#475569',
                      }}
                    >{label[0]}</button>
                  ))}
                </div>
                <div className="flex gap-2 ml-auto">
                  <button onClick={addCron} className="px-4 py-1.5 rounded-lg text-xs font-mono bg-accent-purple/20 text-accent-purple border border-accent-purple/30 hover:bg-accent-purple/30 transition-colors">
                    Adicionar
                  </button>
                  <button onClick={() => setShowForm(false)} className="px-3 py-1.5 rounded-lg text-xs font-mono text-text-muted border border-border hover:border-border-hover transition-colors">✕</button>
                </div>
              </div>
            </div>
          )}

          {/* Cron rows */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.03]">
            {crons.map(cron => {
              const agent = AGENTS.find(a => a.id === cron.agentId);
              return (
                <div key={cron.id} className="px-4 py-3 flex items-center gap-3 hover:bg-white/[0.01] transition-colors group">
                  {/* Toggle switch */}
                  <button
                    onClick={() => toggleCron(cron.id)}
                    className="w-8 h-4 rounded-full relative shrink-0 transition-all"
                    style={{ background: cron.enabled ? 'rgba(52,211,153,0.25)' : 'rgba(255,255,255,0.08)' }}
                  >
                    <div
                      className="absolute top-0.5 w-3 h-3 rounded-full transition-all duration-200"
                      style={{
                        background: cron.enabled ? '#34d399' : '#475569',
                        left: cron.enabled ? 'calc(100% - 14px)' : '2px',
                      }}
                    />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs font-medium ${cron.enabled ? 'text-text-primary' : 'text-text-muted'}`}>
                        {cron.name}
                      </span>
                      <span className="text-[9px] font-mono text-text-muted">{cron.frequency}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px]">{agent?.avatar}</span>
                      <span className="text-[10px] font-mono" style={{ color: agent?.color }}>{agent?.name.split(' ')[0]}</span>
                      <span className="text-[10px] font-mono text-text-muted">·</span>
                      <span className="text-[10px] font-mono" style={{ color: '#c9a84c' }}>{cron.time}</span>
                      <div className="flex gap-0.5">
                        {DAY_LABELS.map((label, i) => (
                          <span
                            key={i}
                            className="text-[9px] font-mono w-4 text-center"
                            style={{ color: cron.days.includes(i) ? agent?.color ?? '#8b5cf6' : '#1a1a2e' }}
                          >{label[0]}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteCron(cron.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-error text-[10px] shrink-0"
                  >✕</button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
