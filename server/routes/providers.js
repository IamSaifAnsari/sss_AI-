import { Router } from 'express';
import { db, uuid } from '../db.js';
import { requireAuth } from '../auth.js';
import { requireWorkspace, requireRole } from '../workspace.js';
import { encryptString, decryptString } from '../crypto.js';
import { logger } from '../logger.js';

const router = Router();

const VALID_PROVIDERS = ['openai', 'anthropic', 'google', 'deepseek', 'mistral', 'replicate'];

router.get('/', requireAuth, requireWorkspace, (req, res) => {
  const rows = db.prepare(
    'SELECT id, provider, label, created_at FROM provider_keys WHERE workspace_id = ?'
  ).all(req.workspace.id);
  res.json({ providers: rows });
});

router.put('/:provider', requireAuth, requireWorkspace, requireRole('owner', 'admin'), (req, res) => {
  const { provider } = req.params;
  if (!VALID_PROVIDERS.includes(provider)) return res.status(400).json({ error: 'Unsupported provider' });
  const { key, label } = req.body || {};
  if (!key || typeof key !== 'string' || key.length < 10) return res.status(400).json({ error: 'key required' });
  const encrypted = encryptString(key);
  const existing = db.prepare('SELECT id FROM provider_keys WHERE workspace_id = ? AND provider = ?').get(req.workspace.id, provider);
  if (existing) {
    db.prepare('UPDATE provider_keys SET encrypted_key = ?, label = ?, created_by = ? WHERE id = ?').run(encrypted, label || null, req.user.id, existing.id);
  } else {
    db.prepare('INSERT INTO provider_keys (id, workspace_id, provider, encrypted_key, label, created_by) VALUES (?, ?, ?, ?, ?, ?)').run(uuid(), req.workspace.id, provider, encrypted, label || null, req.user.id);
  }
  logger.info('provider', `Saved ${provider} key`, { workspaceId: req.workspace.id, userId: req.user.id });
  res.json({ ok: true });
});

router.delete('/:provider', requireAuth, requireWorkspace, requireRole('owner', 'admin'), (req, res) => {
  db.prepare('DELETE FROM provider_keys WHERE workspace_id = ? AND provider = ?').run(req.workspace.id, req.params.provider);
  res.json({ ok: true });
});

// Internal: get decrypted key (used by the LLM proxy on the same server).
export function getProviderKey(workspaceId, provider) {
  const row = db.prepare('SELECT encrypted_key FROM provider_keys WHERE workspace_id = ? AND provider = ?').get(workspaceId, provider);
  if (!row) return null;
  try { return decryptString(row.encrypted_key); } catch { return null; }
}

export default router;
