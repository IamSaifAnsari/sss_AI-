import { Router } from 'express';
import { db, uuid } from '../db.js';
import { requireAuth } from '../auth.js';
import { requireWorkspace } from '../workspace.js';
import { getProviderKey } from './providers.js';
import { saveBlobFromUrl } from '../storage.js';
import { logger } from '../logger.js';

const router = Router();

// Text-to-video models on Replicate. These cost real $ per second of video.
const MODELS = {
  'zeroscope-v2': { provider: 'replicate', model: 'anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351' },
  'animatediff': { provider: 'replicate', model: 'zsxkib/animate-diff:269a616c8b0c2bbc12fc15fd51bb202b11e94ff0f7786c026aa905305c4ed9fb' },
  'luma-dream-machine': { provider: 'replicate', model: 'lucataco/dream-machine' },
};

router.get('/', requireAuth, requireWorkspace, (req, res) => {
  const rows = db.prepare(
    'SELECT * FROM video_generations WHERE workspace_id = ? ORDER BY created_at DESC LIMIT 50'
  ).all(req.workspace.id);
  res.json({ videos: rows });
});

router.post('/', requireAuth, requireWorkspace, async (req, res) => {
  const { prompt, model = 'zeroscope-v2' } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'prompt required' });
  const cfg = MODELS[model];
  if (!cfg) return res.status(400).json({ error: `Unsupported model: ${model}` });
  const apiKey = getProviderKey(req.workspace.id, cfg.provider);
  if (!apiKey) return res.status(412).json({ error: `Add a ${cfg.provider} API key in Settings → Provider Keys` });

  const id = uuid();
  db.prepare(
    'INSERT INTO video_generations (id, workspace_id, prompt, model, provider, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(id, req.workspace.id, prompt, model, cfg.provider, 'processing', req.user.id);
  logger.info('video', `Submit ${model}: "${prompt.slice(0, 80)}"`, { workspaceId: req.workspace.id, userId: req.user.id });

  const startedAt = Date.now();
  (async () => {
    try {
      const url = await runReplicate(apiKey, cfg.model, { prompt });
      const saved = await saveBlobFromUrl(url, 'mp4', 'videos');
      const duration = Date.now() - startedAt;
      db.prepare('UPDATE video_generations SET status = ?, video_url = ?, duration_ms = ? WHERE id = ?').run('succeeded', saved.publicUrl, duration, id);
      logger.info('video', `Video ${id} succeeded in ${duration}ms`, { workspaceId: req.workspace.id });
    } catch (err) {
      const duration = Date.now() - startedAt;
      db.prepare('UPDATE video_generations SET status = ?, error = ?, duration_ms = ? WHERE id = ?').run('failed', String(err.message || err).slice(0, 500), duration, id);
      logger.error('video', `Video ${id} failed: ${err.message}`, { workspaceId: req.workspace.id });
    }
  })();

  res.json({ id, status: 'processing' });
});

router.delete('/:id', requireAuth, requireWorkspace, (req, res) => {
  const r = db.prepare('DELETE FROM video_generations WHERE id = ? AND workspace_id = ?').run(req.params.id, req.workspace.id);
  if (r.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

async function runReplicate(apiKey, modelRef, input) {
  const colonIdx = modelRef.indexOf(':');
  let endpoint, body;
  if (colonIdx >= 0) {
    endpoint = 'https://api.replicate.com/v1/predictions';
    body = { version: modelRef.slice(colonIdx + 1), input };
  } else {
    endpoint = `https://api.replicate.com/v1/models/${modelRef}/predictions`;
    body = { input };
  }
  const r = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Replicate ${r.status}: ${json.detail || JSON.stringify(json).slice(0, 200)}`);
  let prediction = json;
  const startedAt = Date.now();
  while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && prediction.status !== 'canceled') {
    if (Date.now() - startedAt > 600000) throw new Error('Replicate poll timeout (10min)');
    await new Promise((r) => setTimeout(r, 3000));
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

export default router;
