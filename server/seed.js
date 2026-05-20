import crypto from 'node:crypto';
import { db, uuid } from './db.js';
import { hashPassword } from './auth.js';
import { createPersonalWorkspace } from './workspace.js';

const DEMO_EMAIL = (process.env.DEMO_ADMIN_EMAIL || 'admin@neuronstack.local').trim().toLowerCase();
const DEMO_PASSWORD = process.env.DEMO_ADMIN_PASSWORD || 'admin1234';
const DEMO_WORKSPACE = process.env.DEMO_ADMIN_WORKSPACE || 'Demo Workspace';

const SAMPLE_KEYS = [
  { name: 'Production API', env: 'production', permissions: ['All Models', 'Voice AI', 'Workflows'] },
  { name: 'Staging API', env: 'staging', permissions: ['All Models', 'Voice AI'] },
  { name: 'Mobile App', env: 'production', permissions: ['GPT-4o', 'Claude 3.5'] },
];

const SAMPLE_AGENTS = [
  { name: 'SalesBot Pro', desc: 'Handles lead qualification and follow-ups', model: 'gpt-4o', tools: ['crm', 'email', 'calendar'] },
  { name: 'Support Agent', desc: 'Customer support with knowledge base', model: 'claude-3.5', tools: ['knowledge', 'slack'] },
  { name: 'Data Analyst', desc: 'Automated data analysis and reporting', model: 'gpt-4o', tools: ['sql', 'sheets'] },
];

const SAMPLE_WORKFLOWS = [
  { name: 'Lead Qualification Pipeline', trigger: 'Webhook' },
  { name: 'Customer Onboarding', trigger: 'Stripe Event' },
  { name: 'Support Ticket Router', trigger: 'Email' },
  { name: 'Content Publishing', trigger: 'Schedule' },
];

const SAMPLE_DEPLOYMENTS = [
  { name: 'prod-api-v2', env: 'production', model: 'GPT-4o + Claude 3.5', region: 'us-east-1', status: 'active', uptime: '99.99%' },
  { name: 'staging-api', env: 'staging', model: 'GPT-4o Mini', region: 'us-west-2', status: 'active', uptime: '99.95%' },
  { name: 'voice-service', env: 'production', model: 'Whisper + TTS', region: 'eu-west-1', status: 'active', uptime: '99.97%' },
];

const seedSampleKeys = (wsId, userId) => {
  const existing = db.prepare('SELECT COUNT(*) AS n FROM api_keys WHERE workspace_id = ?').get(wsId);
  if (existing.n > 0) return;
  const insert = db.prepare(
    'INSERT INTO api_keys (id, workspace_id, name, key_hash, prefix, last_four, env, permissions, rate_limit, created_by) ' +
    'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const tx = db.transaction(() => {
    for (const k of SAMPLE_KEYS) {
      const prefix = 'pk_' + (k.env === 'production' ? 'live' : 'test');
      const secret = crypto.randomBytes(24).toString('hex');
      const full = `${prefix}_${secret}`;
      insert.run(
        uuid(), wsId, k.name,
        crypto.createHash('sha256').update(full).digest('hex'),
        prefix, secret.slice(-4),
        k.env, JSON.stringify(k.permissions), 1000, userId
      );
    }
  });
  tx();
};

const seedSampleAgents = (wsId, userId) => {
  const existing = db.prepare('SELECT COUNT(*) AS n FROM agents WHERE workspace_id = ?').get(wsId);
  if (existing.n > 0) return;
  const insert = db.prepare(
    'INSERT INTO agents (id, workspace_id, name, description, model, system_prompt, tools, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const tx = db.transaction(() => {
    for (const a of SAMPLE_AGENTS) {
      insert.run(uuid(), wsId, a.name, a.desc, a.model, 'You are a helpful AI assistant.', JSON.stringify(a.tools), userId);
    }
  });
  tx();
};

const seedSampleWorkflows = (wsId, userId) => {
  const existing = db.prepare('SELECT COUNT(*) AS n FROM workflows WHERE workspace_id = ?').get(wsId);
  if (existing.n > 0) return;
  const insert = db.prepare('INSERT INTO workflows (id, workspace_id, name, trigger, runs, success, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const tx = db.transaction(() => {
    for (const w of SAMPLE_WORKFLOWS) {
      insert.run(uuid(), wsId, w.name, w.trigger, Math.floor(Math.random() * 5000), 95 + Math.random() * 5, userId);
    }
  });
  tx();
};

const seedSampleDeployments = (wsId, userId) => {
  const existing = db.prepare('SELECT COUNT(*) AS n FROM deployments WHERE workspace_id = ?').get(wsId);
  if (existing.n > 0) return;
  const insert = db.prepare(
    'INSERT INTO deployments (id, workspace_id, name, env, model, region, status, uptime, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const tx = db.transaction(() => {
    for (const d of SAMPLE_DEPLOYMENTS) {
      insert.run(uuid(), wsId, d.name, d.env, d.model, d.region, d.status, d.uptime, userId);
    }
  });
  tx();
};

export const seedDemoAdmin = () => {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(DEMO_EMAIL);
  let userId = existing?.id;
  let created = false;

  if (!userId) {
    userId = uuid();
    db.prepare(
      'INSERT INTO users (id, email, password_hash, first_name, last_name, onboarded, onboarding_data) VALUES (?, ?, ?, ?, ?, 1, ?)'
    ).run(
      userId, DEMO_EMAIL, hashPassword(DEMO_PASSWORD), 'Demo', 'Admin',
      JSON.stringify({ workspaceName: DEMO_WORKSPACE, selectedModels: ['gpt-4o', 'claude-3.5'], useCase: 'all' })
    );
    createPersonalWorkspace(userId, DEMO_WORKSPACE);
    created = true;
  }

  // Find first workspace for this user, seed samples.
  const ws = db.prepare(
    'SELECT workspace_id FROM workspace_members WHERE user_id = ? ORDER BY joined_at LIMIT 1'
  ).get(userId);
  if (ws?.workspace_id) {
    seedSampleKeys(ws.workspace_id, userId);
    seedSampleAgents(ws.workspace_id, userId);
    seedSampleWorkflows(ws.workspace_id, userId);
    seedSampleDeployments(ws.workspace_id, userId);
  }

  if (created) {
    console.log('[seed] Demo admin created');
  } else {
    console.log('[seed] Demo admin already exists');
  }
  console.log(`[seed]   email:    ${DEMO_EMAIL}`);
  console.log(`[seed]   password: ${DEMO_PASSWORD}`);
};
