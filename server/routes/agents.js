import { Router } from 'express';
import { db, uuid } from '../db.js';
import { requireAuth } from '../auth.js';
import { requireWorkspace, requireRole } from '../workspace.js';

const router = Router();

const hydrate = (r) => ({
  ...r,
  tools: JSON.parse(r.tools || '[]'),
});

router.get('/', requireAuth, requireWorkspace, (req, res) => {
  const rows = db.prepare(
    'SELECT * FROM agents WHERE workspace_id = ? ORDER BY created_at DESC'
  ).all(req.workspace.id);
  res.json({ agents: rows.map(hydrate) });
});

router.post('/', requireAuth, requireWorkspace, requireRole('owner', 'admin', 'developer'), (req, res) => {
  const { name, desc, model, systemPrompt, tools } = req.body || {};
  if (!name || typeof name !== 'string') return res.status(400).json({ error: 'name required' });
  const id = uuid();
  db.prepare(
    'INSERT INTO agents (id, workspace_id, name, description, model, system_prompt, tools, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    id, req.workspace.id, name.trim(), desc || '',
    model || 'gpt-4o', systemPrompt || '',
    JSON.stringify(Array.isArray(tools) ? tools : []),
    req.user.id
  );
  const row = db.prepare('SELECT * FROM agents WHERE id = ?').get(id);
  res.json({ agent: hydrate(row) });
});

router.delete('/:id', requireAuth, requireWorkspace, requireRole('owner', 'admin', 'developer'), (req, res) => {
  const r = db.prepare('DELETE FROM agents WHERE id = ? AND workspace_id = ?').run(req.params.id, req.workspace.id);
  if (r.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

export default router;
