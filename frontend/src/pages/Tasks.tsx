import { useState, useEffect } from 'react';
import { AGENTS } from '@/data/agents';
import { useAgents } from '@/hooks/useAgents';
import type { PanelAgent } from '@/data/agents';

type TaskColumn = 'recorrente' | 'backlog' | 'em-progresso' | 'revisao' | 'concluido';
type Priority = 'alta' | 'media' | 'baixa';

interface Task {
  id: string;
  title: string;
  agentId: string;
  priority: Priority;
  description: string;
  column: TaskColumn;
  createdAt: string;
  live?: boolean;
}

const COLUMNS: { id: TaskColumn; label: string; color: string }[] = [
  { id: 'recorrente',   label: 'Recorrente',  color: '#475569' },
  { id: 'backlog',      label: 'Backlog',      color: '#8b5cf6' },
  { id: 'em-progresso', label: 'Em Progresso', color: '#00d4ff' },
  { id: 'revisao',      label: 'Revisão',      color: '#fbbf24' },
  { id: 'concluido',    label: 'Concluído',    color: '#34d399' },
];

const PRIORITY_COLORS: Record<Priority, string> = {
  alta:  '#f87171',
  media: '#fbbf24',
  baixa: '#34d399',
};

const STORAGE_KEY = 'theo-tasks-v2';

const DEFAULT_TASKS: Task[] = [
  { id: '1', title: 'Briefing matinal',              agentId: 'theo',   priority: 'alta',  description: 'Enviar briefing diário às 06h15',              column: 'recorrente',   createdAt: new Date().toISOString() },
  { id: '2', title: 'Monitorar custos OpenRouter',   agentId: 'leo',    priority: 'media', description: 'Checar custos diários da API',                 column: 'recorrente',   createdAt: new Date().toISOString() },
  { id: '3', title: 'Revisão de skills dos agentes', agentId: 'carla',  priority: 'media', description: 'Atualizar SOUL.md e AGENTS.md de cada agente', column: 'backlog',      createdAt: new Date().toISOString() },
  { id: '4', title: 'Configurar alertas Telegram',   agentId: 'marco',  priority: 'baixa', description: 'Novos alertas de cron jobs',                   column: 'revisao',      createdAt: new Date().toISOString() },
  { id: '5', title: 'Relatório semanal de custos',   agentId: 'leo',    priority: 'media', description: 'Compilar custos da semana',                    column: 'concluido',    createdAt: new Date().toISOString() },
  { id: '6', title: 'Revisar contratos',             agentId: 'rafael', priority: 'alta',  description: 'Análise de cláusulas e compliance LGPD',       column: 'backlog',      createdAt: new Date().toISOString() },
];

const emptyForm = { title: '', agentId: 'theo', priority: 'media' as Priority, description: '', column: 'backlog' as TaskColumn };

