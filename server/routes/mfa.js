import { Router } from 'express';
import crypto from 'node:crypto';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { db } from '../db.js';
import { requireAuth, verifyPassword } from '../auth.js';
import { encryptString, decryptString } from '../crypto.js';
import { logger } from '../logger.js';

const router = Router();

authenticator.options = { window: 1, step: 30 };

const ISSUER = process.env.MFA_ISSUER || 'NeuronStack AI';

const generateRecoveryCodes = () => {
  return Array.from({ length: 10 }, () => crypto.randomBytes(5).toString('hex'));
};

router.get('/status', requireAuth, (req, res) => {
  const row = db.prepare('SELECT enabled, enrolled_at FROM user_mfa WHERE user_id = ?').get(req.user.id);
  res.json({ enabled: !!row?.enabled, enrolled_at: row?.enrolled_at || null });
});

router.post('/enroll/start', requireAuth, async (req, res) => {
  const existing = db.prepare('SELECT enabled FROM user_mfa WHERE user_id = ?').get(req.user.id);
  if (existing?.enabled) return res.status(409).json({ error: '2FA already enabled' });

  const secret = authenticator.generateSecret();
  // Store pending secret (encrypted) but keep enabled=0 until verified.
  db.prepare(
    'INSERT OR REPLACE INTO user_mfa (user_id, encrypted_secret, recovery_codes, enabled) VALUES (?, ?, ?, 0)'
  ).run(req.user.id, encryptString(secret), JSON.stringify([]));

  const otpauthUrl = authenticator.keyuri(req.user.email, ISSUER, secret);
  const qrDataUrl = await QRCode.toDataURL(otpauthUrl);
  res.json({ secret, otpauth_url: otpauthUrl, qr_data_url: qrDataUrl });
});

router.post('/enroll/verify', requireAuth, (req, res) => {
  const { code } = req.body || {};
  if (!code) return res.status(400).json({ error: 'code required' });
  const row = db.prepare('SELECT encrypted_secret FROM user_mfa WHERE user_id = ?').get(req.user.id);
  if (!row) return res.status(404).json({ error: 'No pending enrollment' });

  const secret = decryptString(row.encrypted_secret);
  if (!authenticator.check(String(code).trim(), secret)) {
    return res.status(401).json({ error: 'Invalid code' });
  }

  const recovery = generateRecoveryCodes();
  db.prepare(
    "UPDATE user_mfa SET enabled = 1, enrolled_at = datetime('now'), recovery_codes = ? WHERE user_id = ?"
  ).run(JSON.stringify(recovery), req.user.id);
  logger.info('mfa', `2FA enabled for ${req.user.email}`, { userId: req.user.id });
  res.json({ enabled: true, recovery_codes: recovery });
});

router.post('/disable', requireAuth, (req, res) => {
  const { password } = req.body || {};
  const u = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
  if (!u || !verifyPassword(password || '', u.password_hash)) {
    return res.status(401).json({ error: 'Password incorrect' });
  }
  db.prepare('DELETE FROM user_mfa WHERE user_id = ?').run(req.user.id);
  logger.info('mfa', `2FA disabled for ${req.user.email}`, { userId: req.user.id });
  res.json({ enabled: false });
});

// Verify a TOTP code during login. Called when login response says mfa_required.
router.post('/verify', (req, res) => {
  const { user_id, code } = req.body || {};
  if (!user_id || !code) return res.status(400).json({ error: 'user_id + code required' });
  const row = db.prepare('SELECT encrypted_secret, recovery_codes, enabled FROM user_mfa WHERE user_id = ?').get(user_id);
  if (!row || !row.enabled) return res.status(404).json({ error: 'No active 2FA on account' });

  const trimmed = String(code).trim();
  const secret = decryptString(row.encrypted_secret);

  if (authenticator.check(trimmed, secret)) {
    return res.json({ ok: true });
  }
  // Recovery code path: one-time use.
  const codes = JSON.parse(row.recovery_codes || '[]');
  const idx = codes.indexOf(trimmed);
  if (idx >= 0) {
    codes.splice(idx, 1);
    db.prepare('UPDATE user_mfa SET recovery_codes = ? WHERE user_id = ?').run(JSON.stringify(codes), user_id);
    return res.json({ ok: true, recovery_used: true, remaining_codes: codes.length });
  }
  res.status(401).json({ error: 'Invalid code' });
});

export const isMfaEnabled = (userId) => {
  const r = db.prepare('SELECT enabled FROM user_mfa WHERE user_id = ?').get(userId);
  return !!r?.enabled;
};

export default router;
