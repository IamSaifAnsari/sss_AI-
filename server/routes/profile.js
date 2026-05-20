import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

router.get('/', requireAuth, (req, res) => {
  const u = db.prepare(
    'SELECT id, email, first_name, last_name, timezone, avatar_url, onboarded, onboarding_data, created_at FROM users WHERE id = ?'
  ).get(req.user.id);
  res.json({
    ...u,
    onboarded: !!u.onboarded,
    onboarding_data: JSON.parse(u.onboarding_data || '{}'),
  });
});

router.patch('/', requireAuth, (req, res) => {
  const { first_name, last_name, timezone } = req.body || {};
  db.prepare(
    'UPDATE users SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name), timezone = COALESCE(?, timezone), updated_at = datetime(\'now\') WHERE id = ?'
  ).run(first_name ?? null, last_name ?? null, timezone ?? null, req.user.id);
  res.json({ ok: true });
});

router.post('/complete-onboarding', requireAuth, (req, res) => {
  const data = req.body?.data || {};
  db.prepare(
    'UPDATE users SET onboarded = 1, onboarding_data = ?, updated_at = datetime(\'now\') WHERE id = ?'
  ).run(JSON.stringify(data), req.user.id);

  // If user provided a workspace name, rename their first workspace.
  if (data.workspaceName && typeof data.workspaceName === 'string' && data.workspaceName.trim()) {
    const ws = db.prepare(
      'SELECT workspace_id FROM workspace_members WHERE user_id = ? ORDER BY joined_at LIMIT 1'
    ).get(req.user.id);
    if (ws?.workspace_id) {
      db.prepare('UPDATE workspaces SET name = ?, updated_at = datetime(\'now\') WHERE id = ?').run(data.workspaceName.trim(), ws.workspace_id);
    }
  }
  res.json({ ok: true });
});

export default router;
