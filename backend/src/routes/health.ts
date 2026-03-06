import { Router } from 'express';
import fs from 'fs/promises';
import { config } from '../config.js';
import { getUptime } from '../index.js';
import type { HealthStatus } from '../types/index.js';

export const healthRouter = Router();

healthRouter.get('/health', async (_req, res) => {
  let openrouterOk = false;
  let openclawOk = false;

  // Check OpenRouter API connectivity
  if (config.openrouterApiKey) {
    try {
      const resp = await fetch(`${config.openrouterBaseUrl}/api/v1/credits`, {
        headers: { Authorization: `Bearer ${config.openrouterApiKey}` },
        signal: AbortSignal.timeout(5000),
      });
      openrouterOk = resp.ok;
    } catch {
      openrouterOk = false;
    }
  }

  // Check OpenClaw directory exists
  try {
    await fs.access(config.openclawDir);
    openclawOk = true;
  } catch {
    openclawOk = false;
  }

  const overall = openrouterOk && openclawOk ? 'ok' : openrouterOk || openclawOk ? 'degraded' : 'error';

  const status: HealthStatus = {
    status: overall,
    uptime: getUptime(),
    openrouter: openrouterOk,
    openclaw: openclawOk,
    timestamp: new Date().toISOString(),
  };

  // Set appropriate HTTP status based on health
  const httpStatus = overall === 'ok' ? 200 : overall === 'degraded' ? 200 : 503;
  res.status(httpStatus).json(status);
});
