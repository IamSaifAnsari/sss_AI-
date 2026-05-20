# NeuronStack AI

Vite + React Router frontend with a Node + Express + **SQLite** backend (better-sqlite3). bcrypt for password hashing, JWT in httpOnly cookies for sessions. Single-machine, fully local, no third-party services required.

## Quick start

```powershell
copy .env.example .env
# (edit .env — at minimum set JWT_SECRET to a long random string)

npm install
npm run dev
```

The `dev` script starts both processes via `concurrently`:

- Backend: `node --watch server/index.js` on <http://localhost:3001>
- Frontend: `vite` on <http://localhost:5173> (proxies `/api` → :3001)

Open <http://localhost:5173>, click **Sign Up**, create an account. A personal workspace is created automatically.

The SQLite database file lives at `data/neuronstack.db`. Delete it to wipe all data.

## Project layout

```
server/
├── index.js                     # Express bootstrap, mounts routes
├── db.js                        # better-sqlite3 client, applies schema.sql on boot
├── auth.js                      # bcrypt + JWT + cookie helpers, requireAuth middleware
├── workspace.js                 # requireWorkspace, requireRole middleware
├── schema.sql                   # SQLite tables + indexes
└── routes/
    ├── auth.js                  # /api/auth/{signup,login,logout,me,change-password}
    ├── profile.js               # /api/profile (GET, PATCH, complete-onboarding)
    ├── workspaces.js            # /api/workspaces, /active, /:id/credits
    ├── apiKeys.js               # /api/api-keys CRUD
    ├── agents.js                # /api/agents CRUD
    └── settings.js              # /api/settings, tweaks

src/
├── main.jsx, App.jsx            # entry + router + auth gating
├── lib/
│   ├── apiClient.js             # fetch wrapper, sends credentials + X-Workspace-Id
│   ├── api.js                   # typed methods (auth, profile, workspaces, keys, agents, settings)
│   └── utils.js
├── providers/
│   ├── AuthProvider.jsx         # GET /api/auth/me on mount, signIn/signUp/signOut/changePassword
│   ├── WorkspaceProvider.jsx    # lists workspaces, persists active workspace server-side
│   ├── TweaksProvider.jsx       # theme/accent/font (localStorage cache + server-side via /settings)
│   ├── ToastProvider.jsx
│   └── ConfirmProvider.jsx
├── components/
│   ├── Icons.jsx
│   ├── ui.jsx                   # MetricCard, GlassPanel, Modal, Tabs, etc.
│   └── AppShell.jsx             # Sidebar + Navbar
└── pages/
    ├── Login.jsx                # sign in + sign up (one screen)
    ├── Onboarding.jsx
    ├── Dashboard.jsx
    ├── APIKeys.jsx              # create returns plaintext ONCE; stored as SHA-256 hash
    ├── Agents.jsx
    ├── Profile.jsx
    ├── Settings.jsx
    └── Placeholder.jsx

data/                            # SQLite database file lives here (gitignored)
```

## Scripts

```powershell
npm run dev          # both servers
npm run dev:server   # backend only
npm run dev:client   # frontend only
npm run server       # backend, no auto-reload
npm run build        # frontend production bundle into dist/
npm run preview      # preview production frontend
```

## What is real vs still simulated

### Real

- **Auth**: bcrypt-hashed passwords, JWT in httpOnly Lax cookies, `/api/auth/{signup,login,logout,me,change-password}`.
- **Multi-tenancy**: each user gets a personal workspace on signup. `workspace_members` controls access; every workspace-scoped query is gated by `requireWorkspace` (verifies user is a member) + `requireRole` for write-paths.
- **API keys**: created via `POST /api/api-keys`, plaintext returned **once**. Only the SHA-256 hash, prefix, and last four chars are stored. UI shows `pk_live_****<last4>`.
- **Agents**: full CRUD into SQLite with role-gated writes.
- **Profile, tweaks, settings**: persisted server-side per user.

### Still to build

- **Password reset by email** — needs SMTP (Postmark/Sendgrid). Can wire later.
- **Magic link login** — same SMTP requirement.
- **2FA / TOTP** — `otplib` + a `user_mfa` table.
- **Stripe billing** — checkout, customer portal, webhook handler, plan gating.
- **Real AI proxy** — server-side OpenAI / Anthropic / Google adapters that validate `api_keys.key_hash`, charge credits, record `usage_events`.
- **Streaming Playground** (SSE/WebSocket), **Voice AI** (Twilio + Deepgram + ElevenLabs), **Image/Video Studio** (Replicate / fal.ai).
- **Team invites** — invite token table + email + accept page.
- **Audit log** — every mutation captured.
- **Deploy** — single VPS (Fly.io / Railway) with the SQLite file on a persistent volume, or fork to Postgres/Turso when you need horizontal scale.

## Security notes

- The dev `JWT_SECRET` in `.env.example` is a placeholder. **Generate a long random string** before any non-local deployment.
- API keys are stored as SHA-256 hashes; the plaintext value is returned exactly once at creation.
- Cookies are `httpOnly` and `Secure` in production (`NODE_ENV=production`).
- `bcryptjs` is pure-JS so no native build step on Windows; swap to `bcrypt` for ~3× faster hashing in production if you want.
- CORS is locked to `CLIENT_ORIGIN` (default `http://localhost:5173`).
- SQLite has no row-level security — authorization is enforced in route middleware (`requireWorkspace`, `requireRole`). Audit every workspace-scoped query before shipping.

## Scaling notes

SQLite + a single Node process is perfectly fine up to thousands of users, especially with WAL mode. Limits to watch:

- **Single writer.** SQLite serializes writes. If a single workspace becomes very write-heavy (e.g. lots of streaming usage events), you'll want to batch inserts or move to Postgres.
- **Single machine.** No horizontal scale. Cannot run two backend processes against the same SQLite file safely. If you outgrow this, Turso (libSQL) keeps the SQLite syntax but adds replication + multi-region.
- **Backups.** Snapshot `data/neuronstack.db` regularly. `sqlite3 db .backup file.bak` is online-safe.

## Notes on the legacy demo

The original Babel-standalone prototype is still on disk:

- `NeuronStack AI.html`, `NeuronStack AI v1.html`
- `app.jsx`, `dashboard.jsx`, `pages-1.jsx`, `pages-2.jsx`, `admin.jsx`, `detail-pages.jsx`, `playground.jsx`, `login.jsx`, `onboarding.jsx`, `components.jsx`, `ui-extras.jsx`, `tweaks-panel.jsx`, `store.js`

These are kept as reference. They are not loaded by the new build under `src/`. Delete them once you've confirmed the new app works.
