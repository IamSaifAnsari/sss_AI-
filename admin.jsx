/* NeuronStack AI — Admin / Owner Dashboard */

const AdminPage = () => {
  const [tab, setTab] = useState('overview');
  const {setPage} = useApp();

  /* ── Live platform metrics ── */
  const [platformMetrics, setPlatformMetrics] = useState({
    totalUsers: 2847, activeUsers: 1892, workspaces: 342, mrr: 284590,
    arr: 3415080, apiCalls24h: 18400000, churnRate: 1.8, nps: 72,
  });
  useEffect(()=>{
    const iv = setInterval(()=>{
      setPlatformMetrics(m=>({
        ...m,
        totalUsers: m.totalUsers + (Math.random()>.7?1:0),
        activeUsers: m.activeUsers + (Math.random()>.6?1:Math.random()<0.1?-1:0),
        apiCalls24h: m.apiCalls24h + Math.floor(Math.random()*800+200),
        mrr: m.mrr + +(Math.random()*8).toFixed(2),
      }));
    }, 3000);
    return ()=>clearInterval(iv);
  },[]);

  const userGrowthData = useMemo(()=>genTrendData(12, 1200, 140, 80),[]);
  const revenueGrowthData = useMemo(()=>genTrendData(12, 150000, 12000, 8000),[]);
  const apiVolumeData = useMemo(()=>genTrendData(30, 12000000, 400000, 2000000),[]);

  const recentUsers = [
    {name:'Sarah Kim',email:'sarah@acme.co',plan:'Pro',joined:'2h ago',status:'active',usage:'12.4K calls'},
    {name:'James Rodriguez',email:'james@startup.io',plan:'Enterprise',joined:'5h ago',status:'active',usage:'45.2K calls'},
    {name:'Emily Chen',email:'emily@bigcorp.com',plan:'Pro',joined:'8h ago',status:'active',usage:'3.1K calls'},
    {name:'Michael Brown',email:'michael@agency.dev',plan:'Starter',joined:'12h ago',status:'trial',usage:'890 calls'},
    {name:'Lisa Park',email:'lisa@techfirm.ai',plan:'Pro',joined:'1d ago',status:'active',usage:'8.7K calls'},
    {name:'David Wilson',email:'david@consulting.co',plan:'Enterprise',joined:'1d ago',status:'active',usage:'28.9K calls'},
    {name:'Anna Müller',email:'anna@gmbh.de',plan:'Starter',joined:'2d ago',status:'trial',usage:'340 calls'},
    {name:'Tom Lee',email:'tom@fintech.io',plan:'Pro',joined:'2d ago',status:'active',usage:'6.2K calls'},
  ];

  const tenants = [
    {name:'Acme Corp',plan:'Enterprise',users:45,agents:12,calls:'4.2M',mrr:'$12,400',health:'healthy'},
    {name:'StartupIO',plan:'Enterprise',users:28,agents:8,calls:'2.8M',mrr:'$8,900',health:'healthy'},
    {name:'BigCorp Inc',plan:'Pro',users:12,agents:4,calls:'1.1M',mrr:'$2,400',health:'healthy'},
    {name:'DevAgency',plan:'Pro',users:8,agents:6,calls:'890K',mrr:'$1,800',health:'warning'},
    {name:'TechFirm AI',plan:'Pro',users:15,agents:5,calls:'1.4M',mrr:'$3,200',health:'healthy'},
    {name:'ConsultingCo',plan:'Enterprise',users:32,agents:10,calls:'3.1M',mrr:'$9,800',health:'healthy'},
    {name:'FinTech IO',plan:'Pro',users:6,agents:3,calls:'620K',mrr:'$1,200',health:'healthy'},
    {name:'Healthcare AI',plan:'Enterprise',users:22,agents:9,calls:'1.9M',mrr:'$7,600',health:'warning'},
  ];

  const infraStatus = [
    {name:'API Gateway', region:'us-east-1', status:'operational', latency:'12ms', uptime:'99.99%', load:'34%'},
    {name:'API Gateway', region:'eu-west-1', status:'operational', latency:'18ms', uptime:'99.98%', load:'28%'},
    {name:'GPU Cluster', region:'us-east-1', status:'operational', latency:'—', uptime:'99.95%', load:'73%'},
    {name:'GPU Cluster', region:'us-west-2', status:'degraded', latency:'—', uptime:'99.84%', load:'92%'},
    {name:'Voice Engine', region:'us-east-1', status:'operational', latency:'45ms', uptime:'99.97%', load:'41%'},
    {name:'Database', region:'us-east-1', status:'operational', latency:'3ms', uptime:'99.99%', load:'22%'},
    {name:'CDN / Edge', region:'global', status:'operational', latency:'8ms', uptime:'100%', load:'18%'},
    {name:'Queue Workers', region:'us-east-1', status:'operational', latency:'—', uptime:'99.96%', load:'56%'},
  ];

  const planDistribution = [
    {value:124, color:'var(--accent3)', label:'Enterprise'},
    {value:456, color:'var(--accent)', label:'Pro'},
    {value:312, color:'var(--accent2)', label:'Starter'},
    {value:198, color:'var(--text-3)', label:'Free / Trial'},
  ];

  return (
    <div className="page-scroll"><div className="page-inner">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:700,color:'var(--text-0)',letterSpacing:'-0.02em'}}>Platform Admin</h1>
          <p style={{fontSize:12,color:'var(--text-3)',marginTop:2}}>Owner-level overview of NeuronStack AI platform</p>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn btn-ghost" onClick={()=>setPage('dashboard')}><Icons.dashboard size={14}/> Operations</button>
          <button className="btn btn-accent"><Icons.download size={14}/> Export Report</button>
        </div>
      </div>

      <Tabs tabs={[{id:'overview',label:'Overview'},{id:'users',label:'Users'},{id:'tenants',label:'Tenants'},{id:'infra',label:'Infrastructure'}]}
        active={tab} onChange={setTab} style={{marginBottom:20}}/>

      {/* ═══ Overview Tab ═══ */}
      {tab==='overview' && <>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:12,marginBottom:24}}>
          <MetricCard icon={<Icons.users size={16}/>} label="Total Users" value={platformMetrics.totalUsers} change="+142 this month" changeDir="up" color="var(--accent)" delay={0.04}/>
          <MetricCard icon={<Icons.activity size={16}/>} label="Active Users (DAU)" value={platformMetrics.activeUsers} change="66.4% of total" changeDir="up" color="var(--accent2)" delay={0.08}/>
          <MetricCard icon={<Icons.layers size={16}/>} label="Workspaces" value={platformMetrics.workspaces} change="+28 this month" changeDir="up" color="var(--accent3)" delay={0.12}/>
          <MetricCard icon={<Icons.dollar size={16}/>} label="MRR" value={platformMetrics.mrr} prefix="$" change="+8.2%" changeDir="up" color="#10b981" delay={0.16}/>
          <MetricCard icon={<Icons.dollar size={16}/>} label="ARR" value={platformMetrics.arr} prefix="$" change="+18.4%" changeDir="up" color="#10b981" delay={0.2}/>
          <MetricCard icon={<Icons.zap size={16}/>} label="API Calls (24h)" value={platformMetrics.apiCalls24h} change="+12.1%" changeDir="up" color="var(--accent)" delay={0.24}/>
          <MetricCard icon={<Icons.arrowDown size={16}/>} label="Churn Rate" value={platformMetrics.churnRate} suffix="%" change="-0.3%" changeDir="up" color="#f59e0b" delay={0.28}/>
          <MetricCard icon={<Icons.activity size={16}/>} label="NPS Score" value={platformMetrics.nps} change="+4 pts" changeDir="up" color="var(--accent2)" delay={0.32}/>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))',gap:12,marginBottom:24}}>
          <GlassPanel style={{minWidth:0}}>
            <h3 style={{fontSize:13,fontWeight:600,color:'var(--text-0)',marginBottom:4}}>User Growth</h3>
            <p style={{fontSize:11,color:'var(--text-3)',marginBottom:14}}>Total registered users by month</p>
            <AreaChart data={userGrowthData} labels={monthLabels} color="var(--accent)" h={180}/>
          </GlassPanel>
          <GlassPanel style={{minWidth:0}}>
            <h3 style={{fontSize:13,fontWeight:600,color:'var(--text-0)',marginBottom:4}}>Revenue Growth</h3>
            <p style={{fontSize:11,color:'var(--text-3)',marginBottom:14}}>Monthly recurring revenue trend</p>
            <AreaChart data={revenueGrowthData} labels={monthLabels} color="#10b981" h={180}/>
          </GlassPanel>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:12,marginBottom:24}}>
          <GlassPanel>
            <h3 style={{fontSize:13,fontWeight:600,color:'var(--text-0)',marginBottom:14}}>Users by Plan</h3>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14}}>
              <DonutChart segments={planDistribution} size={130} thickness={15}/>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:5}}>
              {planDistribution.map(s=>(
                <div key={s.label} style={{display:'flex',alignItems:'center',gap:8,fontSize:12}}>
                  <span style={{width:7,height:7,borderRadius:2,background:s.color,flexShrink:0}}></span>
                  <span style={{flex:1,color:'var(--text-2)'}}>{s.label}</span>
                  <span style={{fontWeight:600,color:'var(--text-1)',fontFamily:'var(--mono)',fontSize:11}}>{s.value}</span>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel>
            <h3 style={{fontSize:13,fontWeight:600,color:'var(--text-0)',marginBottom:14}}>Platform API Volume</h3>
            <p style={{fontSize:11,color:'var(--text-3)',marginBottom:12}}>Requests across all tenants (30d)</p>
            <AreaChart data={apiVolumeData} labels={Array.from({length:30},(_,i)=>i%5===0?`${i+1}`:'')} color="var(--accent2)" h={155}/>
          </GlassPanel>

          <GlassPanel>
            <h3 style={{fontSize:13,fontWeight:600,color:'var(--text-0)',marginBottom:14}}>Top Revenue Tenants</h3>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {tenants.slice(0,6).sort((a,b)=>parseFloat(b.mrr.replace(/[$,]/g,''))-parseFloat(a.mrr.replace(/[$,]/g,''))).map((t,i)=>(
                <div key={t.name} style={{display:'flex',alignItems:'center',gap:10,fontSize:12}}>
                  <span style={{width:18,fontWeight:600,color:'var(--text-3)',fontFamily:'var(--mono)',fontSize:10}}>{i+1}.</span>
                  <span style={{flex:1,fontWeight:500,color:'var(--text-1)'}}>{t.name}</span>
                  <span className={`badge badge-${t.plan==='Enterprise'?'violet':'cyan'}`} style={{fontSize:9}}>{t.plan}</span>
                  <span style={{fontFamily:'var(--mono)',fontWeight:600,color:'var(--text-0)',fontSize:11}}>{t.mrr}</span>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </>}

      {/* ═══ Users Tab ═══ */}
      {tab==='users' && <>
        <div style={{display:'flex',gap:12,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
          <div style={{position:'relative',flex:'1 1 240px',maxWidth:300}}>
            <Icons.search size={14} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--text-3)'}}/>
            <input className="input" placeholder="Search users..." style={{paddingLeft:30}}/>
          </div>
          <select style={{background:'var(--bg-2)',border:'1px solid var(--border)',color:'var(--text-1)',padding:'6px 10px',borderRadius:6,fontFamily:'var(--font)',fontSize:12,cursor:'pointer'}}>
            <option>All Plans</option><option>Enterprise</option><option>Pro</option><option>Starter</option><option>Trial</option>
          </select>
          <button className="btn btn-accent btn-sm"><Icons.plus size={13}/> Invite User</button>
        </div>
        <GlassPanel style={{padding:0,overflow:'hidden'}}>
          <table className="ns-table">
            <thead><tr><th>User</th><th>Plan</th><th>API Usage</th><th>Status</th><th>Joined</th><th></th></tr></thead>
            <tbody>
              {recentUsers.map(u=>(
                <tr key={u.email}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:30,height:30,borderRadius:7,background:'var(--bg-4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'var(--text-2)',flexShrink:0}}>
                        {u.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div>
                        <div style={{fontWeight:600,color:'var(--text-0)',fontSize:13}}>{u.name}</div>
                        <div style={{fontSize:11,color:'var(--text-3)'}}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge badge-${u.plan==='Enterprise'?'violet':u.plan==='Pro'?'cyan':'blue'}`}>{u.plan}</span></td>
                  <td className="mono" style={{fontSize:11}}>{u.usage}</td>
                  <td><span className={`badge badge-${u.status==='active'?'green':'yellow'}`}>{u.status}</span></td>
                  <td style={{color:'var(--text-3)',fontSize:12}}>{u.joined}</td>
                  <td>
                    <div style={{display:'flex',gap:4}}>
                      <button className="btn btn-ghost btn-sm" style={{padding:4}}><Icons.eye size={13}/></button>
                      <button className="btn btn-ghost btn-sm" style={{padding:4}}><Icons.settings size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassPanel>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12,fontSize:12,color:'var(--text-3)'}}>
          <span>Showing 1-8 of {platformMetrics.totalUsers.toLocaleString()} users</span>
          <div style={{display:'flex',gap:4}}>
            <button className="btn btn-ghost btn-sm" style={{padding:'4px 10px'}}>← Prev</button>
            <button className="btn btn-ghost btn-sm" style={{padding:'4px 10px'}}>Next →</button>
          </div>
        </div>
      </>}

      {/* ═══ Tenants Tab ═══ */}
      {tab==='tenants' && <>
        <div style={{display:'flex',gap:12,marginBottom:16,alignItems:'center'}}>
          <div style={{position:'relative',flex:'1 1 240px',maxWidth:300}}>
            <Icons.search size={14} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--text-3)'}}/>
            <input className="input" placeholder="Search workspaces..." style={{paddingLeft:30}}/>
          </div>
          <button className="btn btn-accent btn-sm"><Icons.plus size={13}/> Create Workspace</button>
        </div>
        <GlassPanel style={{padding:0,overflow:'hidden'}}>
          <table className="ns-table">
            <thead><tr><th>Workspace</th><th>Plan</th><th>Users</th><th>Agents</th><th>API Calls</th><th>MRR</th><th>Health</th><th></th></tr></thead>
            <tbody>
              {tenants.map(t=>(
                <tr key={t.name}>
                  <td style={{fontWeight:600,color:'var(--text-0)'}}>{t.name}</td>
                  <td><span className={`badge badge-${t.plan==='Enterprise'?'violet':'cyan'}`}>{t.plan}</span></td>
                  <td className="mono">{t.users}</td>
                  <td className="mono">{t.agents}</td>
                  <td className="mono" style={{fontSize:11}}>{t.calls}</td>
                  <td className="mono" style={{fontWeight:600}}>{t.mrr}</td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:5}}>
                      <div className={`sdot sdot-${t.health==='healthy'?'green':'yellow'}`} style={{width:6,height:6}}></div>
                      <span style={{fontSize:11,color:t.health==='healthy'?'var(--green)':'var(--yellow)',textTransform:'capitalize'}}>{t.health}</span>
                    </div>
                  </td>
                  <td><button className="btn btn-ghost btn-sm" style={{padding:'4px 8px'}}><Icons.eye size={13}/> View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassPanel>
      </>}

      {/* ═══ Infrastructure Tab ═══ */}
      {tab==='infra' && <>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12,marginBottom:20}}>
          {[
            {label:'Overall Uptime',value:'99.97%',color:'#10b981'},
            {label:'Avg Response',value:'14ms',color:'var(--accent)'},
            {label:'Error Rate',value:'0.02%',color:'var(--accent2)'},
            {label:'Active Connections',value:'14.2K',color:'var(--accent3)'},
          ].map((m,i)=>(
            <GlassPanel key={i} style={{padding:16,textAlign:'center'}}>
              <div style={{fontSize:11,color:'var(--text-3)',marginBottom:6}}>{m.label}</div>
              <div style={{fontSize:24,fontWeight:700,color:m.color,letterSpacing:'-0.02em'}}>{m.value}</div>
            </GlassPanel>
          ))}
        </div>

        <GlassPanel style={{padding:0,overflow:'hidden',marginBottom:20}}>
          <div style={{padding:'14px 18px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:8}}>
            <div className="sdot sdot-green" style={{width:6,height:6}}></div>
            <h3 style={{fontSize:13,fontWeight:600,color:'var(--text-0)'}}>Service Status</h3>
            <span style={{marginLeft:'auto',fontSize:11,color:'var(--text-3)'}}>Last checked: 4s ago</span>
          </div>
          <table className="ns-table">
            <thead><tr><th>Service</th><th>Region</th><th>Status</th><th>Latency</th><th>Uptime</th><th>Load</th></tr></thead>
            <tbody>
              {infraStatus.map((s,i)=>(
                <tr key={i}>
                  <td style={{fontWeight:500}}>{s.name}</td>
                  <td><span className="mono" style={{fontSize:11,color:'var(--text-2)'}}>{s.region}</span></td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:5}}>
                      <div className={`sdot sdot-${s.status==='operational'?'green':'yellow'}`} style={{width:5,height:5}}></div>
                      <span className={`badge badge-${s.status==='operational'?'green':'yellow'}`} style={{fontSize:10}}>{s.status}</span>
                    </div>
                  </td>
                  <td className="mono" style={{fontSize:11}}>{s.latency}</td>
                  <td className="mono" style={{fontSize:11}}>{s.uptime}</td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:6,minWidth:80}}>
                      <div style={{flex:1,height:4,borderRadius:2,background:'var(--bg-3)',overflow:'hidden'}}>
                        <div style={{height:'100%',borderRadius:2,width:s.load,
                          background:parseInt(s.load)>80?'var(--red)':parseInt(s.load)>60?'var(--yellow)':'var(--green)'}}></div>
                      </div>
                      <span className="mono" style={{fontSize:10,color:'var(--text-3)',width:28}}>{s.load}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassPanel>

        <GlassPanel style={{minWidth:0}}>
          <h3 style={{fontSize:13,fontWeight:600,color:'var(--text-0)',marginBottom:14}}>Platform API Traffic (30d)</h3>
          <AreaChart data={apiVolumeData} labels={Array.from({length:30},(_,i)=>i%5===0?`Day ${i+1}`:'')} color="var(--accent)" h={180}/>
        </GlassPanel>
      </>}
    </div></div>
  );
};

Object.assign(window, { AdminPage });
