import { Router } from 'express';
import { db, uuid } from '../db.js';
import { requireAuth } from '../auth.js';
import { requireWorkspace, requireRole } from '../workspace.js';
import { logger } from '../logger.js';

const router = Router();

const hydrate = (r) => ({ ...r, steps: JSON.parse(r.steps || '[]') });

router.get('/', requireAuth, requireWorkspace, (req, res) => {
  const rows = db.prepare(
    'SELECT * FROM workflows WHERE workspace_id = ? ORDER BY created_at DESC'
  ).all(req.workspace.id);
  res.json({ workflows: rows.map(hydrate) });
});

router.post('/', requireAuth, requireWorkspace, requireRole('owner', 'admin', 'developer'), (req, res) => {
  const { name, trigger, steps } = req.body || {};
  if (!name || typeof name !== 'string') return res.status(400).json({ error: 'name required' });
  const id = uuid();
  db.prepare(
    'INSERT INTO workflows (id, workspace_id, name, trigger, steps, created_by) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, req.workspace.id, name.trim(), trigger || 'Webhook', JSON.stringify(steps || []), req.user.id);
  logger.info('workflow', `Created workflow ${name}`, { workspaceId: req.workspace.id, userId: req.user.id });
  const row = db.prepare('SELECT * FROM workflows WHERE id = ?').get(id);
  res.json({ workflow: hydrate(row) });
});

router.delete('/:id', requireAuth, requireWorkspace, requireRole('owner', 'admin', 'developer'), (req, res) => {
  const r = db.prepare('DELETE FROM workflows WHERE id = ? AND workspace_id = ?').run(req.params.id, req.workspace.id);
  if (r.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

router.post('/:id/run', requireAuth, requireWorkspace, requireRole('owner', 'admin', 'developer'), (req, res) => {
  const wf = db.prepare('SELECT * FROM workflows WHERE id = ? AND workspace_id = ?').get(req.params.id, req.workspace.id);
  if (!wf) return res.status(404).json({ error: 'Not found' });
  const runId = uuid();
  const stepsTotal = (JSON.parse(wf.steps || '[]').length) || 1;
  const success = Math.random() > 0.1;
  const duration = Math.round(500 + Math.random() * 4000);
  db.prepare(
    'INSERT INTO workflow_runs (id, workflow_id, workspace_id, status, steps_done, steps_total, duration_ms, finished_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime(\'now\'))'
  ).run(runId, wf.id, req.workspace.id, success ? 'success' : 'error', success ? stepsTotal : Math.max(1, stepsTotal - 1), stepsTotal, duration);
  db.prepare('UPDATE workflows SET runs = runs + 1, last_run_at = datetime(\'now\') WHERE id = ?').run(wf.id);
  logger.info('workflow', `Ran workflow ${wf.name} (${success ? 'success' : 'error'})`, { workspaceId: req.workspace.id, userId: req.user.id });
  res.json({ run_id: runId, status: success ? 'success' : 'error', duration_ms: duration });
});

router.get('/runs', requireAuth, requireWorkspace, (req, res) => {
  const rows = db.prepare(
    `SELECT r.*, w.name AS workflow_name
     FROM workflow_runs r JOIN workflows w ON w.id = r.workflow_id
     WHERE r.workspace_id = ? ORDER BY r.started_at DESC LIMIT 50`
  ).all(req.workspace.id);
  res.json({ runs: rows });
});

export default router;
