import { Router } from 'express';
import { config } from '../config.js';
import { createSession, destroySession, validateSession } from '../lib/auth.js';

export const authRouter = Router();

authRouter.post('/auth/login', (req, res) => {
  const { username, password } = req.body ?? {};

  if (!username || !password) {
    res.status(400).json({ error: 'Usuário e senha obrigatórios' });
    return;
  }

  if (username !== config.panelUsername || password !== config.panelPassword) {
    res.status(401).json({ error: 'Credenciais inválidas' });
    return;
  }

  const token = createSession();
  res.json({ token, username });
});

authRouter.post('/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    destroySession(authHeader.slice(7));
  }
  res.json({ ok: true });
});

authRouter.get('/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ valid: false });
    return;
  }
  const valid = validateSession(authHeader.slice(7));
  if (!valid) {
    res.status(401).json({ valid: false });
    return;
  }
  res.json({ valid: true, username: config.panelUsername });
});
