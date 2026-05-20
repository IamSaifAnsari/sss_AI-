import { useEffect, useRef, useState } from 'react';
import { useWorkspace } from '../providers/WorkspaceProvider.jsx';
import { useToast } from '../providers/ToastProvider.jsx';
import { useConfirm } from '../providers/ConfirmProvider.jsx';
import { api } from '../lib/api.js';
import { Icons } from '../components/Icons.jsx';
import { GlassPanel, SectionHeader, EmptyState } from '../components/ui.jsx';

const MODELS = [
  { id: 'zeroscope-v2', label: 'Zeroscope V2 XL (Replicate, ~1min)' },
  { id: 'animatediff', label: 'AnimateDiff (Replicate)' },
];

export default function VideoStudioPage() {
  const { active } = useWorkspace();
  const toast = useToast();
  const confirm = useConfirm();
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('zeroscope-v2');
  const [items, setItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const pollRef = useRef(null);

  const refresh = async () => {
    if (!active?.id) return;
    try { setItems(await api.listVideos(active.id)); }
    catch (e) { toast.error(e.message); }
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [active?.id]);
  useEffect(() => {
    const tick = () => {
      if (items.some((i) => i.status === 'processing' || i.status === 'pending')) refresh();
    };
    pollRef.current = setInterval(tick, 4000);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line
  }, [items]);

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error('Prompt required'); return; }
    setSubmitting(true);
    try {
      await api.generateVideo(active.id, { prompt: prompt.trim(), model });
      toast.success('Generation queued (this can take minutes)');
      setPrompt('');
      refresh();
    } catch (e) { toast.error(e.message); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (v) => {
    const ok = await confirm({ title: 'Delete video?', message: `"${v.prompt.slice(0, 60)}..."`, confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    try { await api.deleteVideo(active.id, v.id); refresh(); } catch (e) { toast.error(e.message); }
  };

  if (!active) return null;

  return (
    <div className="page-scroll"><div className="page-inner">
      <SectionHeader title="Video Studio" subtitle="Real text-to-video via Replicate (slow + expensive)" />
      <GlassPanel style={{ marginBottom: 20, maxWidth: 760 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>Prompt</label>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="A drone shot flying over a misty forest at dawn..."
              rows={2} className="input" style={{ resize: 'vertical' }} />
          </div>
          <div style={{ width: 240 }}>
            <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>Model</label>
            <select value={model} onChange={(e) => setModel(e.target.value)} style={{ width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-1)', padding: '8px 10px', borderRadius: 6, fontSize: 12 }}>
              {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
          <button className="btn btn-accent" onClick={handleGenerate} disabled={submitting} style={{ padding: '10px 18px' }}>
            {submitting ? 'Submitting...' : <><Icons.film size={14} /> Generate</>}
          </button>
        </div>
        <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 8 }}>Needs Replicate key in Settings → Provider Keys. Each generation can take 1–5 minutes.</p>
      </GlassPanel>

      {items.length === 0 ? <GlassPanel><EmptyState icon={<Icons.film size={48} />} title="No videos yet" subtitle="Submit a prompt above." /></GlassPanel> :
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
          {items.map((v) => (
            <div key={v.id} className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
              <div style={{ aspectRatio: '16/9', background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {v.video_url ? (
                  <video src={v.video_url} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : v.status === 'failed' ? (
                  <span style={{ color: '#f87171', fontSize: 11, padding: 8, textAlign: 'center' }}>{(v.error || 'Failed').slice(0, 120)}</span>
                ) : (
                  <span style={{ color: 'var(--text-3)', fontSize: 12 }}>Generating… {v.duration_ms ? `${Math.round(v.duration_ms / 1000)}s` : ''}</span>
                )}
              </div>
              <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 12, color: 'var(--text-1)', lineHeight: 1.4, marginBottom: 4 }} className="truncate">{v.prompt}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-3)' }}>{v.model} · {v.status}</p>
                </div>
                <button className="btn btn-ghost btn-sm" style={{ padding: 4, color: 'var(--red)' }} onClick={() => handleDelete(v)}><Icons.trash size={13} /></button>
              </div>
            </div>
          ))}
        </div>}
    </div></div>
  );
}
