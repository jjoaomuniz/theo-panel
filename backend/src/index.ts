import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { config } from './config.js';
import { setupWebSocket } from './ws/server.js';
import { healthRouter } from './routes/health.js';
import { neuralRouter } from './routes/neural.js';
import { agentsRouter } from './routes/agents.js';
import { activitiesRouter } from './routes/activities.js';
import { costsRouter } from './routes/costs.js';
import { cronjobsRouter } from './routes/cronjobs.js';
import { llmsRouter } from './routes/llms.js';

const app = express();
const server = createServer(app);

// ─── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Request logging ────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─── Routes ─────────────────────────────────────────────────
app.use('/api', healthRouter);
app.use('/api', neuralRouter);
app.use('/api', agentsRouter);
app.use('/api', activitiesRouter);
app.use('/api', costsRouter);
app.use('/api', cronjobsRouter);
app.use('/api', llmsRouter);

// ─── WebSocket ──────────────────────────────────────────────
setupWebSocket(server);

// ─── Start ──────────────────────────────────────────────────
const startTime = Date.now();
export const getUptime = () => Math.floor((Date.now() - startTime) / 1000);

server.listen(config.port, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║     THEO PANEL — Backend API v1.0.0       ║
╠═══════════════════════════════════════════╣
║  Port:        ${String(config.port).padEnd(28)}║
║  Environment: ${config.nodeEnv.padEnd(28)}║
║  OpenRouter:  ${(config.openrouterApiKey ? '✓ configured' : '✗ missing').padEnd(28)}║
║  OpenClaw:    ${config.openclawDir.slice(0, 28).padEnd(28)}║
╚═══════════════════════════════════════════╝
  `);
});
