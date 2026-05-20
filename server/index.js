import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
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
import imageRoutes from './routes/images.js';
import videoRoutes from './routes/videos.js';
import voiceRoutes from './routes/voice.js';
import marketplaceRoutes from './routes/marketplace.js';
import oauthRoutes from './routes/oauth.js';

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(express.json({ limit: '32mb' }));
app.use(cookieParser());
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));

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

app.use((err, _req, res, _next) => {
  console.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
});

seedDemoAdmin();
import('./seedMarketplace.js').then((m) => m.seedMarketplaceCatalog());

app.listen(PORT, () => {
  console.log(`[server] http://localhost:${PORT}`);
});
