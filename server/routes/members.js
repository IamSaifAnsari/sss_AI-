import { Router } from 'express';
import crypto from 'node:crypto';
import { db, uuid } from '../db.js';
import { requireAuth } from '../auth.js';
import { requireWorkspace, requireRole } from '../workspace.js';
import { logger } from '../logger.js';

const router = Router();

router.get('/', requireAuth, requireWorkspace, (req, res) => {
  const rows = db.prepare(
    `SELECT u.id, u.email, u.first_name, u.last_name, m.role, m.joined_at
     FROM workspace_members m JOIN users u ON u.id = m.user_id
     WHERE m.workspace_id = ?
     ORDER BY CASE m.role WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 WHEN 'developer' THEN 2 ELSE 3 END, m.joined_at`
  ).all(req.workspace.id);
  res.json({ members: rows });
});

router.patch('/:userId', requireAuth, requireWorkspace, requireRole('owner', 'admin'), (req, res) => {
  const { role } = req.body || {};
  if (!['admin', 'developer', 'viewer'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  const target = db.prepare('SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?').get(req.workspace.id, req.params.userId);
  if (!target) return res.status(404).json({ error: 'Member not found' });
  if (target.role === 'owner') return res.status(403).json({ error: 'Cannot modify owner' });
  db.prepare('UPDATE workspace_members SET role = ? WHERE workspace_id = ? AND user_id = ?').run(role, req.workspace.id, req.params.userId);
  res.json({ ok: true });
});

router.delete('/:userId', requireAuth, requireWorkspace, requireRole('owner', 'admin'), (req, res) => {
  const target = db.prepare('SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?').get(req.workspace.id, req.params.userId);
  if (!target) return res.status(404).json({ error: 'Member not found' });
  if (target.role === 'owner') return res.status(403).json({ error: 'Cannot remove owner' });
  db.prepare('DELETE FROM workspace_members WHERE workspace_id = ? AND user_id = ?').run(req.workspace.id, req.params.userId);
  res.json({ ok: true });
});

router.get('/invitations', requireAuth, requireWorkspace, requireRole('owner', 'admin'), (req, res) => {
  const rows = db.prepare(
    "SELECT id, email, role, token, accepted_at, expires_at, created_at FROM invitations WHERE workspace_id = ? AND accepted_at IS NULL AND expires_at > datetime('now') ORDER BY created_at DESC"
  ).all(req.workspace.id);
  res.json({ invitations: rows });
});

router.post('/invitations', requireAuth, requireWorkspace, requireRole('owner', 'admin'), (req, res) => {
  const { email, role } = req.body || {};
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'Valid email required' });
  const r = ['admin', 'developer', 'viewer'].includes(role) ? role : 'developer';
  const id = uuid();
  const token = crypto.randomBytes(24).toString('base64url');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);
  db.prepare(
    'INSERT INTO invitations (id, workspace_id, email, role, token, invited_by, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(id, req.workspace.id, email.trim().toLowerCase(), r, token, req.user.id, expiresAt);
  logger.info('invite', `Invited ${email} as ${r}`, { workspaceId: req.workspace.id, userId: req.user.id });
  res.json({ id, token, invite_url: `/invite/${token}`, role: r });
});

router.delete('/invitations/:id', requireAuth, requireWorkspace, requireRole('owner', 'admin'), (req, res) => {
  db.prepare('DELETE FROM invitations WHERE id = ? AND workspace_id = ?').run(req.params.id, req.workspace.id);
  res.json({ ok: true });
});

router.post('/invitations/accept', requireAuth, (req, res) => {
  const { token } = req.body || {};
  if (!token) return res.status(400).json({ error: 'token required' });
  const inv = db.prepare("SELECT * FROM invitations WHERE token = ? AND accepted_at IS NULL AND expires_at > datetime('now')").get(token);
  if (!inv) return res.status(404).json({ error: 'Invitation invalid or expired' });
  const tx = db.transaction(() => {
    db.prepare('INSERT OR IGNORE INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, ?)').run(inv.workspace_id, req.user.id, inv.role);
    db.prepare("UPDATE invitations SET accepted_at = datetime('now') WHERE id = ?").run(inv.id);
  });
  tx();
  res.json({ workspace_id: inv.workspace_id, role: inv.role });
});

export default router;
