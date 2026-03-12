import { useState, useEffect } from 'react';
import type { PanelAgent } from '@/data/agents';
import { useAgents } from '@/hooks/useAgents';

interface DeskProps {
  agent: PanelAgent;
  blink: boolean;
  size?: 'sm' | 'md';
}

function Desk({ agent, blink, size = 'md' }: DeskProps) {
  const isWorking = agent.status === 'working';
  const monitorW = size === 'md' ? 88 : 72;
  const monitorH = size === 'md' ? 60 : 48;

  return (
    <div className="flex flex-col items-center gap-1.5 select-none">
      {/* Monitor */}
      <div className="relative flex flex-col items-center">
        {/* Screen */}
        <div
          className="rounded-lg border-2 flex items-center justify-center relative overflow-hidden"
          style={{
            width: monitorW,
            height: monitorH,
            borderColor: agent.color + (isWorking ? '70' : '30'),
            background: '#040407',
          }}
        >
          {isWorking ? (
            <div className="absolute inset-0 flex flex-col justify-center px-2 gap-1">
              <div className="h-[3px] rounded-full" style={{ background: agent.color + (blink ? 'DD' : '44'), width: '80%' }} />
              <div className="h-[3px] rounded-full" style={{ background: agent.color + '55', width: '55%' }} />
              <div className="h-[3px] rounded-full" style={{ background: agent.color + (blink ? '88' : '33'), width: '70%' }} />
              <div className="flex items-center gap-1">
                <div className="h-[3px] rounded-full flex-1" style={{ background: agent.color + '44' }} />
                <div
                  className="w-1 rounded-sm"
                  style={{ height: 8, background: blink ? agent.color : 'transparent', transition: 'background 0.08s' }}
                />
              </div>
            </div>
          ) : (
            <div className="font-mono text-[10px]" style={{ color: '#1a1a2e' }}>---</div>
          )}

          {/* Screen inner glow */}
          {isWorking && (
            <div
              className="absolute inset-0 rounded-md pointer-events-none"
              style={{ boxShadow: `inset 0 0 14px ${agent.color}25`, opacity: blink ? 1 : 0.5, transition: 'opacity 0.4s' }}
            />
          )}

          {/* Status LED */}
          <div
            className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
            style={{
              background: isWorking ? (blink ? '#34d399' : '#1d5c3e') : '#16162a',
              transition: 'background 0.4s',
              boxShadow: isWorking && blink ? '0 0 4px #34d399' : 'none',
            }}
          />
        </div>

        {/* Monitor neck */}
        <div style={{ width: 6, height: 10, background: '#111120' }} />
        {/* Monitor base */}
        <div style={{ width: 28, height: 4, background: '#111120', borderRadius: 2 }} />
      </div>

      {/* Desk surface */}
      <div
        className="flex items-center justify-center rounded-xl relative"
        style={{ width: monitorW + 14, height: 20, background: '#10101e', border: `1px solid ${agent.color}18` }}
      >
        <div className="flex gap-0.5">
          {[5, 7, 6, 5].map((w, i) => (
            <div key={i} style={{ width: w * 2, height: 5, background: '#1a1a2e', borderRadius: 1 }} />
          ))}
        </div>
        <div style={{ width: 7, height: 9, background: '#1a1a2e', borderRadius: 4, marginLeft: 5 }} />
      </div>

      {/* Agent info */}
      <div className="flex flex-col items-center gap-0.5 mt-1">
        <span className="text-lg leading-none">{agent.avatar}</span>
        <span className="text-xs font-mono font-semibold" style={{ color: agent.color }}>
          {agent.name.split(' ')[0]}
        </span>
        <span className="text-[9px] font-mono text-text-muted opacity-60 text-center leading-tight" style={{ maxWidth: monitorW }}>
          {agent.role.split(' — ')[0]}
        </span>
        <div className="flex items-center gap-1 mt-0.5">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: isWorking ? '#34d399' : '#1a1a2e',
              boxShadow: isWorking && blink ? '0 0 5px #34d399' : 'none',
              transition: 'all 0.4s',
            }}
          />
          <span className="text-[9px] font-mono" style={{ color: isWorking ? '#34d399' : '#2a2a4e' }}>
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

  const working = agents.filter(a => a.status === 'working').length;
  const theo = agents[0];
  const subagents = agents.slice(1);

  // Divide subagentes em 2 fileiras: 4 na primeira, resto na segunda
  const row1 = subagents.slice(0, 4);
  const row2 = subagents.slice(4);

  return (
    <div className="h-full flex flex-col overflow-hidden p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <h1 className="text-xl font-semibold tracking-wide">Office</h1>
        <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent" />
        <div className="flex items-center gap-4 text-[10px] font-mono text-text-muted">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span>working</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: '#1a1a2e' }} />
            <span>idle</span>
          </div>
          <span style={{ color: '#c9a84c' }}>{working}/{agents.length} ativos</span>
          {isLive && <span className="text-success">● live</span>}
        </div>
      </div>

      {/* Office canvas */}
      <div className="flex-1 flex items-center justify-center overflow-auto min-h-0">
        <div className="w-full max-w-5xl" style={{ minHeight: 420 }}>
          {/* Room */}
          <div
            className="relative w-full rounded-3xl border border-white/[0.04] overflow-hidden flex flex-col items-center justify-center py-10 gap-8"
            style={{ background: 'linear-gradient(180deg, #08080f 0%, #06060b 70%, #040408 100%)', minHeight: 420 }}
          >
            {/* Floor grid */}
            <div
              className="absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,1) 39px, rgba(255,255,255,1) 40px),' +
                  'repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,1) 39px, rgba(255,255,255,1) 40px)',
              }}
            />

            {/* Ceiling light */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 rounded-b-full"
              style={{ background: 'rgba(201,168,76,0.15)', boxShadow: '0 0 60px 20px rgba(201,168,76,0.04)' }}
            />

            {/* Row 1: Theo */}
            <div className="relative z-10">
              <div
                className="absolute -top-6 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[9px] font-mono tracking-widest whitespace-nowrap"
                style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', color: '#c9a84c' }}
              >
                CHIEF OF STAFF
              </div>
              {theo && <Desk agent={theo} blink={blink} size="md" />}
            </div>

            {/* Divider */}
            <div className="w-2/3 h-px shrink-0" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.04), transparent)' }} />

            {/* Row 2: first 4 subagents */}
            {row1.length > 0 && (
              <div className="flex flex-wrap justify-center gap-8 sm:gap-10 relative z-10 px-4">
                {row1.map(agent => (
                  <Desk key={agent.id} agent={agent} blink={blink} size="md" />
                ))}
              </div>
            )}

            {/* Row 3: remaining subagents */}
            {row2.length > 0 && (
              <div className="flex flex-wrap justify-center gap-8 sm:gap-10 relative z-10 px-4">
                {row2.map(agent => (
                  <Desk key={agent.id} agent={agent} blink={blink} size="md" />
                ))}
              </div>
            )}

            {/* Status bar */}
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-2 rounded-full border border-white/[0.04] backdrop-blur-md"
              style={{ background: 'rgba(6,6,11,0.7)', maxWidth: 'calc(100% - 32px)', flexWrap: 'wrap', justifyContent: 'center' }}
            >
              {agents.map(agent => (
                <div key={agent.id} className="flex items-center gap-1.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: agent.status === 'working' ? '#34d399' : '#16162a',
                      boxShadow: agent.status === 'working' && blink ? '0 0 4px #34d399' : 'none',
                      transition: 'all 0.4s',
                    }}
                  />
                  <span className="text-[10px] font-mono" style={{ color: agent.color + 'CC' }}>
                    {agent.name.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
