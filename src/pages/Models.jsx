import { useState } from 'react';
import { Icons } from '../components/Icons.jsx';
import { SectionHeader } from '../components/ui.jsx';

const allModels = [
  { name: 'GPT-4o', provider: 'OpenAI', ctx: '128K', latency: 124, cost: '$5 / $15', speed: 92, pop: 98, caps: ['chat', 'vision', 'code'], status: 'operational', desc: 'Most capable GPT model. Multimodal with vision.' },
  { name: 'GPT-4o Mini', provider: 'OpenAI', ctx: '128K', latency: 85, cost: '$0.15 / $0.60', speed: 97, pop: 94, caps: ['chat', 'code'], status: 'operational', desc: 'Fast & affordable. Great for most tasks.' },
  { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', ctx: '200K', latency: 98, cost: '$3 / $15', speed: 90, pop: 96, caps: ['chat', 'vision', 'code'], status: 'operational', desc: 'Excels at reasoning, coding, and analysis.' },
  { name: 'Claude 3 Opus', provider: 'Anthropic', ctx: '200K', latency: 210, cost: '$15 / $75', speed: 72, pop: 82, caps: ['chat', 'vision', 'code'], status: 'operational', desc: 'Most powerful Claude. Complex reasoning tasks.' },
  { name: 'Gemini 1.5 Pro', provider: 'Google', ctx: '1M', latency: 156, cost: '$3.50 / $10.50', speed: 85, pop: 88, caps: ['chat', 'vision', 'code', 'audio'], status: 'degraded', desc: '1M context window. Multimodal including audio.' },
  { name: 'DeepSeek V3', provider: 'DeepSeek', ctx: '128K', latency: 189, cost: '$0.27 / $1.10', speed: 88, pop: 91, caps: ['chat', 'code'], status: 'operational', desc: 'Cost-effective powerhouse. MoE architecture.' },
  { name: 'Llama 3.1 405B', provider: 'Meta', ctx: '128K', latency: 320, cost: '$3 / $3', speed: 68, pop: 80, caps: ['chat', 'code'], status: 'operational', desc: 'Largest open-weight model available.' },
  { name: 'Llama 3.1 70B', provider: 'Meta', ctx: '128K', latency: 156, cost: '$0.59 / $0.79', speed: 86, pop: 87, caps: ['chat', 'code'], status: 'operational', desc: 'Best open model for the price. Versatile.' },
  { name: 'Mistral Large', provider: 'Mistral', ctx: '128K', latency: 112, cost: '$2 / $6', speed: 91, pop: 84, caps: ['chat', 'code'], status: 'operational', desc: 'Top-tier European AI model. Multilingual.' },
  { name: 'Grok 2', provider: 'xAI', ctx: '131K', latency: 134, cost: '$2 / $10', speed: 89, pop: 79, caps: ['chat', 'vision'], status: 'operational', desc: 'Real-time knowledge. Unique personality.' },
  { name: 'SDXL Lightning', provider: 'Stability', ctx: '—', latency: 1800, cost: '$0.002/img', speed: 95, pop: 90, caps: ['image'], status: 'operational', desc: 'Fast image generation. 4-step diffusion.' },
  { name: 'Whisper Large V3', provider: 'OpenAI', ctx: '—', latency: 450, cost: '$0.006/min', speed: 82, pop: 86, caps: ['audio'], status: 'operational', desc: 'State-of-the-art speech recognition.' },
];

const providerColors = { OpenAI: 'var(--accent)', Anthropic: '#f59e0b', Google: 'var(--accent2)', DeepSeek: 'var(--accent3)', Meta: '#3b82f6', Mistral: '#ec4899', xAI: '#ef4444', Stability: '#10b981' };

export default function ModelsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('popular');

  const categories = ['all', 'chat', 'code', 'vision', 'embedding', 'image', 'audio'];

  const filtered = allModels.filter((m) => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.provider.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== 'all' && !m.caps.includes(category)) return false;
    return true;
  }).sort((a, b) => sort === 'popular' ? b.pop - a.pop : sort === 'fastest' ? a.latency - b.latency : a.cost.localeCompare(b.cost));

  return (
    <div className="page-scroll"><div className="page-inner">
      <SectionHeader title="Models" subtitle="Browse and deploy AI models from top providers" />
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 320 }}>
          <Icons.search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input className="input" placeholder="Search models..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className="btn btn-sm" style={{
              background: c === category ? 'var(--accent-dim)' : 'var(--bg-3)', color: c === category ? 'var(--accent)' : 'var(--text-3)',
              border: `1px solid ${c === category ? 'rgba(0,212,170,0.3)' : 'var(--border)'}`, textTransform: 'capitalize',
            }}>{c}</button>
          ))}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-1)', padding: '5px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
          <option value="popular">Most Popular</option><option value="fastest">Fastest</option><option value="cheapest">Cheapest</option>
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 14 }}>
        {filtered.map((m) => (
          <div key={m.name} className="glass-card" style={{ padding: 18, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-0)' }}>{m.name}</h3>
                  <div className={`sdot sdot-${m.status === 'operational' ? 'green' : 'yellow'}`} style={{ width: 6, height: 6 }}></div>
                </div>
                <span style={{ fontSize: 11, color: providerColors[m.provider] || 'var(--text-3)', fontWeight: 600 }}>{m.provider}</span>
              </div>
              <span className="badge badge-cyan" style={{ fontSize: 10 }}>{m.caps[0]}</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12, lineHeight: 1.5 }}>{m.desc}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11 }}>
              <Stat label="Context" value={m.ctx} />
              <Stat label="Latency" value={`${m.latency}ms`} />
              <Stat label="Pricing" value={m.cost} small />
              <div style={{ padding: '6px 8px', background: 'var(--bg-2)', borderRadius: 6 }}>
                <div style={{ color: 'var(--text-3)', marginBottom: 2 }}>Speed</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'var(--bg-4)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 2, background: 'var(--accent)', width: `${m.speed}%` }}></div>
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--text-1)', fontFamily: 'var(--mono)' }}>{m.speed}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div></div>
  );
}

function Stat({ label, value, small }) {
  return (
    <div style={{ padding: '6px 8px', background: 'var(--bg-2)', borderRadius: 6 }}>
      <div style={{ color: 'var(--text-3)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 600, color: 'var(--text-1)', fontFamily: 'var(--mono)', fontSize: small ? 10 : undefined }}>{value}</div>
    </div>
  );
}
