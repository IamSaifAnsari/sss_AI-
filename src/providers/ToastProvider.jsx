import { createContext, useCallback, useContext, useState } from 'react';
import { Icons } from '../components/Icons.jsx';

const ToastCtx = createContext(null);
export const useToast = () => useContext(ToastCtx);

let counter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback((kind, message) => {
    const id = ++counter;
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => remove(id), 4000);
  }, [remove]);

  const api = {
    success: (m) => push('success', m),
    error: (m) => push('error', m),
    info: (m) => push('info', m),
  };

  const color = (k) => k === 'success' ? '#10b981' : k === 'error' ? '#ef4444' : '#3b82f6';

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 9999 }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            background: 'var(--bg-1)', border: '1px solid var(--border-light)', borderLeft: `3px solid ${color(t.kind)}`,
            padding: '10px 14px', borderRadius: 8, color: 'var(--text-0)', fontSize: 13, minWidth: 260, maxWidth: 380,
            display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
            animation: 'fadeInScale .15s ease',
          }}>
            <span style={{ color: color(t.kind), display: 'flex' }}>
              {t.kind === 'success' ? <Icons.check size={16} /> : t.kind === 'error' ? <Icons.x size={16} /> : <Icons.activity size={16} />}
            </span>
            <span style={{ flex: 1 }}>{t.message}</span>
            <button onClick={() => remove(t.id)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <Icons.x size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
