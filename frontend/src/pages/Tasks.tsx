import { useState, useEffect } from 'react';
import { AGENTS } from '@/data/agents';

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
}

const COLUMNS: { id: TaskColumn; label: string; color: string }[] = [
  { id: 'recorrente',   label: 'Recorrente',   color: '#475569' },
  { id: 'backlog',      label: 'Backlog',       color: '#8b5cf6' },
  { id: 'em-progresso', label: 'Em Progresso',  color: '#00d4ff' },
  { id: 'revisao',      label: 'Revisão',       color: '#fbbf24' },
  { id: 'concluido',    label: 'Concluído',     color: '#34d399' },
];

const PRIORITY_COLORS: Record<Priority, string> = {
  alta:  '#f87171',
  media: '#fbbf24',
  baixa: '#34d399',
};

const STORAGE_KEY = 'theo-tasks';

const defaultTasks: Task[] = [
  { id: '1', title: 'Briefing matinal',              agentId: 'theo',  priority: 'alta',  description: 'Enviar briefing diário às 06h15',             column: 'recorrente',   createdAt: new Date().toISOString() },
  { id: '2', title: 'Monitorar custos OpenRouter',   agentId: 'leo',   priority: 'media', description: 'Checar custos diários da API',                column: 'recorrente',   createdAt: new Date().toISOString() },
  { id: '3', title: 'Implementar telas do painel',   agentId: 'bruno', priority: 'alta',  description: 'Adicionar 6 novas telas ao theo-panel',       column: 'em-progresso', createdAt: new Date().toISOString() },
  { id: '4', title: 'Revisão de skills dos agentes', agentId: 'carla', priority: 'media', description: 'Atualizar SOUL.md e AGENTS.md de cada agente', column: 'backlog',      createdAt: new Date().toISOString() },
  { id: '5', title: 'Configurar alertas Telegram',   agentId: 'marco', priority: 'baixa', description: 'Novos alertas de cron jobs',                  column: 'revisao',      createdAt: new Date().toISOString() },
  { id: '6', title: 'Relatório semanal de custos',   agentId: 'leo',   priority: 'media', description: 'Compilar custos da semana',                   column: 'concluido',    createdAt: new Date().toISOString() },
  { id: '7', title: 'Revisar contratos fornecedores', agentId: 'rafael', priority: 'alta',  description: 'Análise de cláusulas e compliance LGPD',      column: 'backlog',      createdAt: new Date().toISOString() },
];

