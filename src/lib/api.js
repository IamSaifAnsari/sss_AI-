import { apiClient, streamSSE } from './apiClient.js';

export const api = {
  // ────── Auth ──────
  signup: (email, password, workspaceName) => apiClient.post('/auth/signup', { email, password, workspaceName }),
  login: (email, password, mfa_code) => apiClient.post('/auth/login', { email, password, mfa_code }),
  logout: () => apiClient.post('/auth/logout', {}),
  me: () => apiClient.get('/auth/me'),
  changePassword: (currentPassword, newPassword) => apiClient.post('/auth/change-password', { currentPassword, newPassword }),
  requestPasswordReset: (email) => apiClient.post('/password-reset/request', { email }),
  completePasswordReset: (token, new_password) => apiClient.post('/password-reset/complete', { token, new_password }),

  // ────── MFA ──────
  mfaStatus: () => apiClient.get('/mfa/status'),
  mfaEnrollStart: () => apiClient.post('/mfa/enroll/start', {}),
  mfaEnrollVerify: (code) => apiClient.post('/mfa/enroll/verify', { code }),
  mfaDisable: (password) => apiClient.post('/mfa/disable', { password }),

  // ────── Profile ──────
  getProfile: () => apiClient.get('/profile'),
  updateProfile: (patch) => apiClient.patch('/profile', patch),
  completeOnboarding: (data) => apiClient.post('/profile/complete-onboarding', { data }),

  // ────── Workspaces ──────
  listWorkspaces: () => apiClient.get('/workspaces'),
  createWorkspace: (name, plan) => apiClient.post('/workspaces', { name, plan }),
  getActiveWorkspaceId: () => apiClient.get('/workspaces/active'),
  setActiveWorkspaceId: (workspace_id) => apiClient.put('/workspaces/active', { workspace_id }),
  getCredits: (workspaceId) => apiClient.get(`/workspaces/${workspaceId}/credits`, { workspace: workspaceId }),

  // ────── API Keys ──────
  listApiKeys: (workspaceId) => apiClient.get('/api-keys', { workspace: workspaceId }).then((r) => r.keys),
  createApiKey: (workspaceId, payload) => apiClient.post('/api-keys', payload, { workspace: workspaceId }),
  deleteApiKey: (workspaceId, id) => apiClient.delete(`/api-keys/${id}`, { workspace: workspaceId }),

  // ────── Agents ──────
  listAgents: (workspaceId) => apiClient.get('/agents', { workspace: workspaceId }).then((r) => r.agents),
  createAgent: (workspaceId, payload) => apiClient.post('/agents', payload, { workspace: workspaceId }).then((r) => r.agent),
  deleteAgent: (workspaceId, id) => apiClient.delete(`/agents/${id}`, { workspace: workspaceId }),

  // ────── Settings ──────
  getSettings: () => apiClient.get('/settings'),
  saveTweaks: (tweaks) => apiClient.put('/settings/tweaks', { tweaks }),

  // ────── Admin ──────
  adminOverview: () => apiClient.get('/admin/overview'),
  adminUsers: (limit) => apiClient.get('/admin/users', { query: { limit } }),
  adminTenants: () => apiClient.get('/admin/tenants'),
  adminUsage: () => apiClient.get('/admin/usage'),

  // ────── Workflows ──────
  listWorkflows: (workspaceId) => apiClient.get('/workflows', { workspace: workspaceId }).then((r) => r.workflows),
  createWorkflow: (workspaceId, payload) => apiClient.post('/workflows', payload, { workspace: workspaceId }).then((r) => r.workflow),
  deleteWorkflow: (workspaceId, id) => apiClient.delete(`/workflows/${id}`, { workspace: workspaceId }),
  runWorkflow: (workspaceId, id) => apiClient.post(`/workflows/${id}/run`, {}, { workspace: workspaceId }),
  listWorkflowRuns: (workspaceId) => apiClient.get('/workflows/runs', { workspace: workspaceId }).then((r) => r.runs),

  // ────── Deployments ──────
  listDeployments: (workspaceId) => apiClient.get('/deployments', { workspace: workspaceId }).then((r) => r.deployments),
  createDeployment: (workspaceId, payload) => apiClient.post('/deployments', payload, { workspace: workspaceId }).then((r) => r.deployment),
  deleteDeployment: (workspaceId, id) => apiClient.delete(`/deployments/${id}`, { workspace: workspaceId }),

  // ────── Members + invitations ──────
  listMembers: (workspaceId) => apiClient.get('/members', { workspace: workspaceId }).then((r) => r.members),
  updateMemberRole: (workspaceId, userId, role) => apiClient.patch(`/members/${userId}`, { role }, { workspace: workspaceId }),
  removeMember: (workspaceId, userId) => apiClient.delete(`/members/${userId}`, { workspace: workspaceId }),
  listInvitations: (workspaceId) => apiClient.get('/members/invitations', { workspace: workspaceId }).then((r) => r.invitations),
  createInvitation: (workspaceId, email, role) => apiClient.post('/members/invitations', { email, role }, { workspace: workspaceId }),
  deleteInvitation: (workspaceId, id) => apiClient.delete(`/members/invitations/${id}`, { workspace: workspaceId }),
  acceptInvitation: (token) => apiClient.post('/members/invitations/accept', { token }),

  // ────── Logs ──────
  listLogs: (workspaceId, level) => apiClient.get('/logs', { workspace: workspaceId, query: { level: level || undefined } }).then((r) => r.logs),

  // ────── Provider keys ──────
  listProviders: (workspaceId) => apiClient.get('/providers', { workspace: workspaceId }).then((r) => r.providers),
  saveProviderKey: (workspaceId, provider, key, label) => apiClient.put(`/providers/${provider}`, { key, label }, { workspace: workspaceId }),
  deleteProviderKey: (workspaceId, provider) => apiClient.delete(`/providers/${provider}`, { workspace: workspaceId }),

  // ────── LLM ──────
  streamChat: (workspaceId, body, opts) => streamSSE('/llm/chat/stream', body, { workspace: workspaceId, ...opts }),

  // ────── Images ──────
  listImages: (workspaceId) => apiClient.get('/images', { workspace: workspaceId }).then((r) => r.images),
  generateImage: (workspaceId, payload) => apiClient.post('/images', payload, { workspace: workspaceId }),
  getImage: (workspaceId, id) => apiClient.get(`/images/${id}`, { workspace: workspaceId }).then((r) => r.image),
  deleteImage: (workspaceId, id) => apiClient.delete(`/images/${id}`, { workspace: workspaceId }),

  // ────── Videos ──────
  listVideos: (workspaceId) => apiClient.get('/videos', { workspace: workspaceId }).then((r) => r.videos),
  generateVideo: (workspaceId, payload) => apiClient.post('/videos', payload, { workspace: workspaceId }),
  deleteVideo: (workspaceId, id) => apiClient.delete(`/videos/${id}`, { workspace: workspaceId }),

  // ────── Voice ──────
  listVoices: () => apiClient.get('/voice/voices').then((r) => r.voices),
  tts: (workspaceId, text, voice) => apiClient.post('/voice/tts', { text, voice }, { workspace: workspaceId }),
  stt: (workspaceId, audioBase64, mime) => apiClient.post('/voice/stt', { audio_base64: audioBase64, mime }, { workspace: workspaceId }),
  placeCall: (workspaceId, to, message) => apiClient.post('/voice/call', { to, message }, { workspace: workspaceId }),
  listCalls: (workspaceId) => apiClient.get('/voice/calls', { workspace: workspaceId }).then((r) => r.calls),

  // ────── Marketplace ──────
  listMarketplaceItems: (workspaceId) => apiClient.get('/marketplace', { workspace: workspaceId }).then((r) => r.items),
  installMarketplaceItem: (workspaceId, slug) => apiClient.post(`/marketplace/${slug}/install`, {}, { workspace: workspaceId }),
  uninstallMarketplaceItem: (workspaceId, slug) => apiClient.delete(`/marketplace/${slug}/install`, { workspace: workspaceId }),

  // ────── OAuth ──────
  listConnections: (workspaceId) => apiClient.get('/oauth/connections', { workspace: workspaceId, query: { workspace_id: workspaceId } }).then((r) => r.connections),
  startOAuth: (workspaceId, provider) => apiClient.get(`/oauth/${provider}/start`, { query: { workspace_id: workspaceId } }),
  deleteConnection: (workspaceId, id) => apiClient.delete(`/oauth/connections/${id}`, { workspace: workspaceId }),
};
