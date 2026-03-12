import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { authMiddleware } from '../lib/auth.js';

export const authRouter = Router();

authRouter.post('/auth/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    res.status(400).json({ error: 'Email e senha obrigatórios' });
    return;
  }

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    res.status(401).json({ error: 'Credenciais inválidas' });
    return;
  }

  res.json({
    token: data.session.access_token,
    refreshToken: data.session.refresh_token,
    email: data.user.email,
  });
});

authRouter.post('/auth/logout', authMiddleware, async (req, res) => {
  const token = req.headers.authorization!.slice(7);
  await supabaseAdmin.auth.admin.signOut(token);
  res.json({ ok: true });
});

authRouter.get('/auth/verify', authMiddleware, async (req, res) => {
  const token = req.headers.authorization!.slice(7);
  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  res.json({ valid: true, email: user?.email });
});
