import { Router } from 'express';
import crypto from 'node:crypto';
import { db } from '../db.js';
import { hashPassword } from '../auth.js';
import { logger } from '../logger.js';

const router = Router();

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

// Step 1: user submits email. Always returns 200 to avoid leaking enumeration.
router.post('/request', (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email required' });
  const norm = String(email).trim().toLowerCase();
  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(norm);

  if (user) {
    const token = crypto.randomBytes(32).toString('base64url');
    const expires = new Date(Date.now() + TOKEN_TTL_MS).toISOString().replace('T', ' ').slice(0, 19);
    db.prepare('INSERT INTO password_resets (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, user.id, expires);
    logger.info('auth', `Password reset requested for ${norm}`, { userId: user.id });

    // TODO: send via SMTP (Resend/Postmark). For now log + expose in dev only.
    const resetUrl = `/reset-password?token=${token}`;
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[password-reset] ${norm} → ${resetUrl}`);
      return res.json({ ok: true, dev_reset_url: resetUrl });
    }
  }

  res.json({ ok: true });
});

// Step 2: verify token + set new password.
router.post('/complete', (req, res) => {
  const { token, new_password } = req.body || {};
  if (!token || !new_password) return res.status(400).json({ error: 'token + new_password required' });
  if (new_password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  const row = db.prepare("SELECT user_id, used_at, expires_at FROM password_resets WHERE token = ?").get(token);
  if (!row) return res.status(404).json({ error: 'Invalid token' });
  if (row.used_at) return res.status(410).json({ error: 'Token already used' });
  if (new Date(row.expires_at.replace(' ', 'T') + 'Z') < new Date()) {
    return res.status(410).json({ error: 'Token expired' });
  }

  const tx = db.transaction(() => {
    db.prepare("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?").run(hashPassword(new_password), row.user_id);
    db.prepare("UPDATE password_resets SET used_at = datetime('now') WHERE token = ?").run(token);
  });
  tx();
  logger.info('auth', `Password reset completed`, { userId: row.user_id });
  res.json({ ok: true });
});

export default router;
