import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ConfirmCtx = createContext(null);
export const useConfirm = () => useContext(ConfirmCtx);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const resolverRef = useRef(null);

  const confirm = useCallback((opts = {}) => {
    setState({
      title: opts.title || 'Are you sure?',
      message: opts.message || '',
      confirmLabel: opts.confirmLabel || 'Confirm',
      cancelLabel: opts.cancelLabel || 'Cancel',
      danger: !!opts.danger,
    });
    return new Promise((resolve) => { resolverRef.current = resolve; });
  }, []);

  const handle = (ok) => {
    setState(null);
    if (resolverRef.current) { resolverRef.current(ok); resolverRef.current = null; }
  };

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      {state && (
        <div onClick={() => handle(false)} style={{ position: 'fixed', inset: 0, zIndex: 1500, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn .15s ease' }}>
          <div onClick={(e) => e.stopPropagation()} className="glass-card-static" style={{ width: 420, maxWidth: '90vw', padding: 22, animation: 'fadeInScale .2s ease' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-0)', marginBottom: 6 }}>{state.title}</h3>
            {state.message && <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 16 }}>{state.message}</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => handle(false)}>{state.cancelLabel}</button>
              <button
                className={state.danger ? 'btn' : 'btn btn-accent'}
                style={state.danger ? { background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' } : {}}
                onClick={() => handle(true)}
              >{state.confirmLabel}</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmCtx.Provider>
  );
}
