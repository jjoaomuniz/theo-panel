import { useState, useEffect, useCallback } from 'react';
import { AGENTS } from '@/data/agents';

type Priority = 'alta' | 'media' | 'baixa';
type Column = 'recorrente' | 'backlog' | 'progresso' | 'revisao' | 'concluido';

interface Task {
  id: string;
  title: string;
  agent: string;
  priority: Priority;
  description: string;
  column: Column;
  createdAt: string;
}

const COLUMNS: { id: Column; label: string; color: string }[] = [
  { id: 'recorrente', label: 'Recorrente', color: '#8b5cf6' },
  { id: 'backlog', label: 'Backlog', color: '#475569' },
  { id: 'progresso', label: 'Em Progresso', color: '#00d4ff' },
  { id: 'revisao', label: 'Revisao', color: '#c9a84c' },
  { id: 'concluido', label: 'Concluido', color: '#34d399' },
];

const PRIORITY_COLORS: Record<Priority, string> = {
  alta: '#f87171',
  media: '#fbbf24',
  baixa: '#34d399',
};

const STORAGE_KEY = 'theo-tasks';

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export default function TasksBoard() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', agent: 'theo', priority: 'media' as Priority, description: '' });
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = useCallback(() => {
    if (!formData.title.trim()) return;
    const task: Task = {
      id: crypto.randomUUID(),
      ...formData,
      column: 'backlog',
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [...prev, task]);
    setFormData({ title: '', agent: 'theo', priority: 'media', description: '' });
    setShowForm(false);
  }, [formData]);

  const moveTask = useCallback((taskId: string, column: Column) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, column } : t));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }, []);

  const handleDrop = useCallback((column: Column) => {
    if (dragId) {
      moveTask(dragId, column);
      setDragId(null);
    }
  }, [dragId, moveTask]);

  return (
    <div className="h-full flex flex-col p-6 gap-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-wide">Tasks Board</h1>
          <p className="text-xs text-text-muted mt-1 font-mono">{tasks.length} tasks total</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all"
          style={{ background: '#c9a84c20', color: '#c9a84c', border: '1px solid #c9a84c30' }}
        >
          + Nova Task
        </button>
      </div>

      {/* New Task Form */}
      {showForm && (
        <div className="glass rounded-xl p-4 shrink-0 animate-slide-up">
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Titulo da task..."
              value={formData.title}
              onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
              className="col-span-2 bg-bg-primary border border-white/[0.06] rounded-lg px-3 py-2 text-xs font-mono text-text-primary outline-none focus:border-[#c9a84c]/40"
            />
            <select
              value={formData.agent}
              onChange={e => setFormData(p => ({ ...p, agent: e.target.value }))}
              className="bg-bg-primary border border-white/[0.06] rounded-lg px-3 py-2 text-xs font-mono text-text-primary outline-none"
            >
              {AGENTS.map(a => <option key={a.id} value={a.id}>{a.avatar} {a.name}</option>)}
            </select>
            <select
              value={formData.priority}
              onChange={e => setFormData(p => ({ ...p, priority: e.target.value as Priority }))}
              className="bg-bg-primary border border-white/[0.06] rounded-lg px-3 py-2 text-xs font-mono text-text-primary outline-none"
            >
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baixa">Baixa</option>
            </select>
            <input
              placeholder="Descricao (opcional)..."
              value={formData.description}
              onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              className="col-span-2 bg-bg-primary border border-white/[0.06] rounded-lg px-3 py-2 text-xs font-mono text-text-primary outline-none focus:border-[#c9a84c]/40"
            />
          </div>
          <div className="flex gap-2 mt-3 justify-end">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 rounded-lg text-xs font-mono text-text-muted hover:text-text-primary transition-colors">Cancelar</button>
            <button onClick={addTask} className="px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all" style={{ background: '#c9a84c', color: '#06060b' }}>Criar</button>
          </div>
        </div>
      )}

      {/* Kanban Columns */}
      <div className="flex-1 flex gap-3 overflow-x-auto min-h-0">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.column === col.id);
          return (
            <div
              key={col.id}
              className="flex-1 min-w-[200px] flex flex-col rounded-xl glass-subtle"
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(col.id)}
            >
              {/* Column Header */}
              <div className="px-3 py-2.5 border-b border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                  <span className="text-[11px] font-mono font-bold tracking-wide text-text-secondary">{col.label}</span>
                </div>
                <span className="text-[10px] font-mono text-text-muted">{colTasks.length}</span>
              </div>

              {/* Task Cards */}
              <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
                {colTasks.map(task => {
                  const agent = AGENTS.find(a => a.id === task.agent);
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => setDragId(task.id)}
                      className="bg-bg-card border border-white/[0.04] rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-white/[0.08] transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-medium text-text-primary leading-tight">{task.title}</p>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-text-muted hover:text-error text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        >x</button>
                      </div>
                      {task.description && (
                        <p className="text-[10px] text-text-muted mt-1.5 line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px]">{agent?.avatar}</span>
                          <span className="text-[10px] font-mono text-text-muted">{agent?.name.split(' ')[0]}</span>
                        </div>
                        <span
                          className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full"
                          style={{ color: PRIORITY_COLORS[task.priority], background: PRIORITY_COLORS[task.priority] + '15' }}
                        >{task.priority}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
