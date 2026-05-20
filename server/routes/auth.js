import { Router } from 'express';
import { db, uuid } from '../db.js';
import { hashPassword, verifyPassword, setSessionCookie, clearSessionCookie, requireAuth } from '../auth.js';
import { createPersonalWorkspace } from '../workspace.js';
import { authenticator } from 'otplib';
import { decryptString } from '../crypto.js';
import { logger } from '../logger.js';

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
  const { email, password, mfa_code } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const norm = String(email).trim().toLowerCase();
  const row = db.prepare('SELECT id, email, password_hash, first_name, last_name, timezone, onboarded FROM users WHERE email = ?').get(norm);
  if (!row || !verifyPassword(password, row.password_hash)) {
    logger.warn('auth', `Failed login for ${norm}`);
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // 2FA gate.
  const mfa = db.prepare('SELECT encrypted_secret, recovery_codes, enabled FROM user_mfa WHERE user_id = ?').get(row.id);
  if (mfa?.enabled) {
    if (!mfa_code) {
      return res.status(202).json({ mfa_required: true, user_id: row.id });
    }
    const trimmed = String(mfa_code).trim();
    const secret = decryptString(mfa.encrypted_secret);
    let ok = authenticator.check(trimmed, secret);
    if (!ok) {
      const codes = JSON.parse(mfa.recovery_codes || '[]');
      const idx = codes.indexOf(trimmed);
      if (idx >= 0) {
        codes.splice(idx, 1);
        db.prepare('UPDATE user_mfa SET recovery_codes = ? WHERE user_id = ?').run(JSON.stringify(codes), row.id);
        ok = true;
        logger.warn('auth', `Recovery code used by ${norm}`, { userId: row.id });
      }
    }
    if (!ok) {
      logger.warn('auth', `MFA failed for ${norm}`, { userId: row.id });
      return res.status(401).json({ error: 'Invalid 2FA code' });
    }
  }

  setSessionCookie(res, row.id);
  logger.info('auth', `Login success for ${norm}`, { userId: row.id });
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
