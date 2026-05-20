import { useEffect, useState } from 'react';
import { useWorkspace } from '../providers/WorkspaceProvider.jsx';
import { useToast } from '../providers/ToastProvider.jsx';
import { api } from '../lib/api.js';
import { GlassPanel, SectionHeader, EmptyState } from '../components/ui.jsx';
import { Icons } from '../components/Icons.jsx';

const lvlColor = { info: 'var(--text-3)', warn: '#f59e0b', error: '#ef4444', debug: 'var(--accent2)' };
const LEVELS = ['all', 'info', 'warn', 'error', 'debug'];

export default function LogsPage() {
  const { active } = useWorkspace();
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!active?.id) return;
    setLoading(true);
    try { setLogs(await api.listLogs(active.id, filter === 'all' ? null : filter)); }
    catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [active?.id, filter]);
  useEffect(() => { const i = setInterval(refresh, 3000); return () => clearInterval(i); /* eslint-disable-next-line */ }, [active?.id, filter]);

  if (!active) return null;

  return (
    <div className="page-scroll"><div className="page-inner">
      <SectionHeader title="Logs" subtitle="Server events for this workspace (auto-refresh every 3s)" />
      <GlassPanel style={{ padding: 0, fontFamily: 'var(--mono)', fontSize: 12, lineHeight: 1.8, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="sdot sdot-green"></div>
          <span style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: 'var(--font)' }}>Live ({logs.length} events)</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            {LEVELS.map((l) => (
              <button key={l} onClick={() => setFilter(l)} className="btn btn-sm" style={{
                padding: '2px 8px', fontSize: 10, textTransform: 'uppercase',
                background: filter === l ? 'var(--accent-dim)' : 'var(--bg-3)',
                color: filter === l ? 'var(--accent)' : 'var(--text-3)',
              }}>{l}</button>
            ))}
            <button onClick={refresh} className="btn btn-ghost btn-sm" style={{ padding: '2px 8px', fontSize: 10 }} title="Refresh"><Icons.activity size={11} /></button>
          </div>
        </div>
        <div style={{ padding: '8px 16px', maxHeight: 600, overflowY: 'auto' }}>
          {loading && logs.length === 0 ? <div style={{ color: 'var(--text-3)', fontSize: 12 }}>Loading...</div> :
           logs.length === 0 ? <EmptyState icon={<Icons.fileText size={36} />} title="No log events yet" subtitle="Perform actions to populate the log." /> :
           logs.map((l) => (
            <div key={l.id} style={{ display: 'flex', gap: 12, padding: '3px 0', color: lvlColor[l.level] || 'var(--text-3)' }}>
              <span style={{ color: 'var(--text-3)', flexShrink: 0, width: 140 }}>{l.occurred_at}</span>
              <span style={{ width: 44, flexShrink: 0, textTransform: 'uppercase', fontWeight: 600, color: lvlColor[l.level] }}>{l.level}</span>
              <span style={{ width: 100, flexShrink: 0, color: 'var(--accent)' }}>{l.service}</span>
              <span style={{ color: 'var(--text-2)', minWidth: 0, wordBreak: 'break-word' }}>{l.message}</span>
            </div>
          ))}
        </div>
      </GlassPanel>
    </div></div>
  );
}
