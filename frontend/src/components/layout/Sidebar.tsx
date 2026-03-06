import { NavLink } from 'react-router';

const navItems = [
  { to: '/', label: 'Neural Map', icon: '\u{1F9E0}' },
  { to: '/dashboard', label: 'Dashboard', icon: '\u{1F4CA}' },
  { to: '/agents', label: 'Agentes', icon: '\u{1F916}' },
  { to: '/coverage', label: 'Cobertura', icon: '\u{1F3AF}' },
  { to: '/costs', label: 'Custos', icon: '\u{1F4B0}' },
  { to: '/cronjobs', label: 'Cron Jobs', icon: '\u{23F0}' },
  { to: '/llms', label: 'LLMs', icon: '\u{26A1}' },
];

export default function Sidebar() {
  return (
    <aside className="w-60 h-full bg-bg-card border-r border-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-accent-purple animate-pulse-glow" />
          <h1 className="font-mono text-lg font-bold tracking-wider text-text-primary">
            THEO
          </h1>
        </div>
        <p className="text-xs text-text-muted mt-1 font-mono">Neural Control Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-accent-purple/10 text-accent-purple border-l-2 border-accent-purple'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-card-hover border-l-2 border-transparent'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* System Status */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <div className="w-2 h-2 rounded-full bg-success animate-status-pulse" />
          <span className="font-mono">Sistema Online</span>
        </div>
        <div className="text-xs text-text-muted mt-1 font-mono">
          VPS Hostinger - SP
        </div>
      </div>
    </aside>
  );
}
