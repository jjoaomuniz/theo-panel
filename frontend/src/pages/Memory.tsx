import { useState, useEffect, useMemo } from 'react';

type MemoryTag = 'Decisão' | 'Tech' | 'Ops' | 'Finanças' | 'Dev';

interface MemoryEntry {
  id: string;
  content: string;
  tags: MemoryTag[];
  timestamp: string;
  date: string;
}

const ALL_TAGS: MemoryTag[] = ['Decisão', 'Tech', 'Ops', 'Finanças', 'Dev'];

const TAG_COLORS: Record<MemoryTag, string> = {
  'Decisão':  '#c9a84c',
  'Tech':     '#00d4ff',
  'Ops':      '#8b5cf6',
  'Finanças': '#34d399',
  'Dev':      '#f472b6',
};

const STORAGE_KEY = 'theo-memory';

function todayStr() { return new Date().toISOString().split('T')[0]; }
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

const defaultEntries: MemoryEntry[] = [
  {
    id: '1',
    content: 'Decidido migrar o painel para React + TypeScript. Stack: Vite, Tailwind v4, React Router v7. Deploy no Vercel.',
    tags: ['Decisão', 'Tech', 'Dev'],
    timestamp: new Date(daysAgo(2) + 'T10:30:00').toISOString(),
    date: daysAgo(2),
  },
  {
    id: '2',
    content: 'MCP configurado no OpenClaw via mcporter: discord (22 tools), notion (22 tools), filesystem (14 tools). Binário instalado globalmente.',
    tags: ['Tech', 'Ops'],
    timestamp: new Date(daysAgo(1) + 'T14:20:00').toISOString(),
    date: daysAgo(1),
  },
  {
    id: '3',
    content: 'Bruno agora sabe configurar novos MCPs quando solicitado. Skill add-mcp criada no workspace-bruno com guia completo.',
    tags: ['Ops', 'Dev'],
    timestamp: new Date(daysAgo(1) + 'T16:45:00').toISOString(),
    date: daysAgo(1),
  },
  {
    id: '4',
    content: 'Theo agora tem voz (ElevenLabs — Brian voice) e escuta áudios (faster-whisper base model). TTS modo inbound: responde em áudio quando recebe áudio.',
    tags: ['Tech'],
    timestamp: new Date(todayStr() + 'T09:15:00').toISOString(),
    date: todayStr(),
  },
];

