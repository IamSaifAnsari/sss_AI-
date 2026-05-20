import { useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '../providers/WorkspaceProvider.jsx';
import { api } from '../lib/api.js';
import { Icons } from '../components/Icons.jsx';
import { GlassPanel, MetricCard, SectionHeader, Tabs, AreaChart, BarChart } from '../components/ui.jsx';
import { genTrendData, monthLabels } from '../lib/utils.js';

export default function BillingPage() {
  const { active } = useWorkspace();
  const [tab, setTab] = useState('overview');
  const [credits, setCredits] = useState(null);
  const spendData = useMemo(() => genTrendData(12, 65000, 5000, 15000), []);

  useEffect(() => {
    if (!active?.id) return;
    api.getCredits(active.id).then(setCredits).catch(() => { /* noop */ });
  }, [active?.id]);

  if (!active) return null;

  return (
    <div className="page-scroll"><div className="page-inner">
      <SectionHeader title="Usage & Billing" subtitle={`Workspace: ${active.name} · Plan: ${active.plan}`} />
      <Tabs tabs={[{ id: 'overview', label: 'Overview' }, { id: 'plan', label: 'Plan' }]} active={tab} onChange={setTab} style={{ marginBottom: 20 }} />

      {tab === 'overview' && <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
          <MetricCard icon={<Icons.zap size={16} />} label="Credits available" value={credits?.credits ?? 0} color="var(--accent)" />
          <MetricCard icon={<Icons.dollar size={16} />} label="Current period spend" value={0} prefix="$" color="var(--accent2)" />
          <MetricCard icon={<Icons.activity size={16} />} label="Plan" value={(active.plan || 'free').toUpperCase()} color="var(--accent3)" />
          <MetricCard icon={<Icons.users size={16} />} label="Your role" value={active.role.toUpperCase()} color="#f59e0b" />
        </div>
        <GlassPanel style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-0)', marginBottom: 8 }}>Monthly Spend (demo data)</h3>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 14 }}>Real spend tracking requires Stripe integration — see project roadmap.</p>
          <AreaChart data={spendData} labels={monthLabels} color="var(--accent2)" h={200} />
        </GlassPanel>
        <GlassPanel>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-0)', marginBottom: 14 }}>Cost by Model (demo)</h3>
          <BarChart data={[28400, 18200, 12800, 8600, 7200, 5400, 3900]} labels={['GPT-4o', 'Claude 3.5', 'Gemini', 'SDXL', 'Llama', 'DeepSeek', 'Mistral']}
            colors={['var(--accent)', '#f59e0b', 'var(--accent2)', '#ec4899', '#3b82f6', 'var(--accent3)', '#10b981']} h={160} />
        </GlassPanel>
      </>}

      {tab === 'plan' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {[
            { name: 'free', price: '$0', credits: '1,000', features: ['1K credits/mo', '5 agents', 'Community support'] },
            { name: 'pro', price: '$99', credits: '50,000', features: ['50K credits/mo', '25 agents', '5 team members', 'Email support'] },
            { name: 'enterprise', price: 'Custom', credits: 'Unlimited', features: ['Unlimited credits', 'Unlimited agents', 'SSO/SAML', 'Dedicated support'] },
          ].map((p) => {
            const current = p.name === active.plan;
            return (
              <div key={p.name} className={current ? 'grad-border' : 'glass-card-static'} style={{ padding: current ? 0 : 24 }}>
                <div style={{ padding: current ? 24 : 0 }}>
                  {current && <span className="badge badge-cyan" style={{ marginBottom: 8 }}>Current Plan</span>}
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-0)', marginBottom: 4, textTransform: 'capitalize' }}>{p.name}</h3>
                  <div style={{ fontSize: 28, fontWeight: 700, color: current ? 'var(--accent)' : 'var(--text-1)', marginBottom: 16 }}>
                    {p.price}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-3)' }}>/mo</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                    {p.features.map((f) => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-2)' }}>
                        <Icons.check size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />{f}
                      </div>
                    ))}
                  </div>
                  <button className={`btn ${current ? 'btn-ghost' : 'btn-accent'}`} style={{ width: '100%', justifyContent: 'center' }} disabled={current}>
                    {current ? 'Current Plan' : p.price === 'Custom' ? 'Contact Sales' : 'Upgrade (needs Stripe)'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div></div>
  );
}
