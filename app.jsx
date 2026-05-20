/* NeuronStack AI v3 — App Shell: Full integration */

const NAV_ITEMS = [
  {id:'admin', label:'Admin', icon:'layers', shortcut:'A'},
  {id:'dashboard', label:'Dashboard', icon:'dashboard', shortcut:'D'},
  {id:'playground', label:'Playground', icon:'sparkles', shortcut:'P'},
  {id:'models', label:'Models', icon:'cpu', shortcut:'M'},
  {id:'agents', label:'Agents', icon:'bot'},
  {id:'voice', label:'Voice AI', icon:'phone'},
  {id:'workflows', label:'Workflows', icon:'workflow'},
  {id:'image-studio', label:'Image Studio', icon:'image'},
  {id:'video-studio', label:'Video Studio', icon:'film'},
  {divider:true},
  {id:'api-keys', label:'API Keys', icon:'key'},
  {id:'deployments', label:'Deployments', icon:'rocket'},
  {id:'logs', label:'Logs', icon:'fileText', shortcut:'L'},
  {id:'billing', label:'Usage & Billing', icon:'creditCard'},
  {divider:true},
  {id:'teams', label:'Teams', icon:'users'},
  {id:'marketplace', label:'Marketplace', icon:'store'},
  {id:'integrations', label:'Integrations', icon:'plug'},
  {id:'settings', label:'Settings', icon:'settings', shortcut:'S'},
];

const QUICK_ACTIONS = [
  {id:'new-key', label:'Create API Key', icon:'key', action:'api-keys'},
  {id:'new-agent', label:'New Agent', icon:'bot', action:'agents'},
  {id:'new-workflow', label:'New Workflow', icon:'workflow', action:'workflows'},
  {id:'new-call', label:'Start Voice Call', icon:'phone', action:'voice'},
  {id:'gen-image', label:'Generate Image', icon:'image', action:'image-studio'},
];

