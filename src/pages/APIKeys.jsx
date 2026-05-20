import { useEffect, useState } from 'react';
import { useWorkspace } from '../providers/WorkspaceProvider.jsx';
import { useToast } from '../providers/ToastProvider.jsx';
import { useConfirm } from '../providers/ConfirmProvider.jsx';
import { api } from '../lib/api.js';
import { GlassPanel, Modal, SectionHeader, EmptyState } from '../components/ui.jsx';
import { Icons } from '../components/Icons.jsx';

export default function APIKeysPage() {
  const { active } = useWorkspace();
  const toast = useToast();
  const confirm = useConfirm();
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newKey, setNewKey] = useState(null);
  const [form, setForm] = useState({ name: '', env: 'production', permissions: ['All Models'], rateLimit: 1000 });

  const refresh = async () => {
    if (!active?.id) return;
    setLoading(true);
    try { setKeys(await api.listApiKeys(active.id)); }
    catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [active?.id]);

  const togglePerm = (p) => setForm((f) => ({ ...f, permissions: f.permissions.includes(p) ? f.permissions.filter((x) => x !== p) : [...f.permissions, p] }));

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error('Name required'); return; }
    try {
      const row = await api.createApiKey(active.id, form);
      setNewKey(row?.plaintext_key);
      setShowCreate(false);
      setForm({ name: '', env: 'production', permissions: ['All Models'], rateLimit: 1000 });
      toast.success('API key created. Copy it now — it will not be shown again.');
      refresh();
    } catch (e) { toast.error(e.message || 'Could not create key'); }
  };

  const handleDelete = async (k) => {
    const ok = await confirm({ title: 'Delete API key?', message: `This permanently removes "${k.name}".`, confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    try { await api.deleteApiKey(active.id, k.id); toast.success('Key deleted'); refresh(); }
    catch (e) { toast.error(e.message); }
  };

  const copyToClipboard = async (text) => {
    try { await navigator.clipboard.writeText(text); toast.success('Copied'); }
    catch { toast.error('Copy failed'); }
  };

  if (!active) return null;

  return (
    <div className="page-scroll"><div className="page-inner">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <SectionHeader title="API Keys" subtitle="Authentication keys for your workspace" style={{ marginBottom: 0 }} />
        <button className="btn btn-accent" onClick={() => setShowCreate(true)}><Icons.plus size={14} /> Create Key</button>
      </div>

      <GlassPanel style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 24, color: 'var(--text-3)', fontSize: 13 }}>Loading...</div>
        ) : keys.length === 0 ? (
          <EmptyState icon={<Icons.key size={48} />} title="No keys yet" subtitle="Create your first API key to start integrating." />
        ) : (
          <table className="ns-table">
            <thead><tr><th>Name</th><th>Key</th><th>Env</th><th>Requests</th><th>Last Used</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-0)' }}>{k.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{(k.permissions || []).join(' · ')}</div>
                  </td>
                  <td><code className="mono" style={{ fontSize: 11, color: 'var(--text-2)' }}>{k.prefix}_{'*'.repeat(20)}{k.last_four}</code></td>
                  <td><span className={`badge badge-${k.env === 'production' ? 'green' : 'blue'}`}>{k.env}</span></td>
                  <td className="mono" style={{ fontSize: 12 }}>{k.requests || 0}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-3)' }}>{k.last_used_at ? new Date(k.last_used_at).toLocaleString() : 'Never'}</td>
                  <td><span className={`badge badge-${k.status === 'active' ? 'green' : 'red'}`}>{k.status}</span></td>
                  <td>
                    <button className="btn btn-ghost btn-sm" style={{ padding: 4, color: 'var(--red)' }} title="Delete" onClick={() => handleDelete(k)}>
                      <Icons.trash size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassPanel>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create API Key">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>Key Name</label>
            <input className="input" placeholder="e.g. Production API" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>Environment</label>
            <select value={form.env} onChange={(e) => setForm({ ...form, env: e.target.value })} style={{ width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-1)', padding: '8px 10px', borderRadius: 6, fontSize: 13 }}>
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>Permissions</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['All Models', 'Voice AI', 'Workflows', 'Image Gen', 'Embeddings'].map((p) => (
                <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-1)', background: 'var(--bg-2)', padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.permissions.includes(p)} onChange={() => togglePerm(p)} style={{ accentColor: 'var(--accent)' }} />{p}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>Rate Limit (req/min)</label>
            <input className="input" type="number" value={form.rateLimit} onChange={(e) => setForm({ ...form, rateLimit: Number(e.target.value) || 0 })} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn btn-accent" onClick={handleCreate}>Create Key</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!newKey} onClose={() => setNewKey(null)} title="Your new API key">
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12 }}>
          Copy this key now. For security, the full value is shown only once.
        </p>
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-0)', wordBreak: 'break-all', marginBottom: 12 }}>
          {newKey}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => copyToClipboard(newKey)}><Icons.copy size={13} /> Copy</button>
          <button className="btn btn-accent" onClick={() => setNewKey(null)}>Done</button>
        </div>
      </Modal>
    </div></div>
  );
}
