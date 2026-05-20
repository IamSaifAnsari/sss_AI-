import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider.jsx';
import { useToast } from '../providers/ToastProvider.jsx';
import { useConfirm } from '../providers/ConfirmProvider.jsx';
import { api } from '../lib/api.js';
import { GlassPanel, SectionHeader, Tabs } from '../components/ui.jsx';
import { Icons } from '../components/Icons.jsx';

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
        <>
          <GlassPanel style={{ marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-0)', marginBottom: 16 }}>Change Password</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 440 }}>
              <div><label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>Current Password</label><input className="input" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></div>
              <div><label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>New Password</label><input className="input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" /></div>
              <div><label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>Confirm New Password</label><input className="input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></div>
              <button className="btn btn-accent" style={{ alignSelf: 'flex-start' }} onClick={handlePasswordUpdate} disabled={busy}>{busy ? 'Updating...' : 'Update Password'}</button>
            </div>
          </GlassPanel>
          <MfaSection />
        </>
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

function MfaSection() {
  const toast = useToast();
  const confirm = useConfirm();
  const [status, setStatus] = useState(null);
  const [enroll, setEnroll] = useState(null); // { qr_data_url, secret }
  const [code, setCode] = useState('');
  const [recovery, setRecovery] = useState(null); // array shown once after enable
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    try { setStatus(await api.mfaStatus()); }
    catch (e) { toast.error(e.message); }
  };

  useEffect(() => { refresh(); }, []);

  const startEnroll = async () => {
    setBusy(true);
    try { setEnroll(await api.mfaEnrollStart()); }
    catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const verifyEnroll = async () => {
    if (!code) return;
    setBusy(true);
    try {
      const r = await api.mfaEnrollVerify(code);
      setRecovery(r.recovery_codes);
      setEnroll(null);
      setCode('');
      toast.success('2FA enabled');
      refresh();
    } catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const disable = async () => {
    const pwd = window.prompt('Enter your current password to disable 2FA:');
    if (!pwd) return;
    const ok = await confirm({ title: 'Disable 2FA?', message: 'Your account will be less secure.', confirmLabel: 'Disable', danger: true });
    if (!ok) return;
    try { await api.mfaDisable(pwd); toast.success('2FA disabled'); setRecovery(null); refresh(); }
    catch (e) { toast.error(e.message); }
  };

  if (!status) return null;

  return (
    <GlassPanel>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-0)', marginBottom: 4 }}>Two-Factor Authentication</h3>
      <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>
        Adds a code from your authenticator app on top of your password.
      </p>

      {status.enabled && !recovery && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-0)' }}>Enabled</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>Enrolled {status.enrolled_at}</div>
          </div>
          <button className="btn btn-sm" onClick={disable} style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>Disable</button>
        </div>
      )}

      {!status.enabled && !enroll && (
        <button className="btn btn-accent" onClick={startEnroll} disabled={busy}>
          <Icons.key size={14} /> {busy ? 'Loading...' : 'Enable 2FA'}
        </button>
      )}

      {enroll && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 440 }}>
          <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
            Scan this QR with Google Authenticator / 1Password / Authy. Or enter the secret manually.
          </p>
          <div style={{ background: '#fff', padding: 12, borderRadius: 10, alignSelf: 'flex-start' }}>
            <img src={enroll.qr_data_url} alt="2FA QR code" width={200} height={200} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Manual secret: <code className="mono" style={{ color: 'var(--text-1)' }}>{enroll.secret}</code></div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>6-digit code from app</label>
            <input className="input" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" />
          </div>
          <button className="btn btn-accent" onClick={verifyEnroll} disabled={busy || code.length < 6} style={{ alignSelf: 'flex-start' }}>
            {busy ? 'Verifying...' : 'Verify & enable'}
          </button>
        </div>
      )}

      {recovery && (
        <div style={{ marginTop: 14, padding: '14px 16px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8 }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-0)', marginBottom: 6 }}>Save these recovery codes</h4>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10 }}>Each works ONCE. Use one if you lose your phone. They will NOT be shown again.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, fontFamily: 'var(--mono)', fontSize: 12 }}>
            {recovery.map((c) => <code key={c} style={{ padding: '4px 8px', background: 'var(--bg-2)', borderRadius: 4 }}>{c}</code>)}
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => { navigator.clipboard.writeText(recovery.join('\n')); toast.success('Copied'); }}>
            <Icons.copy size={12} /> Copy all
          </button>
        </div>
      )}
    </GlassPanel>
  );
}
