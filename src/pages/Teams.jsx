import { useEffect, useState } from 'react';
import { useWorkspace } from '../providers/WorkspaceProvider.jsx';
import { useToast } from '../providers/ToastProvider.jsx';
import { useConfirm } from '../providers/ConfirmProvider.jsx';
import { api } from '../lib/api.js';
import { Icons } from '../components/Icons.jsx';
import { GlassPanel, Modal, SectionHeader, Tabs, EmptyState } from '../components/ui.jsx';

const ROLES = ['admin', 'developer', 'viewer'];

export default function TeamsPage() {
  const { active } = useWorkspace();
  const toast = useToast();
  const confirm = useConfirm();
  const [tab, setTab] = useState('members');
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({ email: '', role: 'developer' });
  const [newInvite, setNewInvite] = useState(null);

  const refresh = async () => {
    if (!active?.id) return;
    setLoading(true);
    try {
      const [ms, ivs] = await Promise.all([
        api.listMembers(active.id),
        active.role === 'owner' || active.role === 'admin' ? api.listInvitations(active.id) : Promise.resolve([]),
      ]);
      setMembers(ms);
      setInvites(ivs);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [active?.id]);

  const handleInvite = async () => {
    if (!form.email.includes('@')) { toast.error('Valid email required'); return; }
    try {
      const r = await api.createInvitation(active.id, form.email.trim(), form.role);
      const url = `${window.location.origin}/invite/${r.token}`;
      setNewInvite({ ...r, full_url: url });
      setShowInvite(false); setForm({ email: '', role: 'developer' });
      toast.success('Invite created');
      refresh();
    } catch (e) { toast.error(e.message); }
  };

  const handleRevoke = async (i) => {
    const ok = await confirm({ title: 'Revoke invite?', message: `Cancel invitation to ${i.email}?`, confirmLabel: 'Revoke', danger: true });
    if (!ok) return;
    try { await api.deleteInvitation(active.id, i.id); toast.success('Revoked'); refresh(); }
    catch (e) { toast.error(e.message); }
  };

  const handleRemoveMember = async (m) => {
    const ok = await confirm({ title: 'Remove member?', message: `Remove ${m.email} from this workspace?`, confirmLabel: 'Remove', danger: true });
    if (!ok) return;
    try { await api.removeMember(active.id, m.id); toast.success('Removed'); refresh(); }
    catch (e) { toast.error(e.message); }
  };

  const handleRoleChange = async (m, role) => {
    try { await api.updateMemberRole(active.id, m.id, role); toast.success('Role updated'); refresh(); }
    catch (e) { toast.error(e.message); }
  };

  if (!active) return null;
  const canManage = active.role === 'owner' || active.role === 'admin';

  return (
    <div className="page-scroll"><div className="page-inner">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <SectionHeader title="Teams" subtitle={`Manage members and invitations · ${active.name}`} style={{ marginBottom: 0 }} />
        {canManage && <button className="btn btn-accent" onClick={() => setShowInvite(true)}><Icons.plus size={14} /> Invite</button>}
      </div>

      <Tabs tabs={[{ id: 'members', label: `Members (${members.length})` }, ...(canManage ? [{ id: 'invites', label: `Pending invites (${invites.length})` }] : [])]} active={tab} onChange={setTab} style={{ marginBottom: 16 }} />

      {loading ? <div style={{ color: 'var(--text-3)', fontSize: 13 }}>Loading...</div> : tab === 'members' ? (
        members.length === 0 ? <GlassPanel><EmptyState icon={<Icons.users size={48} />} title="No members" /></GlassPanel> :
        <GlassPanel style={{ padding: 0, overflow: 'hidden' }}>
          <table className="ns-table">
            <thead><tr><th>Member</th><th>Email</th><th>Role</th><th>Joined</th><th></th></tr></thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 500 }}>{[m.first_name, m.last_name].filter(Boolean).join(' ') || '—'}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-3)' }}>{m.email}</td>
                  <td>
                    {canManage && m.role !== 'owner' ? (
                      <select value={m.role} onChange={(e) => handleRoleChange(m, e.target.value)} style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-1)', padding: '3px 8px', borderRadius: 5, fontSize: 11 }}>
                        {ROLES.map((r) => <option key={r}>{r}</option>)}
                      </select>
                    ) : <span className={`badge badge-${m.role === 'owner' ? 'cyan' : m.role === 'admin' ? 'violet' : 'blue'}`}>{m.role}</span>}
                  </td>
                  <td style={{ color: 'var(--text-3)', fontSize: 12 }}>{m.joined_at}</td>
                  <td>{canManage && m.role !== 'owner' && <button className="btn btn-ghost btn-sm" style={{ padding: 4, color: 'var(--red)' }} onClick={() => handleRemoveMember(m)}><Icons.trash size={13} /></button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassPanel>
      ) : (
        invites.length === 0 ? <GlassPanel><EmptyState icon={<Icons.send size={48} />} title="No pending invites" /></GlassPanel> :
        <GlassPanel style={{ padding: 0, overflow: 'hidden' }}>
          <table className="ns-table">
            <thead><tr><th>Email</th><th>Role</th><th>Invite URL</th><th>Expires</th><th></th></tr></thead>
            <tbody>
              {invites.map((iv) => (
                <tr key={iv.id}>
                  <td>{iv.email}</td>
                  <td><span className={`badge badge-${iv.role === 'admin' ? 'violet' : 'blue'}`}>{iv.role}</span></td>
                  <td><code className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>{`/invite/${iv.token.slice(0, 12)}...`}</code></td>
                  <td style={{ color: 'var(--text-3)', fontSize: 12 }}>{iv.expires_at}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/invite/${iv.token}`); toast.success('Copied'); }}><Icons.copy size={13} /></button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => handleRevoke(iv)}><Icons.trash size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassPanel>
      )}

      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Invite member">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@example.com" autoFocus />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={{ width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-1)', padding: '8px 10px', borderRadius: 6, fontSize: 13 }}>
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-3)' }}>Generates an invite link valid for 7 days. SMTP not configured — copy and send the link manually.</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="btn btn-ghost" onClick={() => setShowInvite(false)}>Cancel</button>
            <button className="btn btn-accent" onClick={handleInvite}>Create invite</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!newInvite} onClose={() => setNewInvite(null)} title="Invitation created">
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12 }}>Share this link with the invitee. It expires in 7 days.</p>
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, fontFamily: 'var(--mono)', fontSize: 11, wordBreak: 'break-all', marginBottom: 12 }}>{newInvite?.full_url}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => { navigator.clipboard.writeText(newInvite.full_url); toast.success('Copied'); }}><Icons.copy size={13} /> Copy</button>
          <button className="btn btn-accent" onClick={() => setNewInvite(null)}>Done</button>
        </div>
      </Modal>
    </div></div>
  );
}
