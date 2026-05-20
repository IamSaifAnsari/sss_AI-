import { useEffect, useState } from 'react';
import { useWorkspace } from '../providers/WorkspaceProvider.jsx';
import { api } from '../lib/api.js';
import { GlassPanel, MetricCard, SectionHeader, AreaChart, EmptyState } from '../components/ui.jsx';
import { Icons } from '../components/Icons.jsx';
import { genTrendData, monthLabels } from '../lib/utils.js';

export default function DashboardPage() {
  const { active } = useWorkspace();
  const [credits, setCredits] = useState(null);
  const [keysCount, setKeysCount] = useState(0);
  const [agentsCount, setAgentsCount] = useState(0);
  const [spendSeries] = useState(() => genTrendData(12, 800, 50, 200));

  useEffect(() => {
    if (!active?.id) return;
    let cancel = false;
    (async () => {
      try {
        const [creditsRow, keys, agents] = await Promise.all([
          api.getCredits(active.id),
          api.listApiKeys(active.id),
          api.listAgents(active.id),
        ]);
        if (cancel) return;
        setCredits(creditsRow);
        setKeysCount(keys.length);
        setAgentsCount(agents.length);
      } catch { /* RLS or empty */ }
    })();
    return () => { cancel = true; };
  }, [active?.id]);

  if (!active) {
    return <div className="page-scroll"><div className="page-inner">
      <EmptyState icon={<Icons.layers size={48} />} title="No workspace selected" subtitle="Create or join a workspace to get started." />
    </div></div>;
  }

  return (
    <div className="page-scroll"><div className="page-inner">
      <SectionHeader title={`Welcome to ${active.name}`} subtitle={`Plan: ${active.plan} · Role: ${active.role}`} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 14, marginBottom: 20 }}>
        <MetricCard icon={<Icons.zap size={16} />} label="Credits" value={credits?.credits ?? 0} color="var(--accent)" />
        <MetricCard icon={<Icons.key size={16} />} label="API Keys" value={keysCount} color="var(--accent2)" />
        <MetricCard icon={<Icons.bot size={16} />} label="Agents" value={agentsCount} color="var(--accent3)" />
        <MetricCard icon={<Icons.activity size={16} />} label="Plan" value={active.plan?.toUpperCase() || 'FREE'} color="#f59e0b" />
      </div>
      <GlassPanel>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-0)', marginBottom: 14 }}>Estimated Spend (demo)</h3>
        <AreaChart data={spendSeries} labels={monthLabels} color="var(--accent2)" h={200} />
      </GlassPanel>
    </div></div>
  );
}
