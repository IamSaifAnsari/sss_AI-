import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWorkspace } from '../providers/WorkspaceProvider.jsx';
import { useToast } from '../providers/ToastProvider.jsx';
import { useConfirm } from '../providers/ConfirmProvider.jsx';
import { api } from '../lib/api.js';
import { Icons } from '../components/Icons.jsx';
import { GlassPanel, SectionHeader, EmptyState } from '../components/ui.jsx';

const PROVIDERS = [
  { id: 'slack', name: 'Slack', color: '#E01E5A' },
  { id: 'github', name: 'GitHub', color: '#f0f0f0' },
  { id: 'stripe', name: 'Stripe Connect', color: '#635BFF' },
];

export default function IntegrationsPage() {
  const { active } = useWorkspace();
  const toast = useToast();
  const confirm = useConfirm();
  const [connections, setConnections] = useState([]);
  const [params, setParams] = useSearchParams();
  const [busy, setBusy] = useState({});

  const refresh = async () => {
    if (!active?.id) return;
    try { setConnections(await api.listConnections(active.id)); }
    catch (e) { toast.error(e.message); }
  };

  useEffect(() => {
    refresh();
    const ok = params.get('oauth_success');
    const err = params.get('oauth_error');
    if (ok) { toast.success(`${ok} connected`); params.delete('oauth_success'); setParams(params); }
    if (err) { toast.error(`OAuth failed: ${err}`); params.delete('oauth_error'); setParams(params); }
    // eslint-disable-next-line
  }, [active?.id]);

  const handleConnect = async (provider) => {
    setBusy((b) => ({ ...b, [provider.id]: true }));
    try {
      const r = await api.startOAuth(active.id, provider.id);
      window.location.href = r.auth_url;
    } catch (e) {
      toast.error(e.message);
      setBusy((b) => ({ ...b, [provider.id]: false }));
    }
  };

  const handleDisconnect = async (conn) => {
    const ok = await confirm({ title: 'Disconnect?', message: `Remove ${conn.provider} (${conn.account_name})?`, confirmLabel: 'Disconnect', danger: true });
    if (!ok) return;
    try { await api.deleteConnection(active.id, conn.id); toast.success('Disconnected'); refresh(); }
    catch (e) { toast.error(e.message); }
  };

  if (!active) return null;
  const canManage = active.role === 'owner' || active.role === 'admin';

  const isConnected = (providerId) => connections.find((c) => c.provider === providerId);

  return (
    <div className="page-scroll"><div className="page-inner">
      <SectionHeader title="Integrations" subtitle="Connect external services via OAuth. Tokens stored encrypted (AES-256-GCM)." />
      {!canManage && <GlassPanel style={{ marginBottom: 16 }}><p style={{ fontSize: 12, color: 'var(--text-3)' }}>Owner/admin can connect integrations. You can view.</p></GlassPanel>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14, marginBottom: 24 }}>
        {PROVIDERS.map((p) => {
          const conn = isConnected(p.id);
          return (
            <div key={p.id} className="glass-card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${p.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icons.plug size={20} style={{ color: p.color }} />
                </div>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-0)' }}>{p.name}</h4>
                  <span className={`badge badge-${conn ? 'green' : 'blue'}`}>{conn ? 'connected' : 'not connected'}</span>
                </div>
              </div>
              {conn ? (
                <>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10 }}>Account: <strong style={{ color: 'var(--text-1)' }}>{conn.account_name || conn.account_id || '—'}</strong></p>
                  {canManage && <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => handleDisconnect(conn)}>Disconnect</button>}
                </>
              ) : (
                canManage ? <button className="btn btn-accent btn-sm" onClick={() => handleConnect(p)} disabled={busy[p.id]}>{busy[p.id] ? 'Redirecting...' : 'Connect'}</button> :
                  <p style={{ fontSize: 11, color: 'var(--text-3)' }}>Owner/admin required</p>
              )}
            </div>
          );
        })}
      </div>

      <GlassPanel>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-0)', marginBottom: 12 }}>How OAuth works</h3>
        <ol style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.7, paddingLeft: 18 }}>
          <li>Register an OAuth app at the provider's developer portal (Slack/GitHub/Stripe).</li>
          <li>Set redirect URI to <code>http://localhost:3001/api/oauth/&lt;provider&gt;/callback</code> (or your deployed URL).</li>
          <li>Add <code>&lt;PROVIDER&gt;_CLIENT_ID</code> and <code>&lt;PROVIDER&gt;_CLIENT_SECRET</code> to <code>.env</code> and restart the server.</li>
          <li>Click <strong>Connect</strong> above. You'll be redirected to the provider, then back here with the connection stored.</li>
        </ol>
        <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 12 }}>Without env vars, the Connect button returns an error explaining what to configure.</p>
      </GlassPanel>
    </div></div>
  );
}
