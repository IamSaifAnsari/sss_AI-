import crypto from 'node:crypto';

const SECRET = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'dev-only-insecure-secret';
// Derive a 32-byte AES key from whatever secret we have.
const KEY = crypto.createHash('sha256').update(SECRET).digest();
const ALGO = 'aes-256-gcm';

export function encryptString(plain) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  const enc = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Format: iv:tag:ciphertext, all base64
  return [iv.toString('base64'), tag.toString('base64'), enc.toString('base64')].join(':');
}

export function decryptString(envelope) {
  const [ivB64, tagB64, encB64] = String(envelope).split(':');
  if (!ivB64 || !tagB64 || !encB64) throw new Error('Malformed ciphertext');
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const enc = Buffer.from(encB64, 'base64');
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return dec.toString('utf8');
}
