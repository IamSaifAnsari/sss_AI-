import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

router.get('/', requireAuth, (req, res) => {
  const row = db.prepare('SELECT tweaks, active_workspace_id FROM user_settings WHERE user_id = ?').get(req.user.id);
  res.json({
    tweaks: JSON.parse(row?.tweaks || '{}'),
    active_workspace_id: row?.active_workspace_id || null,
  });
});

router.put('/tweaks', requireAuth, (req, res) => {
  const tweaks = req.body?.tweaks;
  if (!tweaks || typeof tweaks !== 'object') return res.status(400).json({ error: 'tweaks must be an object' });
  db.prepare(
    'INSERT INTO user_settings (user_id, tweaks) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET tweaks = excluded.tweaks, updated_at = datetime(\'now\')'
  ).run(req.user.id, JSON.stringify(tweaks));
  res.json({ ok: true });
});

export default router;
