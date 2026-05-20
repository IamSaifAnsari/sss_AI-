/* NeuronStack AI — Detail Pages: Model Detail, Agent Create Wizard */

/* ═══════════════════ MODEL DETAIL VIEW ═══════════════════ */
const ModelDetailView = ({model, onClose}) => {
  const toast = useToast();
  const [tab, setTab] = useState('overview');

  if(!model) return null;
  const usageData = useMemo(()=>genTrendData(14, 50000, 3000, 15000),[]);
  const latencyData = useMemo(()=>genTrendData(14, model.latency||150, 5, 40),[]);

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:9000,background:'rgba(0,0,0,0.55)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',animation:'fadeIn .12s ease'}}>
      <div onClick={e=>e.stopPropagation()} style={{width:720,maxWidth:'94vw',maxHeight:'85vh',overflow:'auto',background:'var(--bg-1)',border:'1px solid var(--border-light)',borderRadius:14,animation:'fadeInScale .2s ease',boxShadow:'0 24px 80px rgba(0,0,0,0.5)'}}>
        {/* Header */}
        <div style={{padding:'20px 24px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'flex-start',justifyContent:'space-between',position:'sticky',top:0,background:'var(--bg-1)',zIndex:2,borderRadius:'14px 14px 0 0'}}>
          <div style={{display:'flex',gap:14,alignItems:'center'}}>
            <div style={{width:44,height:44,borderRadius:12,background:'var(--accent-dim)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Icons.cpu size={22} style={{color:'var(--accent)'}}/>
            </div>
            <div>
              <h2 style={{fontSize:18,fontWeight:700,color:'var(--text-0)'}}>{model.name}</h2>
              <div style={{display:'flex',gap:6,marginTop:4}}>
                <span className="badge badge-cyan">{model.provider}</span>
                <span className="badge badge-green">Operational</span>
                {model.caps && model.caps.map(c=><span key={c} className="badge badge-blue" style={{fontSize:9}}>{c}</span>)}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'var(--text-3)',cursor:'pointer',padding:4}}><Icons.x size={18}/></button>
        </div>

        {/* Tabs */}
        <div style={{padding:'0 24px'}}>
          <Tabs tabs={[{id:'overview',label:'Overview'},{id:'usage',label:'Usage'},{id:'pricing',label:'Pricing'},{id:'docs',label:'API Docs'}]}
            active={tab} onChange={setTab} style={{marginTop:16,marginBottom:16}}/>
        </div>

        <div style={{padding:'0 24px 24px'}}>
          {tab==='overview' && <>
            <p style={{fontSize:13,color:'var(--text-2)',lineHeight:1.6,marginBottom:20}}>{model.desc}</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:10,marginBottom:20}}>
              {[
                {label:'Context Window',value:model.ctx||'128K'},
                {label:'Avg Latency',value:`${model.latency||150}ms`},
                {label:'Speed Score',value:`${model.speed||90}/100`},
                {label:'Popularity',value:`${model.pop||85}/100`},
              ].map(s=>(
                <div key={s.label} style={{padding:'12px 14px',background:'var(--bg-2)',borderRadius:8,border:'1px solid var(--border)'}}>
                  <div style={{fontSize:10,color:'var(--text-3)',marginBottom:4}}>{s.label}</div>
                  <div style={{fontSize:16,fontWeight:700,color:'var(--text-0)',fontFamily:'var(--mono)'}}>{s.value}</div>
                </div>
              ))}
            </div>
            <h4 style={{fontSize:13,fontWeight:600,color:'var(--text-0)',marginBottom:10}}>Latency (14d)</h4>
            <AreaChart data={latencyData} labels={Array.from({length:14},(_,i)=>i%2===0?`Day ${i+1}`:'')} color="var(--accent)" h={120} showGrid={false}/>
          </>}

          {tab==='usage' && <>
            <h4 style={{fontSize:13,fontWeight:600,color:'var(--text-0)',marginBottom:10}}>Request Volume (14d)</h4>
            <AreaChart data={usageData} labels={Array.from({length:14},(_,i)=>i%2===0?`Day ${i+1}`:'')} color="var(--accent2)" h={160}/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginTop:16}}>
              {[{label:'Total Requests',value:'1.2M'},{label:'Tokens Used',value:'48.2B'},{label:'Avg Response',value:`${model.latency||150}ms`}].map(s=>(
                <div key={s.label} style={{textAlign:'center',padding:'14px',background:'var(--bg-2)',borderRadius:8,border:'1px solid var(--border)'}}>
                  <div style={{fontSize:10,color:'var(--text-3)',marginBottom:4}}>{s.label}</div>
                  <div style={{fontSize:18,fontWeight:700,color:'var(--text-0)'}}>{s.value}</div>
                </div>
              ))}
            </div>
          </>}

          {tab==='pricing' && (
            <div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
                <div style={{padding:16,background:'var(--bg-2)',borderRadius:10,border:'1px solid var(--border)'}}>
                  <div style={{fontSize:11,color:'var(--text-3)',marginBottom:4}}>Input Price</div>
                  <div style={{fontSize:22,fontWeight:700,color:'var(--text-0)'}}>{model.cost ? model.cost.split('/')[0].trim() : '$5.00'}<span style={{fontSize:12,fontWeight:400,color:'var(--text-3)'}}> / 1M tokens</span></div>
                </div>
                <div style={{padding:16,background:'var(--bg-2)',borderRadius:10,border:'1px solid var(--border)'}}>
                  <div style={{fontSize:11,color:'var(--text-3)',marginBottom:4}}>Output Price</div>
                  <div style={{fontSize:22,fontWeight:700,color:'var(--text-0)'}}>{model.cost ? model.cost.split('/')[1]?.trim() || '$15.00' : '$15.00'}<span style={{fontSize:12,fontWeight:400,color:'var(--text-3)'}}> / 1M tokens</span></div>
                </div>
              </div>
              <div style={{padding:14,background:'var(--bg-2)',borderRadius:8,border:'1px solid var(--border)',fontSize:12,color:'var(--text-2)',lineHeight:1.6}}>
                Pricing is per-token with no minimum commitment. Volume discounts available for Enterprise plans exceeding 10B tokens/month.
              </div>
            </div>
          )}

          {tab==='docs' && (
            <div>
              <h4 style={{fontSize:13,fontWeight:600,color:'var(--text-0)',marginBottom:10}}>Quick Start</h4>
              <div style={{borderRadius:8,overflow:'hidden',border:'1px solid var(--border)',marginBottom:16}}>
                <div style={{padding:'8px 12px',background:'var(--bg-3)',fontSize:11,color:'var(--text-3)',display:'flex',justifyContent:'space-between'}}>
                  <span>cURL</span>
                  <button className="btn btn-ghost btn-sm" style={{padding:'2px 8px',fontSize:10}} onClick={()=>toast.success('Copied to clipboard')}><Icons.copy size={11}/> Copy</button>
                </div>
                <pre style={{padding:14,background:'var(--bg-2)',fontSize:12,fontFamily:'var(--mono)',color:'var(--text-1)',overflowX:'auto',margin:0,lineHeight:1.6}}>{`curl https://api.neuronstack.ai/v1/chat/completions \\
  -H "Authorization: Bearer $NS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${model.name?.toLowerCase().replace(/\s+/g,'-')||'gpt-4o'}",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`}</pre>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button className="btn btn-ghost" onClick={()=>toast.info('Documentation would open in a new tab')}>Full API Reference</button>
                <button className="btn btn-accent" onClick={()=>toast.success('Model enabled in your workspace')}>Enable Model</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════ AGENT CREATE WIZARD ═══════════════════ */
const AgentCreateWizard = ({open, onClose, onCreated}) => {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [model, setModel] = useState('gpt-4o');
  const [tools, setTools] = useState([]);
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant.');
  const [creating, setCreating] = useState(false);

  const allTools = [
    {id:'crm',name:'CRM Integration',desc:'Read/write to Salesforce, HubSpot'},
    {id:'email',name:'Email',desc:'Send and receive emails'},
    {id:'calendar',name:'Calendar',desc:'Schedule and manage events'},
    {id:'whatsapp',name:'WhatsApp',desc:'Send messages via WhatsApp'},
    {id:'search',name:'Web Search',desc:'Search the internet in real-time'},
    {id:'knowledge',name:'Knowledge Base',desc:'Query uploaded documents'},
    {id:'sql',name:'SQL Database',desc:'Query databases directly'},
    {id:'slack',name:'Slack',desc:'Post messages and read channels'},
    {id:'sheets',name:'Google Sheets',desc:'Read/write spreadsheet data'},
    {id:'api',name:'Custom API',desc:'Call any REST API endpoint'},
  ];

  const toggleTool = (id) => setTools(prev=>prev.includes(id)?prev.filter(t=>t!==id):[...prev,id]);

  const handleCreate = () => {
    setCreating(true);
    setTimeout(()=>{
      setCreating(false);
      toast.success(`Agent "${name}" created successfully`);
      if(onCreated) onCreated({name,desc,model,tools});
      onClose();
      // reset
      setStep(0);setName('');setDesc('');setModel('gpt-4o');setTools([]);
    },1500);
  };

  if(!open) return null;

  const steps = ['Details','Model & Prompt','Tools','Review'];
  const canNext = step===0?(name.trim()):step===1?true:step===2?true:true;

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:9000,background:'rgba(0,0,0,0.55)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',animation:'fadeIn .12s ease'}}>
      <div onClick={e=>e.stopPropagation()} style={{width:580,maxWidth:'94vw',maxHeight:'85vh',overflow:'auto',background:'var(--bg-1)',border:'1px solid var(--border-light)',borderRadius:14,animation:'fadeInScale .2s ease',boxShadow:'0 24px 80px rgba(0,0,0,0.5)'}}>
        {/* Header */}
        <div style={{padding:'18px 24px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <h2 style={{fontSize:16,fontWeight:700,color:'var(--text-0)'}}>Create Agent</h2>
            <div style={{display:'flex',gap:6,marginTop:6}}>
              {steps.map((s,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:4}}>
                  <div style={{width:20,height:20,borderRadius:'50%',fontSize:10,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',
                    background:i<=step?'var(--accent)':'var(--bg-4)',color:i<=step?'#000':'var(--text-3)',transition:'all .2s'}}>{i+1}</div>
                  <span style={{fontSize:11,color:i===step?'var(--text-0)':'var(--text-3)',fontWeight:i===step?600:400}}>{s}</span>
                  {i<steps.length-1 && <div style={{width:16,height:1,background:'var(--border)',margin:'0 2px'}}/>}
                </div>
              ))}
            </div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'var(--text-3)',cursor:'pointer',padding:4}}><Icons.x size={18}/></button>
        </div>

        <div style={{padding:'20px 24px'}}>
          {/* Step 0: Details */}
          {step===0 && (
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <div><label style={{fontSize:12,color:'var(--text-2)',marginBottom:4,display:'block'}}>Agent Name *</label>
                <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. SalesBot Pro, Support Agent" autoFocus/></div>
              <div><label style={{fontSize:12,color:'var(--text-2)',marginBottom:4,display:'block'}}>Description</label>
                <textarea className="input" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="What does this agent do?" rows={3} style={{resize:'vertical'}}/></div>
            </div>
          )}

          {/* Step 1: Model & Prompt */}
          {step===1 && (
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <div><label style={{fontSize:12,color:'var(--text-2)',marginBottom:4,display:'block'}}>Base Model</label>
                <select value={model} onChange={e=>setModel(e.target.value)} style={{width:'100%',background:'var(--bg-2)',border:'1px solid var(--border)',color:'var(--text-1)',padding:'8px 10px',borderRadius:6,fontFamily:'var(--font)',fontSize:13,cursor:'pointer'}}>
                  <option value="gpt-4o">GPT-4o (OpenAI)</option>
                  <option value="claude-3.5">Claude 3.5 Sonnet (Anthropic)</option>
                  <option value="gemini-pro">Gemini Pro (Google)</option>
                  <option value="llama-3.1">Llama 3.1 70B (Meta)</option>
                </select>
              </div>
              <div><label style={{fontSize:12,color:'var(--text-2)',marginBottom:4,display:'block'}}>System Prompt</label>
                <textarea className="input" value={systemPrompt} onChange={e=>setSystemPrompt(e.target.value)} rows={6} style={{resize:'vertical',fontFamily:'var(--mono)',fontSize:12,lineHeight:1.6}}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                <div><label style={{fontSize:12,color:'var(--text-2)',marginBottom:4,display:'block'}}>Temperature</label>
                  <input className="input" type="number" defaultValue={0.7} min={0} max={2} step={0.1}/></div>
                <div><label style={{fontSize:12,color:'var(--text-2)',marginBottom:4,display:'block'}}>Max Tokens</label>
                  <input className="input" type="number" defaultValue={4096}/></div>
              </div>
            </div>
          )}

          {/* Step 2: Tools */}
          {step===2 && (
            <div>
              <p style={{fontSize:12,color:'var(--text-3)',marginBottom:14}}>Select the tools this agent can use. You can configure each tool's permissions after creation.</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                {allTools.map(t=>{
                  const sel = tools.includes(t.id);
                  return (
                    <div key={t.id} onClick={()=>toggleTool(t.id)} style={{
                      padding:'10px 12px',borderRadius:8,cursor:'pointer',display:'flex',alignItems:'center',gap:10,transition:'all .12s',
                      background:sel?'var(--accent-dim)':'var(--bg-2)',border:`1px solid ${sel?'var(--accent)':'var(--border)'}`,
                    }}>
                      <div style={{width:16,height:16,borderRadius:4,border:`2px solid ${sel?'var(--accent)':'var(--border-light)'}`,background:sel?'var(--accent)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        {sel && <Icons.check size={10} style={{color:'#000',strokeWidth:3}}/>}
                      </div>
                      <div><div style={{fontSize:12,fontWeight:500,color:'var(--text-0)'}}>{t.name}</div><div style={{fontSize:10,color:'var(--text-3)'}}>{t.desc}</div></div>
                    </div>
                  );
                })}
              </div>
              <p style={{fontSize:11,color:'var(--text-3)',marginTop:8}}>{tools.length} tool{tools.length!==1?'s':''} selected</p>
            </div>
          )}

          {/* Step 3: Review */}
          {step===3 && (
            <div>
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {[
                  {label:'Name',value:name},
                  {label:'Description',value:desc||'—'},
                  {label:'Model',value:model},
                  {label:'Tools',value:tools.length?tools.map(id=>allTools.find(t=>t.id===id)?.name).join(', '):'None'},
                ].map(r=>(
                  <div key={r.label} style={{display:'flex',gap:12,padding:'10px 14px',background:'var(--bg-2)',borderRadius:8,border:'1px solid var(--border)'}}>
                    <span style={{fontSize:12,color:'var(--text-3)',width:80,flexShrink:0}}>{r.label}</span>
                    <span style={{fontSize:12,color:'var(--text-1)',fontWeight:500}}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{padding:'14px 24px',borderTop:'1px solid var(--border)',display:'flex',justifyContent:'space-between'}}>
          {step>0 ? <button className="btn btn-ghost" onClick={()=>setStep(s=>s-1)}>← Back</button> : <div/>}
          {step<3 ? (
            <button className="btn btn-accent" onClick={()=>setStep(s=>s+1)} disabled={!canNext} style={{opacity:canNext?1:.5}}>Continue →</button>
          ) : (
            <button className="btn btn-accent" onClick={handleCreate} disabled={creating} style={{opacity:creating?.7:1}}>
              {creating ? 'Creating...' : 'Create Agent'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { ModelDetailView, AgentCreateWizard });