export default function Tasks() {
  const { agents } = useAgents();

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as Task[]) : DEFAULT_TASKS;
    } catch { return DEFAULT_TASKS; }
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // Persist only manual tasks
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks.filter(t => !t.live))); }
    catch { /* ignore */ }
  }, [tasks]);

  // Sync live tasks from real agent activity
  useEffect(() => {
    if (!agents.length) return;
    setTasks(prev => {
      const manual = prev.filter(t => !t.live);
      const liveTasks: Task[] = agents
        .filter(a => a.status === 'working')
        .map(a => ({
          id: `live-${a.id}`,
          title: a.activeTask
            ? a.activeTask.replace(/^Executando:\s*/i, '')
            : `${a.name} trabalhando`,
          agentId: a.id,
          priority: 'alta' as Priority,
          description: a.lastAction?.slice(0, 120) ?? '',
          column: 'em-progresso' as TaskColumn,
          createdAt: a.lastActionTime ?? new Date().toISOString(),
          live: true,
        }));
      return [...manual, ...liveTasks];
    });
  }, [agents]);

  const addTask = () => {
    if (!form.title.trim()) return;
    const task: Task = { ...form, id: Date.now().toString(), createdAt: new Date().toISOString() };
    setTasks(prev => [...prev, task]);
    setForm(emptyForm);
    setShowForm(false);
  };

  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  const moveTask = (id: string, dir: 'forward' | 'back') => {
    const colIds = COLUMNS.map(c => c.id);
    setTasks(prev => prev.map(t => {
      if (t.id !== id || t.live) return t;
      const idx = colIds.indexOf(t.column);
      const next = dir === 'forward' ? idx + 1 : idx - 1;
      if (next < 0 || next >= colIds.length) return t;
      return { ...t, column: colIds[next] };
    }));
  };

  const liveCount  = tasks.filter(t => t.live).length;
  const totalCount = tasks.filter(t => !t.live).length;

  return (
    <div className="h-full flex flex-col overflow-hidden p-4 sm:p-5">

      {/* Header */}
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <h1 className="text-[11px] font-mono font-bold tracking-[0.2em] text-gradient">TASKS</h1>
        <div className="h-px flex-1 bg-gradient-to-r from-white/[0.05] to-transparent" />
        {liveCount > 0 && (
          <div className="flex items-center gap-1.5 text-[9px] font-mono">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-status-pulse" />
            <span className="text-success">{liveCount} ao vivo</span>
          </div>
        )}
        <span className="text-[10px] font-mono text-text-muted">{totalCount} tasks</span>
        <button
          onClick={() => setShowForm(v => !v)}
          className="px-3 py-1.5 rounded-lg text-[10px] font-mono transition-all"
          style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.22)', color: '#c9a84c' }}
        >
          {showForm ? '✕' : '+ Nova'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="mb-3 p-3.5 rounded-xl border border-white/[0.05] bg-bg-card shrink-0 animate-slide-in">
          <div className="grid grid-cols-2 gap-2 mb-2.5">
            <input
              className="col-span-2 px-3 py-2 rounded-lg bg-bg-elevated border border-border text-xs text-text-primary placeholder:text-text-muted font-mono focus:outline-none focus:border-border-hover"
              placeholder="Título da task..."
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addTask()}
              autoFocus
            />
            <input
              className="col-span-2 px-3 py-2 rounded-lg bg-bg-elevated border border-border text-xs text-text-primary placeholder:text-text-muted font-mono focus:outline-none focus:border-border-hover"
              placeholder="Descrição..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
            <select
              className="px-3 py-2 rounded-lg bg-bg-elevated border border-border text-xs text-text-primary font-mono focus:outline-none"
              value={form.agentId}
              onChange={e => setForm(f => ({ ...f, agentId: e.target.value }))}
            >
              {AGENTS.map(a => <option key={a.id} value={a.id}>{a.avatar} {a.name}</option>)}
            </select>
            <div className="flex gap-2">
              <select
                className="flex-1 px-3 py-2 rounded-lg bg-bg-elevated border border-border text-xs text-text-primary font-mono focus:outline-none"
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}
              >
                <option value="alta">🔴 Alta</option>
                <option value="media">🟡 Média</option>
                <option value="baixa">🟢 Baixa</option>
              </select>
              <select
                className="flex-1 px-3 py-2 rounded-lg bg-bg-elevated border border-border text-xs text-text-primary font-mono focus:outline-none"
                value={form.column}
                onChange={e => setForm(f => ({ ...f, column: e.target.value as TaskColumn }))}
              >
                {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addTask} className="px-4 py-1.5 rounded-lg text-[10px] font-mono bg-accent-purple/12 text-accent-purple border border-accent-purple/25 hover:bg-accent-purple/20 transition-colors">Adicionar</button>
            <button onClick={() => { setShowForm(false); setForm(emptyForm); }} className="px-4 py-1.5 rounded-lg text-[10px] font-mono text-text-muted border border-border hover:border-border-hover transition-colors">Cancelar</button>
          </div>
        </div>
      )}

      {/* Kanban board */}
      <div className="flex-1 flex gap-3 overflow-hidden min-h-0">
        {COLUMNS.map((col, colIdx) => {
          const colTasks    = tasks.filter(t => t.column === col.id);
          const liveTasks   = colTasks.filter(t => t.live);
          const manualTasks = colTasks.filter(t => !t.live);

          return (
            <div key={col.id} className="flex-1 flex flex-col min-w-0 bg-bg-card rounded-xl border border-white/[0.03] overflow-hidden">
              {/* Column header */}
              <div className="px-3 py-2 border-b border-white/[0.03] flex items-center gap-1.5 shrink-0">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: col.color }} />
                <span className="text-[9px] font-mono font-semibold text-text-muted tracking-widest uppercase flex-1 truncate">{col.label}</span>
                <span className="text-[9px] font-mono text-text-muted bg-bg-elevated px-1.5 py-0.5 rounded">{colTasks.length}</span>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">

                {/* Live tasks — read-only, from OpenClaw */}
                {liveTasks.map(task => {
                  const agent = agents.find(a => a.id === task.agentId);
                  const color = agent?.color ?? '#8b5cf6';
                  return (
                    <div
                      key={task.id}
                      className="rounded-xl p-2.5 border relative overflow-hidden"
                      style={{ background: color + '06', borderColor: color + '22' }}
                    >
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-success animate-status-pulse" />
                        <span className="text-[8px] font-mono text-success">live</span>
                      </div>
                      <div className="flex items-start gap-2 pr-10">
                        <span className="text-sm shrink-0 leading-none">{agent?.avatar ?? '🤖'}</span>
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold leading-tight" style={{ color }}>{task.title}</p>
                          {task.description && (
                            <p className="text-[9px] font-mono text-text-muted mt-0.5 leading-relaxed"
                               style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Manual tasks */}
                {manualTasks.map(task => {
                  const agent      = AGENTS.find(a => a.id === task.agentId) as PanelAgent | undefined;
                  const taskColIdx = COLUMNS.findIndex(c => c.id === task.column);
                  return (
                    <div key={task.id} className="bg-bg-elevated rounded-xl p-2.5 border border-white/[0.04] group transition-all hover:border-white/[0.08]">
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="text-[10px] font-medium text-text-primary leading-snug flex-1">{task.title}</span>
                        <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-error text-[10px] shrink-0 ml-1">✕</button>
                      </div>
                      {task.description && (
                        <p className="text-[9px] text-text-muted font-mono mb-1.5 leading-relaxed"
                           style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[11px] shrink-0">{agent?.avatar}</span>
                          <span className="text-[9px] font-mono truncate" style={{ color: agent?.color }}>{agent?.name.split(' ')[0]}</span>
                          <span className="text-[8px] font-mono px-1 py-0.5 rounded shrink-0"
                                style={{ background: PRIORITY_COLORS[task.priority] + '18', color: PRIORITY_COLORS[task.priority] }}>
                            {task.priority}
                          </span>
                        </div>
                        <div className="flex gap-0.5 shrink-0">
                          {taskColIdx > 0 && (
                            <button onClick={() => moveTask(task.id, 'back')} className="text-[11px] text-text-muted hover:text-text-secondary w-5 h-5 flex items-center justify-center rounded hover:bg-white/[0.04] transition-all">←</button>
                          )}
                          {taskColIdx < COLUMNS.length - 1 && (
                            <button onClick={() => moveTask(task.id, 'forward')} className="text-[11px] text-text-muted hover:text-text-secondary w-5 h-5 flex items-center justify-center rounded hover:bg-white/[0.04] transition-all">→</button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="flex items-center justify-center text-[9px] text-text-muted/25 font-mono py-8">vazio</div>
                )}
              </div>

              {/* Progress bar */}
              <div className="px-3 py-1.5 border-t border-white/[0.03] shrink-0">
                <div className="h-[2px] rounded-full w-full bg-white/[0.03]">
                  <div className="h-full rounded-full transition-all duration-500"
                       style={{ background: col.color, width: tasks.length > 0 ? `${(colTasks.length / tasks.length) * 100}%` : '0%', opacity: colIdx === COLUMNS.length - 1 ? 1 : 0.45 }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
