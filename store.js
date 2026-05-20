/* NeuronStack AI — Local persistence layer (localStorage) */
(function () {
  const NS = 'ns_v1_';
  const KEYS = {
    AUTH: NS + 'auth',
    USER: NS + 'user',
    ONBOARDED: NS + 'onboarded',
    ONBOARDING_DATA: NS + 'onboarding',
    PAGE: NS + 'page',
    COLLAPSED: NS + 'collapsed',
    TWEAKS: NS + 'tweaks',
    WORKSPACE: NS + 'workspace',
    API_KEYS: NS + 'api_keys',
    AGENTS: NS + 'agents',
    PROFILE: NS + 'profile',
  };

  const read = (k, fallback) => {
    try {
      const v = localStorage.getItem(k);
      if (v === null || v === undefined) return fallback;
      return JSON.parse(v);
    } catch (e) {
      return fallback;
    }
  };

  const write = (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {
      console.warn('NSStore write failed', k, e);
    }
  };

  const remove = (k) => {
    try { localStorage.removeItem(k); } catch (e) {}
  };

  const DEFAULT_KEYS = [
    { id: 'k1', name: 'Production API', key: 'pk_live_***************************8f2k', env: 'production', created: 'Jan 15, 2025', lastUsed: '2s ago', requests: '12.4M', status: 'active', permissions: ['All Models', 'Voice AI', 'Workflows'] },
    { id: 'k2', name: 'Staging API', key: 'pk_test_***************************7gH3', env: 'staging', created: 'Feb 3, 2025', lastUsed: '5m ago', requests: '890K', status: 'active', permissions: ['All Models', 'Voice AI'] },
    { id: 'k3', name: 'Mobile App', key: 'pk_live_***************************6jK4', env: 'production', created: 'Mar 12, 2025', lastUsed: '12s ago', requests: '4.2M', status: 'active', permissions: ['GPT-4o', 'Claude 3.5'] },
  ];

  const DEFAULT_AGENTS = [
    { id: 'a1', name: 'SalesBot Pro', status: 'active', model: 'GPT-4o', calls: 12400, successRate: 94.2, tools: ['CRM', 'Email', 'Calendar'], desc: 'Handles lead qualification and follow-ups' },
    { id: 'a2', name: 'Support Agent', status: 'active', model: 'Claude 3.5', calls: 28900, successRate: 97.1, tools: ['Knowledge Base', 'Tickets', 'Chat'], desc: 'Customer support with knowledge base' },
    { id: 'a3', name: 'Data Analyst', status: 'active', model: 'GPT-4o', calls: 5600, successRate: 91.8, tools: ['SQL', 'Charts', 'Reports'], desc: 'Automated data analysis and reporting' },
  ];

  const DEFAULT_TWEAKS = {
    accentColor: '#3b82f6',
    theme: 'Midnight',
    fontFamily: 'DM Sans',
    sidebarStyle: 'Minimal',
    cardStyle: 'Border',
    density: 'Comfortable',
  };

  const randomMask = () => {
    const chars = '0123456789abcdefghjkmnpqrstuvwxyz';
    let s = '';
    for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  };

  const NSStore = {
    KEYS,

    isAuthed: () => read(KEYS.AUTH, false) === true,
    setAuthed: (v) => write(KEYS.AUTH, !!v),

    getUser: () => read(KEYS.USER, null),
    setUser: (u) => write(KEYS.USER, u),

    isOnboarded: () => read(KEYS.ONBOARDED, false) === true,
    setOnboarded: (v) => write(KEYS.ONBOARDED, !!v),

    getOnboardingData: () => read(KEYS.ONBOARDING_DATA, null),
    setOnboardingData: (d) => write(KEYS.ONBOARDING_DATA, d),

    getPage: () => read(KEYS.PAGE, 'admin'),
    setPage: (p) => write(KEYS.PAGE, p),

    getCollapsed: () => read(KEYS.COLLAPSED, false) === true,
    setCollapsed: (v) => write(KEYS.COLLAPSED, !!v),

    getTweaks: () => ({ ...DEFAULT_TWEAKS, ...(read(KEYS.TWEAKS, {}) || {}) }),
    setTweaks: (t) => write(KEYS.TWEAKS, t),

    getWorkspace: () => read(KEYS.WORKSPACE, 'NeuronStack AI'),
    setWorkspace: (w) => write(KEYS.WORKSPACE, w),

    getApiKeys: () => {
      const v = read(KEYS.API_KEYS, null);
      if (v === null) { write(KEYS.API_KEYS, DEFAULT_KEYS); return DEFAULT_KEYS.slice(); }
      return v;
    },
    setApiKeys: (k) => write(KEYS.API_KEYS, k),
    addApiKey: (k) => {
      const list = NSStore.getApiKeys();
      const id = 'k' + Date.now();
      const masked = 'pk_' + (k.env === 'production' ? 'live' : 'test') + '_' + '*'.repeat(27) + randomMask();
      const today = new Date();
      const created = today.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const row = {
        id, name: k.name || 'Untitled Key', key: masked, env: k.env || 'production',
        created, lastUsed: 'Never', requests: '0', status: 'active',
        permissions: k.permissions && k.permissions.length ? k.permissions : ['All Models'],
      };
      const next = [row, ...list];
      NSStore.setApiKeys(next);
      return row;
    },
    deleteApiKey: (id) => {
      const next = NSStore.getApiKeys().filter((k) => k.id !== id);
      NSStore.setApiKeys(next);
      return next;
    },

    getAgents: () => {
      const v = read(KEYS.AGENTS, null);
      if (v === null) { write(KEYS.AGENTS, DEFAULT_AGENTS); return DEFAULT_AGENTS.slice(); }
      return v;
    },
    setAgents: (a) => write(KEYS.AGENTS, a),
    addAgent: (a) => {
      const list = NSStore.getAgents();
      const id = 'a' + Date.now();
      const modelLabels = { 'gpt-4o': 'GPT-4o', 'claude-3.5': 'Claude 3.5', 'gemini-pro': 'Gemini Pro', 'llama-3.1': 'Llama 3.1 70B' };
      const row = {
        id, name: a.name || 'New Agent', desc: a.desc || '',
        status: 'active', model: modelLabels[a.model] || a.model || 'GPT-4o',
        calls: 0, successRate: 0,
        tools: (a.tools || []).map((t) => t.charAt(0).toUpperCase() + t.slice(1)),
      };
      const next = [row, ...list];
      NSStore.setAgents(next);
      return row;
    },

    getProfile: () => read(KEYS.PROFILE, { firstName: 'Alex', lastName: 'Chen', email: 'admin@neuronstack.ai', timezone: 'America/New_York (EST)' }),
    setProfile: (p) => write(KEYS.PROFILE, p),

    logout: () => {
      remove(KEYS.AUTH);
      remove(KEYS.USER);
      // keep onboarding, tweaks, demo data so demo restart is quick
    },

    resetAll: () => {
      Object.values(KEYS).forEach(remove);
    },

    notify: (key) => {
      try { window.dispatchEvent(new CustomEvent('nsstore', { detail: { key } })); } catch (e) {}
    },
  };

  // Wrap mutating ops with notify
  const wrapNotify = (name) => {
    const orig = NSStore[name];
    NSStore[name] = function () {
      const r = orig.apply(this, arguments);
      NSStore.notify(name);
      return r;
    };
  };
  ['setAuthed', 'setUser', 'setOnboarded', 'setOnboardingData', 'setPage', 'setCollapsed',
    'setTweaks', 'setWorkspace', 'setApiKeys', 'addApiKey', 'deleteApiKey',
    'setAgents', 'addAgent', 'setProfile', 'logout', 'resetAll'].forEach(wrapNotify);

  window.NSStore = NSStore;
})();
