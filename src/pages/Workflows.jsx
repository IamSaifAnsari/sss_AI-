import { useEffect, useState } from 'react';
import { useWorkspace } from '../providers/WorkspaceProvider.jsx';
import { useToast } from '../providers/ToastProvider.jsx';
import { useConfirm } from '../providers/ConfirmProvider.jsx';
import { api } from '../lib/api.js';
import { Icons } from '../components/Icons.jsx';
import { GlassPanel, Modal, SectionHeader, Tabs, EmptyState } from '../components/ui.jsx';
import { fmtNum } from '../lib/utils.js';

const TRIGGERS = ['Webhook', 'Email', 'Schedule', 'Stripe Event', 'Google Sheets', 'API'];

export default function WorkflowsPage() {
  const { active } = useWorkspace();
  const toast = useToast();
  const confirm = useConfirm();
  const [tab, setTab] = useState('workflows');
  const [workflows, setWorkflows] = useState([]);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', trigger: 'Webhook' });

  const refresh = async () => {
    if (!active?.id) return;
    setLoading(true);
    try {
      const [wfs, rs] = await Promise.all([api.listWorkflows(active.id), api.listWorkflowRuns(active.id)]);
      setWorkflows(wfs); setRuns(rs);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [active?.id]);

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error('Name required'); return; }
    try {
      await api.createWorkflow(active.id, form);
      toast.success(`Workflow "${form.name}" created`);
      setShowCreate(false); setForm({ name: '', trigger: 'Webhook' });
      refresh();
    } catch (e) { toast.error(e.message); }
  };

  const handleRun = async (w) => {
    try {
      const r = await api.runWorkflow(active.id, w.id);
      toast[r.status === 'success' ? 'success' : 'error'](`Run ${r.status} (${r.duration_ms}ms)`);
      refresh();
    } catch (e) { toast.error(e.message); }
  };

  const handleDelete = async (w) => {
    const ok = await confirm({ title: 'Delete workflow?', message: `This permanently removes "${w.name}".`, confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    try { await api.deleteWorkflow(active.id, w.id); toast.success('Deleted'); refresh(); }
    catch (e) { toast.error(e.message); }
  };

  if (!active) return null;

  return (
    <div className="page-scroll"><div className="page-inner">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <SectionHeader title="Workflows" subtitle="Automate multi-step tasks" style={{ marginBottom: 0 }} />
        <button className="btn btn-accent" onClick={() => setShowCreate(true)}><Icons.plus size={14} /> New Workflow</button>
      </div>
      <Tabs tabs={[{ id: 'workflows', label: 'All Workflows' }, { id: 'history', label: 'Run History' }]} active={tab} onChange={setTab} style={{ marginBottom: 16 }} />

      {tab === 'workflows' && (
        loading ? <div style={{ color: 'var(--text-3)', fontSize: 13 }}>Loading...</div> :
        workflows.length === 0 ? <GlassPanel><EmptyState icon={<Icons.workflow size={48} />} title="No workflows yet" subtitle="Create your first automated workflow." /></GlassPanel> :
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {workflows.map((w) => (
            <div key={w.id} className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent3-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icons.workflow size={18} style={{ color: 'var(--accent3)' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-0)' }}>{w.name}</h3>
                  <span className={`badge badge-${w.status === 'active' ? 'green' : 'yellow'}`}>{w.status}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2, display: 'flex', gap: 12 }}>
                  <span>{w.trigger}</span>
                  <span>{fmtNum(w.runs)} runs</span>
                  <span>{(w.success || 0).toFixed(1)}% success</span>
                </div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{w.last_run_at ? `Last: ${w.last_run_at}` : 'Never run'}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => handleRun(w)}><Icons.play size={12} /> Run</button>
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => handleDelete(w)}><Icons.trash size={13} /></button>
            </div>
          ))}
        </div>
      )}

      {tab === 'history' && (
        <GlassPanel style={{ padding: 0, overflow: 'hidden' }}>
          {runs.length === 0 ? <EmptyState icon={<Icons.activity size={36} />} title="No runs yet" subtitle="Trigger a workflow to see its run history." /> :
          <table className="ns-table">
            <thead><tr><th>Run ID</th><th>Workflow</th><th>Steps</th><th>Duration</th><th>Status</th><th>Time</th></tr></thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r.id}>
                  <td><code className="mono" style={{ color: 'var(--accent)', fontSize: 11 }}>{r.id.slice(0, 8)}</code></td>
                  <td style={{ fontWeight: 500 }}>{r.workflow_name}</td>
                  <td className="mono">{r.steps_done}/{r.steps_total}</td>
                  <td className="mono">{r.duration_ms}ms</td>
                  <td><span className={`badge badge-${r.status === 'success' ? 'green' : r.status === 'error' ? 'red' : 'yellow'}`}>{r.status}</span></td>
                  <td style={{ color: 'var(--text-3)', fontSize: 12 }}>{r.started_at}</td>
                </tr>
              ))}
            </tbody>
          </table>}
        </GlassPanel>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Workflow">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Lead Qualification" autoFocus />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>Trigger</label>
            <select value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value })} style={{ width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-1)', padding: '8px 10px', borderRadius: 6, fontSize: 13 }}>
              {TRIGGERS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn btn-accent" onClick={handleCreate}>Create</button>
          </div>
        </div>
      </Modal>
    </div></div>
  );
}
