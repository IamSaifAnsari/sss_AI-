import { Router } from 'express';
import { db, uuid } from '../db.js';
import { hashPassword, verifyPassword, setSessionCookie, clearSessionCookie, requireAuth } from '../auth.js';
import { createPersonalWorkspace } from '../workspace.js';

const router = Router();

router.post('/signup', (req, res) => {
  const { email, password, workspaceName } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  if (typeof password !== 'string' || password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  const norm = String(email).trim().toLowerCase();

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(norm);
  if (existing) return res.status(409).json({ error: 'Email already in use' });

  const userId = uuid();
  const localPart = norm.split('@')[0];
  const defaultWsName = workspaceName?.trim() || `${localPart}'s workspace`;
  try {
    const tx = db.transaction(() => {
      db.prepare(
        'INSERT INTO users (id, email, password_hash, first_name) VALUES (?, ?, ?, ?)'
      ).run(userId, norm, hashPassword(password), localPart);
      createPersonalWorkspace(userId, defaultWsName);
    });
    tx();
  } catch (e) {
    console.error('signup failed', e);
    return res.status(500).json({ error: 'Could not create account' });
  }

  setSessionCookie(res, userId);
  const user = db.prepare('SELECT id, email, first_name, last_name, timezone, onboarded FROM users WHERE id = ?').get(userId);
  res.json({ user: { ...user, onboarded: !!user.onboarded } });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const norm = String(email).trim().toLowerCase();
  const row = db.prepare('SELECT id, email, password_hash, first_name, last_name, timezone, onboarded FROM users WHERE email = ?').get(norm);
  if (!row || !verifyPassword(password, row.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  setSessionCookie(res, row.id);
  const { password_hash, ...safe } = row;
  res.json({ user: { ...safe, onboarded: !!safe.onboarded } });
});

router.post('/logout', (req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, email, first_name, last_name, timezone, onboarded FROM users WHERE id = ?').get(req.user.id);
  res.json({ user: { ...user, onboarded: !!user.onboarded } });
});

router.post('/change-password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!newPassword || newPassword.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' });
  const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
  if (!row || !verifyPassword(currentPassword || '', row.password_hash)) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }
  db.prepare('UPDATE users SET password_hash = ?, updated_at = datetime(\'now\') WHERE id = ?').run(hashPassword(newPassword), req.user.id);
  res.json({ ok: true });
});

export default router;
