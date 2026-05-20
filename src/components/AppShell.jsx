import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Icons } from './Icons.jsx';
import { useAuth } from '../providers/AuthProvider.jsx';
import { useWorkspace } from '../providers/WorkspaceProvider.jsx';
import { useTweaks } from '../providers/TweaksProvider.jsx';
import { useToast } from '../providers/ToastProvider.jsx';

const NAV = [
  { to: '/admin', label: 'Admin', icon: 'layers' },
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/playground', label: 'Playground', icon: 'sparkles' },
  { to: '/models', label: 'Models', icon: 'cpu' },
  { to: '/agents', label: 'Agents', icon: 'bot' },
  { to: '/voice', label: 'Voice AI', icon: 'phone' },
  { to: '/workflows', label: 'Workflows', icon: 'workflow' },
  { to: '/image-studio', label: 'Image Studio', icon: 'image' },
  { to: '/video-studio', label: 'Video Studio', icon: 'film' },
  { divider: true },
  { to: '/api-keys', label: 'API Keys', icon: 'key' },
  { to: '/deployments', label: 'Deployments', icon: 'rocket' },
  { to: '/logs', label: 'Logs', icon: 'fileText' },
  { to: '/billing', label: 'Usage & Billing', icon: 'creditCard' },
  { divider: true },
  { to: '/teams', label: 'Teams', icon: 'users' },
  { to: '/marketplace', label: 'Marketplace', icon: 'store' },
  { to: '/integrations', label: 'Integrations', icon: 'plug' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
];

function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { tweaks } = useTweaks();
  const { workspaces, active, setActiveId } = useWorkspace();
  const [wsOpen, setWsOpen] = useState(false);

  const baseBg = tweaks.sidebarStyle === 'Minimal' ? 'transparent'
    : tweaks.sidebarStyle === 'Solid' ? 'var(--bg-1)' : 'rgba(8,8,18,0.85)';

  return (
    <div className={mobileOpen ? 'sidebar-mobile-open' : 'sidebar-mobile-hidden'} style={{
      width: collapsed ? 'var(--sidebar-cw)' : 'var(--sidebar-w)',
      minWidth: collapsed ? 64 : 252, height: '100vh',
      display: 'flex', flexDirection: 'column',
      borderRight: tweaks.sidebarStyle === 'Minimal' ? 'none' : '1px solid var(--border)',
      background: baseBg, transition: 'width .2s var(--ease)', overflow: 'hidden', flexShrink: 0, zIndex: 20,
    }}>
      <div style={{ padding: collapsed ? '14px 10px' : '14px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', borderBottom: tweaks.sidebarStyle === 'Minimal' ? 'none' : '1px solid var(--border)', minHeight: 50 }}
        onClick={() => setCollapsed(!collapsed)}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icons.zap size={15} style={{ color: '#000' }} />
        </div>
        {!collapsed && <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-0)' }}>NeuronStack</div>}
      </div>

      {!collapsed && workspaces.length > 0 && (
        <div style={{ position: 'relative', margin: '8px 8px 4px' }}>
          <button onClick={() => setWsOpen(!wsOpen)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
            background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font)',
          }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 9, fontWeight: 800, color: '#000' }}>{(active?.name || '?')[0]}</span>
            </div>
            <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: 'var(--text-1)', textAlign: 'left' }} className="truncate">{active?.name || 'Select workspace'}</span>
            <Icons.chevDown size={13} style={{ color: 'var(--text-3)' }} />
          </button>
          {wsOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 100, background: 'var(--bg-1)', border: '1px solid var(--border-light)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.4)' }}>
              {workspaces.map((ws) => (
                <button key={ws.id} onClick={() => { setActiveId(ws.id); setWsOpen(false); }} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', textAlign: 'left',
                  background: ws.id === active?.id ? 'var(--accent-dim)' : 'transparent', color: 'var(--text-1)',
                }}>
                  <div style={{ width: 20, height: 20, borderRadius: 5, background: ws.id === active?.id ? 'var(--accent)' : 'var(--bg-4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: ws.id === active?.id ? '#000' : 'var(--text-2)' }}>{ws.name[0]}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{ws.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{ws.plan} · {ws.role}</div>
                  </div>
                  {ws.id === active?.id && <Icons.check size={14} style={{ color: 'var(--accent)' }} />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: collapsed ? '6px 5px' : '6px 8px' }}>
        {NAV.map((item, i) => {
          if (item.divider) return <div key={i} style={{ height: 1, background: 'var(--border)', margin: collapsed ? '6px 4px' : '6px' }} />;
          const Ic = Icons[item.icon];
          return (
            <NavLink key={item.to} to={item.to} title={collapsed ? item.label : undefined} onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 9, width: '100%', textAlign: 'left',
                padding: collapsed ? '8px 0' : '7px 10px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 7, border: 'none', cursor: 'pointer', textDecoration: 'none',
                fontFamily: 'var(--font)', fontSize: 13, fontWeight: isActive ? 600 : 400,
                background: isActive ? 'var(--accent-dim)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-3)',
                marginBottom: 1,
              })}>
              {Ic && <Ic size={16} />}
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </div>

      <UserBlock collapsed={collapsed} />
    </div>
  );
}

function UserBlock({ collapsed }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const initials = (user?.email || 'u').slice(0, 2).toUpperCase();
  return (
    <div style={{ padding: collapsed ? '10px 5px' : '10px 12px', borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', padding: collapsed ? '5px 0' : '5px 4px', justifyContent: collapsed ? 'center' : 'flex-start' }}
        onClick={() => navigate('/profile')}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--bg-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-2)' }}>{initials}</div>
        {!collapsed && (
          <div style={{ overflow: 'hidden', minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-1)' }} className="truncate">{user?.user_metadata?.first_name || user?.email}</div>
            <div style={{ fontSize: 10, color: 'var(--text-3)' }} className="truncate">{user?.email}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function Navbar({ setMobileOpen }) {
  const location = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const title = NAV.find((n) => !n.divider && n.to === location.pathname)?.label || 'Dashboard';

  const handleSignOut = async () => {
    try { await signOut(); toast.info('Signed out'); navigate('/login', { replace: true }); }
    catch (e) { toast.error(e.message || 'Sign out failed'); }
  };

  return (
    <div style={{
      height: 'var(--nav-h)', minHeight: 50, display: 'flex', alignItems: 'center', gap: 10,
      padding: '0 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-1)',
      backdropFilter: 'blur(12px)', flexShrink: 0, zIndex: 15,
    }}>
      <button className="mobile-menu-btn" onClick={() => setMobileOpen((o) => !o)} style={{ background: 'none', border: 'none', color: 'var(--text-1)', cursor: 'pointer', padding: 4, display: 'none' }}>
        <Icons.menu size={18} />
      </button>
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-0)', flex: 1 }}>{title}</span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} title="All systems operational">
        <div className="sdot sdot-green" style={{ width: 5, height: 5 }}></div>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Healthy</span>
      </div>

      <button onClick={handleSignOut} title="Sign out" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4, display: 'flex' }}>
        <Icons.signout size={16} />
      </button>
    </div>
  );
}

export default function AppShell({ children }) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('ns_sidebar_collapsed') === '1');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { localStorage.setItem('ns_sidebar_collapsed', collapsed ? '1' : '0'); }, [collapsed]);

  return (
    <div className="app-shell">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="main-area">
        <Navbar setMobileOpen={setMobileOpen} />
        {children}
      </div>
    </div>
  );
}
