import { useState, useEffect, useCallback, useMemo } from 'react';
import { AGENTS } from '@/data/agents';

type DayOfWeek = 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom';

interface CronEntry {
  id: string;
  name: string;
  frequency: string;
  agent: string;
  days: DayOfWeek[];
  time: string;
}

const DAYS: { id: DayOfWeek; label: string; short: string }[] = [
  { id: 'seg', label: 'Segunda', short: 'Seg' },
  { id: 'ter', label: 'Terca', short: 'Ter' },
  { id: 'qua', label: 'Quarta', short: 'Qua' },
  { id: 'qui', label: 'Quinta', short: 'Qui' },
  { id: 'sex', label: 'Sexta', short: 'Sex' },
  { id: 'sab', label: 'Sabado', short: 'Sab' },
  { id: 'dom', label: 'Domingo', short: 'Dom' },
];

const STORAGE_KEY = 'theo-calendar-crons';

const DEFAULT_CRONS: CronEntry[] = [
  { id: '1', name: 'Briefing Matinal', frequency: 'diario', agent: 'theo', days: ['seg', 'ter', 'qua', 'qui', 'sex'], time: '06:15' },
  { id: '2', name: 'Alerta Escola Julia', frequency: 'diario', agent: 'theo', days: ['seg', 'ter', 'qua', 'qui', 'sex'], time: '07:10' },
  { id: '3', name: 'Relatorio Custos', frequency: 'diario', agent: 'leo', days: ['seg', 'ter', 'qua', 'qui', 'sex'], time: '08:00' },
  { id: '4', name: 'Briefing Noturno', frequency: 'diario', agent: 'marco', days: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'], time: '23:00' },
  { id: '5', name: 'Backup Memoria', frequency: 'diario', agent: 'bruno', days: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'], time: '03:00' },
  { id: '6', name: 'Review Semanal', frequency: 'semanal', agent: 'theo', days: ['sex'], time: '18:00' },
];

function loadCrons(): CronEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_CRONS;
  } catch { return DEFAULT_CRONS; }
}

