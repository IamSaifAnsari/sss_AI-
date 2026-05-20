import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { Icons } from '../components/Icons.jsx';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initialToken = params.get('token') || '';
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setBusy(true);
    try {
      await api.completePasswordReset(token.trim(), password);
      setDone(true);
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      setError(err.message || 'Reset failed');
    } finally {
      setBusy(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px', background: 'var(--bg-2)', border: '1px solid var(--border)',
    borderRadius: 8, color: 'var(--text-0)', fontFamily: 'var(--font)', fontSize: 14, outline: 'none', marginBottom: 12,
  };

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-0)' }}>
      <form onSubmit={submit} style={{ width: 400, maxWidth: '92vw', background: 'var(--bg-1)', border: '1px solid var(--border-light)', borderRadius: 14, padding: 28 }}>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <Icons.key size={20} style={{ color: '#000' }} />
          </div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-0)' }}>Set new password</h2>
        </div>

        {done ? (
          <div style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399', fontSize: 13, textAlign: 'center' }}>
            Password updated. Redirecting...
          </div>
        ) : (
          <>
            {!initialToken && (
              <input type="text" placeholder="Reset token from email" value={token} onChange={(e) => setToken(e.target.value)} style={inputStyle} required />
            )}
            <input type="password" placeholder="New password (min 8 chars)" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required />
            <input type="password" placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={inputStyle} required />
            {error && <div style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 12, marginBottom: 12 }}>{error}</div>}
            <button type="submit" className="btn btn-accent" disabled={busy} style={{ width: '100%', justifyContent: 'center', padding: '10px 0', opacity: busy ? 0.7 : 1 }}>
              {busy ? 'Updating...' : 'Update password'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
