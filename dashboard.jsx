/* NeuronStack AI v2 — Dashboard Page */
const DashboardPage = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const apiData = useMemo(()=>genTrendData(30, 800000, 50000, 200000),[]);
  const tokenData = useMemo(()=>genTrendData(30, 2e6, 100000, 500000),[]);
  const revenueData = useMemo(()=>genTrendData(12, 180000, 12000, 30000),[]);

  /* ── Real-time metrics simulation ── */
  const [liveMetrics, setLiveMetrics] = useState({
    apiReqs: 47200000, revenue: 284590, gpu: 73.4, agents: 156,
    workflows: 89, calls: 1247, tokens: 892000000000, teams: 34,
  });
  useEffect(()=>{
    const iv = setInterval(()=>{
      setLiveMetrics(m=>({
        apiReqs: m.apiReqs + Math.floor(Math.random()*120+30),
        revenue: m.revenue + +(Math.random()*2.5).toFixed(2),
        gpu: Math.min(99, Math.max(50, m.gpu + (Math.random()-0.48)*0.3)),
        agents: m.agents + (Math.random()>0.97?1:0),
        workflows: m.workflows + (Math.random()>0.95?1:Math.random()<0.03?-1:0),
        calls: m.calls + Math.floor(Math.random()*3),
        tokens: m.tokens + Math.floor(Math.random()*50000+10000),
        teams: m.teams,
      }));
    }, 2500);
    return ()=>clearInterval(iv);
  },[]);

  /* ── Live activity feed ── */
  const activityTemplates = useMemo(()=>[
    {icon:<Icons.zap size={14}/>, text:'GPT-4o completion', detail:()=>`${(1000+Math.floor(Math.random()*5000)).toLocaleString()} tokens · ${(100+Math.floor(Math.random()*400))}ms`, color:'var(--accent)', badge:{label:'200',color:'green'}},
    {icon:<Icons.phone size={14}/>, text:'Voice call completed', detail:()=>`${Math.floor(Math.random()*5)+1}m ${Math.floor(Math.random()*59)}s · Lead ${Math.random()>.4?'qualified':'pending'}`, color:'var(--accent2)', badge:{label:'Completed',color:'blue'}},
    {icon:<Icons.workflow size={14}/>, text:'Workflow executed', detail:()=>`${4+Math.floor(Math.random()*10)} steps · ${['Email sent','CRM updated','Slack notified','Invoice created'][Math.floor(Math.random()*4)]}`, color:'var(--accent3)', badge:{label:'Success',color:'green'}},
    {icon:<Icons.cpu size={14}/>, text:'Claude 3.5 Sonnet completion', detail:()=>`${(2000+Math.floor(Math.random()*6000)).toLocaleString()} tokens · ${(80+Math.floor(Math.random()*300))}ms`, color:'#f59e0b', badge:{label:'200',color:'green'}},
    {icon:<Icons.image size={14}/>, text:'Image generated', detail:()=>`SDXL · ${['512×512','1024×1024','768×1024'][Math.floor(Math.random()*3)]} · ${(1+Math.random()*3).toFixed(1)}s`, color:'var(--accent3)'},
    {icon:<Icons.bot size={14}/>, text:'Agent response', detail:()=>`CRM updated · ${['Follow-up scheduled','Lead scored','Email drafted'][Math.floor(Math.random()*3)]}`, color:'#10b981', badge:{label:'Active',color:'cyan'}},
  ],[]);

  const [activities, setActivities] = useState(()=>[
    {icon:<Icons.zap size={14}/>, text:'GPT-4o completion', detail:'2,847 tokens · 340ms', time:'2s ago', color:'var(--accent)', badge:{label:'200',color:'green'}},
    {icon:<Icons.phone size={14}/>, text:'Voice call completed', detail:'3m 24s · Lead qualified', time:'15s ago', color:'var(--accent2)', badge:{label:'Completed',color:'blue'}},
    {icon:<Icons.workflow size={14}/>, text:'Workflow #892 executed', detail:'12 steps · Email sequence triggered', time:'28s ago', color:'var(--accent3)', badge:{label:'Success',color:'green'}},
    {icon:<Icons.image size={14}/>, text:'Image generated', detail:'SDXL · 1024×1024 · 2.1s', time:'45s ago', color:'#f59e0b'},
    {icon:<Icons.bot size={14}/>, text:'Agent response', detail:'CRM updated · Follow-up scheduled', time:'1m ago', color:'#10b981', badge:{label:'Active',color:'cyan'}},
    {icon:<Icons.key size={14}/>, text:'API key created', detail:'pk_live_***8f2k · Production', time:'3m ago', color:'var(--text-3)'},
    {icon:<Icons.zap size={14}/>, text:'Claude 3.5 Sonnet completion', detail:'5,120 tokens · 280ms', time:'3m ago', color:'var(--accent2)', badge:{label:'200',color:'green'}},
    {icon:<Icons.phone size={14}/>, text:'Inbound call received', detail:'Queue: Support · AI handling', time:'4m ago', color:'var(--accent2)', badge:{label:'Live',color:'cyan'}},
  ]);

  useEffect(()=>{
    const iv = setInterval(()=>{
      const tmpl = activityTemplates[Math.floor(Math.random()*activityTemplates.length)];
      setActivities(prev=>[{...tmpl, detail:tmpl.detail(), time:'just now'}, ...prev.slice(0,11)]);
    }, 4000);
    return ()=>clearInterval(iv);
  },[activityTemplates]);

  const providers = [
    {name:'OpenAI', status:'operational', latency:'124ms', uptime:'99.98%'},
    {name:'Anthropic', status:'operational', latency:'98ms', uptime:'99.99%'},
    {name:'Google', status:'degraded', latency:'342ms', uptime:'99.84%'},
    {name:'Meta', status:'operational', latency:'156ms', uptime:'99.95%'},
    {name:'Mistral', status:'operational', latency:'112ms', uptime:'99.97%'},
    {name:'DeepSeek', status:'operational', latency:'189ms', uptime:'99.91%'},
  ];

  const topModels = [
    {name:'GPT-4o', calls:'12.4M', pct:28, color:'var(--accent)'},
    {name:'Claude 3.5 Sonnet', calls:'8.7M', pct:21, color:'var(--accent2)'},
    {name:'Gemini Pro', calls:'6.2M', pct:14, color:'var(--accent3)'},
    {name:'Llama 3.1 70B', calls:'5.1M', pct:12, color:'#f59e0b'},
    {name:'DeepSeek V3', calls:'4.3M', pct:10, color:'#10b981'},
    {name:'Mistral Large', calls:'3.8M', pct:8, color:'#ec4899'},
  ];

  const recentCalls = [
    {id:'req_8f2kL9', model:'GPT-4o', tokens:'2,847', latency:'340ms', cost:'$0.042', status:'success', time:'2s ago'},
    {id:'req_7gH3m1', model:'Claude 3.5 Sonnet', tokens:'5,120', latency:'280ms', cost:'$0.068', status:'success', time:'15s ago'},
    {id:'req_6jK4n2', model:'Gemini Pro', tokens:'1,456', latency:'420ms', cost:'$0.018', status:'success', time:'28s ago'},
    {id:'req_5mL2p3', model:'Llama 3.1 70B', tokens:'3,892', latency:'560ms', cost:'$0.012', status:'success', time:'45s ago'},
    {id:'req_4nM1q4', model:'GPT-4o', tokens:'890', latency:'180ms', cost:'$0.014', status:'success', time:'1m ago'},
    {id:'req_3pN9r5', model:'DeepSeek V3', tokens:'4,210', latency:'380ms', cost:'$0.008', status:'error', time:'2m ago'},
    {id:'req_2qO8s6', model:'Mistral Large', tokens:'2,100', latency:'290ms', cost:'$0.022', status:'success', time:'3m ago'},
  ];

  const costSegments = [
    {value:42800, color:'var(--accent)', label:'Inference'},
    {value:18200, color:'var(--accent2)', label:'Voice AI'},
    {value:12400, color:'var(--accent3)', label:'Image Gen'},
    {value:8900, color:'#f59e0b', label:'Embeddings'},
    {value:5200, color:'#10b981', label:'Fine-tuning'},
  ];

  return (
    <div className="page-scroll">
      <div className="page-inner">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
          <div>
            <h1 style={{fontSize:22,fontWeight:700,color:'var(--text-0)',letterSpacing:'-0.02em'}}>Dashboard</h1>
            <p style={{fontSize:12,color:'var(--text-3)',marginTop:2}}>Real-time overview of your AI infrastructure</p>
          </div>
          <Tabs tabs={['24h','7d','30d','90d']} active={timeRange} onChange={setTimeRange} />
        </div>

        {/* Metrics Grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:12,marginBottom:24}}>
          <MetricCard icon={<Icons.activity size={16}/>} label="Total API Requests" value={liveMetrics.apiReqs} change="+12.4%" changeDir="up" spark={genSparkData(12,40,20)} delay={0.04} color="var(--accent)"/>
          <MetricCard icon={<Icons.dollar size={16}/>} label="Monthly Revenue" value={liveMetrics.revenue} prefix="$" change="+8.2%" changeDir="up" spark={genSparkData(12,50,15)} delay={0.08} color="var(--accent2)"/>
          <MetricCard icon={<Icons.server size={16}/>} label="GPU Usage" value={liveMetrics.gpu} suffix="%" change="+3.1%" changeDir="up" spark={genSparkData(12,60,25)} delay={0.12} color="var(--accent3)"/>
          <MetricCard icon={<Icons.bot size={16}/>} label="Active Agents" value={liveMetrics.agents} change="+24" changeDir="up" spark={genSparkData(12,30,20)} delay={0.16} color="#10b981"/>
          <MetricCard icon={<Icons.workflow size={16}/>} label="Running Workflows" value={liveMetrics.workflows} change="+7" changeDir="up" spark={genSparkData(12,35,15)} delay={0.2} color="#f59e0b"/>
          <MetricCard icon={<Icons.phone size={16}/>} label="Voice Calls Today" value={liveMetrics.calls} change="+18.6%" changeDir="up" spark={genSparkData(12,45,20)} delay={0.24} color="#ec4899"/>
          <MetricCard icon={<Icons.zap size={16}/>} label="Token Consumption" value={liveMetrics.tokens} change="+15.3%" changeDir="up" spark={genSparkData(12,55,18)} delay={0.28} color="var(--accent)"/>
          <MetricCard icon={<Icons.users size={16}/>} label="Active Teams" value={liveMetrics.teams} change="+4" changeDir="up" spark={genSparkData(12,28,10)} delay={0.32} color="var(--accent2)"/>
        </div>

        {/* Charts Row */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))',gap:12,marginBottom:24}}>
          <GlassPanel style={{minWidth:0}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
              <div>
                <h3 style={{fontSize:13,fontWeight:600,color:'var(--text-0)'}}>API Request Volume</h3>
                <p style={{fontSize:11,color:'var(--text-3)',marginTop:1}}>30-day trend across all providers</p>
              </div>
              <div style={{display:'flex',gap:10,fontSize:10,color:'var(--text-3)'}}>
                <span style={{display:'flex',alignItems:'center',gap:4}}><span style={{width:8,height:2,borderRadius:1,background:'var(--accent)'}}></span>Requests</span>
                <span style={{display:'flex',alignItems:'center',gap:4}}><span style={{width:8,height:2,borderRadius:1,background:'var(--accent2)'}}></span>Tokens</span>
              </div>
            </div>
            <AreaChart data={[apiData, tokenData.map(v=>v*.4)]} labels={Array.from({length:30},(_,i)=>i%5===0?`${i+1}`:'')} color="var(--accent)" color2="var(--accent2)" h={180}/>
          </GlassPanel>

          <GlassPanel>
            <h3 style={{fontSize:13,fontWeight:600,color:'var(--text-0)',marginBottom:4}}>Cost Breakdown</h3>
            <p style={{fontSize:11,color:'var(--text-3)',marginBottom:14}}>Current billing period</p>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14}}>
              <DonutChart segments={costSegments} size={128} thickness={15}/>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:5}}>
              {costSegments.map(s=>(
                <div key={s.label} style={{display:'flex',alignItems:'center',gap:8,fontSize:12}}>
                  <span style={{width:7,height:7,borderRadius:2,background:s.color,flexShrink:0}}></span>
                  <span style={{flex:1,color:'var(--text-2)'}}>{s.label}</span>
                  <span style={{fontWeight:600,color:'var(--text-1)',fontFamily:'var(--mono)',fontSize:11}}>${(s.value/1000).toFixed(1)}K</span>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>

        {/* Middle Row */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:12,marginBottom:24}}>
          <GlassPanel>
            <h3 style={{fontSize:13,fontWeight:600,color:'var(--text-0)',marginBottom:12}}>Provider Health</h3>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {providers.map(p=>(
                <div key={p.name} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 10px',borderRadius:7,background:'var(--bg-2)'}}>
                  <div className={`sdot sdot-${p.status==='operational'?'green':'yellow'}`} style={{width:6,height:6}}></div>
                  <span style={{flex:1,fontSize:12,fontWeight:500,color:'var(--text-1)'}}>{p.name}</span>
                  <span style={{fontSize:10,color:'var(--text-3)',fontFamily:'var(--mono)'}}>{p.latency}</span>
                  <span className={`badge badge-${p.status==='operational'?'green':'yellow'}`} style={{fontSize:10}}>
                    {p.status==='operational'?'Healthy':'Degraded'}
                  </span>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel>
            <h3 style={{fontSize:13,fontWeight:600,color:'var(--text-0)',marginBottom:12}}>Top Models</h3>
            <div style={{display:'flex',flexDirection:'column',gap:9}}>
              {topModels.map((m,i)=>(
                <div key={m.name}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:3}}>
                    <span style={{fontSize:12,fontWeight:500,color:'var(--text-1)'}}>{m.name}</span>
                    <span style={{fontSize:10,color:'var(--text-3)',fontFamily:'var(--mono)'}}>{m.calls}</span>
                  </div>
                  <div style={{height:4,borderRadius:2,background:'var(--bg-3)',overflow:'hidden'}}>
                    <div style={{height:'100%',borderRadius:2,background:m.color,width:`${m.pct}%`,transition:'width 1s var(--ease)',transitionDelay:`${i*0.08}s`}}></div>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel>
            <h3 style={{fontSize:13,fontWeight:600,color:'var(--text-0)',marginBottom:4}}>Revenue Trend</h3>
            <p style={{fontSize:11,color:'var(--text-3)',marginBottom:12}}>Monthly recurring revenue</p>
            <AreaChart data={revenueData} labels={monthLabels} color="var(--accent2)" h={145} showGrid={false}/>
          </GlassPanel>
        </div>

        {/* Bottom Row */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(360px,1fr))',gap:12}}>
          <GlassPanel style={{padding:0,overflow:'hidden'}}>
            <div style={{padding:'14px 18px 10px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <h3 style={{fontSize:13,fontWeight:600,color:'var(--text-0)'}}>Recent API Calls</h3>
              <button className="btn btn-ghost btn-sm">View All</button>
            </div>
            <div style={{overflowX:'auto'}}>
              <table className="ns-table">
                <thead><tr>
                  <th>Request ID</th><th>Model</th><th>Tokens</th><th>Latency</th><th>Cost</th><th>Status</th><th>Time</th>
                </tr></thead>
                <tbody>
                  {recentCalls.map(c=>(
                    <tr key={c.id}>
                      <td><code className="mono" style={{color:'var(--accent)'}}>{c.id}</code></td>
                      <td style={{fontWeight:500}}>{c.model}</td>
                      <td className="mono">{c.tokens}</td>
                      <td className="mono">{c.latency}</td>
                      <td className="mono">{c.cost}</td>
                      <td><span className={`badge badge-${c.status==='success'?'green':'red'}`}>{c.status}</span></td>
                      <td style={{color:'var(--text-3)',fontSize:12}}>{c.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassPanel>

          <GlassPanel style={{padding:0,overflow:'hidden'}}>
            <div style={{padding:'14px 18px 8px',display:'flex',alignItems:'center',gap:8}}>
              <div className="sdot sdot-green" style={{width:6,height:6}}></div>
              <h3 style={{fontSize:13,fontWeight:600,color:'var(--text-0)'}}>Live Activity</h3>
              <span style={{fontSize:10,color:'var(--text-3)',marginLeft:'auto',fontFamily:'var(--mono)'}}>streaming</span>
            </div>
            <div style={{padding:'0 18px 10px',maxHeight:380,overflowY:'auto'}}>
              {activities.map((a,i)=><ActivityItem key={i} {...a}/>)}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { DashboardPage });
