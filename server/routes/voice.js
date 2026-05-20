import { Router } from 'express';
import { db, uuid } from '../db.js';
import { requireAuth } from '../auth.js';
import { requireWorkspace } from '../workspace.js';
import { getProviderKey } from './providers.js';
import { saveBlobFromBuffer } from '../storage.js';
import { logger } from '../logger.js';
import { decryptString } from '../crypto.js';

const router = Router();

// Curated voice list for ElevenLabs. Users can override voice_id directly.
const ELEVENLABS_VOICES = {
  'Rachel': '21m00Tcm4TlvDq8ikWAM',
  'Domi': 'AZnzlk1XvdvUeBnXmlld',
  'Bella': 'EXAVITQu4vr4xnSDxMaL',
  'Adam': 'pNInz6obpgDQGcFmaJgB',
  'Sam': 'yoZ06aMxZJJ28mfd3POQ',
};

// ────── ElevenLabs TTS ──────
router.post('/tts', requireAuth, requireWorkspace, async (req, res) => {
  const { text, voice = 'Rachel', voiceId } = req.body || {};
  if (!text || typeof text !== 'string') return res.status(400).json({ error: 'text required' });
  if (text.length > 5000) return res.status(400).json({ error: 'text too long (max 5000)' });
  const apiKey = getProviderKey(req.workspace.id, 'elevenlabs');
  if (!apiKey) return res.status(412).json({ error: 'Add an ElevenLabs API key in Settings → Provider Keys' });
  const id = ELEVENLABS_VOICES[voice] || voiceId || ELEVENLABS_VOICES.Rachel;
  const jobId = uuid();
  db.prepare('INSERT INTO voice_tts_jobs (id, workspace_id, text, voice_id, status, created_by) VALUES (?, ?, ?, ?, ?, ?)')
    .run(jobId, req.workspace.id, text, id, 'processing', req.user.id);
  try {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'xi-api-key': apiKey, 'Accept': 'audio/mpeg' },
      body: JSON.stringify({ text, model_id: 'eleven_turbo_v2_5', voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
    });
    if (!r.ok) {
      const errText = await r.text().catch(() => '');
      throw new Error(`ElevenLabs ${r.status}: ${errText.slice(0, 200)}`);
    }
    const buf = Buffer.from(await r.arrayBuffer());
    const saved = await saveBlobFromBuffer(buf, 'mp3', 'audio');
    db.prepare('UPDATE voice_tts_jobs SET status = ?, audio_path = ? WHERE id = ?').run('succeeded', saved.publicUrl, jobId);
    logger.info('voice', `TTS ${jobId} succeeded (${buf.length} bytes)`, { workspaceId: req.workspace.id });
    res.json({ id: jobId, audio_url: saved.publicUrl });
  } catch (err) {
    db.prepare('UPDATE voice_tts_jobs SET status = ?, error = ? WHERE id = ?').run('failed', String(err.message).slice(0, 500), jobId);
    logger.error('voice', `TTS ${jobId} failed: ${err.message}`, { workspaceId: req.workspace.id });
    res.status(500).json({ error: err.message });
  }
});

// ────── Deepgram STT ──────
// Client uploads audio as raw bytes (multipart not needed, we accept octet-stream).
router.post('/stt', requireAuth, requireWorkspace, async (req, res) => {
  const apiKey = getProviderKey(req.workspace.id, 'deepgram');
  if (!apiKey) return res.status(412).json({ error: 'Add a Deepgram API key in Settings → Provider Keys' });
  const { audio_base64, mime } = req.body || {};
  if (!audio_base64) return res.status(400).json({ error: 'audio_base64 required' });
  const buf = Buffer.from(audio_base64, 'base64');
  try {
    const r = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true', {
      method: 'POST',
      headers: { 'Content-Type': mime || 'audio/wav', 'Authorization': `Token ${apiKey}` },
      body: buf,
    });
    const json = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`Deepgram ${r.status}: ${JSON.stringify(json).slice(0, 200)}`);
    const transcript = json.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
    const confidence = json.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0;
    logger.info('voice', `STT transcribed ${transcript.length} chars`, { workspaceId: req.workspace.id });
    res.json({ transcript, confidence });
  } catch (err) {
    logger.error('voice', `STT failed: ${err.message}`, { workspaceId: req.workspace.id });
    res.status(500).json({ error: err.message });
  }
});

// ────── Twilio outbound call ──────
// twilio provider key stored as JSON {sid, token, from}
router.post('/call', requireAuth, requireWorkspace, async (req, res) => {
  const { to, message } = req.body || {};
  if (!to || !message) return res.status(400).json({ error: 'to + message required' });
  if (!/^\+\d{6,15}$/.test(to)) return res.status(400).json({ error: 'to must be E.164 format (+15551234567)' });
  const raw = getProviderKey(req.workspace.id, 'twilio');
  if (!raw) return res.status(412).json({ error: 'Add Twilio credentials in Settings → Provider Keys (JSON: {sid, token, from})' });
  let creds;
  try { creds = JSON.parse(raw); }
  catch { return res.status(400).json({ error: 'Twilio key must be JSON {sid, token, from}' }); }
  if (!creds.sid || !creds.token || !creds.from) return res.status(400).json({ error: 'Twilio JSON needs sid, token, from' });

  // TwiML inline: speak the message. For full conversational voice agents you'd point twiml.Url at a public webhook on this server.
  const twiml = `<Response><Say voice="Polly.Joanna">${escapeXml(message)}</Say></Response>`;
  const body = new URLSearchParams({ To: to, From: creds.from, Twiml: twiml });
  const auth = Buffer.from(`${creds.sid}:${creds.token}`).toString('base64');
  try {
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${creds.sid}/Calls.json`, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const json = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`Twilio ${r.status}: ${json.message || JSON.stringify(json).slice(0, 200)}`);
    const callId = uuid();
    db.prepare(
      'INSERT INTO voice_calls (id, workspace_id, twilio_sid, direction, from_number, to_number, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(callId, req.workspace.id, json.sid || null, 'outbound', creds.from, to, json.status || 'queued', req.user.id);
    logger.info('voice', `Call queued to ${to} (sid: ${json.sid})`, { workspaceId: req.workspace.id });
    res.json({ id: callId, twilio_sid: json.sid, status: json.status });
  } catch (err) {
    logger.error('voice', `Call failed: ${err.message}`, { workspaceId: req.workspace.id });
    res.status(500).json({ error: err.message });
  }
});

router.get('/calls', requireAuth, requireWorkspace, (req, res) => {
  const rows = db.prepare('SELECT * FROM voice_calls WHERE workspace_id = ? ORDER BY created_at DESC LIMIT 50').all(req.workspace.id);
  res.json({ calls: rows });
});

router.get('/voices', requireAuth, (_req, res) => {
  res.json({ voices: Object.entries(ELEVENLABS_VOICES).map(([name, id]) => ({ name, id })) });
});

function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
}

export default router;
