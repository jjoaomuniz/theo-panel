import { NavLink } from 'react-router';
import { useState, useEffect } from 'react';

const navItems = [
  { to: '/', label: 'Neural Map', icon: '\u{1F9E0}' },
  { to: '/dashboard', label: 'Dashboard', icon: '\u{1F4CA}' },
  { to: '/agents', label: 'Agentes', icon: '\u{1F916}' },
  { to: '/coverage', label: 'Cobertura', icon: '\u{1F3AF}' },
  { to: '/costs', label: 'Custos', icon: '\u{1F4B0}' },
  { to: '/cronjobs', label: 'Cron Jobs', icon: '\u{23F0}' },
  { to: '/llms', label: 'LLMs', icon: '\u{26A1}' },
];

const STORAGE_KEY = 'theo-sidebar-collapsed';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === 'true'; }
    catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, String(collapsed)); }
    catch { /* ignore */ }
  }, [collapsed]);

  return (
    <aside
      className={`h-full bg-bg-card/80 backdrop-blur-md border-r border-white/[0.03] flex flex-col shrink-0 transition-all duration-300 relative ${
        collapsed ? 'w-[62px]' : 'w-56'
      }`}
    >
      {/* Subtle gradient accent on left edge */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-accent-purple/20 via-accent-cyan/10 to-transparent" />

      {/* Header: hamburger + logo */}
      <div className="px-3 py-3 border-b border-white/[0.03] flex items-center gap-2.5">
        <button
          onClick={() => setCollapsed(prev => !prev)}
          className="shrink-0 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.04] transition-all"
          aria-label={collapsed ? 'Expandir' : 'Recolher'}
          title={collapsed ? 'Expandir' : 'Recolher'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="relative shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-accent-purple" />
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-accent-purple animate-pulse-ring" />
            </div>
            <div>
              <h1 className="font-mono text-sm font-bold tracking-[0.2em] text-gradient">THEO</h1>
              <p className="text-[9px] text-text-muted font-mono tracking-wider mt-0.5">NEURAL CONTROL</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all duration-200 group relative ${
                collapsed ? 'justify-center' : ''
              } ${
                isActive
                  ? 'bg-accent-purple/10 text-accent-purple'
                  : 'text-text-muted hover:text-text-primary hover:bg-white/[0.02]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-r-full bg-accent-purple" />
                )}
                <span className={`text-sm shrink-0 transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="font-medium tracking-wide">{item.label}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className={`px-3 py-3 border-t border-white/[0.03] flex items-center gap-2 text-[10px] text-text-muted ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-1.5 h-1.5 rounded-full bg-success animate-status-pulse shrink-0" />
        {!collapsed && <span className="font-mono tracking-wide">Online</span>}
      </div>
    </aside>
  );
}
