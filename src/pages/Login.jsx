import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider.jsx';
import { Icons } from '../components/Icons.jsx';
import { api } from '../lib/api.js';

export default function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('signin'); // signin | signup | forgot
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (auth.user) return <Navigate to={location.state?.from?.pathname || '/dashboard'} replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (mode !== 'forgot' && !email.trim()) { setError('Email is required'); return; }
    setLoading(true);
    try {
      if (mode === 'signin') {
        const r = await auth.signIn(email.trim(), password, mfaCode || undefined);
        if (r && r.mfa_required) {
          setMfaRequired(true);
          setError('');
          return;
        }
        navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
      } else if (mode === 'signup') {
        if (password.length < 8) throw new Error('Password must be at least 8 characters');
        await auth.signUp(email.trim(), password, workspaceName.trim() || undefined);
        navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
      } else if (mode === 'forgot') {
        const r = await api.requestPasswordReset(email.trim());
        if (r?.dev_reset_url) {
          setInfo(`Dev mode: ${window.location.origin}${r.dev_reset_url}`);
        } else {
          setInfo('If that email exists, a reset link has been sent.');
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px', background: 'var(--bg-2)', border: '1px solid var(--border)',
    borderRadius: 8, color: 'var(--text-0)', fontFamily: 'var(--font)', fontSize: 14, outline: 'none',
  };

  const switchMode = (m) => { setMode(m); setError(''); };

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'var(--bg-0)' }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', width: '140%', height: '140%', top: '-20%', left: '-20%',
          background: 'radial-gradient(ellipse 30% 40% at 20% 30%, rgba(59,130,246,0.08), transparent 60%), radial-gradient(ellipse 35% 30% at 75% 70%, rgba(139,92,246,0.06), transparent 60%)',
        }} />
      </div>

      <div style={{
        position: 'relative', width: 420, maxWidth: '92vw', zIndex: 1,
        background: 'var(--bg-1)', backdropFilter: 'blur(24px)',
        border: '1px solid var(--border-light)', borderRadius: 16,
        padding: '40px 36px', boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Icons.zap size={22} style={{ color: '#000' }} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-0)', letterSpacing: '-0.02em' }}>NeuronStack AI</h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
            {mode === 'signup' ? 'Create your account' : mode === 'forgot' ? 'Reset your password' : 'Welcome back'}
          </p>
        </div>

        {mode !== 'forgot' && (
          <div style={{ display: 'flex', gap: 2, padding: 3, background: 'var(--bg-2)', borderRadius: 8, marginBottom: 24, border: '1px solid var(--border)' }}>
            {[{ id: 'signin', label: 'Sign In' }, { id: 'signup', label: 'Sign Up' }].map((m) => (
              <button key={m.id} type="button" onClick={() => { switchMode(m.id); setMfaRequired(false); setMfaCode(''); }} style={{
                flex: 1, padding: '8px 0', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font)', fontSize: 13, fontWeight: 600,
                background: mode === m.id ? 'var(--bg-4)' : 'transparent',
                color: mode === m.id ? 'var(--text-0)' : 'var(--text-3)',
              }}>{m.label}</button>
            ))}
          </div>
        )}

        <form onSubmit={onSubmit}>
          {!mfaRequired && (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', marginBottom: 6, display: 'block' }}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" style={inputStyle} autoFocus required />
              </div>
              {mode !== 'forgot' && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', marginBottom: 6, display: 'block' }}>Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'} style={inputStyle} required minLength={mode === 'signup' ? 8 : 1} />
                </div>
              )}
              {mode === 'signup' && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', marginBottom: 6, display: 'block' }}>Workspace name (optional)</label>
                  <input type="text" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} placeholder="My Company" style={inputStyle} />
                </div>
              )}
            </>
          )}

          {mfaRequired && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', marginBottom: 6, display: 'block' }}>6-digit code from your authenticator app</label>
              <input type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={10} value={mfaCode} onChange={(e) => setMfaCode(e.target.value)}
                placeholder="123456 (or recovery code)" style={{ ...inputStyle, letterSpacing: 4, textAlign: 'center', fontSize: 18 }} autoFocus required />
            </div>
          )}

          {error && <div style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 12, margin: '14px 0' }}>{error}</div>}
          {info && <div style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399', fontSize: 12, margin: '14px 0', wordBreak: 'break-all' }}>{info}</div>}

          <button type="submit" className="btn btn-accent" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '11px 0', fontSize: 14, borderRadius: 8, marginTop: 8, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Working...'
              : mfaRequired ? 'Verify code'
                : mode === 'signup' ? 'Create account'
                  : mode === 'forgot' ? 'Send reset link'
                    : 'Sign in'}
          </button>
        </form>

        {mode === 'signin' && !mfaRequired && (
          <div style={{ marginTop: 14, textAlign: 'center' }}>
            <button type="button" onClick={() => { switchMode('forgot'); setMfaRequired(false); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>
              Forgot password?
            </button>
          </div>
        )}
        {mode === 'forgot' && (
          <div style={{ marginTop: 14, textAlign: 'center' }}>
            <button type="button" onClick={() => switchMode('signin')} style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: 11, cursor: 'pointer' }}>
              ← Back to sign in
            </button>
          </div>
        )}

        <div style={{ marginTop: 28, paddingTop: 16, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <p style={{ fontSize: 10, color: 'var(--text-3)' }}>Local SQLite-backed accounts. Data lives in <code>data/neuronstack.db</code>.</p>
        </div>
      </div>
    </div>
  );
}
