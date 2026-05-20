import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { useToast } from '../providers/ToastProvider.jsx';
import { Icons } from '../components/Icons.jsx';
import { GlassPanel, MetricCard, SectionHeader, Tabs, AreaChart, DonutChart, EmptyState } from '../components/ui.jsx';

const PLAN_COLORS = { enterprise: 'var(--accent3)', pro: 'var(--accent)', free: 'var(--text-3)' };

export default function AdminPage() {
  const toast = useToast();
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [usage, setUsage] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [ov, u, t, usg] = await Promise.all([
          api.adminOverview(),
          api.adminUsers(100),
          api.adminTenants(),
          api.adminUsage(),
        ]);
        if (!active) return;
        setOverview(ov);
        setUsers(u.users);
        setTenants(t.tenants);
        setUsage(usg.daily);
      } catch (e) {
        if (!active) return;
        setError(e.message || 'Failed to load admin data');
        if (e.status === 403) toast.error('Admin requires owner role on at least one workspace');
      }
    })();
    return () => { active = false; };
  }, [toast]);

  if (error) return <div className="page-scroll"><div className="page-inner">
    <GlassPanel><EmptyState icon={<Icons.layers size={48} />} title="Admin unavailable" subtitle={error} /></GlassPanel>
  </div></div>;

  if (!overview) return <div className="page-scroll"><div className="page-inner" style={{ color: 'var(--text-3)' }}>Loading platform metrics...</div></div>;

  const planSegments = (overview.planDistribution || []).map((p) => ({
    value: p.n, label: p.plan, color: PLAN_COLORS[p.plan] || 'var(--text-3)',
  }));

  const usageSeries = usage.length ? usage.map((u) => u.calls) : [0];
  const usageLabels = usage.length ? usage.map((u) => u.day.slice(5)) : [''];

  return (
    <div className="page-scroll"><div className="page-inner">
      <SectionHeader title="Platform Admin" subtitle="Real metrics aggregated from this database" />
      <Tabs tabs={[{ id: 'overview', label: 'Overview' }, { id: 'users', label: 'Users' }, { id: 'tenants', label: 'Tenants' }]}
        active={tab} onChange={setTab} style={{ marginBottom: 20 }} />

      {tab === 'overview' && <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12, marginBottom: 24 }}>
          <MetricCard icon={<Icons.users size={16} />} label="Total Users" value={overview.totals.totalUsers} color="var(--accent)" />
          <MetricCard icon={<Icons.layers size={16} />} label="Workspaces" value={overview.totals.workspaces} color="var(--accent3)" />
          <MetricCard icon={<Icons.bot size={16} />} label="Agents" value={overview.totals.totalAgents} color="var(--accent2)" />
          <MetricCard icon={<Icons.key size={16} />} label="API Keys" value={overview.totals.totalKeys} color="#f59e0b" />
          <MetricCard icon={<Icons.workflow size={16} />} label="Workflows" value={overview.totals.totalWorkflows} color="var(--accent3)" />
          <MetricCard icon={<Icons.rocket size={16} />} label="Deployments" value={overview.totals.totalDeployments} color="var(--accent2)" />
          <MetricCard icon={<Icons.activity size={16} />} label="Usage (24h)" value={overview.totals.usage24h} color="var(--accent)" />
          <MetricCard icon={<Icons.arrowUp size={16} />} label="New users (30d)" value={overview.totals.newUsers30d} color="#10b981" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 14 }}>
          <GlassPanel>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-0)', marginBottom: 14 }}>Workspaces by Plan</h3>
            {planSegments.length === 0 ? <div style={{ color: 'var(--text-3)', fontSize: 12 }}>No data</div> : (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                  <DonutChart segments={planSegments} size={130} thickness={15} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {planSegments.map((s) => (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                      <span style={{ width: 7, height: 7, borderRadius: 2, background: s.color }}></span>
                      <span style={{ flex: 1, color: 'var(--text-2)', textTransform: 'capitalize' }}>{s.label}</span>
                      <span className="mono" style={{ color: 'var(--text-1)', fontSize: 11 }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </GlassPanel>
          <GlassPanel>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-0)', marginBottom: 14 }}>API Usage (30 days)</h3>
            <AreaChart data={usageSeries} labels={usageLabels} color="var(--accent2)" h={170} />
          </GlassPanel>
        </div>
      </>}

      {tab === 'users' && (
        <GlassPanel style={{ padding: 0, overflow: 'hidden' }}>
          <table className="ns-table">
            <thead><tr><th>User</th><th>Email</th><th>Onboarded</th><th>Joined</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500 }}>{[u.first_name, u.last_name].filter(Boolean).join(' ') || '—'}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-3)' }}>{u.email}</td>
                  <td>{u.onboarded ? <span className="badge badge-green">yes</span> : <span className="badge badge-yellow">no</span>}</td>
                  <td style={{ color: 'var(--text-3)', fontSize: 12 }}>{u.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassPanel>
      )}

      {tab === 'tenants' && (
        <GlassPanel style={{ padding: 0, overflow: 'hidden' }}>
          <table className="ns-table">
            <thead><tr><th>Workspace</th><th>Plan</th><th>Users</th><th>Agents</th><th>Keys</th><th>Workflows</th><th>Credits</th><th>Created</th></tr></thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-0)' }}>{t.name}</td>
                  <td><span className={`badge badge-${t.plan === 'enterprise' ? 'violet' : t.plan === 'pro' ? 'cyan' : 'blue'}`}>{t.plan}</span></td>
                  <td className="mono">{t.users}</td>
                  <td className="mono">{t.agents}</td>
                  <td className="mono">{t.keys}</td>
                  <td className="mono">{t.workflows}</td>
                  <td className="mono">{t.credits}</td>
                  <td style={{ color: 'var(--text-3)', fontSize: 12 }}>{t.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassPanel>
      )}
    </div></div>
  );
}
