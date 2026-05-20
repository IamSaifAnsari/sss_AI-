import { Router } from 'express';
import { db, uuid } from '../db.js';
import { requireAuth } from '../auth.js';
import { requireWorkspace } from '../workspace.js';

const router = Router();

router.get('/', requireAuth, (req, res) => {
  const rows = db.prepare(
    'SELECT workspaces.id, workspaces.name, workspaces.plan, workspaces.credits, workspaces.created_at, workspace_members.role ' +
    'FROM workspaces JOIN workspace_members ON workspace_members.workspace_id = workspaces.id ' +
    'WHERE workspace_members.user_id = ? ORDER BY workspace_members.joined_at'
  ).all(req.user.id);
  res.json({ workspaces: rows });
});

router.post('/', requireAuth, (req, res) => {
  const { name, plan } = req.body || {};
  if (!name || typeof name !== 'string') return res.status(400).json({ error: 'name required' });
  const wsId = uuid();
  const tx = db.transaction(() => {
    db.prepare('INSERT INTO workspaces (id, name, plan, created_by) VALUES (?, ?, ?, ?)').run(wsId, name.trim(), plan || 'free', req.user.id);
    db.prepare('INSERT INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, ?)').run(wsId, req.user.id, 'owner');
  });
  tx();
  res.json({ id: wsId });
});

router.get('/active', requireAuth, (req, res) => {
  const row = db.prepare('SELECT active_workspace_id FROM user_settings WHERE user_id = ?').get(req.user.id);
  res.json({ active_workspace_id: row?.active_workspace_id || null });
});

router.put('/active', requireAuth, (req, res) => {
  const { workspace_id } = req.body || {};
  if (!workspace_id) return res.status(400).json({ error: 'workspace_id required' });
  const member = db.prepare('SELECT 1 FROM workspace_members WHERE workspace_id = ? AND user_id = ?').get(workspace_id, req.user.id);
  if (!member) return res.status(403).json({ error: 'Not a member' });
  db.prepare('INSERT INTO user_settings (user_id, active_workspace_id) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET active_workspace_id = excluded.active_workspace_id').run(req.user.id, workspace_id);
  res.json({ ok: true });
});

router.get('/:id/credits', requireAuth, requireWorkspace, (req, res) => {
  res.json({ credits: req.workspace.credits, plan: req.workspace.plan });
});

export default router;
