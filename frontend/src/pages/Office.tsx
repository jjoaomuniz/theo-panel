import { useState, useEffect, useRef } from 'react';
import { AGENTS } from '@/data/agents';

interface AgentDesk {
  id: string;
  name: string;
  avatar: string;
  color: string;
  status: 'working' | 'idle';
  x: number;
  y: number;
}

const PIXEL = 4; // scale factor
const DESK_W = 28;
const DESK_H = 16;
const MONITOR_W = 12;
const MONITOR_H = 8;

// Desk positions on the floor plan
const DESK_POSITIONS: { x: number; y: number }[] = [
  { x: 50, y: 12 },   // Theo - top center (boss desk)
  { x: 14, y: 45 },   // Bruno - left
  { x: 86, y: 45 },   // Leo - right
  { x: 14, y: 78 },   // Marco - bottom left
  { x: 86, y: 78 },   // Carla - bottom right
];

function drawPixelRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  for (let px = 0; px < w; px++) {
    for (let py = 0; py < h; py++) {
      ctx.fillRect((x + px) * PIXEL, (y + py) * PIXEL, PIXEL, PIXEL);
    }
  }
}

function drawPixelOutline(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  for (let px = 0; px < w; px++) {
    ctx.fillRect((x + px) * PIXEL, y * PIXEL, PIXEL, PIXEL);
    ctx.fillRect((x + px) * PIXEL, (y + h - 1) * PIXEL, PIXEL, PIXEL);
  }
  for (let py = 0; py < h; py++) {
    ctx.fillRect(x * PIXEL, (y + py) * PIXEL, PIXEL, PIXEL);
    ctx.fillRect((x + w - 1) * PIXEL, (y + py) * PIXEL, PIXEL, PIXEL);
  }
}

function drawChar(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  // Simple pixel character (5x7 grid)
  ctx.fillStyle = color;
  // Head
  const headX = x + 1, headY = y;
  for (let px = 0; px < 3; px++) {
    for (let py = 0; py < 3; py++) {
      ctx.fillRect((headX + px) * PIXEL, (headY + py) * PIXEL, PIXEL, PIXEL);
    }
  }
  // Body
  for (let py = 3; py < 6; py++) {
    for (let px = 0; px < 5; px++) {
      ctx.fillRect((x + px) * PIXEL, (y + py) * PIXEL, PIXEL, PIXEL);
    }
  }
}

