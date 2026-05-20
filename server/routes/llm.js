import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { requireWorkspace } from '../workspace.js';
import { getProviderKey } from './providers.js';
import { logger } from '../logger.js';

const router = Router();

// Map UI model id → { provider, providerModel }
const MODEL_MAP = {
  'gpt-4o': { provider: 'openai', providerModel: 'gpt-4o' },
  'gpt-4o-mini': { provider: 'openai', providerModel: 'gpt-4o-mini' },
  'claude-3.5-sonnet': { provider: 'anthropic', providerModel: 'claude-3-5-sonnet-20241022' },
  'claude-3.5': { provider: 'anthropic', providerModel: 'claude-3-5-sonnet-20241022' },
};

router.post('/chat/stream', requireAuth, requireWorkspace, async (req, res) => {
  const { model, messages, systemPrompt, temperature = 0.7, maxTokens = 1024 } = req.body || {};
  const mapping = MODEL_MAP[model];
  if (!mapping) return res.status(400).json({ error: `Unsupported model: ${model}` });
  const apiKey = getProviderKey(req.workspace.id, mapping.provider);
  if (!apiKey) {
    return res.status(412).json({ error: `No ${mapping.provider} API key configured. Add one in Settings → Provider Keys.` });
  }
  if (!Array.isArray(messages) || messages.length === 0) return res.status(400).json({ error: 'messages required' });

  // SSE response
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const send = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const startedAt = Date.now();
  let totalTokensIn = 0;
  let totalTokensOut = 0;

  try {
    if (mapping.provider === 'openai') {
      const chatMessages = [];
      if (systemPrompt) chatMessages.push({ role: 'system', content: systemPrompt });
      chatMessages.push(...messages);

      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: mapping.providerModel,
          messages: chatMessages,
          stream: true,
          temperature,
          max_tokens: maxTokens,
        }),
      });
      if (!r.ok || !r.body) {
        const text = await r.text().catch(() => '');
        throw new Error(`OpenAI error ${r.status}: ${text.slice(0, 200)}`);
      }
      const reader = r.body.getReader();
      const dec = new TextDecoder();
      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += dec.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') continue;
          try {
            const obj = JSON.parse(payload);
            const delta = obj.choices?.[0]?.delta?.content;
            if (delta) { totalTokensOut += Math.ceil(delta.length / 4); send('delta', { text: delta }); }
            if (obj.usage) {
              totalTokensIn = obj.usage.prompt_tokens || totalTokensIn;
              totalTokensOut = obj.usage.completion_tokens || totalTokensOut;
            }
          } catch { /* ignore parse errors mid-chunk */ }
        }
      }
    } else if (mapping.provider === 'anthropic') {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: mapping.providerModel,
          system: systemPrompt || undefined,
          messages: messages.filter((m) => m.role !== 'system'),
          stream: true,
          temperature,
          max_tokens: maxTokens,
        }),
      });
      if (!r.ok || !r.body) {
        const text = await r.text().catch(() => '');
        throw new Error(`Anthropic error ${r.status}: ${text.slice(0, 200)}`);
      }
      const reader = r.body.getReader();
      const dec = new TextDecoder();
      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += dec.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (!payload) continue;
          try {
            const obj = JSON.parse(payload);
            if (obj.type === 'content_block_delta' && obj.delta?.text) {
              totalTokensOut += Math.ceil(obj.delta.text.length / 4);
              send('delta', { text: obj.delta.text });
            }
            if (obj.type === 'message_delta' && obj.usage) {
              totalTokensOut = obj.usage.output_tokens || totalTokensOut;
            }
            if (obj.type === 'message_start' && obj.message?.usage) {
              totalTokensIn = obj.message.usage.input_tokens || 0;
            }
          } catch { /* noop */ }
        }
      }
    } else {
      throw new Error(`Provider ${mapping.provider} streaming not implemented yet`);
    }

    const durationMs = Date.now() - startedAt;
    db.prepare(
      'INSERT INTO usage_events (workspace_id, user_id, kind, model, tokens_in, tokens_out) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(req.workspace.id, req.user.id, 'chat', model, totalTokensIn, totalTokensOut);
    logger.info('llm', `Chat completion (${model}) in:${totalTokensIn} out:${totalTokensOut} ${durationMs}ms`, { workspaceId: req.workspace.id, userId: req.user.id });

    send('done', { tokens_in: totalTokensIn, tokens_out: totalTokensOut, duration_ms: durationMs });
    res.end();
  } catch (err) {
    logger.error('llm', err.message, { workspaceId: req.workspace.id, userId: req.user.id });
    try { send('error', { error: err.message }); } catch { /* noop */ }
    res.end();
  }
});

export default router;