export default function Calendar() {
  const [crons, setCrons] = useState<CronEntry[]>(loadCrons);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<CronEntry, 'id'>>({
    name: '', frequency: 'diario', agent: 'theo', days: ['seg', 'ter', 'qua', 'qui', 'sex'], time: '09:00',
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(crons));
  }, [crons]);

  const addCron = useCallback(() => {
    if (!formData.name.trim()) return;
    setCrons(prev => [...prev, { ...formData, id: crypto.randomUUID() }]);
    setFormData({ name: '', frequency: 'diario', agent: 'theo', days: ['seg', 'ter', 'qua', 'qui', 'sex'], time: '09:00' });
    setShowForm(false);
  }, [formData]);

  const deleteCron = useCallback((id: string) => {
    setCrons(prev => prev.filter(c => c.id !== id));
  }, []);

  const toggleDay = useCallback((day: DayOfWeek) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day],
    }));
  }, []);

  // Build weekly grid data
  const weekGrid = useMemo(() => {
    // Get hours that have crons
    const hours = new Set<string>();
    crons.forEach(c => hours.add(c.time));
    const sortedHours = Array.from(hours).sort();

    return { hours: sortedHours };
  }, [crons]);

  return (
    <div className="h-full flex flex-col p-6 gap-4 overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-wide">Calendar</h1>
          <p className="text-xs text-text-muted mt-1 font-mono">{crons.length} cron jobs agendados</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all"
          style={{ background: '#c9a84c20', color: '#c9a84c', border: '1px solid #c9a84c30' }}
        >+ Novo Cron</button>
      </div>

      {showForm && (
        <div className="glass rounded-xl p-4 shrink-0 animate-slide-up">
          <div className="grid grid-cols-3 gap-3">
            <input
              placeholder="Nome do cron..."
              value={formData.name}
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              className="col-span-2 bg-bg-primary border border-white/[0.06] rounded-lg px-3 py-2 text-xs font-mono text-text-primary outline-none focus:border-[#c9a84c]/40"
            />
            <input
              type="time"
              value={formData.time}
              onChange={e => setFormData(p => ({ ...p, time: e.target.value }))}
              className="bg-bg-primary border border-white/[0.06] rounded-lg px-3 py-2 text-xs font-mono text-text-primary outline-none"
            />
            <select
              value={formData.agent}
              onChange={e => setFormData(p => ({ ...p, agent: e.target.value }))}
              className="bg-bg-primary border border-white/[0.06] rounded-lg px-3 py-2 text-xs font-mono text-text-primary outline-none"
            >
              {AGENTS.map(a => <option key={a.id} value={a.id}>{a.avatar} {a.name}</option>)}
            </select>
            <select
              value={formData.frequency}
              onChange={e => setFormData(p => ({ ...p, frequency: e.target.value }))}
              className="bg-bg-primary border border-white/[0.06] rounded-lg px-3 py-2 text-xs font-mono text-text-primary outline-none"
            >
              <option value="diario">Diario</option>
              <option value="semanal">Semanal</option>
              <option value="mensal">Mensal</option>
            </select>
            <div className="flex items-center gap-1">
              {DAYS.map(day => (
                <button
                  key={day.id}
                  onClick={() => toggleDay(day.id)}
                  className="w-7 h-7 rounded text-[9px] font-mono font-bold transition-all"
                  style={{
                    background: formData.days.includes(day.id) ? '#c9a84c25' : 'transparent',
                    color: formData.days.includes(day.id) ? '#c9a84c' : '#475569',
                    border: `1px solid ${formData.days.includes(day.id) ? '#c9a84c40' : 'rgba(255,255,255,0.06)'}`,
                  }}
                >{day.short[0]}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mt-3 justify-end">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 rounded-lg text-xs font-mono text-text-muted hover:text-text-primary transition-colors">Cancelar</button>
            <button onClick={addCron} className="px-4 py-1.5 rounded-lg text-xs font-mono font-bold" style={{ background: '#c9a84c', color: '#06060b' }}>Criar</button>
          </div>
        </div>
      )}

      {/* Weekly Grid */}
      <div className="flex-1 overflow-auto">
        <div className="glass-subtle rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-8 border-b border-white/[0.04]">
            <div className="px-3 py-2.5 text-[10px] font-mono font-bold text-text-muted">HORA</div>
            {DAYS.map(day => (
              <div key={day.id} className="px-3 py-2.5 text-[10px] font-mono font-bold text-text-secondary text-center border-l border-white/[0.04]">
                {day.short}
              </div>
            ))}
          </div>

          {/* Time Rows */}
          {weekGrid.hours.map(hour => (
            <div key={hour} className="grid grid-cols-8 border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors">
              <div className="px-3 py-2 text-[11px] font-mono text-text-muted">{hour}</div>
              {DAYS.map(day => {
                const dayCrons = crons.filter(c => c.time === hour && c.days.includes(day.id));
                return (
                  <div key={day.id} className="px-1.5 py-1.5 border-l border-white/[0.03] flex flex-col gap-1">
                    {dayCrons.map(cron => {
                      const agent = AGENTS.find(a => a.id === cron.agent);
                      return (
                        <div
                          key={cron.id}
                          className="rounded px-1.5 py-1 text-[9px] font-mono leading-tight cursor-default group relative"
                          style={{ background: (agent?.color || '#8b5cf6') + '15', color: agent?.color || '#8b5cf6', border: `1px solid ${(agent?.color || '#8b5cf6')}20` }}
                          title={`${cron.name} — ${agent?.name}`}
                        >
                          <span className="truncate block">{cron.name}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Cron List */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {crons.map(cron => {
            const agent = AGENTS.find(a => a.id === cron.agent);
            return (
              <div key={cron.id} className="bg-bg-card border border-white/[0.04] rounded-lg p-3 hover:border-white/[0.08] transition-all group">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-text-primary">{cron.name}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[11px]">{agent?.avatar}</span>
                      <span className="text-[10px] font-mono text-text-muted">{agent?.name}</span>
                      <span className="text-[10px] font-mono" style={{ color: '#c9a84c' }}>{cron.time}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteCron(cron.id)}
                    className="text-text-muted hover:text-error text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                  >x</button>
                </div>
                <div className="flex gap-1 mt-2">
                  {DAYS.map(day => (
                    <span
                      key={day.id}
                      className="w-5 h-5 rounded text-[8px] font-mono font-bold flex items-center justify-center"
                      style={{
                        background: cron.days.includes(day.id) ? (agent?.color || '#8b5cf6') + '20' : 'transparent',
                        color: cron.days.includes(day.id) ? agent?.color || '#8b5cf6' : '#2a2a4e',
                      }}
                    >{day.short[0]}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
