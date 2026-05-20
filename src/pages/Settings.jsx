import { useEffect, useState } from 'react';
import { useWorkspace } from '../providers/WorkspaceProvider.jsx';
import { useToast } from '../providers/ToastProvider.jsx';
import { useTweaks } from '../providers/TweaksProvider.jsx';
import { api } from '../lib/api.js';
import { Icons } from '../components/Icons.jsx';
import { GlassPanel, SectionHeader, Tabs } from '../components/ui.jsx';

const PROVIDERS = [
  { id: 'openai', label: 'OpenAI', hint: 'sk-...' },
  { id: 'anthropic', label: 'Anthropic', hint: 'sk-ant-...' },
  { id: 'google', label: 'Google (Gemini)', hint: 'API key' },
  { id: 'deepseek', label: 'DeepSeek', hint: 'API key' },
  { id: 'mistral', label: 'Mistral', hint: 'API key' },
  { id: 'replicate', label: 'Replicate', hint: 'r8_...' },
];

export default function SettingsPage() {
  const { tweaks, setTweak } = useTweaks();
  const [tab, setTab] = useState('appearance');

  return (
    <div className="page-scroll"><div className="page-inner">
      <SectionHeader title="Settings" subtitle="Customize NeuronStack and connect AI providers" />
      <Tabs tabs={[{ id: 'appearance', label: 'Appearance' }, { id: 'providers', label: 'Provider Keys' }]} active={tab} onChange={setTab} style={{ marginBottom: 20 }} />

      {tab === 'appearance' && (
        <GlassPanel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 520 }}>
            <Row label="Accent Color">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['#3b82f6', '#00d4aa', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#10b981', '#06b6d4'].map((c) => (
                  <button key={c} onClick={() => setTweak('accentColor', c)} style={{
                    width: 28, height: 28, borderRadius: 6, border: tweaks.accentColor === c ? '2px solid var(--text-0)' : '1px solid var(--border)',
                    background: c, cursor: 'pointer', padding: 0,
                  }} />
                ))}
              </div>
            </Row>
            <Row label="Theme">
              <Segment options={['Midnight', 'Charcoal', 'Pitch', 'Light']} value={tweaks.theme} onChange={(v) => setTweak('theme', v)} />
            </Row>
            <Row label="Font">
              <select value={tweaks.fontFamily} onChange={(e) => setTweak('fontFamily', e.target.value)} style={{ width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-1)', padding: '8px 10px', borderRadius: 6, fontSize: 13 }}>
                {['DM Sans', 'Inter', 'Plus Jakarta Sans', 'Manrope'].map((f) => <option key={f}>{f}</option>)}
              </select>
            </Row>
            <Row label="Sidebar style">
              <Segment options={['Glass', 'Solid', 'Minimal']} value={tweaks.sidebarStyle} onChange={(v) => setTweak('sidebarStyle', v)} />
            </Row>
            <Row label="Card style">
              <Segment options={['Glass', 'Solid', 'Border']} value={tweaks.cardStyle} onChange={(v) => setTweak('cardStyle', v)} />
            </Row>
            <Row label="Density">
              <Segment options={['Compact', 'Default', 'Comfortable']} value={tweaks.density} onChange={(v) => setTweak('density', v)} />
            </Row>
          </div>
        </GlassPanel>
      )}

      {tab === 'providers' && <ProviderKeys />}
    </div></div>
  );
}

function ProviderKeys() {
  const { active } = useWorkspace();
  const toast = useToast();
  const [providers, setProviders] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [busy, setBusy] = useState({});

  const refresh = async () => {
    if (!active?.id) return;
    try { setProviders(await api.listProviders(active.id)); }
    catch (e) { toast.error(e.message); }
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [active?.id]);

  const save = async (p) => {
    const key = drafts[p.id];
    if (!key || key.length < 10) { toast.error('Key looks too short'); return; }
    setBusy((b) => ({ ...b, [p.id]: true }));
    try {
      await api.saveProviderKey(active.id, p.id, key, p.label);
      toast.success(`${p.label} key saved`);
      setDrafts((d) => ({ ...d, [p.id]: '' }));
      refresh();
    } catch (e) { toast.error(e.message); }
    finally { setBusy((b) => ({ ...b, [p.id]: false })); }
  };

  const remove = async (p) => {
    try { await api.deleteProviderKey(active.id, p.id); toast.success('Removed'); refresh(); }
    catch (e) { toast.error(e.message); }
  };

  if (!active) return null;
  if (active.role !== 'owner' && active.role !== 'admin') {
    return <GlassPanel><p style={{ color: 'var(--text-3)', fontSize: 13 }}>Only workspace owners and admins can manage provider keys.</p></GlassPanel>;
  }

  return (
    <GlassPanel>
      <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16, lineHeight: 1.5 }}>
        Keys are encrypted (AES-256-GCM) at rest. Used server-side by the Playground and AI proxy. Never exposed to the browser.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {PROVIDERS.map((p) => {
          const configured = providers.some((r) => r.provider === p.id);
          return (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'var(--bg-2)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <div style={{ width: 100, fontWeight: 600, color: 'var(--text-0)', fontSize: 13 }}>{p.label}</div>
              <span className={`badge badge-${configured ? 'green' : 'yellow'}`}>{configured ? 'set' : 'none'}</span>
              <input type="password" placeholder={p.hint} value={drafts[p.id] || ''} onChange={(e) => setDrafts((d) => ({ ...d, [p.id]: e.target.value }))}
                style={{ flex: 1, background: 'var(--bg-1)', border: '1px solid var(--border)', color: 'var(--text-1)', padding: '6px 10px', borderRadius: 6, fontSize: 12 }} />
              <button className="btn btn-accent btn-sm" disabled={busy[p.id]} onClick={() => save(p)}>{busy[p.id] ? 'Saving...' : 'Save'}</button>
              {configured && <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => remove(p)} title="Remove"><Icons.trash size={13} /></button>}
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
}

function Row({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6, display: 'block' }}>{label}</label>
      {children}
    </div>
  );
}

function Segment({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 2, padding: 3, background: 'var(--bg-2)', borderRadius: 8, border: '1px solid var(--border)' }}>
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)} style={{
          flex: 1, padding: '7px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
          background: value === o ? 'var(--bg-4)' : 'transparent', color: value === o ? 'var(--text-0)' : 'var(--text-3)',
        }}>{o}</button>
      ))}
    </div>
  );
}
