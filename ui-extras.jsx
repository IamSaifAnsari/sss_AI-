/* NeuronStack AI — UI Extras: Toasts, Confirms, Workspace Switcher, Breadcrumbs, Profile */

/* ═══════════════════ TOAST SYSTEM ═══════════════════ */
const ToastContext = createContext();
const useToast = () => useContext(ToastContext);

const ToastProvider = ({children}) => {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((msg, type='success', duration=4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev=>[...prev, {id, msg, type}]);
    setTimeout(()=> setToasts(prev=>prev.filter(t=>t.id!==id)), duration);
  },[]);
  const toast = useMemo(()=>({
    success: (msg)=>addToast(msg,'success'),
    error: (msg)=>addToast(msg,'error'),
    warn: (msg)=>addToast(msg,'warn'),
    info: (msg)=>addToast(msg,'info'),
  }),[addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{position:'fixed',bottom:20,right:20,zIndex:99999,display:'flex',flexDirection:'column-reverse',gap:8,pointerEvents:'none',maxWidth:380}}>
        {toasts.map(t=>(
          <div key={t.id} style={{
            padding:'12px 16px',borderRadius:10,display:'flex',alignItems:'center',gap:10,
            background:t.type==='success'?'rgba(16,185,129,0.14)':t.type==='error'?'rgba(239,68,68,0.14)':t.type==='warn'?'rgba(245,158,11,0.14)':'rgba(59,130,246,0.14)',
            border:`1px solid ${t.type==='success'?'rgba(16,185,129,0.3)':t.type==='error'?'rgba(239,68,68,0.3)':t.type==='warn'?'rgba(245,158,11,0.3)':'rgba(59,130,246,0.3)'}`,
            backdropFilter:'blur(16px)', boxShadow:'0 8px 32px rgba(0,0,0,0.3)',
            animation:'toast-in .25s ease', pointerEvents:'auto', fontSize:13,
            color:t.type==='success'?'#34d399':t.type==='error'?'#f87171':t.type==='warn'?'#fbbf24':'#60a5fa',
          }}>
            {t.type==='success'&&<Icons.check size={16}/>}
            {t.type==='error'&&<Icons.x size={16}/>}
            {t.type==='warn'&&<Icons.activity size={16}/>}
            {t.type==='info'&&<Icons.bell size={16}/>}
            <span style={{flex:1,color:'var(--text-1)',fontWeight:500}}>{t.msg}</span>
            <button onClick={()=>setToasts(prev=>prev.filter(x=>x.id!==t.id))} style={{background:'none',border:'none',color:'var(--text-3)',cursor:'pointer',padding:2,flexShrink:0}}>
              <Icons.x size={14}/>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

/* ═══════════════════ CONFIRM DIALOG ═══════════════════ */
const ConfirmContext = createContext();
const useConfirm = () => useContext(ConfirmContext);

const ConfirmProvider = ({children}) => {
  const [state, setState] = useState(null);
  const resolveRef = useRef(null);

  const confirm = useCallback((opts) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState(typeof opts === 'string' ? {title:'Confirm',message:opts} : opts);
    });
  },[]);

  const handleResponse = (val) => {
    resolveRef.current?.(val);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div onClick={()=>handleResponse(false)} style={{position:'fixed',inset:0,zIndex:99998,background:'rgba(0,0,0,0.55)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',animation:'fadeIn .12s ease'}}>
          <div onClick={e=>e.stopPropagation()} style={{width:400,maxWidth:'90vw',background:'var(--bg-1)',border:'1px solid var(--border-light)',borderRadius:14,padding:24,boxShadow:'0 24px 64px rgba(0,0,0,0.5)',animation:'fadeInScale .15s ease'}}>
            <h3 style={{fontSize:16,fontWeight:700,color:'var(--text-0)',marginBottom:6}}>{state.title||'Confirm'}</h3>
            <p style={{fontSize:13,color:'var(--text-2)',lineHeight:1.6,marginBottom:20}}>{state.message}</p>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button className="btn btn-ghost" onClick={()=>handleResponse(false)}>{state.cancelLabel||'Cancel'}</button>
              <button className="btn" onClick={()=>handleResponse(true)} style={{
                background:state.danger?'rgba(239,68,68,0.15)':'var(--accent)',
                color:state.danger?'#f87171':'#000',
                border:state.danger?'1px solid rgba(239,68,68,0.3)':'none',
              }}>{state.confirmLabel||'Confirm'}</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

/* ═══════════════════ WORKSPACE SWITCHER ═══════════════════ */
const WorkspaceSwitcher = ({collapsed}) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() => (typeof NSStore!=='undefined'?NSStore.getWorkspace():'NeuronStack AI'));
  const ref = useRef(null);

  const selectWorkspace = (name) => {
    setActive(name);
    if (typeof NSStore !== 'undefined') NSStore.setWorkspace(name);
    setOpen(false);
  };

  const workspaces = [
    {name:'NeuronStack AI',plan:'Pro',role:'Owner'},
    {name:'Acme Corp',plan:'Enterprise',role:'Admin'},
    {name:'Personal Dev',plan:'Starter',role:'Owner'},
  ];

  useEffect(()=>{
    const handler = (e)=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false)};
    if(open) document.addEventListener('mousedown',handler);
    return ()=>document.removeEventListener('mousedown',handler);
  },[open]);

  if(collapsed) return null;

  return (
    <div ref={ref} style={{position:'relative',margin:'8px 8px 4px'}}>
      <button onClick={()=>setOpen(!open)} style={{
        width:'100%',display:'flex',alignItems:'center',gap:8,padding:'7px 10px',
        background:'var(--bg-2)',border:'1px solid var(--border)',borderRadius:8,
        cursor:'pointer',fontFamily:'var(--font)',transition:'border-color .12s',
      }}
        onMouseEnter={e=>e.currentTarget.style.borderColor='var(--border-light)'}
        onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
        <div style={{width:20,height:20,borderRadius:5,background:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <span style={{fontSize:9,fontWeight:800,color:'#000'}}>{active[0]}</span>
        </div>
        <span style={{flex:1,fontSize:12,fontWeight:600,color:'var(--text-1)',textAlign:'left'}} className="truncate">{active}</span>
        <Icons.chevDown size={13} style={{color:'var(--text-3)',flexShrink:0}}/>
      </button>

      {open && (
        <div style={{position:'absolute',top:'calc(100% + 4px)',left:0,right:0,zIndex:100,background:'var(--bg-1)',border:'1px solid var(--border-light)',borderRadius:10,overflow:'hidden',boxShadow:'0 12px 40px rgba(0,0,0,0.4)',animation:'fadeInScale .1s ease'}}>
          <div style={{padding:'8px 10px 4px',fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:'var(--text-3)'}}>Workspaces</div>
          {workspaces.map(ws=>(
            <button key={ws.name} onClick={()=>selectWorkspace(ws.name)} style={{
              width:'100%',display:'flex',alignItems:'center',gap:8,padding:'8px 10px',border:'none',cursor:'pointer',fontFamily:'var(--font)',
              background:ws.name===active?'var(--accent-dim)':'transparent',color:'var(--text-1)',transition:'background .1s',textAlign:'left',
            }}
              onMouseEnter={e=>{if(ws.name!==active)e.currentTarget.style.background='rgba(255,255,255,0.03)'}}
              onMouseLeave={e=>{if(ws.name!==active)e.currentTarget.style.background='transparent'}}>
              <div style={{width:20,height:20,borderRadius:5,background:ws.name===active?'var(--accent)':'var(--bg-4)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <span style={{fontSize:9,fontWeight:800,color:ws.name===active?'#000':'var(--text-2)'}}>{ws.name[0]}</span>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:500}} className="truncate">{ws.name}</div>
                <div style={{fontSize:10,color:'var(--text-3)'}}>{ws.plan} · {ws.role}</div>
              </div>
              {ws.name===active && <Icons.check size={14} style={{color:'var(--accent)',flexShrink:0}}/>}
            </button>
          ))}
          <div style={{borderTop:'1px solid var(--border)',padding:6}}>
            <button style={{width:'100%',display:'flex',alignItems:'center',gap:6,padding:'7px 10px',border:'none',cursor:'pointer',fontFamily:'var(--font)',fontSize:12,color:'var(--text-3)',background:'transparent',borderRadius:6,transition:'background .1s'}}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.03)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <Icons.plus size={13}/> Create workspace
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════ BREADCRUMBS ═══════════════════ */
const Breadcrumbs = ({items=[]}) => {
  if(items.length <= 1) return null;
  return (
    <div style={{display:'flex',alignItems:'center',gap:4,fontSize:12,marginBottom:16}}>
      {items.map((item,i)=>(
        <React.Fragment key={i}>
          {i>0 && <Icons.chevRight size={12} style={{color:'var(--text-3)',opacity:.5}}/>}
          {item.onClick ? (
            <button onClick={item.onClick} style={{background:'none',border:'none',cursor:'pointer',fontFamily:'var(--font)',fontSize:12,color:'var(--text-3)',padding:0,transition:'color .12s'}}
              onMouseEnter={e=>e.currentTarget.style.color='var(--text-1)'} onMouseLeave={e=>e.currentTarget.style.color='var(--text-3)'}>{item.label}</button>
          ) : (
            <span style={{color:i===items.length-1?'var(--text-0)':'var(--text-3)',fontWeight:i===items.length-1?600:400}}>{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

/* ═══════════════════ PROFILE PAGE ═══════════════════ */
const ProfilePage = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const app = useApp();
  const [tab, setTab] = useState('profile');
  const [profile, setProfileState] = useState(() => NSStore.getProfile());
  const updateProfileField = (field, v) => setProfileState(p => ({...p, [field]: v}));

  const sessions = [
    {device:'Chrome · macOS',ip:'192.168.1.1',location:'San Francisco, CA',last:'Active now',current:true},
    {device:'Safari · iPhone',ip:'10.0.0.42',location:'San Francisco, CA',last:'2h ago',current:false},
    {device:'Firefox · Windows',ip:'203.0.113.5',location:'New York, NY',last:'3d ago',current:false},
  ];

  const handleSave = () => { NSStore.setProfile(profile); toast.success('Profile updated successfully'); };
  const handleSignOut = async () => {
    const ok = await confirm({title:'Sign out?',message:'You will be returned to the login screen.',confirmLabel:'Sign out'});
    if(ok && app && app.handleLogout) app.handleLogout();
  };
  const handleRevokeSession = async (s) => {
    const ok = await confirm({title:'Revoke session?',message:`This will sign out the ${s.device} session. The user will need to log in again.`,confirmLabel:'Revoke',danger:true});
    if(ok) toast.success('Session revoked');
  };
  const handleDeleteAccount = async () => {
    const ok = await confirm({title:'Delete account?',message:'This action is permanent and cannot be undone. All your data, agents, workflows, and API keys will be permanently deleted.',confirmLabel:'Delete Account',danger:true});
    if(ok) toast.error('Account deletion initiated');
  };

  return (
    <div className="page-scroll"><div className="page-inner">
      <Breadcrumbs items={[{label:'Settings',onClick:()=>{}},{label:'Profile'}]}/>
      <SectionHeader title="Profile & Account" subtitle="Manage your personal information and security"/>
      <div style={{display:'flex',gap:24}}>
        <div style={{width:180,flexShrink:0}}>
          {['profile','security','sessions','danger'].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{display:'block',width:'100%',textAlign:'left',padding:'7px 10px',borderRadius:6,border:'none',cursor:'pointer',fontFamily:'var(--font)',fontSize:13,fontWeight:t===tab?600:400,marginBottom:2,
              background:t===tab?'var(--accent-dim)':'transparent',color:t===tab?'var(--accent)':'var(--text-3)',textTransform:'capitalize',transition:'all .12s'
            }}>{t==='danger'?'Danger Zone':t}</button>
          ))}
        </div>
        <div style={{flex:1}}>
          {tab==='profile' && (
            <GlassPanel>
              <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:24}}>
                <div style={{width:64,height:64,borderRadius:16,background:'var(--bg-4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:700,color:'var(--text-2)'}}>AC</div>
                <div>
                  <h3 style={{fontSize:16,fontWeight:700,color:'var(--text-0)'}}>Alex Chen</h3>
                  <p style={{fontSize:12,color:'var(--text-3)'}}>Owner · Pro Plan · Joined Jan 2025</p>
                </div>
                <button className="btn btn-ghost btn-sm" style={{marginLeft:'auto'}}>Change avatar</button>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:14,maxWidth:440}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div><label style={{fontSize:12,color:'var(--text-2)',marginBottom:4,display:'block'}}>First Name</label><input className="input" value={profile.firstName||''} onChange={e=>updateProfileField('firstName',e.target.value)}/></div>
                  <div><label style={{fontSize:12,color:'var(--text-2)',marginBottom:4,display:'block'}}>Last Name</label><input className="input" value={profile.lastName||''} onChange={e=>updateProfileField('lastName',e.target.value)}/></div>
                </div>
                <div><label style={{fontSize:12,color:'var(--text-2)',marginBottom:4,display:'block'}}>Email</label><input className="input" value={profile.email||''} onChange={e=>updateProfileField('email',e.target.value)}/></div>
                <div><label style={{fontSize:12,color:'var(--text-2)',marginBottom:4,display:'block'}}>Role</label><input className="input" defaultValue="Platform Owner" disabled style={{opacity:.6}}/></div>
                <div><label style={{fontSize:12,color:'var(--text-2)',marginBottom:4,display:'block'}}>Timezone</label>
                  <select value={profile.timezone||'America/New_York (EST)'} onChange={e=>updateProfileField('timezone',e.target.value)} style={{width:'100%',background:'var(--bg-2)',border:'1px solid var(--border)',color:'var(--text-1)',padding:'8px 10px',borderRadius:6,fontFamily:'var(--font)',fontSize:13,cursor:'pointer'}}>
                    <option>America/New_York (EST)</option><option>America/Los_Angeles (PST)</option><option>Europe/London (GMT)</option><option>Asia/Tokyo (JST)</option>
                  </select>
                </div>
                <button className="btn btn-accent" style={{alignSelf:'flex-start'}} onClick={handleSave}>Save Changes</button>
              </div>
            </GlassPanel>
          )}

          {tab==='security' && (
            <GlassPanel>
              <h3 style={{fontSize:15,fontWeight:700,color:'var(--text-0)',marginBottom:16}}>Security</h3>
              <div style={{display:'flex',flexDirection:'column',gap:14,maxWidth:440}}>
                <div><label style={{fontSize:12,color:'var(--text-2)',marginBottom:4,display:'block'}}>Current Password</label><input className="input" type="password" placeholder="Enter current password"/></div>
                <div><label style={{fontSize:12,color:'var(--text-2)',marginBottom:4,display:'block'}}>New Password</label><input className="input" type="password" placeholder="Enter new password"/></div>
                <div><label style={{fontSize:12,color:'var(--text-2)',marginBottom:4,display:'block'}}>Confirm Password</label><input className="input" type="password" placeholder="Confirm new password"/></div>
                <button className="btn btn-accent" style={{alignSelf:'flex-start'}} onClick={()=>toast.success('Password updated')}>Update Password</button>
              </div>
              <div style={{borderTop:'1px solid var(--border)',marginTop:20,paddingTop:20}}>
                <h4 style={{fontSize:13,fontWeight:600,color:'var(--text-0)',marginBottom:10}}>Two-Factor Authentication</h4>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',background:'var(--bg-2)',borderRadius:8,border:'1px solid var(--border)'}}>
                  <div><div style={{fontSize:13,fontWeight:500,color:'var(--text-0)'}}>Authenticator App</div><div style={{fontSize:11,color:'var(--text-3)',marginTop:1}}>Enabled · Last used 2 hours ago</div></div>
                  <span className="badge badge-green">Enabled</span>
                </div>
              </div>
            </GlassPanel>
          )}

          {tab==='sessions' && (
            <GlassPanel>
              <h3 style={{fontSize:15,fontWeight:700,color:'var(--text-0)',marginBottom:16}}>Active Sessions</h3>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {sessions.map((s,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:'var(--bg-2)',borderRadius:8,border:`1px solid ${s.current?'rgba(16,185,129,0.2)':'var(--border)'}`}}>
                    <Icons.globe size={18} style={{color:'var(--text-3)',flexShrink:0}}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:500,color:'var(--text-0)'}}>{s.device}{s.current&&<span className="badge badge-green" style={{marginLeft:8,fontSize:9}}>Current</span>}</div>
                      <div style={{fontSize:11,color:'var(--text-3)',marginTop:1}}>{s.ip} · {s.location} · {s.last}</div>
                    </div>
                    {!s.current && <button className="btn btn-ghost btn-sm" onClick={()=>handleRevokeSession(s)} style={{color:'var(--red)',fontSize:11}}>Revoke</button>}
                  </div>
                ))}
              </div>
            </GlassPanel>
          )}

          {tab==='danger' && (
            <GlassPanel style={{border:'1px solid rgba(239,68,68,0.2)'}}>
              <h3 style={{fontSize:15,fontWeight:700,color:'#f87171',marginBottom:6}}>Danger Zone</h3>
              <p style={{fontSize:12,color:'var(--text-3)',marginBottom:16,lineHeight:1.5}}>These actions are permanent and cannot be undone.</p>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',background:'var(--bg-2)',borderRadius:8,border:'1px solid var(--border)'}}>
                  <div><div style={{fontSize:13,fontWeight:500,color:'var(--text-0)'}}>Sign Out</div><div style={{fontSize:11,color:'var(--text-3)',marginTop:1}}>End current session on this device</div></div>
                  <button className="btn btn-sm btn-ghost" onClick={handleSignOut}>Sign out</button>
                </div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',background:'rgba(239,68,68,0.05)',borderRadius:8,border:'1px solid rgba(239,68,68,0.15)'}}>
                  <div><div style={{fontSize:13,fontWeight:500,color:'var(--text-0)'}}>Reset Demo Data</div><div style={{fontSize:11,color:'var(--text-3)',marginTop:1}}>Clear API keys, agents, tweaks, onboarding state</div></div>
                  <button className="btn btn-sm" onClick={async()=>{ const ok=await confirm({title:'Reset all demo data?',message:'This clears all locally-saved data and reloads the app.',confirmLabel:'Reset',danger:true}); if(ok){ NSStore.resetAll(); location.reload(); } }} style={{background:'rgba(239,68,68,0.15)',color:'#f87171',border:'1px solid rgba(239,68,68,0.3)'}}>Reset</button>
                </div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',background:'rgba(239,68,68,0.05)',borderRadius:8,border:'1px solid rgba(239,68,68,0.15)'}}>
                  <div><div style={{fontSize:13,fontWeight:500,color:'var(--text-0)'}}>Delete Account</div><div style={{fontSize:11,color:'var(--text-3)',marginTop:1}}>Permanently remove your account and all data</div></div>
                  <button className="btn btn-sm" onClick={handleDeleteAccount} style={{background:'rgba(239,68,68,0.15)',color:'#f87171',border:'1px solid rgba(239,68,68,0.3)'}}>Delete</button>
                </div>
              </div>
            </GlassPanel>
          )}
        </div>
      </div>
    </div></div>
  );
};

Object.assign(window, { ToastContext, ToastProvider, useToast, ConfirmContext, ConfirmProvider, useConfirm, WorkspaceSwitcher, Breadcrumbs, ProfilePage });
