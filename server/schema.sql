-- NeuronStack AI — SQLite schema.
-- Applied automatically by server/db.js on first run via better-sqlite3.

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  first_name    TEXT,
  last_name     TEXT,
  timezone      TEXT DEFAULT 'America/New_York (EST)',
  avatar_url    TEXT,
  onboarded     INTEGER NOT NULL DEFAULT 0,
  onboarding_data TEXT NOT NULL DEFAULT '{}',
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS workspaces (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  plan        TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro','enterprise')),
  credits     INTEGER NOT NULL DEFAULT 1000,
  created_by  TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS workspace_members (
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role         TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner','admin','developer','viewer')),
  joined_at    TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (workspace_id, user_id)
);

CREATE TABLE IF NOT EXISTS api_keys (
  id           TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  key_hash     TEXT NOT NULL,
  prefix       TEXT NOT NULL,
  last_four    TEXT NOT NULL,
  env          TEXT NOT NULL DEFAULT 'production' CHECK (env IN ('production','staging','development')),
  permissions  TEXT NOT NULL DEFAULT '[]',
  rate_limit   INTEGER NOT NULL DEFAULT 1000,
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked')),
  requests     INTEGER NOT NULL DEFAULT 0,
  last_used_at TEXT,
  created_by   TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS agents (
  id            TEXT PRIMARY KEY,
  workspace_id  TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  model         TEXT NOT NULL DEFAULT 'gpt-4o',
  system_prompt TEXT NOT NULL DEFAULT '',
  tools         TEXT NOT NULL DEFAULT '[]',
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','draft')),
  calls         INTEGER NOT NULL DEFAULT 0,
  success_rate  REAL NOT NULL DEFAULT 0,
  created_by    TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_settings (
  user_id             TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  tweaks              TEXT NOT NULL DEFAULT '{}',
  active_workspace_id TEXT REFERENCES workspaces(id) ON DELETE SET NULL,
  updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS usage_events (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id      TEXT REFERENCES users(id) ON DELETE SET NULL,
  kind         TEXT NOT NULL,
  model        TEXT,
  tokens_in    INTEGER DEFAULT 0,
  tokens_out   INTEGER DEFAULT 0,
  cost_cents   INTEGER DEFAULT 0,
  occurred_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS workflows (
  id            TEXT PRIMARY KEY,
  workspace_id  TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  trigger       TEXT NOT NULL DEFAULT 'Webhook',
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','draft')),
  steps         TEXT NOT NULL DEFAULT '[]',
  runs          INTEGER NOT NULL DEFAULT 0,
  success       REAL NOT NULL DEFAULT 100,
  last_run_at   TEXT,
  created_by    TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS workflow_runs (
  id           TEXT PRIMARY KEY,
  workflow_id  TEXT NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  status       TEXT NOT NULL CHECK (status IN ('success','error','running')),
  steps_done   INTEGER NOT NULL DEFAULT 0,
  steps_total  INTEGER NOT NULL DEFAULT 0,
  duration_ms  INTEGER NOT NULL DEFAULT 0,
  started_at   TEXT NOT NULL DEFAULT (datetime('now')),
  finished_at  TEXT
);

CREATE TABLE IF NOT EXISTS deployments (
  id           TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  env          TEXT NOT NULL DEFAULT 'production' CHECK (env IN ('production','staging','development')),
  model        TEXT NOT NULL DEFAULT '',
  region       TEXT NOT NULL DEFAULT 'us-east-1',
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','deploying','failed','paused')),
  uptime       TEXT NOT NULL DEFAULT '100%',
  created_by   TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS invitations (
  id            TEXT PRIMARY KEY,
  workspace_id  TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email         TEXT NOT NULL COLLATE NOCASE,
  role          TEXT NOT NULL DEFAULT 'developer' CHECK (role IN ('admin','developer','viewer')),
  token         TEXT NOT NULL UNIQUE,
  invited_by    TEXT REFERENCES users(id) ON DELETE SET NULL,
  accepted_at   TEXT,
  expires_at    TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS provider_keys (
  id            TEXT PRIMARY KEY,
  workspace_id  TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  provider      TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  label         TEXT,
  created_by    TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (workspace_id, provider)
);

CREATE TABLE IF NOT EXISTS image_generations (
  id           TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  prompt       TEXT NOT NULL,
  model        TEXT NOT NULL,
  provider     TEXT NOT NULL,
  size         TEXT,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','succeeded','failed')),
  image_url    TEXT,
  error        TEXT,
  duration_ms  INTEGER,
  created_by   TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS video_generations (
  id           TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  prompt       TEXT NOT NULL,
  model        TEXT NOT NULL,
  provider     TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','succeeded','failed')),
  video_url    TEXT,
  poster_url   TEXT,
  error        TEXT,
  duration_ms  INTEGER,
  created_by   TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS voice_calls (
  id           TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twilio_sid   TEXT,
  direction    TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
  from_number  TEXT,
  to_number    TEXT,
  status       TEXT NOT NULL DEFAULT 'queued',
  duration     INTEGER,
  transcript   TEXT,
  agent_id     TEXT REFERENCES agents(id) ON DELETE SET NULL,
  created_by   TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS voice_tts_jobs (
  id           TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  text         TEXT NOT NULL,
  voice_id     TEXT NOT NULL,
  audio_path   TEXT,
  status       TEXT NOT NULL DEFAULT 'pending',
  error        TEXT,
  created_by   TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS marketplace_items (
  id           TEXT PRIMARY KEY,
  slug         TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  category     TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  tags         TEXT NOT NULL DEFAULT '[]',
  rating       REAL NOT NULL DEFAULT 0,
  installs     INTEGER NOT NULL DEFAULT 0,
  template     TEXT NOT NULL DEFAULT '{}',
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS marketplace_installations (
  id           TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  item_id      TEXT NOT NULL REFERENCES marketplace_items(id) ON DELETE CASCADE,
  installed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  installed_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (workspace_id, item_id)
);

CREATE TABLE IF NOT EXISTS oauth_connections (
  id              TEXT PRIMARY KEY,
  workspace_id    TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  provider        TEXT NOT NULL,
  account_id      TEXT,
  account_name    TEXT,
  access_token    TEXT NOT NULL,
  refresh_token   TEXT,
  scopes          TEXT,
  expires_at      TEXT,
  created_by      TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (workspace_id, provider, account_id)
);

CREATE TABLE IF NOT EXISTS oauth_states (
  state         TEXT PRIMARY KEY,
  workspace_id  TEXT NOT NULL,
  provider      TEXT NOT NULL,
  user_id       TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS log_events (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  workspace_id  TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id       TEXT REFERENCES users(id) ON DELETE SET NULL,
  level         TEXT NOT NULL CHECK (level IN ('debug','info','warn','error')),
  service       TEXT NOT NULL,
  message       TEXT NOT NULL,
  meta          TEXT NOT NULL DEFAULT '{}',
  occurred_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_usage_ws_time ON usage_events(workspace_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_members_user ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_keys_ws ON api_keys(workspace_id);
CREATE INDEX IF NOT EXISTS idx_agents_ws ON agents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workflows_ws ON workflows(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_wf ON workflow_runs(workflow_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_deployments_ws ON deployments(workspace_id);
CREATE INDEX IF NOT EXISTS idx_invitations_ws ON invitations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_log_events_ws_time ON log_events(workspace_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_images_ws_time ON image_generations(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_ws_time ON video_generations(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_calls_ws_time ON voice_calls(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_oauth_ws_provider ON oauth_connections(workspace_id, provider);
