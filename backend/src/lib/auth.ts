import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

// In-memory session store: token -> expiresAt
const sessions = new Map<string, number>();
const SESSION_TTL = 24 * 60 * 60 * 1000; // 24h

// Periodically clean expired sessions
setInterval(() => {
  const now = Date.now();
  for (const [token, expiresAt] of sessions) {
    if (now > expiresAt) sessions.delete(token);
  }
}, 60 * 60 * 1000); // every hour

export function createSession(): string {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, Date.now() + SESSION_TTL);
  return token;
}

export function validateSession(token: string): boolean {
  const expiresAt = sessions.get(token);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    sessions.delete(token);
    return false;
  }
  return true;
}

export function destroySession(token: string): void {
  sessions.delete(token);
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Não autorizado' });
    return;
  }
  const token = authHeader.slice(7);
  if (!validateSession(token)) {
    res.status(401).json({ error: 'Sessão inválida ou expirada' });
    return;
  }
  next();
}
