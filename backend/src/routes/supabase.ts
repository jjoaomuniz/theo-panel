import { Router } from 'express';
import { config } from '../config.js';
import { authMiddleware } from '../lib/auth.js';

export const supabaseRouter = Router();

const sbFetch = (path: string) =>
  fetch(`https://api.supabase.com${path}`, {
    headers: {
      Authorization: `Bearer ${config.supabaseServiceKey}`,
    },
    signal: AbortSignal.timeout(10_000),
  });

supabaseRouter.get('/integrations/supabase', authMiddleware, async (_req, res) => {
  if (!config.supabaseUrl) {
    res.json({ configured: false });
    return;
  }

  try {
    const [projectsRes, orgsRes] = await Promise.all([
      sbFetch('/v1/projects'),
      sbFetch('/v1/organizations'),
    ]);

    if (!projectsRes.ok) {
      res.status(projectsRes.status).json({ error: 'Token Supabase inválido' });
      return;
    }

    const projects = await projectsRes.json();
    const orgs = orgsRes.ok ? await orgsRes.json() : [];

    const mappedProjects = (Array.isArray(projects) ? projects : []).map((p: any) => ({
      id: p.id,
      name: p.name,
      region: p.region,
      status: p.status,
      createdAt: p.created_at,
      orgId: p.organization_id,
      dbVersion: p.db_version,
      ref: p.ref,
    }));

    const mappedOrgs = (Array.isArray(orgs) ? orgs : []).map((o: any) => ({
      id: o.id,
      name: o.name,
      slug: o.slug,
    }));

    res.json({
      configured: true,
      projects: mappedProjects,
      organizations: mappedOrgs,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
