/* NeuronStack AI — Models, Agents, Voice AI, Workflows */

/* ═══════════════════ MODELS PAGE ═══════════════════ */
const ModelsPage = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('popular');

  const categories = ['all','chat','code','vision','embedding','image','audio'];
  const allModels = [
    {name:'GPT-4o',provider:'OpenAI',ctx:'128K',latency:124,cost:'$5 / $15',speed:92,pop:98,caps:['chat','vision','code'],status:'operational',desc:'Most capable GPT model. Multimodal with vision.'},
    {name:'GPT-4o Mini',provider:'OpenAI',ctx:'128K',latency:85,cost:'$0.15 / $0.60',speed:97,pop:94,caps:['chat','code'],status:'operational',desc:'Fast & affordable. Great for most tasks.'},
    {name:'Claude 3.5 Sonnet',provider:'Anthropic',ctx:'200K',latency:98,cost:'$3 / $15',speed:90,pop:96,caps:['chat','vision','code'],status:'operational',desc:'Excels at reasoning, coding, and analysis.'},
    {name:'Claude 3 Opus',provider:'Anthropic',ctx:'200K',latency:210,cost:'$15 / $75',speed:72,pop:82,caps:['chat','vision','code'],status:'operational',desc:'Most powerful Claude. Complex reasoning tasks.'},
    {name:'Gemini 1.5 Pro',provider:'Google',ctx:'1M',latency:156,cost:'$3.50 / $10.50',speed:85,pop:88,caps:['chat','vision','code','audio'],status:'degraded',desc:'1M context window. Multimodal including audio.'},
    {name:'DeepSeek V3',provider:'DeepSeek',ctx:'128K',latency:189,cost:'$0.27 / $1.10',speed:88,pop:91,caps:['chat','code'],status:'operational',desc:'Cost-effective powerhouse. MoE architecture.'},
    {name:'Llama 3.1 405B',provider:'Meta',ctx:'128K',latency:320,cost:'$3 / $3',speed:68,pop:80,caps:['chat','code'],status:'operational',desc:'Largest open-weight model available.'},
    {name:'Llama 3.1 70B',provider:'Meta',ctx:'128K',latency:156,cost:'$0.59 / $0.79',speed:86,pop:87,caps:['chat','code'],status:'operational',desc:'Best open model for the price. Versatile.'},
    {name:'Mistral Large',provider:'Mistral',ctx:'128K',latency:112,cost:'$2 / $6',speed:91,pop:84,caps:['chat','code'],status:'operational',desc:'Top-tier European AI model. Multilingual.'},
    {name:'Grok 2',provider:'xAI',ctx:'131K',latency:134,cost:'$2 / $10',speed:89,pop:79,caps:['chat','vision'],status:'operational',desc:'Real-time knowledge. Unique personality.'},
    {name:'SDXL Lightning',provider:'Stability',ctx:'—',latency:1800,cost:'$0.002/img',speed:95,pop:90,caps:['image'],status:'operational',desc:'Fast image generation. 4-step diffusion.'},
    {name:'Whisper Large V3',provider:'OpenAI',ctx:'—',latency:450,cost:'$0.006/min',speed:82,pop:86,caps:['audio'],status:'operational',desc:'State-of-the-art speech recognition.'},
  ];

  const filtered = allModels.filter(m => {
    if(search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.provider.toLowerCase().includes(search.toLowerCase())) return false;
    if(category !== 'all' && !m.caps.includes(category)) return false;
    return true;
  }).sort((a,b) => sort==='popular' ? b.pop-a.pop : sort==='fastest' ? a.latency-b.latency : a.cost.localeCompare(b.cost));

  const providerColors = {OpenAI:'var(--accent)',Anthropic:'#f59e0b',Google:'var(--accent2)',DeepSeek:'var(--accent3)',Meta:'#3b82f6',Mistral:'#ec4899',xAI:'#ef4444',Stability:'#10b981'};

  return (
    <div className="page-scroll"><div className="page-inner">
      <SectionHeader title="Models" subtitle="Browse and deploy AI models from top providers"/>
      <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap',alignItems:'center'}}>
        <div style={{position:'relative',flex:'1 1 260px',maxWidth:320}}>
          <Icons.search size={15} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--text-3)'}}/>
          <input className="input" placeholder="Search models..." value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:32}}/>
        </div>
        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
          {categories.map(c=>(
            <button key={c} onClick={()=>setCategory(c)} className="btn btn-sm" style={{
              background:c===category?'var(--accent-dim)':'var(--bg-3)', color:c===category?'var(--accent)':'var(--text-3)',
              border:`1px solid ${c===category?'rgba(0,212,170,0.3)':'var(--border)'}`, textTransform:'capitalize'
            }}>{c}</button>
          ))}
        </div>
        <select value={sort} onChange={e=>setSort(e.target.value)} style={{background:'var(--bg-2)',border:'1px solid var(--border)',color:'var(--text-1)',padding:'5px 10px',borderRadius:6,fontFamily:'var(--font)',fontSize:12,cursor:'pointer'}}>
          <option value="popular">Most Popular</option><option value="fastest">Fastest</option><option value="cheapest">Cheapest</option>
        </select>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:14}}>
        {filtered.map((m,i)=>(
          <div key={m.name} className="glass-card" style={{padding:18,animationDelay:`${i*0.03}s`,cursor:'pointer'}}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10}}>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                  <h3 style={{fontSize:14,fontWeight:700,color:'var(--text-0)'}}>{m.name}</h3>
                  <div className={`sdot sdot-${m.status==='operational'?'green':'yellow'}`} style={{width:6,height:6}}></div>
                </div>
                <span style={{fontSize:11,color:providerColors[m.provider]||'var(--text-3)',fontWeight:600}}>{m.provider}</span>
              </div>
              <span className="badge badge-cyan" style={{fontSize:10}}>{m.caps[0]}</span>
            </div>
            <p style={{fontSize:12,color:'var(--text-3)',marginBottom:12,lineHeight:1.5}}>{m.desc}</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,fontSize:11}}>
              <div style={{padding:'6px 8px',background:'var(--bg-2)',borderRadius:6}}>
                <div style={{color:'var(--text-3)',marginBottom:2}}>Context</div>
                <div style={{fontWeight:600,color:'var(--text-1)',fontFamily:'var(--mono)'}}>{m.ctx}</div>
              </div>
              <div style={{padding:'6px 8px',background:'var(--bg-2)',borderRadius:6}}>
                <div style={{color:'var(--text-3)',marginBottom:2}}>Latency</div>
                <div style={{fontWeight:600,color:'var(--text-1)',fontFamily:'var(--mono)'}}>{m.latency}ms</div>
              </div>
              <div style={{padding:'6px 8px',background:'var(--bg-2)',borderRadius:6}}>
                <div style={{color:'var(--text-3)',marginBottom:2}}>Pricing</div>
                <div style={{fontWeight:600,color:'var(--text-1)',fontFamily:'var(--mono)',fontSize:10}}>{m.cost}</div>
              </div>
              <div style={{padding:'6px 8px',background:'var(--bg-2)',borderRadius:6}}>
                <div style={{color:'var(--text-3)',marginBottom:2}}>Speed</div>
                <div style={{display:'flex',alignItems:'center',gap:4}}>
                  <div style={{flex:1,height:3,borderRadius:2,background:'var(--bg-4)',overflow:'hidden'}}>
                    <div style={{height:'100%',borderRadius:2,background:'var(--accent)',width:`${m.speed}%`}}></div>
                  </div>
                  <span style={{fontWeight:600,color:'var(--text-1)',fontFamily:'var(--mono)'}}>{m.speed}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div></div>
  );
};