function formatDateLabel(dateStr: string): string {
  const today = todayStr();
  const yesterday = daysAgo(1);
  if (dateStr === today) return 'Hoje';
  if (dateStr === yesterday) return 'Ontem';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
}

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function Memory() {
  const [entries, setEntries] = useState<MemoryEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as MemoryEntry[]) : defaultEntries;
    } catch { return defaultEntries; }
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterTags, setFilterTags] = useState<MemoryTag[]>([]);
  const [content, setContent] = useState('');
  const [newTags, setNewTags] = useState<MemoryTag[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); }
    catch { /* ignore */ }
  }, [entries]);

  const dateGroups = useMemo(() => {
    const map = new Map<string, number>();
    entries.forEach(e => map.set(e.date, (map.get(e.date) ?? 0) + 1));
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [entries]);

  const filtered = useMemo(() => {
    return entries
      .filter(e => {
        if (selectedDate && e.date !== selectedDate) return false;
        if (search && !e.content.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterTags.length > 0 && !filterTags.every(t => e.tags.includes(t))) return false;
        return true;
      })
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [entries, selectedDate, search, filterTags]);

  const addEntry = () => {
    if (!content.trim()) return;
    const now = new Date();
    const entry: MemoryEntry = {
      id: Date.now().toString(),
      content: content.trim(),
      tags: newTags,
      timestamp: now.toISOString(),
      date: now.toISOString().split('T')[0],
    };
    setEntries(prev => [...prev, entry]);
    setContent('');
    setNewTags([]);
    setShowForm(false);
  };

  const deleteEntry = (id: string) => setEntries(prev => prev.filter(e => e.id !== id));

  const toggleFilterTag = (tag: MemoryTag) =>
    setFilterTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const toggleNewTag = (tag: MemoryTag) =>
    setNewTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  return (
    <div className="h-full flex overflow-hidden">
      {/* Date sidebar */}
      <aside className="w-44 shrink-0 border-r border-white/[0.03] flex flex-col bg-bg-card/50">
        <div className="px-3 py-3 border-b border-white/[0.03]">
          <p className="text-[9px] font-mono text-text-muted uppercase tracking-widest">Entradas por Data</p>
        </div>
        <div className="flex-1 overflow-y-auto py-2 px-2">
          <button
            onClick={() => setSelectedDate(null)}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all mb-1 flex items-center justify-between ${
              !selectedDate ? 'text-accent-purple bg-accent-purple/10' : 'text-text-muted hover:text-text-secondary hover:bg-white/[0.02]'
            }`}
          >
            <span>Todas</span>
            <span className="text-[9px] font-mono opacity-60">{entries.length}</span>
          </button>
          {dateGroups.map(([date, count]) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date === selectedDate ? null : date)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between mb-0.5 ${
                date === selectedDate ? 'text-accent-purple bg-accent-purple/10' : 'text-text-muted hover:text-text-secondary hover:bg-white/[0.02]'
              }`}
            >
              <span className="text-[10px] font-mono">{formatDateLabel(date)}</span>
              <span className="text-[9px] font-mono bg-bg-elevated px-1 rounded opacity-60">{count}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-3 border-b border-white/[0.03] flex items-center gap-3 shrink-0 flex-wrap">
          <h1 className="text-lg font-semibold tracking-wide shrink-0">Memory</h1>
          <input
            className="flex-1 min-w-32 px-3 py-1.5 rounded-xl bg-bg-elevated border border-border text-xs text-text-primary placeholder:text-text-muted font-mono focus:outline-none focus:border-border-hover"
            placeholder="Buscar entradas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="flex gap-1.5 shrink-0 flex-wrap">
            {ALL_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleFilterTag(tag)}
                className="px-2 py-1 rounded-lg text-[9px] font-mono transition-all"
                style={{
                  background: filterTags.includes(tag) ? TAG_COLORS[tag] + '20' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${filterTags.includes(tag) ? TAG_COLORS[tag] + '50' : 'rgba(255,255,255,0.05)'}`,
                  color: filterTags.includes(tag) ? TAG_COLORS[tag] : '#475569',
                }}
              >{tag}</button>
            ))}
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="px-3 py-1.5 rounded-lg text-xs font-mono shrink-0 transition-all"
            style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c' }}
          >
            + Entrada
          </button>
        </div>

        {/* New entry form */}
        {showForm && (
          <div className="mx-5 mt-3 p-4 rounded-2xl border border-white/[0.05] bg-bg-card shrink-0 animate-slide-in">
            <textarea
              className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border text-sm text-text-primary placeholder:text-text-muted font-mono focus:outline-none focus:border-border-hover resize-none mb-3"
              rows={3}
              placeholder="O que aconteceu? Decisão tomada, aprendizado, observação..."
              value={content}
              onChange={e => setContent(e.target.value)}
              autoFocus
            />
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex gap-1.5 flex-wrap">
                {ALL_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleNewTag(tag)}
                    className="px-2 py-1 rounded-lg text-[9px] font-mono transition-all"
                    style={{
                      background: newTags.includes(tag) ? TAG_COLORS[tag] + '20' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${newTags.includes(tag) ? TAG_COLORS[tag] + '50' : 'rgba(255,255,255,0.05)'}`,
                      color: newTags.includes(tag) ? TAG_COLORS[tag] : '#475569',
                    }}
                  >{tag}</button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-text-muted">
                  {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <button onClick={addEntry} className="px-4 py-1.5 rounded-lg text-xs font-mono bg-accent-purple/20 text-accent-purple border border-accent-purple/30 hover:bg-accent-purple/30 transition-colors">
                  Salvar
                </button>
                <button
                  onClick={() => { setShowForm(false); setContent(''); setNewTags([]); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono text-text-muted border border-border hover:border-border-hover transition-colors"
                >Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {/* Entries */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
          {filtered.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-text-muted text-xs font-mono opacity-50 py-20">
              Nenhuma entrada encontrada
            </div>
          )}
          {filtered.map(entry => (
            <div key={entry.id} className="bg-bg-card rounded-2xl border border-white/[0.04] p-4 card-hover group animate-fade-in">
              <div className="flex items-start gap-3 mb-3">
                <p className="text-sm text-text-primary leading-relaxed flex-1">{entry.content}</p>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-error text-[10px] shrink-0 mt-0.5"
                >✕</button>
              </div>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex gap-1.5 flex-wrap">
                  {entry.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-[9px] font-mono"
                      style={{ background: TAG_COLORS[tag] + '20', color: TAG_COLORS[tag] }}
                    >{tag}</span>
                  ))}
                  {entry.tags.length === 0 && (
                    <span className="text-[9px] font-mono text-text-muted opacity-40">sem tags</span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-text-muted shrink-0">
                  {formatDateLabel(entry.date)} · {formatTime(entry.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
