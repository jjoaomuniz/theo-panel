import { Router } from 'express';
import { config } from '../config.js';
import { authMiddleware } from '../lib/auth.js';

export const githubRouter = Router();

const ghFetch = (path: string) =>
  fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${config.githubToken}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    signal: AbortSignal.timeout(10_000),
  });

githubRouter.get('/integrations/github', authMiddleware, async (_req, res) => {
  if (!config.githubToken) {
    res.json({ configured: false });
    return;
  }

  try {
    const [userRes, reposRes, eventsRes] = await Promise.all([
      ghFetch('/user'),
      ghFetch('/user/repos?sort=pushed&per_page=10&type=owner'),
      ghFetch('/user/events?per_page=20'),
    ]);

    if (!userRes.ok) {
      res.status(userRes.status).json({ error: 'Token GitHub inválido' });
      return;
    }

    const user = await userRes.json() as any;
    const repos = reposRes.ok ? await reposRes.json() as any[] : [];
    const events = eventsRes.ok ? await eventsRes.json() as any[] : [];

    // Count open PRs and issues from repos
    const repoStats = repos.map((r: any) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      openIssues: r.open_issues_count,
      pushedAt: r.pushed_at,
      url: r.html_url,
      private: r.private,
    }));

    const recentEvents = events.slice(0, 15).map((e: any) => ({
      id: e.id,
      type: e.type,
      repo: e.repo?.name,
      createdAt: e.created_at,
      payload: {
        ref: e.payload?.ref,
        commits: e.payload?.commits?.length ?? 0,
        action: e.payload?.action,
        title: e.payload?.pull_request?.title ?? e.payload?.issue?.title,
      },
    }));

    res.json({
      configured: true,
      user: {
        login: user.login,
        name: user.name,
        avatar: user.avatar_url,
        publicRepos: user.public_repos,
        followers: user.followers,
        following: user.following,
      },
      repos: repoStats,
      events: recentEvents,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
