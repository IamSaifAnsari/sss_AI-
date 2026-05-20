import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider.jsx';
import { useToast } from '../providers/ToastProvider.jsx';
import { useConfirm } from '../providers/ConfirmProvider.jsx';
import { api } from '../lib/api.js';
import { GlassPanel, SectionHeader, Tabs } from '../components/ui.jsx';

export default function ProfilePage() {
  const { user, signOut, changePassword } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!user) return;
    api.getProfile().then(setProfile).catch((e) => toast.error(e.message));
    // eslint-disable-next-line
  }, [user]);

  const update = (field, v) => setProfile((p) => ({ ...p, [field]: v }));

  const save = async () => {
    setBusy(true);
    try {
      await api.updateProfile({
        first_name: profile.first_name, last_name: profile.last_name, timezone: profile.timezone,
      });
      toast.success('Profile updated');
    } catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const handlePasswordUpdate = async () => {
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setBusy(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success('Password updated');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const handleSignOut = async () => {
    const ok = await confirm({ title: 'Sign out?', message: 'You will be returned to the login screen.', confirmLabel: 'Sign out' });
    if (!ok) return;
    await signOut();
    navigate('/login', { replace: true });
  };

  if (!profile) return <div className="page-scroll"><div className="page-inner" style={{ color: 'var(--text-3)' }}>Loading...</div></div>;

  return (
    <div className="page-scroll"><div className="page-inner">
      <SectionHeader title="Profile & Account" subtitle="Manage your personal information and security" />
      <Tabs tabs={[{ id: 'profile', label: 'Profile' }, { id: 'security', label: 'Security' }, { id: 'danger', label: 'Danger Zone' }]} active={tab} onChange={setTab} style={{ marginBottom: 20 }} />

      {tab === 'profile' && (
        <GlassPanel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 480 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>First Name</label><input className="input" value={profile.first_name || ''} onChange={(e) => update('first_name', e.target.value)} /></div>
              <div><label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>Last Name</label><input className="input" value={profile.last_name || ''} onChange={(e) => update('last_name', e.target.value)} /></div>
            </div>
            <div><label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>Email</label><input className="input" value={profile.email || ''} disabled style={{ opacity: 0.6 }} /></div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>Timezone</label>
              <select value={profile.timezone || ''} onChange={(e) => update('timezone', e.target.value)} style={{ width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-1)', padding: '8px 10px', borderRadius: 6, fontSize: 13 }}>
                <option>America/New_York (EST)</option><option>America/Los_Angeles (PST)</option><option>Europe/London (GMT)</option><option>Asia/Tokyo (JST)</option>
              </select>
            </div>
            <button className="btn btn-accent" style={{ alignSelf: 'flex-start' }} onClick={save} disabled={busy}>{busy ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </GlassPanel>
      )}

      {tab === 'security' && (
        <GlassPanel>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-0)', marginBottom: 16 }}>Change Password</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 440 }}>
            <div><label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>Current Password</label><input className="input" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></div>
            <div><label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>New Password</label><input className="input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" /></div>
            <div><label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>Confirm New Password</label><input className="input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></div>
            <button className="btn btn-accent" style={{ alignSelf: 'flex-start' }} onClick={handlePasswordUpdate} disabled={busy}>{busy ? 'Updating...' : 'Update Password'}</button>
          </div>
        </GlassPanel>
      )}

      {tab === 'danger' && (
        <GlassPanel style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f87171', marginBottom: 16 }}>Danger Zone</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--bg-2)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <div><div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-0)' }}>Sign Out</div><div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>End current session</div></div>
              <button className="btn btn-sm btn-ghost" onClick={handleSignOut}>Sign out</button>
            </div>
          </div>
        </GlassPanel>
      )}
    </div></div>
  );
}
