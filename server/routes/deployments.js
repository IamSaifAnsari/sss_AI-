import { Router } from 'express';
import { db, uuid } from '../db.js';
import { requireAuth } from '../auth.js';
import { requireWorkspace, requireRole } from '../workspace.js';
import { logger } from '../logger.js';

const router = Router();

router.get('/', requireAuth, requireWorkspace, (req, res) => {
  const rows = db.prepare('SELECT * FROM deployments WHERE workspace_id = ? ORDER BY created_at DESC').all(req.workspace.id);
  res.json({ deployments: rows });
});

router.post('/', requireAuth, requireWorkspace, requireRole('owner', 'admin', 'developer'), (req, res) => {
  const { name, env, model, region } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name required' });
  const id = uuid();
  db.prepare(
    'INSERT INTO deployments (id, workspace_id, name, env, model, region, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(id, req.workspace.id, name.trim(), env || 'production', model || '', region || 'us-east-1', 'deploying', req.user.id);
  logger.info('deployment', `Deployment "${name}" queued`, { workspaceId: req.workspace.id, userId: req.user.id });

  // Simulate deploy completing after a short delay.
  setTimeout(() => {
    try {
      db.prepare('UPDATE deployments SET status = ?, uptime = ?, updated_at = datetime(\'now\') WHERE id = ?').run('active', '99.99%', id);
      logger.info('deployment', `Deployment "${name}" active`, { workspaceId: req.workspace.id });
    } catch (e) { /* noop */ }
  }, 4000);

  const row = db.prepare('SELECT * FROM deployments WHERE id = ?').get(id);
  res.json({ deployment: row });
});

router.delete('/:id', requireAuth, requireWorkspace, requireRole('owner', 'admin'), (req, res) => {
  const r = db.prepare('DELETE FROM deployments WHERE id = ? AND workspace_id = ?').run(req.params.id, req.workspace.id);
  if (r.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

export default router;
