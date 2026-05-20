import { Router } from 'express';
import crypto from 'node:crypto';
import { db, uuid } from '../db.js';
import { requireAuth } from '../auth.js';
import { requireWorkspace, requireRole } from '../workspace.js';

const router = Router();

router.get('/', requireAuth, requireWorkspace, (req, res) => {
  const rows = db.prepare(
    'SELECT id, name, prefix, last_four, env, permissions, rate_limit, status, requests, last_used_at, created_at ' +
    'FROM api_keys WHERE workspace_id = ? ORDER BY created_at DESC'
  ).all(req.workspace.id);
  res.json({
    keys: rows.map((r) => ({ ...r, permissions: JSON.parse(r.permissions || '[]') })),
  });
});

router.post('/', requireAuth, requireWorkspace, requireRole('owner', 'admin', 'developer'), (req, res) => {
  const { name, env, permissions, rateLimit } = req.body || {};
  if (!name || typeof name !== 'string') return res.status(400).json({ error: 'name required' });
  const e = env === 'staging' || env === 'development' ? env : 'production';
  const prefix = 'pk_' + (e === 'production' ? 'live' : 'test');
  const secret = crypto.randomBytes(24).toString('hex');
  const fullKey = `${prefix}_${secret}`;
  const hash = crypto.createHash('sha256').update(fullKey).digest('hex');
  const id = uuid();
  db.prepare(
    'INSERT INTO api_keys (id, workspace_id, name, key_hash, prefix, last_four, env, permissions, rate_limit, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    id, req.workspace.id, name.trim(), hash, prefix, secret.slice(-4), e,
    JSON.stringify(Array.isArray(permissions) ? permissions : []),
    Number.isInteger(rateLimit) ? rateLimit : 1000,
    req.user.id
  );
  res.json({ id, plaintext_key: fullKey });
});

router.delete('/:id', requireAuth, requireWorkspace, requireRole('owner', 'admin', 'developer'), (req, res) => {
  const r = db.prepare('DELETE FROM api_keys WHERE id = ? AND workspace_id = ?').run(req.params.id, req.workspace.id);
  if (r.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

export default router;
