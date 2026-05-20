import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

const SECRET = process.env.JWT_SECRET || 'dev-only-insecure-secret';
const COOKIE_NAME = 'ns_session';
const SESSION_TTL_DAYS = 7;

// In production, the frontend (GitHub Pages) and backend (Render) live on
// different origins, so the session cookie must be SameSite=None + Secure.
const IS_PROD = process.env.NODE_ENV === 'production';
export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: IS_PROD ? 'none' : 'lax',
  secure: IS_PROD,
  maxAge: SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
  path: '/',
};

export const hashPassword = (plain) => bcrypt.hashSync(plain, 12);
export const verifyPassword = (plain, hash) => bcrypt.compareSync(plain, hash);

export const signToken = (userId) =>
  jwt.sign({ sub: userId }, SECRET, { expiresIn: `${SESSION_TTL_DAYS}d` });

export const verifyToken = (token) => {
  try { return jwt.verify(token, SECRET); }
  catch { return null; }
};

export const setSessionCookie = (res, userId) => {
  const token = signToken(userId);
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
};

export const clearSessionCookie = (res) => {
  res.clearCookie(COOKIE_NAME, { path: '/' });
};

export const requireAuth = (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  const payload = verifyToken(token);
  if (!payload?.sub) return res.status(401).json({ error: 'Invalid session' });
  const user = db.prepare('SELECT id, email, first_name, last_name, timezone, onboarded FROM users WHERE id = ?').get(payload.sub);
  if (!user) { clearSessionCookie(res); return res.status(401).json({ error: 'User not found' }); }
  req.user = user;
  next();
};

export const COOKIE = COOKIE_NAME;
