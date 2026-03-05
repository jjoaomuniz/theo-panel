import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import chokidar from 'chokidar';
import path from 'path';
import { config } from '../config.js';
import { cache } from '../services/cache.js';
import { getAgents, getActivities } from '../services/openclaw.js';
import { parseMemoryFile } from '../services/neural.js';
import type { WSMessage } from '../types/index.js';

let wss: WebSocketServer;

export function setupWebSocket(server: Server) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log(`[WS] Client connected (total: ${wss.clients.size})`);

    ws.on('close', () => {
      console.log(`[WS] Client disconnected (total: ${wss.clients.size})`);
    });

    ws.on('error', (err) => {
      console.error('[WS] Client error:', err.message);
    });

    // Send initial ping
    ws.send(JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() }));
  });

  // Set up file watchers
  setupFileWatchers();

  // Periodic cost refresh (every 5 minutes)
  setInterval(async () => {
    try {
      cache.invalidatePrefix('openrouter:');
      // Costs will be refreshed on next API call
      broadcast({ type: 'costs:update', data: null, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('[WS] Periodic cost refresh error:', error);
    }
  }, 5 * 60 * 1000);

  console.log('[WS] WebSocket server ready on /ws');
}

function broadcast(message: WSMessage) {
  if (!wss) return;

  const data = JSON.stringify(message);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

function setupFileWatchers() {
  // Watch OpenClaw session files
  const sessionsGlob = path.join(config.openclawDir, 'agents', '*', 'sessions', '*.jsonl');

  try {
    const sessionWatcher = chokidar.watch(sessionsGlob, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 1000,
        pollInterval: 200,
      },
    });

    sessionWatcher.on('change', async (filePath) => {
      console.log(`[WS] Session file changed: ${path.basename(filePath)}`);

      // Invalidate caches
      cache.invalidatePrefix('openclaw:');

      try {
        // Broadcast updated agent data
        const agents = await getAgents();
        for (const agent of agents) {
          broadcast({
            type: 'agent:update',
            data: agent,
            timestamp: new Date().toISOString(),
          });
        }

        // Broadcast new activities
        const activities = await getActivities(5);
        if (activities.length > 0) {
          broadcast({
            type: 'activity:new',
            data: activities[0],
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('[WS] Error processing session change:', error);
      }
    });

    sessionWatcher.on('add', async (filePath) => {
      console.log(`[WS] New session file: ${path.basename(filePath)}`);
      cache.invalidatePrefix('openclaw:');
    });

    console.log(`[WS] Watching sessions: ${sessionsGlob}`);
  } catch (error) {
    console.warn('[WS] Could not watch session files:', error);
  }

  // Watch MEMORY.md
  try {
    const memoryWatcher = chokidar.watch(config.memoryFile, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 200,
      },
    });

    memoryWatcher.on('change', async () => {
      console.log('[WS] MEMORY.md changed');
      cache.invalidatePrefix('neural:');

      try {
        const neuralData = await parseMemoryFile();
        broadcast({
          type: 'neural:update',
          data: neuralData,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('[WS] Error processing MEMORY.md change:', error);
      }
    });

    console.log(`[WS] Watching MEMORY: ${config.memoryFile}`);
  } catch (error) {
    console.warn('[WS] Could not watch MEMORY.md:', error);
  }
}
