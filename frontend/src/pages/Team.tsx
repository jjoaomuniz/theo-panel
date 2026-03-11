import { useState } from 'react';
import { AGENTS, type TheoAgent } from '@/data/agents';

export default function Team() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const theo = AGENTS[0]; // Theo is first
  const subordinates = AGENTS.slice(1); // Bruno, Leo, Marco, Carla

  return (
    <div className="h-full flex flex-col p-6 gap-6 overflow-y-auto">
      <div>
        <h1 className="text-xl font-bold font-mono tracking-wide">Team</h1>
        <p className="text-xs text-text-muted mt-1 font-mono">{AGENTS.length} agentes — {AGENTS.filter(a => a.status === 'working').length} ativos</p>
      </div>

      {/* Hierarchy Visualization */}
      <div className="flex flex-col items-center gap-2">
        {/* Theo - Leader */}
        <AgentCardFull agent={theo} expanded={expandedId === theo.id} onClick={() => setExpandedId(expandedId === theo.id ? null : theo.id)} isLeader />

        {/* Connection line from Theo down */}
        <div className="w-px h-6 bg-gradient-to-b from-[#c9a84c]/40 to-white/[0.06]" />

        {/* Horizontal connector */}
        <div className="relative w-full max-w-4xl">
          <div className="absolute left-1/4 right-1/4 top-0 h-px bg-white/[0.06]" />
          {/* Vertical lines down to each agent */}
          <div className="absolute left-1/4 top-0 w-px h-4 bg-white/[0.06]" />
          <div className="absolute left-[41.66%] top-0 w-px h-4 bg-white/[0.06]" />
          <div className="absolute left-[58.33%] top-0 w-px h-4 bg-white/[0.06]" />
          <div className="absolute left-3/4 top-0 w-px h-4 bg-white/[0.06]" />
        </div>

        {/* Subordinates Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl mt-2">
          {subordinates.map(agent => (
            <AgentCardFull
              key={agent.id}
              agent={agent}
              expanded={expandedId === agent.id}
              onClick={() => setExpandedId(expandedId === agent.id ? null : agent.id)}
            />
          ))}
        </div>
      </div>

      {/* Team Stats */}
      <div className="glass-subtle rounded-xl p-4 max-w-4xl mx-auto w-full">
        <h3 className="text-[11px] font-mono font-bold text-text-muted tracking-wide mb-3">COBERTURA DE SKILLS</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {AGENTS.map(agent => (
            <div key={agent.id} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px]">{agent.avatar}</span>
                <span className="text-[10px] font-mono font-bold" style={{ color: agent.color }}>{agent.name.split(' ')[0]}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {agent.skills.map(skill => (
                  <span
                    key={skill}
                    className="text-[8px] font-mono px-1.5 py-0.5 rounded-full"
                    style={{ color: agent.color, background: agent.color + '12', border: `1px solid ${agent.color}18` }}
                  >{skill}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AgentCardFull({ agent, expanded, onClick, isLeader }: { agent: TheoAgent; expanded: boolean; onClick: () => void; isLeader?: boolean }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border transition-all cursor-pointer ${
        isLeader ? 'max-w-md mx-auto w-full' : ''
      } ${expanded ? 'border-white/[0.08]' : 'border-white/[0.04] hover:border-white/[0.08]'}`}
      style={{
        background: expanded ? agent.color + '08' : '#0d0d16',
        boxShadow: isLeader ? `0 0 30px ${agent.color}10` : undefined,
      }}
    >
      {/* Accent top line */}
      <div className="h-[2px] rounded-t-xl" style={{ background: `linear-gradient(to right, ${agent.color}, transparent)` }} />

      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{agent.avatar}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold" style={{ color: agent.color }}>{agent.name}</p>
              {isLeader && (
                <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full" style={{ color: '#c9a84c', background: '#c9a84c18', border: '1px solid #c9a84c25' }}>LEADER</span>
              )}
            </div>
            <p className="text-[10px] font-mono text-text-muted mt-0.5">{agent.role}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: agent.status === 'working' ? '#34d399' : '#475569' }}
            />
            <span className="text-[10px] font-mono" style={{ color: agent.status === 'working' ? '#34d399' : '#475569' }}>
              {agent.status === 'working' ? 'Working' : 'Idle'}
            </span>
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-4 pt-3 border-t border-white/[0.04] animate-slide-up">
            <p className="text-[10px] font-mono font-bold text-text-muted tracking-wide mb-2">SKILLS</p>
            <div className="flex flex-wrap gap-1.5">
              {agent.skills.map(skill => (
                <span
                  key={skill}
                  className="text-[10px] font-mono px-2 py-1 rounded-lg"
                  style={{ color: agent.color, background: agent.color + '15', border: `1px solid ${agent.color}20` }}
                >{skill}</span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-bg-primary/50 rounded-lg p-2.5">
                <p className="text-[9px] font-mono text-text-muted">STATUS</p>
                <p className="text-xs font-mono font-bold mt-1" style={{ color: agent.status === 'working' ? '#34d399' : '#475569' }}>
                  {agent.status === 'working' ? 'Trabalhando' : 'Ocioso'}
                </p>
              </div>
              <div className="bg-bg-primary/50 rounded-lg p-2.5">
                <p className="text-[9px] font-mono text-text-muted">ID</p>
                <p className="text-xs font-mono font-bold mt-1" style={{ color: agent.color }}>{agent.id}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
