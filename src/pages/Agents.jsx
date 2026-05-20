import { useEffect, useState } from 'react';
import { useWorkspace } from '../providers/WorkspaceProvider.jsx';
import { useToast } from '../providers/ToastProvider.jsx';
import { useConfirm } from '../providers/ConfirmProvider.jsx';
import { api } from '../lib/api.js';
import { GlassPanel, Modal, SectionHeader, EmptyState } from '../components/ui.jsx';
import { Icons } from '../components/Icons.jsx';
import { fmtNum } from '../lib/utils.js';

const MODELS = [
  { id: 'gpt-4o', label: 'GPT-4o (OpenAI)' },
  { id: 'claude-3.5', label: 'Claude 3.5 Sonnet (Anthropic)' },
  { id: 'gemini-pro', label: 'Gemini Pro (Google)' },
  { id: 'llama-3.1', label: 'Llama 3.1 70B (Meta)' },
];

const TOOLS = [
  { id: 'crm', name: 'CRM Integration' }, { id: 'email', name: 'Email' },
  { id: 'calendar', name: 'Calendar' }, { id: 'whatsapp', name: 'WhatsApp' },
  { id: 'search', name: 'Web Search' }, { id: 'knowledge', name: 'Knowledge Base' },
  { id: 'sql', name: 'SQL Database' }, { id: 'slack', name: 'Slack' },
  { id: 'sheets', name: 'Google Sheets' }, { id: 'api', name: 'Custom API' },
];

export default function AgentsPage() {
  const { active } = useWorkspace();
  const toast = useToast();
  const confirm = useConfirm();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [form, setForm] = useState({ name: '', desc: '', model: 'gpt-4o', systemPrompt: 'You are a helpful AI assistant.', tools: [] });

  const refresh = async () => {
    if (!active?.id) return;
    setLoading(true);
    try { setAgents(await api.listAgents(active.id)); }
    catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [active?.id]);

  const toggleTool = (t) => setForm((f) => ({ ...f, tools: f.tools.includes(t) ? f.tools.filter((x) => x !== t) : [...f.tools, t] }));

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error('Name required'); return; }
    try {
      await api.createAgent(active.id, form);
      toast.success(`Agent "${form.name}" created`);
      setShowWizard(false);
      setForm({ name: '', desc: '', model: 'gpt-4o', systemPrompt: 'You are a helpful AI assistant.', tools: [] });
      refresh();
    } catch (e) { toast.error(e.message || 'Could not create agent'); }
  };

  const handleDelete = async (a) => {
    const ok = await confirm({ title: 'Delete agent?', message: `This removes "${a.name}".`, confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    try { await api.deleteAgent(active.id, a.id); toast.success('Agent deleted'); refresh(); }
    catch (e) { toast.error(e.message); }
  };

  if (!active) return null;

  return (
    <div className="page-scroll"><div className="page-inner">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <SectionHeader title="AI Agents" subtitle="Build and deploy autonomous agents" style={{ marginBottom: 0 }} />
        <button className="btn btn-accent" onClick={() => setShowWizard(true)}><Icons.plus size={14} /> New Agent</button>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-3)', fontSize: 13 }}>Loading...</div>
      ) : agents.length === 0 ? (
        <GlassPanel><EmptyState icon={<Icons.bot size={48} />} title="No agents yet" subtitle="Build your first agent to get started." action={<button className="btn btn-accent" onClick={() => setShowWizard(true)}><Icons.plus size={14} /> New Agent</button>} /></GlassPanel>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 14 }}>
          {agents.map((a) => (
            <div key={a.id} className="glass-card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icons.bot size={18} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-0)' }}>{a.name}</h3>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{a.model}</span>
                  </div>
                </div>
                <span className={`badge badge-${a.status === 'active' ? 'green' : a.status === 'paused' ? 'yellow' : 'blue'}`}>{a.status}</span>
              </div>
              {a.description && <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>{a.description}</p>}
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                {(a.tools || []).map((t) => <span key={t} style={{ fontSize: 10, padding: '2px 7px', background: 'var(--bg-3)', borderRadius: 4, color: 'var(--text-2)', border: '1px solid var(--border)' }}>{t}</span>)}
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-3)', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{fmtNum(a.calls || 0)} calls · {(a.success_rate || 0)}% success</span>
                <button className="btn btn-ghost btn-sm" style={{ padding: 4, color: 'var(--red)' }} onClick={() => handleDelete(a)}><Icons.trash size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showWizard} onClose={() => setShowWizard(false)} title="Create Agent" width={580}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. SalesBot Pro" autoFocus />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>Description</label>
            <textarea className="input" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} rows={2} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>Model</label>
            <select value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} style={{ width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-1)', padding: '8px 10px', borderRadius: 6, fontSize: 13 }}>
              {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>System Prompt</label>
            <textarea className="input" value={form.systemPrompt} onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })} rows={4} style={{ fontFamily: 'var(--mono)' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>Tools</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {TOOLS.map((t) => {
                const sel = form.tools.includes(t.id);
                return (
                  <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, background: sel ? 'var(--accent-dim)' : 'var(--bg-2)', border: `1px solid ${sel ? 'var(--accent)' : 'var(--border)'}`, cursor: 'pointer', fontSize: 12 }}>
                    <input type="checkbox" checked={sel} onChange={() => toggleTool(t.id)} style={{ accentColor: 'var(--accent)' }} />
                    {t.name}
                  </label>
                );
              })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => setShowWizard(false)}>Cancel</button>
            <button className="btn btn-accent" onClick={handleCreate}>Create Agent</button>
          </div>
        </div>
      </Modal>
    </div></div>
  );
}
