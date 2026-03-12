import { useState, useEffect } from 'react';
import type { PanelAgent } from '@/data/agents';
import { useAgents } from '@/hooks/useAgents';

interface WorkstationProps {
  agent: PanelAgent;
  blink: boolean;
  isLead?: boolean;
}

// ── Terminal-window workstation card ──────────────────────────────────────────
function Workstation({ agent, blink, isLead = false }: WorkstationProps) {
  const isWorking = agent.status === 'working';
  const cardW = isLead ? 224 : 156;

  return (
    <div className="flex flex-col items-center select-none" style={{ width: cardW }}>
      {/* Terminal card */}
      <div
        className="rounded-xl border overflow-hidden w-full transition-all duration-300"
        style={{
          borderColor: isWorking ? agent.color + '28' : 'rgba(255,255,255,0.04)',
          background: '#09090f',
          boxShadow: isWorking ? `0 0 28px ${agent.color}08` : 'none',
        }}
      >
        {/* Titlebar */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5"
          style={{
            background: agent.color + '07',
            borderBottom: `1px solid ${agent.color}12`,
          }}
        >
          <div className="w-[7px] h-[7px] rounded-full" style={{ background: isWorking ? '#f87171' : '#1a1a2c' }} />
          <div className="w-[7px] h-[7px] rounded-full" style={{ background: isWorking ? '#fbbf24' : '#1a1a2c' }} />
          <div className="w-[7px] h-[7px] rounded-full" style={{ background: isWorking ? agent.color : '#1a1a2c' }} />
          <span className="ml-1.5 text-[8px] font-mono truncate flex-1" style={{ color: agent.color + '70' }}>
            {agent.name.split(' ')[0].toLowerCase()}@theo
          </span>
        </div>

        {/* Terminal body */}
        <div
          className="relative overflow-hidden px-2.5 py-2"
          style={{ height: isLead ? 72 : 52, background: '#030307' }}
        >
          {isWorking ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <span className="text-[8px] font-mono shrink-0" style={{ color: agent.color + '55' }}>›</span>
                <div
                  className="h-[2px] rounded flex-1"
                  style={{ background: agent.color + (blink ? '50' : '18') }}
                />
                <div
                  className="w-[3px] rounded-sm ml-0.5 shrink-0"
                  style={{
                    height: 10,
                    background: blink ? agent.color : 'transparent',
                    transition: 'background 0.1s',
                  }}
                />
              </div>
              <div className="h-[2px] rounded" style={{ width: '72%',  background: agent.color + '16' }} />
              <div className="h-[2px] rounded" style={{ width: '48%',  background: agent.color + '10' }} />
              {isLead && (
                <>
                  <div className="h-[2px] rounded" style={{ width: '88%', background: agent.color + '18' }} />
                  <div className="h-[2px] rounded" style={{ width: '58%', background: agent.color + '0C' }} />
                </>
              )}
            </div>
          ) : (
            <div className="h-full flex items-end">
              <span className="text-[8px] font-mono" style={{ color: 'rgba(255,255,255,0.04)' }}>_ standby</span>
            </div>
          )}

          {/* Screen glow */}
          {isWorking && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: `inset 0 0 16px ${agent.color}0C`,
                opacity: blink ? 1 : 0.4,
                transition: 'opacity 0.5s',
              }}
            />
          )}
        </div>
      </div>

      {/* Agent info below terminal */}
      <div className="flex flex-col items-center gap-0.5 mt-2.5">
        <span className={isLead ? 'text-xl' : 'text-base leading-none'}>{agent.avatar}</span>
        <span
          className="text-[10px] font-mono font-semibold mt-0.5"
          style={{ color: agent.color }}
        >
          {agent.name.split(' ')[0]}
        </span>
        <p
          className="text-[8px] font-mono text-text-muted/50 text-center leading-tight"
          style={{ maxWidth: cardW - 12 }}
        >
          {agent.role.split(' — ')[0]}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <div
            className="w-1 h-1 rounded-full"
            style={{
              background: isWorking ? '#34d399' : '#1a1a2e',
              boxShadow: isWorking && blink ? '0 0 4px #34d399' : 'none',
              transition: 'all 0.4s',
            }}
          />
          <span className="text-[8px] font-mono" style={{ color: isWorking ? '#34d399' : '#252540' }}>
            {isWorking ? 'working' : 'idle'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Office() {
  const [blink, setBlink] = useState(true);
  const { agents, isLive } = useAgents();

  useEffect(() => {
    const interval = setInterval(() => setBlink(v => !v), 800);
    return () => clearInterval(interval);
  }, []);

  const working   = agents.filter(a => a.status === 'working').length;
  const theo      = agents[0];
  const subagents = agents.slice(1);

  return (
    <div className="h-full flex flex-col overflow-hidden p-4 sm:p-5">

      {/* Header */}
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <h1 className="text-[11px] font-mono font-bold tracking-[0.2em] text-gradient">OFFICE</h1>
        <div className="h-px flex-1 bg-gradient-to-r from-white/[0.05] to-transparent" />
        <div className="flex items-center gap-4 text-[10px] font-mono text-text-muted">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-success" />
            <span>working</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-border" />
            <span>idle</span>
          </div>
          <span style={{ color: '#c9a84c' }}>{working}/{agents.length} ativos</span>
          {isLive && <span className="text-success/60">● live</span>}
        </div>
      </div>

      {/* Floor */}
      <div className="flex-1 overflow-auto min-h-0">
        <div
          className="relative w-full rounded-2xl border border-white/[0.04] overflow-hidden flex flex-col items-center py-12 gap-10"
          style={{
            background: 'linear-gradient(160deg, #080810 0%, #050509 60%, #030306 100%)',
            minHeight: 440,
          }}
        >
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.016]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, transparent, transparent 47px, #fff 47px, #fff 48px),' +
                'repeating-linear-gradient(90deg, transparent, transparent 47px, #fff 47px, #fff 48px)',
            }}
          />

          {/* Ceiling light */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-px"
            style={{
              background: 'rgba(201,168,76,0.10)',
              boxShadow: '0 0 80px 28px rgba(201,168,76,0.025)',
            }}
          />

          {/* Theo — centered, labeled */}
          <div className="relative z-10">
            <div
              className="absolute -top-7 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full whitespace-nowrap text-[8px] font-mono tracking-[0.2em] uppercase"
              style={{
                background: 'rgba(201,168,76,0.06)',
                border: '1px solid rgba(201,168,76,0.16)',
                color: '#c9a84c',
              }}
            >
              CHIEF OF STAFF
            </div>
            {theo && <Workstation agent={theo} blink={blink} isLead />}
          </div>

          {/* Divider */}
          <div
            className="w-2/3 h-px shrink-0"
            style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.03), transparent)' }}
          />

          {/* Subagents — wrapping row, centered */}
          <div className="flex flex-wrap justify-center gap-8 sm:gap-10 px-8 relative z-10">
            {subagents.map(agent => (
              <Workstation key={agent.id} agent={agent} blink={blink} />
            ))}
          </div>

          {/* Bottom status strip */}
          <div
            className="absolute bottom-0 left-0 right-0 flex items-center justify-center flex-wrap gap-4 px-5 py-2 border-t border-white/[0.03]"
            style={{ background: 'rgba(3,3,7,0.75)', backdropFilter: 'blur(8px)' }}
          >
            {agents.map(agent => (
              <div key={agent.id} className="flex items-center gap-1.5">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: agent.status === 'working' ? '#34d399' : '#14142a',
                    boxShadow: agent.status === 'working' && blink ? '0 0 4px #34d399' : 'none',
                    transition: 'all 0.4s',
                  }}
                />
                <span className="text-[9px] font-mono" style={{ color: agent.color + 'CC' }}>
                  {agent.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
