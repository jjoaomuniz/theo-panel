import { Router } from 'express';
import { config } from '../config.js';
import { authMiddleware } from '../lib/auth.js';

export const vercelRouter = Router();

const vcFetch = (path: string) =>
  fetch(`https://api.vercel.com${path}`, {
    headers: {
      Authorization: `Bearer ${config.vercelToken}`,
    },
    signal: AbortSignal.timeout(10_000),
  });

vercelRouter.get('/integrations/vercel', authMiddleware, async (_req, res) => {
  if (!config.vercelToken) {
    res.json({ configured: false });
    return;
  }

  try {
    const [projectsRes, deploymentsRes, userRes] = await Promise.all([
      vcFetch('/v9/projects?limit=20'),
      vcFetch('/v6/deployments?limit=20'),
      vcFetch('/v2/user'),
    ]);

    if (!userRes.ok) {
      res.status(userRes.status).json({ error: 'Token Vercel inválido' });
      return;
    }

    const userData = await userRes.json() as any;
    const projectsData = projectsRes.ok ? await projectsRes.json() as any : { projects: [] };
    const deploymentsData = deploymentsRes.ok ? await deploymentsRes.json() as any : { deployments: [] };

    const projects = (projectsData.projects ?? []).map((p: any) => ({
      id: p.id,
      name: p.name,
      framework: p.framework,
      updatedAt: p.updatedAt,
      latestDeployments: (p.latestDeployments ?? []).slice(0, 1).map((d: any) => ({
        uid: d.uid,
        state: d.readyState,
        url: d.url,
        createdAt: d.createdAt,
      })),
    }));

    const deployments = (deploymentsData.deployments ?? []).map((d: any) => ({
      uid: d.uid,
      name: d.name,
      url: d.url,
      state: d.state,
      target: d.target,
      createdAt: d.createdAt,
      ready: d.ready,
    }));

    res.json({
      configured: true,
      user: {
        name: userData.user?.name ?? userData.user?.username,
        username: userData.user?.username,
        email: userData.user?.email,
        avatar: userData.user?.avatar,
      },
      projects,
      deployments,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
