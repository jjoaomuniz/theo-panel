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
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch { /* ignore */ }
  }, [collapsed]);

  return (
    <aside
      className={`h-full bg-bg-card border-r border-border flex flex-col shrink-0 transition-all duration-300 ${
        collapsed ? 'w-[68px]' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-accent-purple animate-pulse-glow shrink-0" />
          {!collapsed && (
            <h1 className="font-mono text-lg font-bold tracking-wider text-text-primary">
              THEO
            </h1>
          )}
        </div>
        {!collapsed && (
          <p className="text-xs text-text-muted mt-1 font-mono">Neural Control Panel</p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                collapsed ? 'justify-center' : ''
              } ${
                isActive
                  ? 'bg-accent-purple/10 text-accent-purple border-l-2 border-accent-purple'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-card-hover border-l-2 border-transparent'
              }`
            }
          >
            <span className="text-base shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer: Status + Collapse Toggle */}
      <div className="p-3 border-t border-border">
        {/* System Status */}
        <div className={`flex items-center gap-2 text-xs text-text-muted ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-2 h-2 rounded-full bg-success animate-status-pulse shrink-0" />
          {!collapsed && <span className="font-mono">Sistema Online</span>}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(prev => !prev)}
          className={`mt-3 w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-text-muted hover:text-text-primary hover:bg-bg-card-hover transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          aria-label={collapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
          title={collapsed ? 'Expandir' : 'Recolher'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`shrink-0 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          {!collapsed && <span className="font-mono">Recolher</span>}
        </button>
      </div>
    </aside>
  );
}
