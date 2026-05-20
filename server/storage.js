import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const STORAGE_ROOT = process.env.STORAGE_PATH || './data/storage';

export async function saveBlobFromUrl(url, ext = 'bin', subdir = 'media') {
  const dir = path.join(STORAGE_ROOT, subdir);
  await fs.mkdir(dir, { recursive: true });
  const id = crypto.randomBytes(12).toString('hex');
  const filename = `${id}.${ext}`;
  const filePath = path.join(dir, filename);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(filePath, buf);
  return { path: filePath, publicUrl: `/api/storage/${subdir}/${filename}` };
}

export async function saveBlobFromBuffer(buffer, ext = 'bin', subdir = 'media') {
  const dir = path.join(STORAGE_ROOT, subdir);
  await fs.mkdir(dir, { recursive: true });
  const id = crypto.randomBytes(12).toString('hex');
  const filename = `${id}.${ext}`;
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, buffer);
  return { path: filePath, publicUrl: `/api/storage/${subdir}/${filename}` };
}

export function getStorageRoot() {
  return path.resolve(STORAGE_ROOT);
}
