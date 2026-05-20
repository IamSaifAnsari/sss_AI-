import { useEffect, useState } from 'react';
import { useWorkspace } from '../providers/WorkspaceProvider.jsx';
import { useToast } from '../providers/ToastProvider.jsx';
import { useConfirm } from '../providers/ConfirmProvider.jsx';
import { api } from '../lib/api.js';
import { Icons } from '../components/Icons.jsx';
import { GlassPanel, Modal, SectionHeader, EmptyState } from '../components/ui.jsx';

const REGIONS = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1', 'global'];

export default function DeploymentsPage() {
  const { active } = useWorkspace();
  const toast = useToast();
  const confirm = useConfirm();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', env: 'production', model: '', region: 'us-east-1' });

  const refresh = async () => {
    if (!active?.id) return;
    setLoading(true);
    try { setItems(await api.listDeployments(active.id)); }
    catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [active?.id]);
  useEffect(() => { const i = setInterval(refresh, 5000); return () => clearInterval(i); /* eslint-disable-next-line */ }, [active?.id]);

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error('Name required'); return; }
    try {
      await api.createDeployment(active.id, form);
      toast.success('Deployment queued');
      setShowCreate(false);
      setForm({ name: '', env: 'production', model: '', region: 'us-east-1' });
      refresh();
    } catch (e) { toast.error(e.message); }
  };

  const handleDelete = async (d) => {
    const ok = await confirm({ title: 'Delete deployment?', message: `Permanently remove "${d.name}".`, confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    try { await api.deleteDeployment(active.id, d.id); toast.success('Deleted'); refresh(); }
    catch (e) { toast.error(e.message); }
  };

  if (!active) return null;

  return (
    <div className="page-scroll"><div className="page-inner">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <SectionHeader title="Deployments" subtitle="Manage your deployed models and endpoints" style={{ marginBottom: 0 }} />
        <button className="btn btn-accent" onClick={() => setShowCreate(true)}><Icons.plus size={14} /> New Deployment</button>
      </div>

      {loading ? <div style={{ color: 'var(--text-3)', fontSize: 13 }}>Loading...</div> :
       items.length === 0 ? <GlassPanel><EmptyState icon={<Icons.rocket size={48} />} title="No deployments" subtitle="Create your first deployment." /></GlassPanel> :
       <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
         {items.map((d) => (
           <div key={d.id} className="glass-card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
             <Icons.rocket size={18} style={{ color: 'var(--accent)' }} />
             <div style={{ flex: 1 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                 <span style={{ fontWeight: 600, color: 'var(--text-0)', fontSize: 14 }}>{d.name}</span>
                 <span className={`badge badge-${d.env === 'production' ? 'green' : 'blue'}`}>{d.env}</span>
                 <span className={`badge badge-${d.status === 'active' ? 'green' : d.status === 'deploying' ? 'yellow' : 'red'}`}>{d.status}</span>
               </div>
               <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{d.model || '—'} · {d.region} · Uptime: {d.uptime}</div>
             </div>
             <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{d.updated_at}</span>
             <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => handleDelete(d)}><Icons.trash size={13} /></button>
           </div>
         ))}
       </div>}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Deployment">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. prod-api-v3" autoFocus />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>Model</label>
            <input className="input" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="GPT-4o + Claude 3.5" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>Environment</label>
              <select value={form.env} onChange={(e) => setForm({ ...form, env: e.target.value })} style={{ width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-1)', padding: '8px 10px', borderRadius: 6, fontSize: 13 }}>
                <option value="production">production</option><option value="staging">staging</option><option value="development">development</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>Region</label>
              <select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} style={{ width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-1)', padding: '8px 10px', borderRadius: 6, fontSize: 13 }}>
                {REGIONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn btn-accent" onClick={handleCreate}>Deploy</button>
          </div>
        </div>
      </Modal>
    </div></div>
  );
}
