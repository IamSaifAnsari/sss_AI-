import { Router } from 'express';
import crypto from 'node:crypto';
import { db, uuid } from '../db.js';
import { requireAuth } from '../auth.js';
import { encryptString } from '../crypto.js';
import { logger } from '../logger.js';

const router = Router();

const PROVIDERS = {
  slack: {
    authUrl: 'https://slack.com/oauth/v2/authorize',
    tokenUrl: 'https://slack.com/api/oauth.v2.access',
    clientId: () => process.env.SLACK_CLIENT_ID,
    clientSecret: () => process.env.SLACK_CLIENT_SECRET,
    scopes: 'chat:write,channels:read,users:read',
    userScopes: '',
    extractAccount: (data) => ({ id: data.team?.id, name: data.team?.name, raw: data }),
    parseTokenResponse: (j) => ({ access_token: j.access_token, refresh_token: null, expires_in: null, scopes: j.scope }),
  },
  github: {
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    clientId: () => process.env.GITHUB_CLIENT_ID,
    clientSecret: () => process.env.GITHUB_CLIENT_SECRET,
    scopes: 'repo,user',
    extractAccount: async (data, token) => {
      const r = await fetch('https://api.github.com/user', { headers: { 'Authorization': `Bearer ${token}`, 'User-Agent': 'NeuronStack' } });
      const j = await r.json();
      return { id: String(j.id), name: j.login || j.name };
    },
    parseTokenResponse: (j) => ({ access_token: j.access_token, refresh_token: null, expires_in: null, scopes: j.scope }),
  },
  stripe: {
    authUrl: 'https://connect.stripe.com/oauth/authorize',
    tokenUrl: 'https://connect.stripe.com/oauth/token',
    clientId: () => process.env.STRIPE_CONNECT_CLIENT_ID,
    clientSecret: () => process.env.STRIPE_SECRET_KEY,
    scopes: 'read_write',
    extractAccount: (data) => ({ id: data.stripe_user_id, name: data.stripe_user_id }),
    parseTokenResponse: (j) => ({ access_token: j.access_token, refresh_token: j.refresh_token, expires_in: null, scopes: j.scope }),
  },
};

const getBaseUrl = (req) => {
  const proto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
};

router.get('/connections', requireAuth, (req, res) => {
  const wsId = req.headers['x-workspace-id'] || req.query.workspace_id;
  if (!wsId) return res.status(400).json({ error: 'Workspace id required' });
  const member = db.prepare('SELECT 1 FROM workspace_members WHERE workspace_id = ? AND user_id = ?').get(wsId, req.user.id);
  if (!member) return res.status(403).json({ error: 'Not a member' });
  const rows = db.prepare(
    'SELECT id, provider, account_id, account_name, scopes, expires_at, created_at FROM oauth_connections WHERE workspace_id = ?'
  ).all(wsId);
  res.json({ connections: rows });
});

router.delete('/connections/:id', requireAuth, (req, res) => {
  const row = db.prepare('SELECT workspace_id FROM oauth_connections WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  const member = db.prepare("SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?").get(row.workspace_id, req.user.id);
  if (!member || !['owner', 'admin'].includes(member.role)) return res.status(403).json({ error: 'Owner/admin required' });
  db.prepare('DELETE FROM oauth_connections WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

router.get('/:provider/start', requireAuth, (req, res) => {
  const provider = req.params.provider;
  const cfg = PROVIDERS[provider];
  if (!cfg) return res.status(404).json({ error: 'Unknown provider' });
  if (!cfg.clientId() || !cfg.clientSecret()) {
    return res.status(412).json({ error: `${provider} OAuth not configured. Set ${provider.toUpperCase()}_CLIENT_ID and ${provider.toUpperCase()}_CLIENT_SECRET in .env` });
  }
  const wsId = req.query.workspace_id;
  if (!wsId) return res.status(400).json({ error: 'workspace_id required' });
  const member = db.prepare("SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?").get(wsId, req.user.id);
  if (!member || !['owner', 'admin'].includes(member.role)) return res.status(403).json({ error: 'Owner/admin required' });

  const state = crypto.randomBytes(24).toString('base64url');
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);
  db.prepare('INSERT INTO oauth_states (state, workspace_id, provider, user_id, expires_at) VALUES (?, ?, ?, ?, ?)').run(state, wsId, provider, req.user.id, expiresAt);

  const redirectUri = `${getBaseUrl(req)}/api/oauth/${provider}/callback`;
  const params = new URLSearchParams({
    client_id: cfg.clientId(),
    redirect_uri: redirectUri,
    state,
    scope: cfg.scopes,
    response_type: 'code',
  });
  res.json({ auth_url: `${cfg.authUrl}?${params.toString()}` });
});

router.get('/:provider/callback', async (req, res) => {
  const provider = req.params.provider;
  const cfg = PROVIDERS[provider];
  if (!cfg) return res.status(404).send('Unknown provider');
  const { code, state, error } = req.query;
  if (error) return res.redirect(`/integrations?oauth_error=${encodeURIComponent(error)}`);
  if (!code || !state) return res.status(400).send('Missing code or state');

  const stateRow = db.prepare("SELECT * FROM oauth_states WHERE state = ? AND expires_at > datetime('now')").get(state);
  if (!stateRow || stateRow.provider !== provider) return res.status(400).send('Invalid state');
  db.prepare('DELETE FROM oauth_states WHERE state = ?').run(state);

  const redirectUri = `${getBaseUrl(req)}/api/oauth/${provider}/callback`;
  try {
    const body = new URLSearchParams({
      client_id: cfg.clientId(),
      client_secret: cfg.clientSecret(),
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });
    const r = await fetch(cfg.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
      body,
    });
    const j = await r.json();
    if (!r.ok || j.error) throw new Error(j.error_description || j.error || `Token exchange failed (${r.status})`);
    const parsed = cfg.parseTokenResponse(j);
    const account = await cfg.extractAccount(j, parsed.access_token);
    const expiresAt = parsed.expires_in ? new Date(Date.now() + parsed.expires_in * 1000).toISOString().replace('T', ' ').slice(0, 19) : null;
    db.prepare(
      'INSERT OR REPLACE INTO oauth_connections (id, workspace_id, provider, account_id, account_name, access_token, refresh_token, scopes, expires_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(uuid(), stateRow.workspace_id, provider, account.id || null, account.name || null, encryptString(parsed.access_token), parsed.refresh_token ? encryptString(parsed.refresh_token) : null, parsed.scopes || null, expiresAt, stateRow.user_id);
    logger.info('oauth', `Connected ${provider} (${account.name})`, { workspaceId: stateRow.workspace_id, userId: stateRow.user_id });
    res.redirect(`/integrations?oauth_success=${provider}`);
  } catch (err) {
    logger.error('oauth', `${provider} callback failed: ${err.message}`);
    res.redirect(`/integrations?oauth_error=${encodeURIComponent(err.message)}`);
  }
});

export default router;
