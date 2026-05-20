import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { requireWorkspace } from '../workspace.js';

const router = Router();

router.get('/', requireAuth, requireWorkspace, (req, res) => {
  const level = ['debug', 'info', 'warn', 'error'].includes(req.query.level) ? req.query.level : null;
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  let rows;
  if (level) {
    rows = db.prepare(
      'SELECT * FROM log_events WHERE (workspace_id = ? OR workspace_id IS NULL) AND level = ? ORDER BY id DESC LIMIT ?'
    ).all(req.workspace.id, level, limit);
  } else {
    rows = db.prepare(
      'SELECT * FROM log_events WHERE (workspace_id = ? OR workspace_id IS NULL) ORDER BY id DESC LIMIT ?'
    ).all(req.workspace.id, limit);
  }
  res.json({ logs: rows.map((r) => ({ ...r, meta: JSON.parse(r.meta || '{}') })) });
});

export default router;