export default function Office() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tick, setTick] = useState(0);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  const desks: AgentDesk[] = AGENTS.map((agent, i) => ({
    id: agent.id,
    name: agent.name,
    avatar: agent.avatar,
    color: agent.color,
    status: agent.status,
    x: DESK_POSITIONS[i].x,
    y: DESK_POSITIONS[i].y,
  }));

  // Blink animation
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 800);
    return () => clearInterval(interval);
  }, []);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    const cw = 160; // pixel grid width
    const ch = 110; // pixel grid height
    canvas.width = cw * PIXEL;
    canvas.height = ch * PIXEL;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#0a0a12';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Floor grid (subtle)
    ctx.fillStyle = '#0f0f1a';
    for (let gx = 0; gx < cw; gx += 8) {
      for (let gy = 0; gy < ch; gy += 8) {
        ctx.fillRect(gx * PIXEL, gy * PIXEL, PIXEL, PIXEL);
      }
    }

    // Room walls
    drawPixelOutline(ctx, 2, 2, cw - 4, ch - 4, '#1a1a2e');

    // Draw each desk
    desks.forEach(desk => {
      const dx = desk.x - Math.floor(DESK_W / 2);
      const dy = desk.y - Math.floor(DESK_H / 2);

      // Desk surface
      drawPixelRect(ctx, dx, dy + 6, DESK_W, DESK_H - 6, '#1a1a2e');
      drawPixelOutline(ctx, dx, dy + 6, DESK_W, DESK_H - 6, '#2a2a4e');

      // Monitor
      const mx = desk.x - Math.floor(MONITOR_W / 2);
      const my = dy + 1;
      const monitorOn = desk.status === 'working' && tick % 2 === 0;
      const screenColor = monitorOn ? desk.color + '80' : '#0d0d16';
      drawPixelRect(ctx, mx, my, MONITOR_W, MONITOR_H, screenColor);
      drawPixelOutline(ctx, mx, my, MONITOR_W, MONITOR_H, desk.color + '60');

      // Monitor stand
      drawPixelRect(ctx, desk.x - 1, my + MONITOR_H, 2, 2, '#2a2a4e');

      // Character sitting at desk
      const charX = desk.x - 2;
      const charY = dy + DESK_H;
      drawChar(ctx, charX, charY, desk.color);

      // Status dot
      const dotColor = desk.status === 'working' ? '#34d399' : '#475569';
      ctx.fillStyle = dotColor;
      ctx.fillRect((desk.x + Math.floor(MONITOR_W / 2) + 2) * PIXEL, my * PIXEL, PIXEL * 2, PIXEL * 2);

      // Name label below character
      ctx.fillStyle = desk.color;
      ctx.font = `${PIXEL * 2.5}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(desk.name.split(' ')[0], desk.x * PIXEL, (charY + 9) * PIXEL);
    });

    // Title
    ctx.fillStyle = '#c9a84c';
    ctx.font = `bold ${PIXEL * 3}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('THEO OFFICE', (cw / 2) * PIXEL, (ch - 4) * PIXEL);

  }, [tick, desks]);

  const handleCanvasHover = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX / PIXEL;
    const my = (e.clientY - rect.top) * scaleY / PIXEL;

    let found: string | null = null;
    for (const desk of desks) {
      const dx = desk.x - DESK_W / 2;
      const dy = desk.y - DESK_H / 2;
      if (mx >= dx - 2 && mx <= dx + DESK_W + 2 && my >= dy - 2 && my <= dy + DESK_H + 10) {
        found = desk.id;
        break;
      }
    }
    setHoveredAgent(found);
  };

  const hoveredData = hoveredAgent ? AGENTS.find(a => a.id === hoveredAgent) : null;

  return (
    <div className="h-full flex flex-col p-6 gap-4 overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-wide">Office</h1>
          <p className="text-xs text-text-muted mt-1 font-mono">Pixel art workspace — {AGENTS.filter(a => a.status === 'working').length} trabalhando</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-success animate-status-pulse" />
            <span className="text-[10px] font-mono text-text-muted">Working</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-text-muted" />
            <span className="text-[10px] font-mono text-text-muted">Idle</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center relative min-h-0">
        <div className="glass-subtle rounded-xl p-4 inline-block">
          <canvas
            ref={canvasRef}
            className="block max-w-full max-h-full"
            style={{ imageRendering: 'pixelated', width: 160 * PIXEL, height: 110 * PIXEL }}
            onMouseMove={handleCanvasHover}
            onMouseLeave={() => setHoveredAgent(null)}
          />
        </div>

        {/* Hover tooltip */}
        {hoveredData && (
          <div className="absolute top-4 right-4 glass rounded-xl p-4 min-w-[200px] animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{hoveredData.avatar}</span>
              <div>
                <p className="text-sm font-bold" style={{ color: hoveredData.color }}>{hoveredData.name}</p>
                <p className="text-[10px] font-mono text-text-muted">{hoveredData.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-2 h-2 rounded-full" style={{ background: hoveredData.status === 'working' ? '#34d399' : '#475569' }} />
              <span className="text-[10px] font-mono" style={{ color: hoveredData.status === 'working' ? '#34d399' : '#475569' }}>
                {hoveredData.status === 'working' ? 'Trabalhando' : 'Ocioso'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {hoveredData.skills.slice(0, 3).map(s => (
                <span key={s} className="text-[9px] font-mono px-1.5 py-0.5 rounded-full" style={{ color: hoveredData.color, background: hoveredData.color + '15', border: `1px solid ${hoveredData.color}20` }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom status bar */}
      <div className="shrink-0 flex items-center gap-4 justify-center">
        {desks.map(desk => (
          <div key={desk.id} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: desk.status === 'working' ? desk.color : '#2a2a4e' }} />
            <span className="text-[10px] font-mono" style={{ color: desk.status === 'working' ? desk.color : '#475569' }}>
              {desk.name.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
