import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import './db.js';
import { getStorageRoot } from './storage.js';
import { seedDemoAdmin } from './seed.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import workspaceRoutes from './routes/workspaces.js';
import apiKeyRoutes from './routes/apiKeys.js';
import agentRoutes from './routes/agents.js';
import settingsRoutes from './routes/settings.js';
import adminRoutes from './routes/admin.js';
import workflowRoutes from './routes/workflows.js';
import deploymentRoutes from './routes/deployments.js';
import memberRoutes from './routes/members.js';
import logRoutes from './routes/logs.js';
import providerRoutes from './routes/providers.js';
import llmRoutes from './routes/llm.js';
import mfaRoutes from './routes/mfa.js';
import passwordResetRoutes from './routes/passwordReset.js';
import imageRoutes from './routes/images.js';
import videoRoutes from './routes/videos.js';
import voiceRoutes from './routes/voice.js';
import marketplaceRoutes from './routes/marketplace.js';
import oauthRoutes from './routes/oauth.js';

const app = express();
const PORT = Number(process.env.PORT) || 3001;
// Comma-separated list of allowed origins, e.g.
//   CLIENT_ORIGIN=http://localhost:5173,https://iamsaifansari.github.io
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://localhost:5174';
const ALLOWED_ORIGINS = CLIENT_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean);

// Behind Render/CDN proxies, trust the X-Forwarded-* headers for IP detection.
app.set('trust proxy', 1);

app.use(helmet({
  // Static media (/api/storage/*) loaded cross-origin from the Pages frontend.
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  // CSP is too strict for current inline-styled React; ship without it for now.
  contentSecurityPolicy: false,
}));
app.use(express.json({ limit: '32mb' }));
app.use(cookieParser());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));

// Per-route rate limits. Identifier = IP for anon endpoints, user id once auth'd.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts. Try again in 15 minutes.' },
});
const llmLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { error: 'Rate limit exceeded. Slow down.' },
});
const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { error: 'Too many write requests. Slow down.' },
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);
app.use('/api/auth/change-password', authLimiter);
app.use('/api/password-reset', authLimiter);
app.use('/api/llm', llmLimiter);
app.use('/api/images', writeLimiter);
app.use('/api/videos', writeLimiter);
app.use('/api/voice', writeLimiter);

// Serve generated images / videos / audio.
app.use('/api/storage', express.static(getStorageRoot(), { maxAge: '7d', immutable: true }));

app.get('/api/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/api-keys', apiKeyRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/deployments', deploymentRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/llm', llmRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/mfa', mfaRoutes);
app.use('/api/password-reset', passwordResetRoutes);

app.use((err, _req, res, _next) => {
  console.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
});

seedDemoAdmin();
import('./seedMarketplace.js').then((m) => m.seedMarketplaceCatalog());

app.listen(PORT, () => {
  console.log(`[server] http://localhost:${PORT}`);
});
