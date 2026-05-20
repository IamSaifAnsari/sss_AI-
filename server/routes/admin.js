import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

// Owner check: must own at least one workspace.
const requireOwner = (req, res, next) => {
  const row = db.prepare("SELECT 1 FROM workspace_members WHERE user_id = ? AND role = 'owner' LIMIT 1").get(req.user.id);
  if (!row) return res.status(403).json({ error: 'Owner role required' });
  next();
};

router.get('/overview', requireAuth, requireOwner, (_req, res) => {
  const totalUsers = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
  const workspaces = db.prepare('SELECT COUNT(*) AS n FROM workspaces').get().n;
  const totalAgents = db.prepare('SELECT COUNT(*) AS n FROM agents').get().n;
  const totalKeys = db.prepare('SELECT COUNT(*) AS n FROM api_keys').get().n;
  const totalWorkflows = db.prepare('SELECT COUNT(*) AS n FROM workflows').get().n;
  const totalDeployments = db.prepare('SELECT COUNT(*) AS n FROM deployments').get().n;
  const usage24h = db.prepare("SELECT COUNT(*) AS n FROM usage_events WHERE occurred_at > datetime('now','-1 day')").get().n;
  const newUsers30d = db.prepare("SELECT COUNT(*) AS n FROM users WHERE created_at > datetime('now','-30 days')").get().n;
  const planRows = db.prepare("SELECT plan, COUNT(*) AS n FROM workspaces GROUP BY plan").all();

  res.json({
    totals: { totalUsers, workspaces, totalAgents, totalKeys, totalWorkflows, totalDeployments, usage24h, newUsers30d },
    planDistribution: planRows,
  });
});

router.get('/users', requireAuth, requireOwner, (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const rows = db.prepare(
    'SELECT id, email, first_name, last_name, onboarded, created_at FROM users ORDER BY created_at DESC LIMIT ?'
  ).all(limit);
  res.json({ users: rows.map((r) => ({ ...r, onboarded: !!r.onboarded })) });
});

router.get('/tenants', requireAuth, requireOwner, (_req, res) => {
  const rows = db.prepare(
    `SELECT
       w.id, w.name, w.plan, w.credits, w.created_at,
       (SELECT COUNT(*) FROM workspace_members WHERE workspace_id = w.id) AS users,
       (SELECT COUNT(*) FROM agents WHERE workspace_id = w.id) AS agents,
       (SELECT COUNT(*) FROM api_keys WHERE workspace_id = w.id) AS keys,
       (SELECT COUNT(*) FROM workflows WHERE workspace_id = w.id) AS workflows
     FROM workspaces w
     ORDER BY w.created_at DESC`
  ).all();
  res.json({ tenants: rows });
});

router.get('/usage', requireAuth, requireOwner, (_req, res) => {
  const rows = db.prepare(
    "SELECT date(occurred_at) AS day, COUNT(*) AS calls FROM usage_events WHERE occurred_at > datetime('now','-30 days') GROUP BY day ORDER BY day"
  ).all();
  res.json({ daily: rows });
});

export default router;