/* ── Command Palette ── */
const CommandPalette = ({open, onClose, onNavigate}) => {
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);

  useEffect(()=>{
    if(open) { setQuery(''); setActiveIdx(0); setTimeout(()=>inputRef.current?.focus(),50); }
  },[open]);

  const navItems = NAV_ITEMS.filter(n=>!n.divider);
  const q = query.toLowerCase().trim();
  const filteredNav = q ? navItems.filter(n=>n.label.toLowerCase().includes(q)) : navItems;
  const filteredActions = q ? QUICK_ACTIONS.filter(a=>a.label.toLowerCase().includes(q)) : QUICK_ACTIONS;
  const allResults = [
    ...filteredActions.map(a=>({...a, group:'Actions', go:a.action})),
    ...filteredNav.map(n=>({...n, group:'Navigation', go:n.id})),
  ];

  useEffect(()=>{ setActiveIdx(0); },[query]);

  const handleKey = (e) => {
    if(e.key==='ArrowDown') { e.preventDefault(); setActiveIdx(i=>Math.min(i+1,allResults.length-1)); }
    else if(e.key==='ArrowUp') { e.preventDefault(); setActiveIdx(i=>Math.max(i-1,0)); }
    else if(e.key==='Enter' && allResults[activeIdx]) { onNavigate(allResults[activeIdx].go); onClose(); }
    else if(e.key==='Escape') onClose();
  };

  if(!open) return null;
  return (
    <div className="cmd-overlay" onClick={onClose}>
      <div className="cmd-box" onClick={e=>e.stopPropagation()}>
        <input ref={inputRef} className="cmd-input" placeholder="Search pages, actions, models..."
          value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={handleKey}/>
        <div className="cmd-results">
          {q && allResults.length===0 && <div style={{padding:'24px 16px',textAlign:'center',color:'var(--text-3)',fontSize:13}}>No results for "{query}"</div>}
          {(q ? ['Results'] : ['Actions','Navigation']).map(group => {
            const items = allResults.filter(r=>q?true:r.group===group);
            if(!items.length) return null;
            return (
              <div key={group}>
                {!q && <div className="cmd-group-label">{group==='Actions'?'Quick Actions':'Pages'}</div>}
                {items.map((item) => {
                  const globalIdx = allResults.indexOf(item);
                  const Ic = Icons[item.icon];
                  return (
                    <div key={item.id} className={`cmd-item ${globalIdx===activeIdx?'active':''}`}
                      onClick={()=>{onNavigate(item.go);onClose();}} onMouseEnter={()=>setActiveIdx(globalIdx)}>
                      {Ic && <Ic size={15} style={{opacity:.6}}/>}
                      <span>{item.label}</span>
                      {item.shortcut && <span className="cmd-shortcut">{item.shortcut}</span>}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div style={{padding:'8px 14px',borderTop:'1px solid var(--border)',display:'flex',gap:12,fontSize:10,color:'var(--text-3)'}}>
          <span><kbd style={{padding:'1px 4px',background:'var(--bg-3)',borderRadius:3,border:'1px solid var(--border)',fontSize:9}}>↑↓</kbd> navigate</span>
          <span><kbd style={{padding:'1px 4px',background:'var(--bg-3)',borderRadius:3,border:'1px solid var(--border)',fontSize:9}}>↵</kbd> select</span>
          <span><kbd style={{padding:'1px 4px',background:'var(--bg-3)',borderRadius:3,border:'1px solid var(--border)',fontSize:9}}>esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
};

/* ── Notification Panel ── */
const NOTIF_DATA = [
  {id:1,text:'GPU cluster us-east-1 utilization at 84%',detail:'Auto-scaling triggered for additional capacity',time:'2m ago',type:'warn',icon:'server',read:false},
  {id:2,text:'Workflow #892 completed — 12/12 steps',detail:'Lead Qualification Pipeline processed 48 leads',time:'8m ago',type:'success',icon:'check',read:false},
  {id:3,text:'API rate limit warning',detail:'Key pk_live_***8f2k reached 890/1000 req/min',time:'15m ago',type:'warn',icon:'activity',read:false},
  {id:4,text:'New team member accepted invite',detail:'sarah@neuronstack.ai joined as Developer',time:'1h ago',type:'info',icon:'users',read:true},
  {id:5,text:'Invoice INV-2025-04 paid',detail:'$76,891.00 — automatic payment processed',time:'3h ago',type:'success',icon:'creditCard',read:true},
  {id:6,text:'Claude 3.5 Sonnet latency spike resolved',detail:'Anthropic API latency normalized at 98ms',time:'5h ago',type:'info',icon:'activity',read:true},
];

const NotificationPanel = ({open, onClose}) => {
  const [notifications, setNotifications] = useState(NOTIF_DATA);
  const [filter, setFilter] = useState('all');
  const unreadCount = notifications.filter(n=>!n.read).length;
  const markAllRead = () => setNotifications(ns=>ns.map(n=>({...n,read:true})));
  const filtered = filter==='unread' ? notifications.filter(n=>!n.read) : notifications;
  const typeColor = {warn:'var(--yellow)',success:'var(--green)',info:'var(--accent2)',error:'var(--red)'};

  if(!open) return null;
  return (
    <div style={{position:'absolute',right:0,top:'calc(100% + 8px)',width:380,zIndex:100}} onClick={e=>e.stopPropagation()}>
      <div className="glass-card-static" style={{overflow:'hidden',boxShadow:'0 16px 64px rgba(0,0,0,0.5)',animation:'fadeInScale .12s ease'}}>
        <div style={{padding:'14px 16px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:14,fontWeight:700,color:'var(--text-0)'}}>Notifications</span>
            {unreadCount>0 && <span className="badge badge-blue" style={{fontSize:9,padding:'1px 6px'}}>{unreadCount}</span>}
          </div>
          {unreadCount>0 && <button className="btn btn-ghost btn-sm" style={{fontSize:10,padding:'3px 8px'}} onClick={markAllRead}>Mark all read</button>}
        </div>
        <div style={{display:'flex',gap:2,padding:'6px 8px',borderBottom:'1px solid var(--border)'}}>
          {['all','unread'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:'4px 10px',borderRadius:5,border:'none',cursor:'pointer',fontFamily:'var(--font)',fontSize:11,fontWeight:600,
              background:f===filter?'var(--bg-4)':'transparent',color:f===filter?'var(--text-0)':'var(--text-3)',textTransform:'capitalize'}}>{f}{f==='unread'&&unreadCount>0?` (${unreadCount})`:''}</button>
          ))}
        </div>
        <div style={{maxHeight:400,overflowY:'auto'}}>
          {filtered.length===0 && <div style={{padding:'32px 16px',textAlign:'center',color:'var(--text-3)',fontSize:12}}>No notifications</div>}
          {filtered.map(n=>{
            const Ic = Icons[n.icon];
            return (
              <div key={n.id} style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',cursor:'pointer',display:'flex',gap:10,transition:'background .1s',
                background:n.read?'transparent':'rgba(59,130,246,0.03)'}}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                onMouseLeave={e=>e.currentTarget.style.background=n.read?'transparent':'rgba(59,130,246,0.03)'}
                onClick={()=>setNotifications(ns=>ns.map(x=>x.id===n.id?{...x,read:true}:x))}>
                <div style={{width:28,height:28,borderRadius:7,background:`${typeColor[n.type]}12`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1}}>
                  {Ic && <Ic size={13} style={{color:typeColor[n.type]}}/>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:n.read?400:600,color:n.read?'var(--text-2)':'var(--text-0)',lineHeight:1.4}}>{n.text}</div>
                  <div style={{fontSize:11,color:'var(--text-3)',marginTop:2,lineHeight:1.4}}>{n.detail}</div>
                  <div style={{fontSize:10,color:'var(--text-3)',marginTop:3}}>{n.time}</div>
                </div>
                {!n.read && <div style={{width:6,height:6,borderRadius:3,background:'var(--accent2)',flexShrink:0,marginTop:6}}></div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ── Sidebar ── */
const Sidebar = ({mobileOpen, setMobileOpen}) => {
  const {page, setPage, collapsed, setCollapsed, tweaks} = useApp();

  const baseBg = tweaks.sidebarStyle==='Minimal' ? 'transparent' :
    tweaks.sidebarStyle==='Solid' ? 'var(--bg-1)' : 'rgba(8,8,18,0.85)';

  return (
    <div className={mobileOpen?'sidebar-mobile-open':'sidebar-mobile-hidden'} style={{
      width: collapsed ? 'var(--sidebar-cw)' : 'var(--sidebar-w)',
      minWidth: collapsed ? 64 : 252,
      height: '100vh', display: 'flex', flexDirection: 'column',
      borderRight: tweaks.sidebarStyle==='Minimal' ? 'none' : '1px solid var(--border)',
      background: baseBg,
      backdropFilter: tweaks.sidebarStyle==='Glass' ? 'blur(24px)' : 'none',
      WebkitBackdropFilter: tweaks.sidebarStyle==='Glass' ? 'blur(24px)' : 'none',
      transition: 'width .2s var(--ease), min-width .2s var(--ease)',
      overflow: 'hidden', flexShrink: 0, zIndex: 20,
    }}>
      {/* Logo */}
      <div style={{padding: collapsed ? '14px 10px' : '14px 16px', display:'flex', alignItems:'center', gap:10,
        borderBottom: tweaks.sidebarStyle==='Minimal' ? 'none' : '1px solid var(--border)', minHeight:50, cursor:'pointer'}}
        onClick={()=>setCollapsed(!collapsed)}>
        <div style={{width:30, height:30, borderRadius:8, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
          <Icons.zap size={15} style={{color:'#000'}}/>
        </div>
        {!collapsed && <div style={{fontSize:14, fontWeight:700, color:'var(--text-0)', letterSpacing:'-0.02em'}}>NeuronStack</div>}
      </div>

      {/* Workspace Switcher */}
      <WorkspaceSwitcher collapsed={collapsed}/>

      {/* Nav Items */}
      <div style={{flex:1, overflowY:'auto', padding: collapsed ? '6px 5px' : '6px 8px'}}>
        {NAV_ITEMS.map((item, i) => {
          if (item.divider) return <div key={i} style={{height:1, background:'var(--border)', margin: collapsed ? '6px 4px' : '6px'}}></div>;
          const active = page === item.id;
          const IconComp = Icons[item.icon];
          return (
            <button key={item.id} onClick={()=>{setPage(item.id);setMobileOpen(false)}} title={collapsed ? item.label : undefined}
              style={{
                display:'flex', alignItems:'center', gap:9, width:'100%', textAlign:'left',
                padding: collapsed ? '8px 0' : '7px 10px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 7, border:'none', cursor:'pointer',
                fontFamily:'var(--font)', fontSize:13, fontWeight: active ? 600 : 400,
                background: active ? 'var(--accent-dim)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text-3)',
                transition: 'all .12s var(--ease)', marginBottom: 1,
              }}
              onMouseEnter={e=>{if(!active){e.currentTarget.style.background='rgba(255,255,255,0.035)';e.currentTarget.style.color='var(--text-1)'}}}
              onMouseLeave={e=>{if(!active){e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--text-3)'}}}
            >
              {IconComp && <IconComp size={16}/>}
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Bottom user */}
      <div style={{padding: collapsed ? '10px 5px' : '10px 12px', borderTop: tweaks.sidebarStyle==='Minimal'?'none':'1px solid var(--border)'}}>
        <div style={{display:'flex', alignItems:'center', gap:9, cursor:'pointer', padding: collapsed ? '5px 0' : '5px 4px', justifyContent: collapsed ? 'center' : 'flex-start',borderRadius:7}}
          onClick={()=>{setPage('profile');setMobileOpen(false)}}>
          <div style={{width:28,height:28,borderRadius:7,background:'var(--bg-4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'var(--text-2)',flexShrink:0}}>AC</div>
          {!collapsed && (
            <div style={{overflow:'hidden',minWidth:0}}>
              <div style={{fontSize:12,fontWeight:500,color:'var(--text-1)'}} className="truncate">Alex Chen</div>
              <div style={{fontSize:10,color:'var(--text-3)'}} className="truncate">Owner · Pro</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Navbar ── */
const Navbar = ({setMobileOpen}) => {
  const {page, setPage, setCmdOpen} = useApp();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const pageTitle = NAV_ITEMS.find(n=>n.id===page)?.label || (page==='profile'?'Profile':'Dashboard');

  useEffect(()=>{
    const handler = (e) => { if(notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    if(notifOpen) document.addEventListener('mousedown', handler);
    return ()=>document.removeEventListener('mousedown', handler);
  },[notifOpen]);

  return (
    <div style={{
      height:'var(--nav-h)', minHeight:50, display:'flex', alignItems:'center', gap:10,
      padding:'0 20px', borderBottom:'1px solid var(--border)', background:'rgba(6,6,12,0.65)',
      backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', flexShrink:0, zIndex:15,
    }}>
      {/* Mobile hamburger */}
      <button className="mobile-menu-btn" onClick={()=>setMobileOpen(o=>!o)} style={{background:'none',border:'none',color:'var(--text-1)',cursor:'pointer',padding:4,display:'none'}}>
        <Icons.menu size={18}/>
      </button>

      <span style={{fontSize:14,fontWeight:600,color:'var(--text-0)',flex:1}}>{pageTitle}</span>

      {/* Search trigger */}
      <button onClick={()=>setCmdOpen(true)} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 12px',
        background:'var(--bg-2)',border:'1px solid var(--border)',borderRadius:8,cursor:'pointer',
        color:'var(--text-3)',fontFamily:'var(--font)',fontSize:12,transition:'border-color .15s',minWidth:200}}
        onMouseEnter={e=>e.currentTarget.style.borderColor='var(--border-light)'}
        onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
        <Icons.search size={13}/><span>Search...</span>
        <span style={{marginLeft:'auto',fontSize:10,background:'var(--bg-3)',padding:'1px 5px',borderRadius:4,border:'1px solid var(--border)'}}>⌘K</span>
      </button>

      <button className="btn btn-accent btn-sm" onClick={()=>setCmdOpen(true)}><Icons.plus size={13}/> Create</button>

      <div style={{display:'flex',alignItems:'center',gap:5,padding:'5px 10px',background:'var(--bg-2)',borderRadius:7,border:'1px solid var(--border)',fontSize:12}}>
        <Icons.zap size={12} style={{color:'var(--accent)'}}/><span style={{fontWeight:600,color:'var(--text-1)'}}>24.8K</span>
        <span style={{color:'var(--text-3)',fontSize:10}}>credits</span>
      </div>

      <div style={{display:'flex',alignItems:'center',gap:4}} title="All systems operational">
        <div className="sdot sdot-green" style={{width:5,height:5}}></div>
        <span style={{fontSize:11,color:'var(--text-3)'}}>Healthy</span>
      </div>

      <div ref={notifRef} style={{position:'relative'}}>
        <button onClick={()=>setNotifOpen(!notifOpen)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-3)',padding:4,position:'relative',display:'flex'}}
          onMouseEnter={e=>e.currentTarget.style.color='var(--text-1)'} onMouseLeave={e=>e.currentTarget.style.color='var(--text-3)'}>
          <Icons.bell size={16}/><div style={{position:'absolute',top:1,right:1,width:5,height:5,borderRadius:3,background:'var(--accent2)'}}></div>
        </button>
        <NotificationPanel open={notifOpen} onClose={()=>setNotifOpen(false)}/>
      </div>

      <div style={{width:28,height:28,borderRadius:7,background:'var(--bg-4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'var(--text-2)',cursor:'pointer',flexShrink:0}}
        onClick={()=>setPage('profile')}>AC</div>
    </div>
  );
};

/* ── Page Router ── */
const PageRouter = () => {
  const {page, setPage} = useApp();
  const [modelDetail, setModelDetail] = useState(null);
  const [agentWizard, setAgentWizard] = useState(false);

  // Expose openers to window so pages can call them
  useEffect(()=>{
    window.__openModelDetail = (model) => setModelDetail(model);
    window.__openAgentWizard = () => setAgentWizard(true);
  },[]);

  const pages = {
    admin:AdminPage, dashboard:DashboardPage, playground:PlaygroundPage, models:ModelsPage,
    agents:AgentsPage, voice:VoiceAIPage, workflows:WorkflowsPage,
    'image-studio':ImageStudioPage, 'video-studio':VideoStudioPage,
    'api-keys':APIKeysPage, billing:BillingPage, marketplace:MarketplacePage,
    settings:SettingsPage, deployments:DeploymentsPage, logs:LogsPage,
    teams:TeamsPage, integrations:IntegrationsPage, profile:ProfilePage,
  };
  const Page = pages[page] || DashboardPage;
  return (
    <>
      <Page key={page}/>
      <ModelDetailView model={modelDetail} onClose={()=>setModelDetail(null)}/>
      <AgentCreateWizard open={agentWizard} onClose={()=>setAgentWizard(false)} onCreated={(a)=>{ NSStore.addAgent(a); }}/>
    </>
  );
};

/* ── App Shell ── */
const App = () => {
  const [authed, setAuthed] = useState(() => NSStore.isAuthed());
  const [user, setUser] = useState(() => NSStore.getUser());
  const [onboarded, setOnboarded] = useState(() => NSStore.isOnboarded());
  const [page, setPageState] = useState(() => NSStore.getPage());
  const [collapsed, setCollapsedState] = useState(() => NSStore.getCollapsed());
  const [cmdOpen, setCmdOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const setPage = useCallback((p) => { setPageState(p); NSStore.setPage(p); }, []);
  const setCollapsed = useCallback((v) => {
    setCollapsedState((prev) => { const next = typeof v === 'function' ? v(prev) : v; NSStore.setCollapsed(next); return next; });
  }, []);

  const handleLogin = (userData) => {
    setUser(userData); NSStore.setUser(userData);
    setAuthed(true); NSStore.setAuthed(true);
  };
  const handleLogout = () => {
    NSStore.logout();
    setAuthed(false); setUser(null);
  };
  const handleOnboardComplete = (data) => {
    if (data) {
      NSStore.setOnboardingData(data);
      if (data.workspaceName && data.workspaceName.trim()) {
        NSStore.setWorkspace(data.workspaceName.trim());
      }
    }
    NSStore.setOnboarded(true);
    setOnboarded(true);
  };

  // ⌘K shortcut
  useEffect(()=>{
    const handler = (e) => { if((e.metaKey||e.ctrlKey) && e.key==='k') { e.preventDefault(); setCmdOpen(o=>!o); } };
    window.addEventListener('keydown', handler);
    return ()=>window.removeEventListener('keydown', handler);
  },[]);

  // Apply tweaks
  useEffect(()=>{
    const r = document.documentElement;
    r.style.setProperty('--accent', tweaks.accentColor);
    r.style.setProperty('--accent-dim', tweaks.accentColor + '22');
    r.style.setProperty('--border-focus', tweaks.accentColor + '66');

    // Font
    const fonts = {'DM Sans':"'DM Sans',-apple-system,sans-serif",'Inter':"'Inter',-apple-system,sans-serif",
      'Plus Jakarta Sans':"'Plus Jakarta Sans',-apple-system,sans-serif",'Manrope':"'Manrope',-apple-system,sans-serif"};
    if(fonts[tweaks.fontFamily]) r.style.setProperty('--font', fonts[tweaks.fontFamily]);

    // Theme
    const root = document.getElementById('root');
    root.className = '';
    if(tweaks.theme === 'Charcoal') root.classList.add('theme-charcoal');
    else if(tweaks.theme === 'Pitch') root.classList.add('theme-pitch');
    else if(tweaks.theme === 'Light') root.classList.add('theme-light');

    // Card / Density
    const body = document.body;
    body.classList.remove('card-glass','card-solid','card-border','density-compact','density-default','density-comfortable');
    if(tweaks.cardStyle === 'Solid') body.classList.add('card-solid');
    else if(tweaks.cardStyle === 'Border') body.classList.add('card-border');
    if(tweaks.density === 'Compact') body.classList.add('density-compact');
    else if(tweaks.density === 'Comfortable') body.classList.add('density-comfortable');
  }, [tweaks]);

  // Load Google Font
  useEffect(()=>{
    if(tweaks.fontFamily && tweaks.fontFamily !== 'DM Sans') {
      const id = 'gfont-' + tweaks.fontFamily.replace(/\s/g,'-');
      if(!document.getElementById(id)) {
        const link = document.createElement('link'); link.id = id; link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(tweaks.fontFamily)}:wght@300;400;500;600;700&display=swap`;
        document.head.appendChild(link);
      }
    }
  }, [tweaks.fontFamily]);

  const ctx = useMemo(()=>({
    page, setPage, collapsed, setCollapsed, cmdOpen, setCmdOpen, tweaks, setTweak, user, handleLogout,
  }), [page, collapsed, cmdOpen, tweaks, user]);

  // Login
  if(!authed) return <LoginPage onLogin={handleLogin}/>;

  // Onboarding (first time)
  if(!onboarded) return <OnboardingWizard onComplete={handleOnboardComplete}/>;

  return (
    <AppContext.Provider value={ctx}>
      <ToastProvider>
        <ConfirmProvider>
          <div className="ambient"></div>
          <div className="app-shell">
            <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}/>
            <div className="main-area">
              <Navbar setMobileOpen={setMobileOpen}/>
              <PageRouter/>
            </div>
          </div>
          <CommandPalette open={cmdOpen} onClose={()=>setCmdOpen(false)} onNavigate={(id)=>{setPage(id);setCmdOpen(false);}}/>
          <NSTweaks tweaks={tweaks} setTweak={setTweak}/>
        </ConfirmProvider>
      </ToastProvider>
    </AppContext.Provider>
  );
};

/* ── Tweaks Panel ── */
const NSTweaks = ({tweaks, setTweak}) => (
  <TweaksPanel title="Tweaks">
    <TweakSection label="Accent Color">
      <TweakColor value={tweaks.accentColor} onChange={v=>setTweak('accentColor',v)}
        options={['#3b82f6','#00d4aa','#8b5cf6','#f59e0b','#ef4444','#ec4899','#10b981','#06b6d4']}/>
    </TweakSection>
    <TweakSection label="Theme">
      <TweakSelect value={tweaks.theme} onChange={v=>setTweak('theme',v)}
        options={['Midnight','Charcoal','Pitch','Light']}/>
    </TweakSection>
    <TweakSection label="Typography">
      <TweakSelect label="Font" value={tweaks.fontFamily} onChange={v=>setTweak('fontFamily',v)}
        options={['DM Sans','Inter','Plus Jakarta Sans','Manrope']}/>
    </TweakSection>
    <TweakSection label="Sidebar">
      <TweakRadio value={tweaks.sidebarStyle} onChange={v=>setTweak('sidebarStyle',v)}
        options={['Glass','Solid','Minimal']}/>
    </TweakSection>
    <TweakSection label="Cards">
      <TweakRadio value={tweaks.cardStyle} onChange={v=>setTweak('cardStyle',v)}
        options={['Glass','Solid','Border']}/>
    </TweakSection>
    <TweakSection label="Density">
      <TweakRadio value={tweaks.density} onChange={v=>setTweak('density',v)}
        options={['Compact','Default','Comfortable']}/>
    </TweakSection>
  </TweaksPanel>
);

Object.assign(window, { App, Sidebar, Navbar, PageRouter, NSTweaks, CommandPalette, NotificationPanel });