const emptyForm = { title: '', agentId: 'theo', priority: 'media' as Priority, description: '', column: 'backlog' as TaskColumn };

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as Task[]) : defaultTasks;
    } catch { return defaultTasks; }
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
    catch { /* ignore */ }
  }, [tasks]);

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
      if (t.id !== id) return t;
      const idx = colIds.indexOf(t.column);
      const next = dir === 'forward' ? idx + 1 : idx - 1;
      if (next < 0 || next >= colIds.length) return t;
      return { ...t, column: colIds[next] };
    }));
  };

  return (
    <div className="h-full flex flex-col overflow-hidden p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <h1 className="text-xl font-semibold tracking-wide">Tasks Board</h1>
        <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent" />
        <span className="text-[10px] font-mono text-text-muted">{tasks.length} tasks</span>
        <button
          onClick={() => setShowForm(v => !v)}
          className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
          style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c' }}
        >
          + Nova Task
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="mb-4 p-4 rounded-2xl border border-white/[0.05] bg-bg-card shrink-0 animate-slide-in">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <input
              className="col-span-2 px-3 py-2 rounded-xl bg-bg-elevated border border-border text-sm text-text-primary placeholder:text-text-muted font-mono focus:outline-none focus:border-border-hover"
              placeholder="Título da task..."
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addTask()}
              autoFocus
            />
            <input
              className="col-span-2 px-3 py-2 rounded-xl bg-bg-elevated border border-border text-xs text-text-primary placeholder:text-text-muted font-mono focus:outline-none focus:border-border-hover"
              placeholder="Descrição..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
            <select
              className="px-3 py-2 rounded-xl bg-bg-elevated border border-border text-xs text-text-primary font-mono focus:outline-none"
              value={form.agentId}
              onChange={e => setForm(f => ({ ...f, agentId: e.target.value }))}
            >
              {AGENTS.map(a => <option key={a.id} value={a.id}>{a.avatar} {a.name}</option>)}
            </select>
            <div className="flex gap-2">
              <select
                className="flex-1 px-3 py-2 rounded-xl bg-bg-elevated border border-border text-xs text-text-primary font-mono focus:outline-none"
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}
              >
                <option value="alta">🔴 Alta</option>
                <option value="media">🟡 Média</option>
                <option value="baixa">🟢 Baixa</option>
              </select>
              <select
                className="flex-1 px-3 py-2 rounded-xl bg-bg-elevated border border-border text-xs text-text-primary font-mono focus:outline-none"
                value={form.column}
                onChange={e => setForm(f => ({ ...f, column: e.target.value as TaskColumn }))}
              >
                {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addTask} className="px-4 py-1.5 rounded-lg text-xs font-mono bg-accent-purple/20 text-accent-purple border border-accent-purple/30 hover:bg-accent-purple/30 transition-colors">
              Adicionar
            </button>
            <button onClick={() => { setShowForm(false); setForm(emptyForm); }} className="px-4 py-1.5 rounded-lg text-xs font-mono text-text-muted border border-border hover:border-border-hover transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Kanban board */}
      <div className="flex-1 flex gap-3 overflow-hidden min-h-0">
        {COLUMNS.map((col, colIdx) => {
          const colTasks = tasks.filter(t => t.column === col.id);
          return (
            <div key={col.id} className="flex-1 flex flex-col min-w-0 bg-bg-card rounded-2xl border border-white/[0.03] overflow-hidden">
              {/* Column header */}
              <div className="px-3 py-2.5 border-b border-white/[0.03] flex items-center gap-2 shrink-0">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: col.color }} />
                <span className="text-[10px] font-mono font-semibold text-text-secondary tracking-widest uppercase flex-1">{col.label}</span>
                <span className="text-[10px] font-mono text-text-muted bg-bg-elevated px-1.5 py-0.5 rounded-md">{colTasks.length}</span>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
                {colTasks.map(task => {
                  const agent = AGENTS.find(a => a.id === task.agentId);
                  const taskColIdx = COLUMNS.findIndex(c => c.id === task.column);
                  return (
                    <div key={task.id} className="bg-bg-elevated rounded-xl p-3 border border-white/[0.04] card-hover group">
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <span className="text-xs font-medium text-text-primary leading-snug flex-1">{task.title}</span>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-error text-[10px] shrink-0 ml-1"
                        >✕</button>
                      </div>
                      {task.description && (
                        <p className="text-[10px] text-text-muted font-mono mb-2 leading-relaxed">{task.description}</p>
                      )}
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                          <span className="text-[11px] shrink-0">{agent?.avatar}</span>
                          <span className="text-[10px] font-mono truncate" style={{ color: agent?.color }}>{agent?.name.split(' ')[0]}</span>
                          <span
                            className="text-[9px] font-mono px-1.5 py-0.5 rounded-full shrink-0"
                            style={{ background: PRIORITY_COLORS[task.priority] + '20', color: PRIORITY_COLORS[task.priority] }}
                          >{task.priority}</span>
                        </div>
                        <div className="flex gap-0.5 shrink-0">
                          {taskColIdx > 0 && (
                            <button
                              onClick={() => moveTask(task.id, 'back')}
                              className="text-[11px] text-text-muted hover:text-text-secondary w-5 h-5 flex items-center justify-center rounded hover:bg-white/[0.04] transition-all"
                              title="Voltar"
                            >←</button>
                          )}
                          {taskColIdx < COLUMNS.length - 1 && (
                            <button
                              onClick={() => moveTask(task.id, 'forward')}
                              className="text-[11px] text-text-muted hover:text-text-secondary w-5 h-5 flex items-center justify-center rounded hover:bg-white/[0.04] transition-all"
                              title="Avançar"
                            >→</button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {colTasks.length === 0 && (
                  <div className="flex items-center justify-center text-[10px] text-text-muted font-mono opacity-30 py-10">
                    vazio
                  </div>
                )}
              </div>

              {/* Column footer */}
              <div className="px-3 py-1.5 border-t border-white/[0.03] shrink-0">
                <div className="h-0.5 rounded-full w-full" style={{ background: colIdx === COLUMNS.length - 1 ? col.color + '40' : 'rgba(255,255,255,0.03)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ background: col.color, width: tasks.length > 0 ? `${(colTasks.length / tasks.length) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
