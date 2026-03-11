import { useState, useEffect, useCallback, useMemo } from 'react';

type Tag = 'decisao' | 'tech' | 'ops' | 'financas' | 'dev';

interface MemoryEntry {
  id: string;
  content: string;
  tags: Tag[];
  createdAt: string;
}

const TAG_CONFIG: Record<Tag, { label: string; color: string }> = {
  decisao: { label: 'Decisao', color: '#c9a84c' },
  tech: { label: 'Tech', color: '#8b5cf6' },
  ops: { label: 'Ops', color: '#00d4ff' },
  financas: { label: 'Financas', color: '#34d399' },
  dev: { label: 'Dev', color: '#f472b6' },
};

const ALL_TAGS = Object.keys(TAG_CONFIG) as Tag[];

const STORAGE_KEY = 'theo-memory';

function loadEntries(): MemoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function Memory() {
  const [entries, setEntries] = useState<MemoryEntry[]>(loadEntries);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formContent, setFormContent] = useState('');
  const [formTags, setFormTags] = useState<Tag[]>([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const addEntry = useCallback(() => {
    if (!formContent.trim()) return;
    const entry: MemoryEntry = {
      id: crypto.randomUUID(),
      content: formContent.trim(),
      tags: formTags.length > 0 ? formTags : ['tech'],
      createdAt: new Date().toISOString(),
    };
    setEntries(prev => [entry, ...prev]);
    setFormContent('');
    setFormTags([]);
    setShowForm(false);
  }, [formContent, formTags]);

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const toggleFormTag = useCallback((tag: Tag) => {
    setFormTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }, []);

  // Group entries by date
  const dateGroups = useMemo(() => {
    const groups = new Map<string, MemoryEntry[]>();
    for (const entry of entries) {
      const date = entry.createdAt.split('T')[0];
      if (!groups.has(date)) groups.set(date, []);
      groups.get(date)!.push(entry);
    }
    return Array.from(groups.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [entries]);

  const filtered = useMemo(() => {
    let list = entries;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(e => e.content.toLowerCase().includes(q));
    }
    if (selectedTag) {
      list = list.filter(e => e.tags.includes(selectedTag));
    }
    if (selectedDate) {
      list = list.filter(e => e.createdAt.startsWith(selectedDate));
    }
    return list;
  }, [entries, search, selectedTag, selectedDate]);

  return (
    <div className="h-full flex overflow-hidden">
      {/* Sidebar: dates */}
      <div className="w-48 shrink-0 border-r border-white/[0.04] flex flex-col overflow-hidden">
        <div className="px-4 py-4 border-b border-white/[0.04]">
          <h2 className="text-xs font-mono font-bold text-text-secondary tracking-wide">DATAS</h2>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <button
            onClick={() => setSelectedDate(null)}
            className={`w-full text-left px-4 py-2 text-[11px] font-mono transition-colors ${
              !selectedDate ? 'text-[#c9a84c] bg-[#c9a84c]/10' : 'text-text-muted hover:text-text-primary hover:bg-white/[0.02]'
            }`}
          >Todas</button>
          {dateGroups.map(([date, items]) => (
            <button
              key={date}
              onClick={() => setSelectedDate(selectedDate === date ? null : date)}
              className={`w-full text-left px-4 py-2 text-[11px] font-mono transition-colors flex justify-between ${
                selectedDate === date ? 'text-[#c9a84c] bg-[#c9a84c]/10' : 'text-text-muted hover:text-text-primary hover:bg-white/[0.02]'
              }`}
            >
              <span>{formatDate(date + 'T00:00:00')}</span>
              <span className="text-text-muted">{items.length}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col p-6 gap-4 overflow-hidden">
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold font-mono tracking-wide">Memory</h1>
            <p className="text-xs text-text-muted mt-1 font-mono">{entries.length} entradas</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all"
            style={{ background: '#c9a84c20', color: '#c9a84c', border: '1px solid #c9a84c30' }}
          >+ Nova Entrada</button>
        </div>

        {/* Search + Tag Filters */}
        <div className="flex items-center gap-3 shrink-0">
          <input
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-bg-primary border border-white/[0.06] rounded-lg px-3 py-2 text-xs font-mono text-text-primary outline-none focus:border-[#c9a84c]/40"
          />
          <div className="flex gap-1.5">
            {ALL_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold transition-all"
                style={{
                  color: TAG_CONFIG[tag].color,
                  background: selectedTag === tag ? TAG_CONFIG[tag].color + '25' : 'transparent',
                  border: `1px solid ${selectedTag === tag ? TAG_CONFIG[tag].color + '40' : 'rgba(255,255,255,0.06)'}`,
                }}
              >{TAG_CONFIG[tag].label}</button>
            ))}
          </div>
        </div>

        {/* New Entry Form */}
        {showForm && (
          <div className="glass rounded-xl p-4 shrink-0 animate-slide-up">
            <textarea
              placeholder="Escreva uma nova entrada..."
              value={formContent}
              onChange={e => setFormContent(e.target.value)}
              rows={3}
              className="w-full bg-bg-primary border border-white/[0.06] rounded-lg px-3 py-2 text-xs font-mono text-text-primary outline-none focus:border-[#c9a84c]/40 resize-none"
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-1.5">
                {ALL_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleFormTag(tag)}
                    className="px-2 py-1 rounded-full text-[9px] font-mono font-bold transition-all"
                    style={{
                      color: TAG_CONFIG[tag].color,
                      background: formTags.includes(tag) ? TAG_CONFIG[tag].color + '25' : 'transparent',
                      border: `1px solid ${formTags.includes(tag) ? TAG_CONFIG[tag].color + '40' : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >{TAG_CONFIG[tag].label}</button>
                ))}
              </div>
              <button onClick={addEntry} className="px-4 py-1.5 rounded-lg text-xs font-mono font-bold" style={{ background: '#c9a84c', color: '#06060b' }}>Salvar</button>
            </div>
          </div>
        )}

        {/* Entry List */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
          {filtered.map(entry => (
            <div key={entry.id} className="bg-bg-card border border-white/[0.04] rounded-lg p-4 hover:border-white/[0.08] transition-all group">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs text-text-primary leading-relaxed flex-1">{entry.content}</p>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="text-text-muted hover:text-error text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                >x</button>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex gap-1.5">
                  {entry.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full"
                      style={{ color: TAG_CONFIG[tag].color, background: TAG_CONFIG[tag].color + '15' }}
                    >{TAG_CONFIG[tag].label}</span>
                  ))}
                </div>
                <span className="text-[10px] font-mono text-text-muted">
                  {formatDate(entry.createdAt)} {formatTime(entry.createdAt)}
                </span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-text-muted font-mono">Nenhuma entrada encontrada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
