import { useEffect, useState } from 'react';
import { useWorkspace } from '../providers/WorkspaceProvider.jsx';
import { useToast } from '../providers/ToastProvider.jsx';
import { useConfirm } from '../providers/ConfirmProvider.jsx';
import { api } from '../lib/api.js';
import { Icons } from '../components/Icons.jsx';
import { SectionHeader, EmptyState, GlassPanel } from '../components/ui.jsx';

const CAT_COLORS = { industry: 'var(--accent3)', agents: 'var(--accent)', workflows: '#f59e0b', voice: 'var(--accent2)', prompts: '#10b981' };

export default function MarketplacePage() {
  const { active } = useWorkspace();
  const toast = useToast();
  const confirm = useConfirm();
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState({});
  const [category, setCategory] = useState('all');

  const refresh = async () => {
    if (!active?.id) return;
    try { setItems(await api.listMarketplaceItems(active.id)); }
    catch (e) { toast.error(e.message); }
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [active?.id]);

  const cats = ['all', ...Array.from(new Set(items.map((i) => i.category)))];
  const filtered = items.filter((i) => category === 'all' || i.category === category);

  const handleInstall = async (it) => {
    setBusy((b) => ({ ...b, [it.slug]: true }));
    try {
      const r = await api.installMarketplaceItem(active.id, it.slug);
      toast.success(`Installed "${it.name}" — added ${r.created.agents.length} agents, ${r.created.workflows.length} workflows`);
      refresh();
    } catch (e) { toast.error(e.message); }
    finally { setBusy((b) => ({ ...b, [it.slug]: false })); }
  };

  const handleUninstall = async (it) => {
    const ok = await confirm({ title: 'Uninstall?', message: `"${it.name}" — created agents and workflows will remain. Reinstalling later will create duplicates.`, confirmLabel: 'Uninstall' });
    if (!ok) return;
    try { await api.uninstallMarketplaceItem(active.id, it.slug); toast.success('Uninstalled'); refresh(); }
    catch (e) { toast.error(e.message); }
  };

  if (!active) return null;

  return (
    <div className="page-scroll"><div className="page-inner">
      <SectionHeader title="Marketplace" subtitle="Pre-built templates. Installing creates real agents and workflows in this workspace." />
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {cats.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className="btn btn-sm" style={{
            background: c === category ? 'var(--accent-dim)' : 'var(--bg-3)',
            color: c === category ? 'var(--accent)' : 'var(--text-3)',
            border: `1px solid ${c === category ? 'rgba(0,212,170,0.3)' : 'var(--border)'}`, textTransform: 'capitalize',
          }}>{c}</button>
        ))}
      </div>

      {filtered.length === 0 ? <GlassPanel><EmptyState icon={<Icons.store size={48} />} title="No items in this category" /></GlassPanel> :
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 14 }}>
        {filtered.map((item) => (
          <div key={item.slug} className="glass-card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${CAT_COLORS[item.category] || 'var(--accent)'}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icons.store size={18} style={{ color: CAT_COLORS[item.category] || 'var(--accent)' }} />
              </div>
              <span className={`badge badge-${item.category === 'industry' ? 'violet' : item.category === 'agents' ? 'cyan' : 'blue'}`}>{item.category}</span>
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-0)', marginBottom: 4 }}>{item.name}</h3>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10, lineHeight: 1.5, minHeight: 36 }}>{item.description}</p>
            <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
              {item.tags.map((t) => <span key={t} style={{ fontSize: 10, padding: '2px 6px', background: 'var(--bg-3)', borderRadius: 4, color: 'var(--text-2)', border: '1px solid var(--border)' }}>{t}</span>)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)' }}>
              <span>{item.installs} installs · ★ {item.rating}</span>
              {item.installed ? (
                <button className="btn btn-ghost btn-sm" onClick={() => handleUninstall(item)}>Uninstall</button>
              ) : (
                <button className="btn btn-accent btn-sm" onClick={() => handleInstall(item)} disabled={busy[item.slug]}>
                  {busy[item.slug] ? 'Installing...' : 'Install'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>}
    </div></div>
  );
}
