import { NavLink, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { clearSession, getUsername } from '@/lib/auth';

const navItems = [
  { to: '/',          label: 'Neural Map',  icon: '🧠', group: 'core' },
  { to: '/coverage',  label: 'Cobertura',   icon: '🎯', group: 'core' },
  { to: '/cronjobs',  label: 'Cron Jobs',   icon: '⏰', group: 'core' },
  { to: '/tasks',     label: 'Tasks',       icon: '✅', group: 'new'  },
  { to: '/memory',    label: 'Memory',      icon: '📓', group: 'new'  },
  { to: '/calendar',  label: 'Calendar',    icon: '📅', group: 'new'  },
  { to: '/office',    label: 'Office',      icon: '🏢', group: 'new'  },
  { to: '/team',      label: 'Team',        icon: '👥', group: 'new'  },
  // MCP Integrations
  { to: '/github',    label: 'GitHub',      icon: '🐙', group: 'mcp'  },
  { to: '/vercel',    label: 'Vercel',      icon: '▲',  group: 'mcp'  },
  { to: '/supabase',  label: 'Supabase',    icon: '🟢', group: 'mcp'  },
];

const GROUP_LABELS: Record<string, string> = {
  core: 'Core',
  new: 'Workspace',
  mcp: 'Integrações',
};

const STORAGE_KEY = 'theo-sidebar-collapsed';

export default function Sidebar() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) return stored === 'true';
      return typeof window !== 'undefined' && window.innerWidth < 768;
    } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, String(collapsed)); }
    catch { /* ignore */ }
  }, [collapsed]);

  const handleLogout = async () => {
    await api.logout().catch(() => {});
    clearSession();
    navigate('/login');
  };

  const username = getUsername();

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
      <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5 overflow-y-auto">
        {(() => {
          const groups = ['core', 'new', 'mcp'] as const;
          return groups.map((group) => {
            const items = navItems.filter((i) => i.group === group);
            return (
              <div key={group}>
                {!collapsed && (
                  <p className="text-[9px] text-text-muted/50 uppercase tracking-widest font-mono px-3 pt-3 pb-1 first:pt-0">
                    {GROUP_LABELS[group]}
                  </p>
                )}
                {collapsed && group !== 'core' && (
                  <div className="my-1.5 mx-3 h-px bg-white/[0.03]" />
                )}
                {items.map((item) => (
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
              </div>
            );
          });
        })()}
      </nav>

      {/* Footer: user + logout */}
      <div className={`px-3 py-3 border-t border-white/[0.03] flex items-center gap-2 text-[10px] text-text-muted ${collapsed ? 'flex-col' : ''}`}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-status-pulse shrink-0" />
          {!collapsed && (
            <span className="font-mono tracking-wide truncate">{username ?? 'Online'}</span>
          )}
        </div>
        <button
          onClick={handleLogout}
          title="Sair"
          className="shrink-0 p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-all"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
