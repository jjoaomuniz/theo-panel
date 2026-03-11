import { useState, useEffect, useCallback } from 'react';

type Stage = 'ideias' | 'script' | 'thumbnail' | 'filming' | 'edicao' | 'publicado';
type Platform = 'YouTube' | 'Instagram' | 'LinkedIn';

interface Content {
  id: string;
  title: string;
  platform: Platform;
  stage: Stage;
  createdAt: string;
}

const STAGES: { id: Stage; label: string; icon: string; color: string }[] = [
  { id: 'ideias', label: 'Ideias', icon: '\u{1F4A1}', color: '#fbbf24' },
  { id: 'script', label: 'Script', icon: '\u{1F4DD}', color: '#8b5cf6' },
  { id: 'thumbnail', label: 'Thumbnail', icon: '\u{1F3A8}', color: '#f472b6' },
  { id: 'filming', label: 'Filming', icon: '\u{1F3AC}', color: '#00d4ff' },
  { id: 'edicao', label: 'Edicao', icon: '\u{2702}\u{FE0F}', color: '#c9a84c' },
  { id: 'publicado', label: 'Publicado', icon: '\u{2705}', color: '#34d399' },
];

const STAGE_ORDER = STAGES.map(s => s.id);

const PLATFORM_COLORS: Record<Platform, string> = {
  YouTube: '#ff0000',
  Instagram: '#e1306c',
  LinkedIn: '#0077b5',
};

const STORAGE_KEY = 'theo-content-pipeline';

function loadContent(): Content[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export default function ContentPipeline() {
  const [items, setItems] = useState<Content[]>(loadContent);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', platform: 'YouTube' as Platform });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addContent = useCallback(() => {
    if (!formData.title.trim()) return;
    const content: Content = {
      id: crypto.randomUUID(),
      ...formData,
      stage: 'ideias',
      createdAt: new Date().toISOString(),
    };
    setItems(prev => [...prev, content]);
    setFormData({ title: '', platform: 'YouTube' });
    setShowForm(false);
  }, [formData]);

  const moveStage = useCallback((id: string, direction: 1 | -1) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const idx = STAGE_ORDER.indexOf(item.stage);
      const next = idx + direction;
      if (next < 0 || next >= STAGE_ORDER.length) return item;
      return { ...item, stage: STAGE_ORDER[next] };
    }));
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  return (
    <div className="h-full flex flex-col p-6 gap-4 overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-wide">Content Pipeline</h1>
          <p className="text-xs text-text-muted mt-1 font-mono">{items.length} conteudos</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all"
          style={{ background: '#c9a84c20', color: '#c9a84c', border: '1px solid #c9a84c30' }}
        >
          + Novo Conteudo
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-xl p-4 shrink-0 animate-slide-up">
          <div className="flex gap-3">
            <input
              placeholder="Titulo do conteudo..."
              value={formData.title}
              onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
              className="flex-1 bg-bg-primary border border-white/[0.06] rounded-lg px-3 py-2 text-xs font-mono text-text-primary outline-none focus:border-[#c9a84c]/40"
            />
            <select
              value={formData.platform}
              onChange={e => setFormData(p => ({ ...p, platform: e.target.value as Platform }))}
              className="bg-bg-primary border border-white/[0.06] rounded-lg px-3 py-2 text-xs font-mono text-text-primary outline-none"
            >
              <option>YouTube</option>
              <option>Instagram</option>
              <option>LinkedIn</option>
            </select>
            <button onClick={addContent} className="px-4 py-2 rounded-lg text-xs font-mono font-bold" style={{ background: '#c9a84c', color: '#06060b' }}>Criar</button>
          </div>
        </div>
      )}

      {/* Pipeline Stages */}
      <div className="flex-1 flex gap-3 overflow-x-auto min-h-0">
        {STAGES.map((stage, stageIdx) => {
          const stageItems = items.filter(i => i.stage === stage.id);
          return (
            <div key={stage.id} className="flex-1 min-w-[180px] flex flex-col rounded-xl glass-subtle">
              <div className="px-3 py-2.5 border-b border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{stage.icon}</span>
                  <span className="text-[11px] font-mono font-bold tracking-wide" style={{ color: stage.color }}>{stage.label}</span>
                </div>
                <span className="text-[10px] font-mono text-text-muted">{stageItems.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
                {stageItems.map(item => (
                  <div key={item.id} className="bg-bg-card border border-white/[0.04] rounded-lg p-3 hover:border-white/[0.08] transition-all group">
                    <p className="text-xs font-medium text-text-primary leading-tight">{item.title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span
                        className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full"
                        style={{ color: PLATFORM_COLORS[item.platform], background: PLATFORM_COLORS[item.platform] + '18' }}
                      >{item.platform}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {stageIdx > 0 && (
                          <button onClick={() => moveStage(item.id, -1)} className="text-text-muted hover:text-text-primary text-[11px] px-1">&larr;</button>
                        )}
                        {stageIdx < STAGES.length - 1 && (
                          <button onClick={() => moveStage(item.id, 1)} className="text-text-muted hover:text-text-primary text-[11px] px-1">&rarr;</button>
                        )}
                        <button onClick={() => deleteItem(item.id)} className="text-text-muted hover:text-error text-[10px] px-1">x</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
