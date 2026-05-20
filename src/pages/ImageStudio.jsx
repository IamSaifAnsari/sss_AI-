import { useEffect, useRef, useState } from 'react';
import { useWorkspace } from '../providers/WorkspaceProvider.jsx';
import { useToast } from '../providers/ToastProvider.jsx';
import { useConfirm } from '../providers/ConfirmProvider.jsx';
import { api } from '../lib/api.js';
import { Icons } from '../components/Icons.jsx';
import { GlassPanel, SectionHeader, EmptyState } from '../components/ui.jsx';

const MODELS = [
  { id: 'flux-schnell', label: 'FLUX.1 schnell (Replicate, fast)', provider: 'replicate' },
  { id: 'flux-dev', label: 'FLUX.1 dev (Replicate, quality)', provider: 'replicate' },
  { id: 'sdxl-lightning', label: 'SDXL Lightning (Replicate, ~3s)', provider: 'replicate' },
  { id: 'sdxl', label: 'SDXL base (Replicate)', provider: 'replicate' },
  { id: 'dall-e-3', label: 'DALL-E 3 (OpenAI)', provider: 'openai' },
];

const SIZES = ['1024x1024', '1024x768', '768x1024', '512x512'];

export default function ImageStudioPage() {
  const { active } = useWorkspace();
  const toast = useToast();
  const confirm = useConfirm();
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('flux-schnell');
  const [size, setSize] = useState('1024x1024');
  const [items, setItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const pollRef = useRef(null);

  const refresh = async () => {
    if (!active?.id) return;
    try { setItems(await api.listImages(active.id)); }
    catch (e) { toast.error(e.message); }
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [active?.id]);

  useEffect(() => {
    // Poll while any item is processing.
    const tick = () => {
      const anyProcessing = items.some((i) => i.status === 'processing' || i.status === 'pending');
      if (anyProcessing) refresh();
    };
    pollRef.current = setInterval(tick, 2500);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line
  }, [items]);

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error('Prompt required'); return; }
    setSubmitting(true);
    try {
      await api.generateImage(active.id, { prompt: prompt.trim(), model, size });
      toast.success('Generation queued — refreshing...');
      setPrompt('');
      refresh();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (img) => {
    const ok = await confirm({ title: 'Delete image?', message: `"${img.prompt.slice(0, 60)}..."`, confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    try { await api.deleteImage(active.id, img.id); refresh(); } catch (e) { toast.error(e.message); }
  };

  const colorFor = (i) => `hsl(${(i * 47 + 180) % 360}, 45%, ${18 + (i % 3) * 4}%)`;

  if (!active) return null;

  return (
    <div className="page-scroll"><div className="page-inner">
      <SectionHeader title="Image Studio" subtitle="Real image generation via Replicate or OpenAI" />
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <GlassPanel>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-0)', marginBottom: 12 }}>Generate</h3>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="A serene mountain lake at sunrise, ultra-realistic, 8k..."
              rows={4} className="input" style={{ resize: 'vertical', marginBottom: 10 }} />
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4, display: 'block' }}>Model</label>
              <select value={model} onChange={(e) => setModel(e.target.value)} style={{ width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-1)', padding: '6px 10px', borderRadius: 6, fontSize: 12 }}>
                {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4, display: 'block' }}>Size</label>
              <select value={size} onChange={(e) => setSize(e.target.value)} style={{ width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-1)', padding: '6px 10px', borderRadius: 6, fontSize: 12 }}>
                {SIZES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <button className="btn btn-accent" onClick={handleGenerate} disabled={submitting} style={{ width: '100%', justifyContent: 'center', padding: '10px 16px' }}>
              {submitting ? 'Submitting...' : <><Icons.sparkles size={14} /> Generate</>}
            </button>
            <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 8, lineHeight: 1.5 }}>
              Needs a {MODELS.find((m) => m.id === model)?.provider} API key in Settings → Provider Keys. Costs real credits per generation.
            </p>
          </GlassPanel>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{items.length} generations</span>
            <button className="btn btn-ghost btn-sm" onClick={refresh}><Icons.activity size={12} /> Refresh</button>
          </div>
          {items.length === 0 ? <GlassPanel><EmptyState icon={<Icons.image size={48} />} title="No images yet" subtitle="Enter a prompt and click Generate." /></GlassPanel> :
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }}>
              {items.map((img, i) => (
                <div key={img.id} className="glass-card" style={{ overflow: 'hidden', cursor: 'pointer', padding: 0, position: 'relative' }}>
                  <div style={{ aspectRatio: '1', background: img.image_url ? `url("${img.image_url}") center/cover` : `linear-gradient(${135 + i * 30}deg, ${colorFor(i)}, ${colorFor(i + 3)})`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {!img.image_url && (
                      img.status === 'processing' || img.status === 'pending' ?
                        <span style={{ color: 'var(--text-2)', fontSize: 11 }}>Generating…</span> :
                      img.status === 'failed' ? <span style={{ color: '#f87171', fontSize: 11, padding: 8, textAlign: 'center' }}>{(img.error || 'Failed').slice(0, 80)}</span> :
                      <Icons.image size={32} style={{ color: 'rgba(255,255,255,0.15)' }} />
                    )}
                    <div style={{ position: 'absolute', top: 6, right: 6 }}>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(img); }} className="btn btn-ghost btn-sm" style={{ padding: 4, background: 'rgba(0,0,0,0.55)', color: '#fff' }}><Icons.trash size={11} /></button>
                    </div>
                  </div>
                  <div style={{ padding: '8px 10px' }}>
                    <p style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.4, marginBottom: 4 }} className="truncate">{img.prompt}</p>
                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{img.model} · {img.size || '—'} · {img.duration_ms ? `${(img.duration_ms / 1000).toFixed(1)}s` : img.status}</div>
                  </div>
                </div>
              ))}
            </div>}
        </div>
      </div>
    </div></div>
  );
}
