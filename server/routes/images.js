import { Router } from 'express';
import { db, uuid } from '../db.js';
import { requireAuth } from '../auth.js';
import { requireWorkspace } from '../workspace.js';
import { getProviderKey } from './providers.js';
import { saveBlobFromUrl } from '../storage.js';
import { logger } from '../logger.js';

const router = Router();

// model id → { provider, providerModel, params builder }
const MODELS = {
  'sdxl': { provider: 'replicate', model: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b' },
  'sdxl-lightning': { provider: 'replicate', model: 'bytedance/sdxl-lightning-4step:5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637' },
  'flux-schnell': { provider: 'replicate', model: 'black-forest-labs/flux-schnell' },
  'flux-dev': { provider: 'replicate', model: 'black-forest-labs/flux-dev' },
  'dall-e-3': { provider: 'openai', model: 'dall-e-3' },
};

router.get('/', requireAuth, requireWorkspace, (req, res) => {
  const rows = db.prepare(
    'SELECT * FROM image_generations WHERE workspace_id = ? ORDER BY created_at DESC LIMIT 100'
  ).all(req.workspace.id);
  res.json({ images: rows });
});

router.post('/', requireAuth, requireWorkspace, async (req, res) => {
  const { prompt, model = 'flux-schnell', size = '1024x1024' } = req.body || {};
  if (!prompt || typeof prompt !== 'string') return res.status(400).json({ error: 'prompt required' });
  const cfg = MODELS[model];
  if (!cfg) return res.status(400).json({ error: `Unsupported model: ${model}` });
  const apiKey = getProviderKey(req.workspace.id, cfg.provider);
  if (!apiKey) return res.status(412).json({ error: `Add a ${cfg.provider} API key in Settings → Provider Keys` });

  const id = uuid();
  db.prepare(
    'INSERT INTO image_generations (id, workspace_id, prompt, model, provider, size, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(id, req.workspace.id, prompt, model, cfg.provider, size, 'processing', req.user.id);
  logger.info('image', `Submit ${model}: "${prompt.slice(0, 80)}"`, { workspaceId: req.workspace.id, userId: req.user.id });

  const startedAt = Date.now();
  // Fire-and-forget worker
  (async () => {
    try {
      let resultUrl = null;
      if (cfg.provider === 'replicate') {
        resultUrl = await runReplicate(apiKey, cfg.model, { prompt, width: parseSize(size, 'w'), height: parseSize(size, 'h') });
      } else if (cfg.provider === 'openai') {
        resultUrl = await runOpenAIImage(apiKey, cfg.model, prompt, size);
      }
      if (!resultUrl) throw new Error('Provider returned no image');
      const saved = await saveBlobFromUrl(resultUrl, 'png', 'images');
      const duration = Date.now() - startedAt;
      db.prepare('UPDATE image_generations SET status = ?, image_url = ?, duration_ms = ? WHERE id = ?').run('succeeded', saved.publicUrl, duration, id);
      logger.info('image', `Image ${id} succeeded in ${duration}ms`, { workspaceId: req.workspace.id });
    } catch (err) {
      const duration = Date.now() - startedAt;
      db.prepare('UPDATE image_generations SET status = ?, error = ?, duration_ms = ? WHERE id = ?').run('failed', String(err.message || err).slice(0, 500), duration, id);
      logger.error('image', `Image ${id} failed: ${err.message}`, { workspaceId: req.workspace.id });
    }
  })();

  res.json({ id, status: 'processing' });
});

router.get('/:id', requireAuth, requireWorkspace, (req, res) => {
  const row = db.prepare('SELECT * FROM image_generations WHERE id = ? AND workspace_id = ?').get(req.params.id, req.workspace.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json({ image: row });
});

router.delete('/:id', requireAuth, requireWorkspace, (req, res) => {
  const r = db.prepare('DELETE FROM image_generations WHERE id = ? AND workspace_id = ?').run(req.params.id, req.workspace.id);
  if (r.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

function parseSize(size, axis) {
  const [w, h] = String(size).split('x').map(Number);
  return axis === 'w' ? (w || 1024) : (h || 1024);
}

async function runReplicate(apiKey, modelRef, input) {
  // Replicate "models/{owner}/{name}" endpoint accepts plain model id (with optional :version).
  const colonIdx = modelRef.indexOf(':');
  let endpoint;
  let body;
  if (colonIdx >= 0) {
    // Pinned version
    const version = modelRef.slice(colonIdx + 1);
    endpoint = 'https://api.replicate.com/v1/predictions';
    body = { version, input };
  } else {
    // Latest version of named model
    endpoint = `https://api.replicate.com/v1/models/${modelRef}/predictions`;
    body = { input };
  }
  const r = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, 'Prefer': 'wait=60' },
    body: JSON.stringify(body),
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Replicate ${r.status}: ${json.detail || JSON.stringify(json).slice(0, 200)}`);
  let prediction = json;

  // Poll if still running.
  const startedAt = Date.now();
  while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && prediction.status !== 'canceled') {
    if (Date.now() - startedAt > 180000) throw new Error('Replicate poll timeout');
    await new Promise((r) => setTimeout(r, 1500));
    const pr = await fetch(prediction.urls.get, { headers: { 'Authorization': `Bearer ${apiKey}` } });
    prediction = await pr.json();
  }
  if (prediction.status !== 'succeeded') throw new Error(`Replicate ${prediction.status}: ${prediction.error || 'unknown'}`);
  const out = prediction.output;
  if (Array.isArray(out)) return out[0];
  if (typeof out === 'string') return out;
  if (out?.url) return out.url;
  throw new Error('Replicate returned unexpected output shape');
}

async function runOpenAIImage(apiKey, model, prompt, size) {
  const r = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model, prompt, n: 1, size: normalizeOpenAISize(size), response_format: 'url' }),
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`OpenAI ${r.status}: ${json.error?.message || JSON.stringify(json).slice(0, 200)}`);
  return json.data?.[0]?.url;
}

function normalizeOpenAISize(s) {
  // DALL-E 3 only accepts 1024x1024, 1792x1024, 1024x1792.
  if (s === '1024x1024' || s === '1792x1024' || s === '1024x1792') return s;
  return '1024x1024';
}

export default router;