/* ═══════════════════ AGENTS PAGE ═══════════════════ */
const AgentsPage = () => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [tab, setTab] = useState('agents');
  const [agents, setAgents] = useState(() => NSStore.getAgents());

  useEffect(() => {
    const refresh = () => setAgents(NSStore.getAgents());
    window.addEventListener('nsstore', refresh);
    return () => window.removeEventListener('nsstore', refresh);
  }, []);

  const openWizard = () => { if(window.__openAgentWizard) window.__openAgentWizard(); };

  const nodes = [
    {id:'trigger',x:60,y:140,label:'Webhook Trigger',type:'trigger',color:'var(--accent)'},
    {id:'classify',x:260,y:80,label:'Intent Classifier',type:'ai',color:'var(--accent2)'},
    {id:'search',x:260,y:210,label:'Knowledge Search',type:'tool',color:'var(--accent3)'},
    {id:'respond',x:480,y:100,label:'Generate Response',type:'ai',color:'var(--accent2)'},
    {id:'crm',x:480,y:220,label:'Update CRM',type:'tool',color:'#f59e0b'},
    {id:'output',x:680,y:160,label:'Send Reply',type:'output',color:'#10b981'},
  ];

  const connections = [
    ['trigger','classify'],['trigger','search'],['classify','respond'],['search','respond'],['respond','crm'],['respond','output'],['crm','output']
  ];

  return (
    <div className="page-scroll"><div className="page-inner">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <SectionHeader title="AI Agents" subtitle="Build, deploy and monitor intelligent agents" style={{marginBottom:0}}/>
        <button className="btn btn-accent" onClick={openWizard}><Icons.plus size={14}/> New Agent</button>
      </div>
      <Tabs tabs={[{id:'agents',label:'My Agents'},{id:'builder',label:'Visual Builder'},{id:'logs',label:'Execution Logs'}]} active={tab} onChange={setTab} style={{marginBottom:20}}/>

      {tab==='agents' && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:14}}>
          {agents.map((a,i)=>(
            <div key={a.id} className="glass-card" style={{padding:18,cursor:'pointer',animationDelay:`${i*.04}s`}} onClick={()=>setSelectedAgent(a)}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:36,height:36,borderRadius:10,background:'var(--accent-dim)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <Icons.bot size={18} style={{color:'var(--accent)'}}/>
                  </div>
                  <div>
                    <h3 style={{fontSize:14,fontWeight:700,color:'var(--text-0)'}}>{a.name}</h3>
                    <span style={{fontSize:11,color:'var(--text-3)'}}>{a.model}</span>
                  </div>
                </div>
                <span className={`badge badge-${a.status==='active'?'green':a.status==='paused'?'yellow':'blue'}`}>{a.status}</span>
              </div>
              <p style={{fontSize:12,color:'var(--text-3)',marginBottom:12}}>{a.desc}</p>
              <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
                {a.tools.map(t=><span key={t} style={{fontSize:10,padding:'2px 7px',background:'var(--bg-3)',borderRadius:4,color:'var(--text-2)',border:'1px solid var(--border)'}}>{t}</span>)}
              </div>
              <div style={{display:'flex',gap:16,fontSize:11,color:'var(--text-3)'}}>
                <span>{fmtNum(a.calls)} calls</span>
                <span>{a.successRate}% success</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==='builder' && (
        <GlassPanel style={{height:400,position:'relative',overflow:'hidden',padding:0}}>
          <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle,rgba(255,255,255,0.03) 1px,transparent 1px)',backgroundSize:'24px 24px'}}></div>
          <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}}>
            {connections.map(([from,to],i)=>{
              const f=nodes.find(n=>n.id===from), t=nodes.find(n=>n.id===to);
              if(!f||!t) return null;
              const x1=f.x+70,y1=f.y+20,x2=t.x,y2=t.y+20;
              return <path key={i} d={`M${x1},${y1} C${x1+60},${y1} ${x2-60},${y2} ${x2},${y2}`} fill="none" stroke="rgba(0,212,170,0.25)" strokeWidth="2" strokeDasharray="6,4">
                <animate attributeName="stroke-dashoffset" from="20" to="0" dur="2s" repeatCount="indefinite"/>
              </path>;
            })}
          </svg>
          {nodes.map(n=>(
            <div key={n.id} style={{position:'absolute',left:n.x,top:n.y,width:140,padding:'10px 12px',background:'var(--bg-2)',border:`1px solid ${n.color}30`,borderRadius:10,cursor:'grab',transition:'transform .15s',zIndex:1}}
              onMouseEnter={e=>e.currentTarget.style.transform='scale(1.05)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                <div style={{width:6,height:6,borderRadius:3,background:n.color}}></div>
                <span style={{fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.04em'}}>{n.type}</span>
              </div>
              <span style={{fontSize:12,fontWeight:600,color:'var(--text-0)'}}>{n.label}</span>
            </div>
          ))}
          <div style={{position:'absolute',bottom:14,right:14,display:'flex',gap:6}}>
            <button className="btn btn-ghost btn-sm"><Icons.plus size={13}/> Add Node</button>
            <button className="btn btn-accent btn-sm"><Icons.play size={12}/> Test Run</button>
          </div>
        </GlassPanel>
      )}

      {tab==='logs' && (
        <GlassPanel style={{padding:0,overflow:'hidden'}}>
          <table className="ns-table">
            <thead><tr><th>Agent</th><th>Trigger</th><th>Steps</th><th>Duration</th><th>Status</th><th>Time</th></tr></thead>
            <tbody>
              {[
                {agent:'SalesBot Pro',trigger:'Webhook',steps:8,dur:'2.4s',status:'success',time:'12s ago'},
                {agent:'Support Agent',trigger:'Chat Message',steps:5,dur:'1.8s',status:'success',time:'28s ago'},
                {agent:'Data Analyst',trigger:'Scheduled',steps:12,dur:'8.2s',status:'success',time:'2m ago'},
                {agent:'SalesBot Pro',trigger:'Webhook',steps:6,dur:'3.1s',status:'error',time:'5m ago'},
                {agent:'Content Writer',trigger:'API Call',steps:4,dur:'12.5s',status:'success',time:'8m ago'},
                {agent:'Recruiter AI',trigger:'Email',steps:7,dur:'4.7s',status:'success',time:'12m ago'},
              ].map((l,i)=>(
                <tr key={i}>
                  <td style={{fontWeight:500}}>{l.agent}</td>
                  <td><span className="badge badge-blue">{l.trigger}</span></td>
                  <td className="mono">{l.steps}</td>
                  <td className="mono">{l.dur}</td>
                  <td><span className={`badge badge-${l.status==='success'?'green':'red'}`}>{l.status}</span></td>
                  <td style={{color:'var(--text-3)',fontSize:12}}>{l.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassPanel>
      )}
    </div></div>
  );
};

/* ═══════════════════ VOICE AI PAGE ═══════════════════ */
const VoiceAIPage = () => {
  const [tab, setTab] = useState('dashboard');
  const [selectedCall, setSelectedCall] = useState(null);

  const Waveform = ({active=true, bars=24, color='var(--accent)'}) => (
    <div style={{display:'flex',alignItems:'center',gap:2,height:32}}>
      {Array.from({length:bars}).map((_,i)=>(
        <div key={i} style={{width:3,borderRadius:2,background:color,opacity:active?.7:.2,
          animation:active?`waveform ${0.8+Math.random()*0.8}s ease-in-out ${Math.random()*0.5}s infinite`:'none',
          height:active?undefined:4, minHeight:3}}/>
      ))}
    </div>
  );

  const calls = [
    {id:'call_8f2k',type:'inbound',number:'+1 (415) 555-8821',duration:'3:24',status:'completed',agent:'SalesBot',sentiment:'positive',time:'2m ago'},
    {id:'call_7gH3',type:'outbound',number:'+1 (212) 555-1234',duration:'—',status:'live',agent:'Support AI',sentiment:'neutral',time:'now'},
    {id:'call_6jK4',type:'inbound',number:'+44 20 7123 4567',duration:'5:12',status:'completed',agent:'Receptionist',sentiment:'positive',time:'8m ago'},
    {id:'call_5mL2',type:'outbound',number:'+1 (650) 555-9876',duration:'1:45',status:'completed',agent:'SalesBot',sentiment:'negative',time:'15m ago'},
    {id:'call_4nM1',type:'inbound',number:'+1 (310) 555-4321',duration:'0:48',status:'missed',agent:'—',sentiment:'—',time:'22m ago'},
    {id:'call_3pN9',type:'outbound',number:'+49 30 1234 5678',duration:'4:33',status:'completed',agent:'Scheduler',sentiment:'positive',time:'35m ago'},
  ];

  const voiceMetrics = [
    {label:'Calls Today',value:1247,change:'+18.6%',dir:'up',color:'var(--accent)'},
    {label:'Avg Duration',value:'2:34',color:'var(--accent2)'},
    {label:'Success Rate',value:'94.2%',color:'#10b981'},
    {label:'AI Handling',value:'87.3%',color:'var(--accent3)'},
  ];

  return (
    <div className="page-scroll"><div className="page-inner">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <SectionHeader title="Voice AI" subtitle="Real-time voice agent control center" style={{marginBottom:0}}/>
        <div style={{display:'flex',gap:8}}>
          <button className="btn btn-ghost"><Icons.settings size={14}/> Configure</button>
          <button className="btn btn-accent"><Icons.phone size={14}/> New Call</button>
        </div>
      </div>

      {/* Metrics */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20}}>
        {voiceMetrics.map((m,i)=>(
          <GlassPanel key={i} style={{padding:16,textAlign:'center'}}>
            <div style={{fontSize:11,color:'var(--text-3)',marginBottom:6}}>{m.label}</div>
            <div style={{fontSize:24,fontWeight:700,color:m.color,letterSpacing:'-0.02em'}}>{typeof m.value==='number'?<AnimCounter value={m.value}/>:m.value}</div>
            {m.change && <div style={{fontSize:11,color:'#10b981',marginTop:4}}>{m.change}</div>}
          </GlassPanel>
        ))}
      </div>

      {/* Live Call Banner */}
      <div className="grad-border" style={{marginBottom:20}}>
        <div style={{padding:'16px 20px',background:'var(--bg-2)',borderRadius:'var(--radius)',display:'flex',alignItems:'center',gap:16}}>
          <div className="sdot sdot-green"></div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:600,color:'var(--text-0)'}}>Live Call — Support AI → +1 (212) 555-1234</div>
            <div style={{fontSize:11,color:'var(--text-3)',marginTop:2}}>Duration: 1:42 · Language: English · Sentiment: Neutral</div>
          </div>
          <Waveform active={true} bars={20}/>
          <div style={{display:'flex',gap:6}}>
            <button className="btn btn-ghost btn-sm"><Icons.mic size={13}/> Listen</button>
            <button className="btn btn-sm" style={{background:'rgba(239,68,68,0.15)',color:'#f87171',border:'1px solid rgba(239,68,68,0.3)'}}><Icons.phone size={13}/> End</button>
          </div>
        </div>
      </div>

      <Tabs tabs={[{id:'dashboard',label:'Call Log'},{id:'voices',label:'Voice Config'},{id:'analytics',label:'Analytics'}]} active={tab} onChange={setTab} style={{marginBottom:16}}/>

      {tab==='dashboard' && (
        <GlassPanel style={{padding:0,overflow:'hidden'}}>
          <table className="ns-table">
            <thead><tr><th>Call ID</th><th>Type</th><th>Number</th><th>Agent</th><th>Duration</th><th>Sentiment</th><th>Status</th><th>Time</th></tr></thead>
            <tbody>
              {calls.map(c=>(
                <tr key={c.id} style={{cursor:'pointer'}} onClick={()=>setSelectedCall(c)}>
                  <td><code className="mono" style={{color:'var(--accent)'}}>{c.id}</code></td>
                  <td><span className={`badge badge-${c.type==='inbound'?'blue':'violet'}`}>{c.type}</span></td>
                  <td className="mono" style={{fontSize:12}}>{c.number}</td>
                  <td style={{fontWeight:500}}>{c.agent}</td>
                  <td className="mono">{c.duration}</td>
                  <td>{c.sentiment!=='—' && <span className={`badge badge-${c.sentiment==='positive'?'green':c.sentiment==='negative'?'red':'blue'}`}>{c.sentiment}</span>}</td>
                  <td><span className={`badge badge-${c.status==='completed'?'green':c.status==='live'?'cyan':c.status==='missed'?'red':'yellow'}`}>{c.status}</span></td>
                  <td style={{color:'var(--text-3)',fontSize:12}}>{c.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassPanel>
      )}

      {tab==='voices' && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
          {[
            {name:'Nova',lang:'English (US)',gender:'Female',style:'Professional',active:true},
            {name:'Atlas',lang:'English (UK)',gender:'Male',style:'Warm',active:true},
            {name:'Luna',lang:'Spanish',gender:'Female',style:'Friendly',active:false},
            {name:'Kai',lang:'German',gender:'Male',style:'Formal',active:false},
            {name:'Aria',lang:'French',gender:'Female',style:'Elegant',active:true},
            {name:'Zen',lang:'Japanese',gender:'Male',style:'Calm',active:false},
          ].map((v,i)=>(
            <div key={v.name} className="glass-card" style={{padding:16}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:36,height:36,borderRadius:10,background:'var(--accent3-dim)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <Icons.mic size={16} style={{color:'var(--accent3)'}}/>
                  </div>
                  <div>
                    <h4 style={{fontSize:14,fontWeight:600,color:'var(--text-0)'}}>{v.name}</h4>
                    <span style={{fontSize:11,color:'var(--text-3)'}}>{v.gender} · {v.style}</span>
                  </div>
                </div>
                <span className={`badge badge-${v.active?'green':'yellow'}`}>{v.active?'Active':'Inactive'}</span>
              </div>
              <div style={{fontSize:12,color:'var(--text-3)',marginBottom:10}}>{v.lang}</div>
              <Waveform active={false} bars={16} color="var(--accent3)"/>
              <button className="btn btn-ghost btn-sm" style={{marginTop:10,width:'100%',justifyContent:'center'}}>
                <Icons.play size={12}/> Preview
              </button>
            </div>
          ))}
        </div>
      )}

      {tab==='analytics' && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          <GlassPanel>
            <h3 style={{fontSize:14,fontWeight:600,color:'var(--text-0)',marginBottom:14}}>Calls Over Time</h3>
            <AreaChart data={genTrendData(14,80,5,30)} labels={['Mon','Tue','Wed','Thu','Fri','Sat','Sun','Mon','Tue','Wed','Thu','Fri','Sat','Sun']} h={180} color="var(--accent)"/>
          </GlassPanel>
          <GlassPanel>
            <h3 style={{fontSize:14,fontWeight:600,color:'var(--text-0)',marginBottom:14}}>Call Duration Distribution</h3>
            <BarChart data={[45,120,89,65,34,18,8]} labels={['<30s','1m','2m','3m','5m','10m','10m+']} colors={Array(7).fill('var(--accent2)')} h={180}/>
          </GlassPanel>
        </div>
      )}
    </div></div>
  );
};

/* ═══════════════════ WORKFLOWS PAGE ═══════════════════ */
const WorkflowsPage = () => {
  const [tab, setTab] = useState('workflows');
  const workflows = [
    {id:892,name:'Lead Qualification Pipeline',trigger:'Webhook',steps:12,runs:4521,success:98.2,status:'active',lastRun:'12s ago'},
    {id:887,name:'Customer Onboarding',trigger:'Stripe Event',steps:8,runs:2890,success:99.1,status:'active',lastRun:'2m ago'},
    {id:875,name:'Support Ticket Router',trigger:'Email',steps:6,runs:12400,success:97.8,status:'active',lastRun:'45s ago'},
    {id:864,name:'Content Publishing',trigger:'Schedule',steps:5,runs:890,success:95.4,status:'active',lastRun:'1h ago'},
    {id:852,name:'Invoice Processing',trigger:'Google Sheets',steps:9,runs:3200,success:96.7,status:'paused',lastRun:'3h ago'},
    {id:841,name:'Slack Alert System',trigger:'API',steps:4,runs:8900,success:99.5,status:'active',lastRun:'5m ago'},
  ];

  const triggerIcons = {Webhook:<Icons.globe size={13}/>,Email:<Icons.activity size={13}/>,'Stripe Event':<Icons.creditCard size={13}/>,Schedule:<Icons.clock size={13}/>,'Google Sheets':<Icons.fileText size={13}/>,API:<Icons.terminal size={13}/>};

  return (
    <div className="page-scroll"><div className="page-inner">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <SectionHeader title="Workflows" subtitle="Automate tasks with AI-powered pipelines" style={{marginBottom:0}}/>
        <button className="btn btn-accent"><Icons.plus size={14}/> New Workflow</button>
      </div>
      <Tabs tabs={[{id:'workflows',label:'All Workflows'},{id:'templates',label:'Templates'},{id:'history',label:'Run History'}]} active={tab} onChange={setTab} style={{marginBottom:16}}/>

      {tab==='workflows' && (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {workflows.map((w,i)=>(
            <div key={w.id} className="glass-card" style={{padding:'16px 20px',display:'flex',alignItems:'center',gap:16,cursor:'pointer'}}>
              <div style={{width:40,height:40,borderRadius:10,background:'var(--accent3-dim)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Icons.workflow size={18} style={{color:'var(--accent3)'}}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <h3 style={{fontSize:14,fontWeight:600,color:'var(--text-0)'}}>{w.name}</h3>
                  <span className={`badge badge-${w.status==='active'?'green':'yellow'}`}>{w.status}</span>
                </div>
                <div style={{fontSize:12,color:'var(--text-3)',marginTop:2,display:'flex',gap:12}}>
                  <span style={{display:'flex',alignItems:'center',gap:4}}>{triggerIcons[w.trigger]} {w.trigger}</span>
                  <span>{w.steps} steps</span>
                  <span>{fmtNum(w.runs)} runs</span>
                  <span>{w.success}% success</span>
                </div>
              </div>
              <span style={{fontSize:11,color:'var(--text-3)'}}>Last: {w.lastRun}</span>
              <button className="btn btn-ghost btn-sm"><Icons.play size={12}/> Run</button>
            </div>
          ))}
        </div>
      )}

      {tab==='templates' && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:14}}>
          {['Lead → CRM → Email','Stripe → Invoice → Slack','Form → AI Classify → Route','Schedule → Report → Email','Webhook → Process → Store','Email → AI Reply → Log'].map((t,i)=>(
            <div key={t} className="glass-card" style={{padding:16,cursor:'pointer'}}>
              <Icons.workflow size={20} style={{color:'var(--accent3)',marginBottom:10}}/>
              <h4 style={{fontSize:13,fontWeight:600,color:'var(--text-0)',marginBottom:4}}>{t}</h4>
              <p style={{fontSize:11,color:'var(--text-3)'}}>Pre-built template · {3+i} steps</p>
              <button className="btn btn-ghost btn-sm" style={{marginTop:10}}>Use Template</button>
            </div>
          ))}
        </div>
      )}

      {tab==='history' && (
        <GlassPanel style={{padding:0,overflow:'hidden'}}>
          <table className="ns-table">
            <thead><tr><th>Run ID</th><th>Workflow</th><th>Steps</th><th>Duration</th><th>Status</th><th>Time</th></tr></thead>
            <tbody>
              {[
                {id:'run_92kf',wf:'Lead Qualification',steps:'12/12',dur:'2.4s',status:'success',time:'12s ago'},
                {id:'run_91hg',wf:'Support Router',steps:'6/6',dur:'0.8s',status:'success',time:'45s ago'},
                {id:'run_90jk',wf:'Customer Onboarding',steps:'8/8',dur:'3.2s',status:'success',time:'2m ago'},
                {id:'run_89lm',wf:'Lead Qualification',steps:'9/12',dur:'1.9s',status:'error',time:'5m ago'},
                {id:'run_88no',wf:'Slack Alerts',steps:'4/4',dur:'0.3s',status:'success',time:'5m ago'},
              ].map(r=>(
                <tr key={r.id}>
                  <td><code className="mono" style={{color:'var(--accent)'}}>{r.id}</code></td>
                  <td style={{fontWeight:500}}>{r.wf}</td>
                  <td className="mono">{r.steps}</td>
                  <td className="mono">{r.dur}</td>
                  <td><span className={`badge badge-${r.status==='success'?'green':'red'}`}>{r.status}</span></td>
                  <td style={{color:'var(--text-3)',fontSize:12}}>{r.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassPanel>
      )}
    </div></div>
  );
};

Object.assign(window, { ModelsPage, AgentsPage, VoiceAIPage, WorkflowsPage });
