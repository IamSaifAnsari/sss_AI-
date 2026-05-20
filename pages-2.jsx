/* NeuronStack AI — Studios, API Keys, Billing, Marketplace, Settings, Misc */

/* ═══════════════════ IMAGE STUDIO ═══════════════════ */
const ImageStudioPage = () => {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('sdxl-lightning');
  const [generating, setGenerating] = useState(false);
  const [images, setImages] = useState([
    {id:1,prompt:'Cyberpunk cityscape at night with neon lights',model:'SDXL',size:'1024×1024',time:'2.1s'},
    {id:2,prompt:'Abstract fluid art in teal and violet gradients',model:'SDXL',size:'1024×1024',time:'1.8s'},
    {id:3,prompt:'Minimalist logo for a tech company',model:'DALL-E 3',size:'512×512',time:'3.4s'},
    {id:4,prompt:'Photorealistic mountain landscape at golden hour',model:'SDXL',size:'1024×768',time:'2.3s'},
    {id:5,prompt:'Isometric illustration of a data center',model:'SDXL',size:'1024×1024',time:'1.9s'},
    {id:6,prompt:'Watercolor portrait of a robot reading a book',model:'DALL-E 3',size:'1024×1024',time:'3.8s'},
  ]);

  const handleGenerate = () => {
    if(!prompt.trim()) return;
    setGenerating(true);
    setTimeout(()=>{
      setImages(p=>[{id:Date.now(),prompt:prompt.trim(),model:model==='sdxl-lightning'?'SDXL':'DALL-E 3',size:'1024×1024',time:(1.5+Math.random()*2).toFixed(1)+'s'},...p]);
      setGenerating(false);
    }, 2000);
  };

  const colorFor = i => `hsl(${(i*47+180)%360}, 45%, ${18+i%3*4}%)`;

  return (
    <div className="page-scroll"><div className="page-inner">
      <SectionHeader title="Image Studio" subtitle="Generate, edit, and upscale images with AI"/>
      <div style={{display:'grid',gridTemplateColumns:'340px 1fr',gap:20}}>
        {/* Controls */}
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <GlassPanel>
            <h3 style={{fontSize:13,fontWeight:700,color:'var(--text-0)',marginBottom:12}}>Generate</h3>
            <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Describe the image you want to create..."
              rows={4} className="input" style={{resize:'vertical',marginBottom:10}}/>
            <div style={{marginBottom:10}}>
              <label style={{fontSize:11,color:'var(--text-3)',marginBottom:4,display:'block'}}>Model</label>
              <select value={model} onChange={e=>setModel(e.target.value)} style={{width:'100%',background:'var(--bg-2)',border:'1px solid var(--border)',color:'var(--text-1)',padding:'6px 10px',borderRadius:6,fontFamily:'var(--font)',fontSize:12,cursor:'pointer'}}>
                <option value="sdxl-lightning">SDXL Lightning</option>
                <option value="dall-e-3">DALL-E 3</option>
                <option value="midjourney">Midjourney V6</option>
                <option value="flux">FLUX.1 Pro</option>
              </select>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
              <div>
                <label style={{fontSize:11,color:'var(--text-3)',marginBottom:4,display:'block'}}>Size</label>
                <select style={{width:'100%',background:'var(--bg-2)',border:'1px solid var(--border)',color:'var(--text-1)',padding:'5px 8px',borderRadius:6,fontFamily:'var(--font)',fontSize:12,cursor:'pointer'}}>
                  <option>1024×1024</option><option>1024×768</option><option>768×1024</option><option>512×512</option>
                </select>
              </div>
              <div>
                <label style={{fontSize:11,color:'var(--text-3)',marginBottom:4,display:'block'}}>Steps</label>
                <select style={{width:'100%',background:'var(--bg-2)',border:'1px solid var(--border)',color:'var(--text-1)',padding:'5px 8px',borderRadius:6,fontFamily:'var(--font)',fontSize:12,cursor:'pointer'}}>
                  <option>4 (Fast)</option><option>20</option><option>30</option><option>50 (Quality)</option>
                </select>
              </div>
            </div>
            <button className="btn btn-accent" onClick={handleGenerate} disabled={generating} style={{width:'100%',justifyContent:'center',padding:'10px 16px'}}>
              {generating ? <><span className="skeleton" style={{width:14,height:14,borderRadius:'50%'}}></span> Generating...</> : <><Icons.sparkles size={14}/> Generate</>}
            </button>
          </GlassPanel>
          <GlassPanel>
            <h3 style={{fontSize:13,fontWeight:700,color:'var(--text-0)',marginBottom:10}}>Quick Actions</h3>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {['Upscale 2x','Remove Background','Inpaint','Outpaint','Style Transfer'].map(a=>(
                <button key={a} className="btn btn-ghost btn-sm" style={{justifyContent:'flex-start',width:'100%'}}>{a}</button>
              ))}
            </div>
          </GlassPanel>
        </div>
        {/* Gallery */}
        <div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
            <span style={{fontSize:13,color:'var(--text-2)'}}>{images.length} images generated</span>
            <Tabs tabs={['Grid','List']} active="Grid" onChange={()=>{}}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12}}>
            {images.map((img,i)=>(
              <div key={img.id} className="glass-card" style={{overflow:'hidden',cursor:'pointer',padding:0}}>
                <div style={{aspectRatio:'1',background:`linear-gradient(${135+i*30}deg, ${colorFor(i)}, ${colorFor(i+3)})`,display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
                  <Icons.image size={32} style={{color:'rgba(255,255,255,0.15)'}}/>
                  <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'8px 10px',background:'linear-gradient(transparent,rgba(0,0,0,0.7))',fontSize:10,color:'rgba(255,255,255,0.7)'}}>
                    {img.model} · {img.size} · {img.time}
                  </div>
                </div>
                <div style={{padding:'8px 10px'}}>
                  <p style={{fontSize:11,color:'var(--text-2)',lineHeight:1.4}} className="truncate">{img.prompt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div></div>
  );
};

/* ═══════════════════ VIDEO STUDIO ═══════════════════ */
const VideoStudioPage = () => (
  <div className="page-scroll"><div className="page-inner">
    <SectionHeader title="Video Studio" subtitle="AI-powered video generation and editing"/>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:20}}>
      {[
        {title:'Text to Video',desc:'Generate videos from text prompts',icon:<Icons.film size={20}/>},
        {title:'Image to Video',desc:'Animate still images with AI',icon:<Icons.image size={20}/>},
        {title:'Video Upscale',desc:'Enhance resolution and quality',icon:<Icons.arrowUp size={20}/>},
        {title:'Lip Sync',desc:'Sync audio to video faces',icon:<Icons.mic size={20}/>},
      ].map((t,i)=>(
        <div key={t.title} className="glass-card" style={{padding:20,cursor:'pointer'}}>
          <div style={{width:44,height:44,borderRadius:12,background:'var(--accent2-dim)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--accent2)',marginBottom:12}}>
            {t.icon}
          </div>
          <h3 style={{fontSize:15,fontWeight:700,color:'var(--text-0)',marginBottom:4}}>{t.title}</h3>
          <p style={{fontSize:12,color:'var(--text-3)'}}>{t.desc}</p>
        </div>
      ))}
    </div>
    <GlassPanel>
      <h3 style={{fontSize:14,fontWeight:600,color:'var(--text-0)',marginBottom:14}}>Recent Generations</h3>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:12}}>
        {['Product showcase animation','Explainer video intro','Social media clip','Brand logo animation'].map((v,i)=>(
          <div key={v} style={{background:'var(--bg-2)',borderRadius:10,overflow:'hidden',border:'1px solid var(--border)'}}>
            <div style={{aspectRatio:'16/9',background:`linear-gradient(${120+i*40}deg, hsl(${200+i*30},40%,15%), hsl(${260+i*30},40%,20%))`,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <div style={{width:40,height:40,borderRadius:'50%',background:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Icons.play size={18} style={{color:'rgba(255,255,255,0.6)'}}/>
              </div>
            </div>
            <div style={{padding:'8px 12px'}}>
              <p style={{fontSize:12,fontWeight:500,color:'var(--text-1)'}}>{v}</p>
              <p style={{fontSize:10,color:'var(--text-3)',marginTop:2}}>1080p · {(3+i*2)}s · Runway</p>
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  </div></div>
);

/* ═══════════════════ API KEYS ═══════════════════ */
const APIKeysPage = () => {
  const toast = (typeof useToast === 'function') ? useToast() : null;
  const confirm = (typeof useConfirm === 'function') ? useConfirm() : null;
  const [showCreate, setShowCreate] = useState(false);
  const [keys, setKeys] = useState(() => NSStore.getApiKeys());
  const [newName, setNewName] = useState('');
  const [newEnv, setNewEnv] = useState('production');
  const [newPerms, setNewPerms] = useState(['All Models']);
  const [newLimit, setNewLimit] = useState(1000);
  const [revealed, setRevealed] = useState({});

  const togglePerm = (p) => setNewPerms(prev => prev.includes(p) ? prev.filter(x=>x!==p) : [...prev,p]);

  const handleCreate = () => {
    const trimmed = (newName||'').trim();
    if(!trimmed) { toast && toast.error ? toast.error('Name required') : alert('Name required'); return; }
    const row = NSStore.addApiKey({ name: trimmed, env: newEnv, permissions: newPerms, rateLimit: newLimit });
    setKeys(NSStore.getApiKeys());
    setShowCreate(false);
    setNewName(''); setNewEnv('production'); setNewPerms(['All Models']); setNewLimit(1000);
    toast && toast.success && toast.success('API key created');
  };

  const handleCopy = (k) => {
    try { navigator.clipboard.writeText(k.key); toast && toast.success && toast.success('Key copied'); }
    catch (e) { toast && toast.error && toast.error('Copy failed'); }
  };

  const handleToggleReveal = (id) => setRevealed(r => ({ ...r, [id]: !r[id] }));

  const handleDelete = async (k) => {
    const ok = confirm ? await confirm({title:'Delete API key?', message:`This will permanently delete "${k.name}".`, confirmLabel:'Delete', danger:true})
      : window.confirm(`Delete API key "${k.name}"?`);
    if(!ok) return;
    NSStore.deleteApiKey(k.id);
    setKeys(NSStore.getApiKeys());
    toast && toast.success && toast.success('Key deleted');
  };

  return (
    <div className="page-scroll"><div className="page-inner">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <SectionHeader title="API Keys" subtitle="Manage authentication keys for your applications" style={{marginBottom:0}}/>
        <button className="btn btn-accent" onClick={()=>setShowCreate(true)}><Icons.plus size={14}/> Create Key</button>
      </div>
      <GlassPanel style={{padding:0,overflow:'hidden'}}>
        <table className="ns-table">
          <thead><tr><th>Name</th><th>Key</th><th>Environment</th><th>Requests</th><th>Last Used</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {keys.map(k=>(
              <tr key={k.id || k.key}>
                <td>
                  <div style={{fontWeight:600,color:'var(--text-0)'}}>{k.name}</div>
                  <div style={{fontSize:10,color:'var(--text-3)',marginTop:1}}>{(k.permissions||[]).join(' · ')}</div>
                </td>
                <td><code className="mono" style={{fontSize:11,color:'var(--text-2)'}}>{revealed[k.id]?k.key.replace(/\*+/, '4f9c2a8b6d3e1k7n5p'):k.key}</code></td>
                <td><span className={`badge badge-${k.env==='production'?'green':'blue'}`}>{k.env}</span></td>
                <td className="mono" style={{fontSize:12}}>{k.requests}</td>
                <td style={{fontSize:12,color:'var(--text-3)'}}>{k.lastUsed}</td>
                <td><span className={`badge badge-${k.status==='active'?'green':'red'}`}>{k.status}</span></td>
                <td>
                  <div style={{display:'flex',gap:4}}>
                    <button className="btn btn-ghost btn-sm" style={{padding:4}} title="Copy" onClick={()=>handleCopy(k)}><Icons.copy size={13}/></button>
                    <button className="btn btn-ghost btn-sm" style={{padding:4}} title="Reveal" onClick={()=>handleToggleReveal(k.id)}><Icons.eye size={13}/></button>
                    <button className="btn btn-ghost btn-sm" style={{padding:4,color:'var(--red)'}} title="Delete" onClick={()=>handleDelete(k)}><Icons.trash size={13}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassPanel>

      <Modal open={showCreate} onClose={()=>setShowCreate(false)} title="Create API Key">
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div><label style={{fontSize:12,color:'var(--text-2)',marginBottom:4,display:'block'}}>Key Name</label><input className="input" placeholder="e.g. Production API" value={newName} onChange={e=>setNewName(e.target.value)} autoFocus/></div>
          <div><label style={{fontSize:12,color:'var(--text-2)',marginBottom:4,display:'block'}}>Environment</label>
            <select value={newEnv} onChange={e=>setNewEnv(e.target.value)} style={{width:'100%',background:'var(--bg-2)',border:'1px solid var(--border)',color:'var(--text-1)',padding:'8px 10px',borderRadius:6,fontFamily:'var(--font)',fontSize:13,cursor:'pointer'}}>
              <option value="production">Production</option><option value="staging">Staging</option><option value="development">Development</option>
            </select>
          </div>
          <div><label style={{fontSize:12,color:'var(--text-2)',marginBottom:4,display:'block'}}>Permissions</label>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {['All Models','Voice AI','Workflows','Image Gen','Embeddings'].map(p=>(
                <label key={p} style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'var(--text-1)',background:'var(--bg-2)',padding:'5px 10px',borderRadius:6,border:'1px solid var(--border)',cursor:'pointer'}}>
                  <input type="checkbox" checked={newPerms.includes(p)} onChange={()=>togglePerm(p)} style={{accentColor:'var(--accent)'}}/>{p}
                </label>
              ))}
            </div>
          </div>
          <div><label style={{fontSize:12,color:'var(--text-2)',marginBottom:4,display:'block'}}>Rate Limit (req/min)</label><input className="input" type="number" value={newLimit} onChange={e=>setNewLimit(Number(e.target.value)||0)}/></div>
          <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:8}}>
            <button className="btn btn-ghost" onClick={()=>setShowCreate(false)}>Cancel</button>
            <button className="btn btn-accent" onClick={handleCreate}>Create Key</button>
          </div>
        </div>
      </Modal>
    </div></div>
  );
};

/* ═══════════════════ BILLING ═══════════════════ */
const BillingPage = () => {
  const [tab, setTab] = useState('overview');
  const spendData = useMemo(()=>genTrendData(12,65000,5000,15000),[]);

  return (
    <div className="page-scroll"><div className="page-inner">
      <SectionHeader title="Usage & Billing" subtitle="Monitor spend, manage subscriptions, and view invoices"/>
      <Tabs tabs={[{id:'overview',label:'Overview'},{id:'invoices',label:'Invoices'},{id:'plan',label:'Plan'}]} active={tab} onChange={setTab} style={{marginBottom:20}}/>

      {tab==='overview' && <>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20}}>
          <MetricCard icon={<Icons.dollar size={16}/>} label="Current Period" value={87500} prefix="$" change="+12%" changeDir="up" color="var(--accent)"/>
          <MetricCard icon={<Icons.zap size={16}/>} label="Tokens Used" value={892000000} change="+15%" changeDir="up" color="var(--accent2)"/>
          <MetricCard icon={<Icons.phone size={16}/>} label="Voice Minutes" value={4820} change="+22%" changeDir="up" color="var(--accent3)"/>
          <MetricCard icon={<Icons.image size={16}/>} label="Images Generated" value={12400} change="+8%" changeDir="up" color="#f59e0b"/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:14,marginBottom:20}}>
          <GlassPanel>
            <h3 style={{fontSize:14,fontWeight:600,color:'var(--text-0)',marginBottom:14}}>Monthly Spend</h3>
            <AreaChart data={spendData} labels={monthLabels} color="var(--accent2)" h={200}/>
          </GlassPanel>
          <GlassPanel>
            <h3 style={{fontSize:14,fontWeight:600,color:'var(--text-0)',marginBottom:14}}>Spend by Provider</h3>
            <DonutChart segments={[
              {value:38200,color:'var(--accent)',label:'OpenAI'},
              {value:22100,color:'#f59e0b',label:'Anthropic'},
              {value:12800,color:'var(--accent2)',label:'Google'},
              {value:8400,color:'var(--accent3)',label:'Meta'},
              {value:6000,color:'#10b981',label:'Other'},
            ]} size={140}/>
            <div style={{marginTop:14,display:'flex',flexDirection:'column',gap:6}}>
              {[{l:'OpenAI',v:'$38.2K',c:'var(--accent)'},{l:'Anthropic',v:'$22.1K',c:'#f59e0b'},{l:'Google',v:'$12.8K',c:'var(--accent2)'},{l:'Meta',v:'$8.4K',c:'var(--accent3)'},{l:'Other',v:'$6.0K',c:'#10b981'}].map(s=>(
                <div key={s.l} style={{display:'flex',alignItems:'center',gap:8,fontSize:12}}>
                  <span style={{width:8,height:8,borderRadius:2,background:s.c}}></span>
                  <span style={{flex:1,color:'var(--text-2)'}}>{s.l}</span>
                  <span className="mono" style={{fontSize:11,color:'var(--text-1)'}}>{s.v}</span>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
        <GlassPanel>
          <h3 style={{fontSize:14,fontWeight:600,color:'var(--text-0)',marginBottom:14}}>Cost by Model</h3>
          <BarChart data={[28400,18200,12800,8600,7200,5400,3900]} labels={['GPT-4o','Claude 3.5','Gemini','SDXL','Llama','DeepSeek','Mistral']}
            colors={['var(--accent)','#f59e0b','var(--accent2)','#ec4899','#3b82f6','var(--accent3)','#10b981']} h={160}/>
        </GlassPanel>
      </>}

      {tab==='invoices' && (
        <GlassPanel style={{padding:0,overflow:'hidden'}}>
          <table className="ns-table">
            <thead><tr><th>Invoice</th><th>Period</th><th>Amount</th><th>Status</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {[
                {id:'INV-2025-05',period:'May 2025',amount:'$87,524.00',status:'pending',date:'May 31, 2025'},
                {id:'INV-2025-04',period:'Apr 2025',amount:'$76,891.00',status:'paid',date:'Apr 30, 2025'},
                {id:'INV-2025-03',period:'Mar 2025',amount:'$71,245.00',status:'paid',date:'Mar 31, 2025'},
                {id:'INV-2025-02',period:'Feb 2025',amount:'$68,123.00',status:'paid',date:'Feb 28, 2025'},
                {id:'INV-2025-01',period:'Jan 2025',amount:'$62,890.00',status:'paid',date:'Jan 31, 2025'},
              ].map(inv=>(
                <tr key={inv.id}>
                  <td><code className="mono" style={{color:'var(--accent)'}}>{inv.id}</code></td>
                  <td style={{fontWeight:500}}>{inv.period}</td>
                  <td className="mono" style={{fontWeight:600}}>{inv.amount}</td>
                  <td><span className={`badge badge-${inv.status==='paid'?'green':'yellow'}`}>{inv.status}</span></td>
                  <td style={{color:'var(--text-3)',fontSize:12}}>{inv.date}</td>
                  <td><button className="btn btn-ghost btn-sm"><Icons.download size={13}/> PDF</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassPanel>
      )}

      {tab==='plan' && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
          {[
            {name:'Starter',price:'$299',features:['1M tokens/mo','100 voice mins','5 agents','2 team members'],current:false},
            {name:'Pro',price:'$999',features:['10M tokens/mo','1,000 voice mins','25 agents','10 team members','Priority support'],current:true},
            {name:'Enterprise',price:'Custom',features:['Unlimited tokens','Unlimited voice','Unlimited agents','Unlimited team','SSO & SAML','Dedicated support'],current:false},
          ].map(p=>(
            <div key={p.name} className={p.current?'grad-border':'glass-card-static'} style={{padding:p.current?0:24}}>
              <div style={{padding:p.current?24:0}}>
                {p.current && <span className="badge badge-cyan" style={{marginBottom:8}}>Current Plan</span>}
                <h3 style={{fontSize:20,fontWeight:700,color:'var(--text-0)',marginBottom:4}}>{p.name}</h3>
                <div style={{fontSize:28,fontWeight:700,color:p.current?'var(--accent)':'var(--text-1)',marginBottom:16}}>{p.price}<span style={{fontSize:13,fontWeight:400,color:'var(--text-3)'}}>/mo</span></div>
                <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
                  {p.features.map(f=>(
                    <div key={f} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'var(--text-2)'}}>
                      <Icons.check size={14} style={{color:'var(--accent)',flexShrink:0}}/>{f}
                    </div>
                  ))}
                </div>
                <button className={`btn ${p.current?'btn-ghost':'btn-accent'}`} style={{width:'100%',justifyContent:'center'}}>
                  {p.current?'Current Plan':p.price==='Custom'?'Contact Sales':'Upgrade'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div></div>
  );
};

/* ═══════════════════ MARKETPLACE ═══════════════════ */
const MarketplacePage = () => {
  const [category, setCategory] = useState('all');
  const items = [
    {name:'Recruitment AI Pack',category:'industry',tags:['Hiring','Resume','ATS'],installs:'2.4K',rating:4.8,desc:'Complete AI hiring pipeline with resume screening and outreach'},
    {name:'Customer Support Suite',category:'agents',tags:['Support','Tickets','Chat'],installs:'8.1K',rating:4.9,desc:'Multi-channel AI support with knowledge base integration'},
    {name:'Sales Outreach Agent',category:'agents',tags:['Sales','Email','CRM'],installs:'5.6K',rating:4.7,desc:'Automated lead qualification and personalized outreach'},
    {name:'Healthcare AI Pack',category:'industry',tags:['HIPAA','Scheduling','Triage'],installs:'1.8K',rating:4.6,desc:'Patient communication and appointment management'},
    {name:'Content Calendar Workflow',category:'workflows',tags:['Content','Social','Schedule'],installs:'3.2K',rating:4.5,desc:'AI-powered content planning and publishing pipeline'},
    {name:'Immigration Case Manager',category:'industry',tags:['Legal','Documents','Cases'],installs:'980',rating:4.7,desc:'Case tracking and document preparation assistant'},
    {name:'College CRM AI',category:'industry',tags:['Education','Admissions','Student'],installs:'1.2K',rating:4.4,desc:'Student enrollment and communication platform'},
    {name:'E-commerce Assistant',category:'agents',tags:['Shopping','Recommendations'],installs:'4.3K',rating:4.6,desc:'Product recommendations and order management'},
    {name:'Voice Receptionist',category:'voice',tags:['Phone','Scheduling','IVR'],installs:'3.8K',rating:4.8,desc:'24/7 AI phone receptionist with appointment booking'},
  ];

  const cats = ['all','agents','workflows','voice','industry','prompts'];
  const filtered = items.filter(i=>category==='all'||i.category===category);
  const catColors = {industry:'var(--accent3)',agents:'var(--accent)',workflows:'#f59e0b',voice:'var(--accent2)',prompts:'#10b981'};

  return (
    <div className="page-scroll"><div className="page-inner">
      <SectionHeader title="Marketplace" subtitle="Pre-built agents, workflows, and industry packs"/>
      <div style={{display:'flex',gap:6,marginBottom:20,flexWrap:'wrap'}}>
        {cats.map(c=>(
          <button key={c} onClick={()=>setCategory(c)} className="btn btn-sm" style={{
            background:c===category?'var(--accent-dim)':'var(--bg-3)', color:c===category?'var(--accent)':'var(--text-3)',
            border:`1px solid ${c===category?'rgba(0,212,170,0.3)':'var(--border)'}`, textTransform:'capitalize'
          }}>{c}</button>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:14}}>
        {filtered.map((item,i)=>(
          <div key={item.name} className="glass-card" style={{padding:18,cursor:'pointer'}}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10}}>
              <div style={{width:40,height:40,borderRadius:10,background:`${catColors[item.category]||'var(--accent)'}15`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Icons.store size={18} style={{color:catColors[item.category]||'var(--accent)'}}/>
              </div>
              <span className={`badge badge-${item.category==='industry'?'violet':item.category==='agents'?'cyan':'blue'}`}>{item.category}</span>
            </div>
            <h3 style={{fontSize:14,fontWeight:700,color:'var(--text-0)',marginBottom:4}}>{item.name}</h3>
            <p style={{fontSize:12,color:'var(--text-3)',marginBottom:10,lineHeight:1.5}}>{item.desc}</p>
            <div style={{display:'flex',gap:4,marginBottom:10,flexWrap:'wrap'}}>
              {item.tags.map(t=><span key={t} style={{fontSize:10,padding:'2px 6px',background:'var(--bg-3)',borderRadius:4,color:'var(--text-2)',border:'1px solid var(--border)'}}>{t}</span>)}
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:11,color:'var(--text-3)'}}>
              <span>{item.installs} installs</span>
              <span>★ {item.rating}</span>
            </div>
          </div>
        ))}
      </div>
    </div></div>
  );
};

/* ═══════════════════ SETTINGS ═══════════════════ */
const SettingsPage = () => {
  const [tab, setTab] = useState('general');
  return (
    <div className="page-scroll"><div className="page-inner">
      <SectionHeader title="Settings" subtitle="Configure your workspace and preferences"/>
      <div style={{display:'flex',gap:24}}>
        <div style={{width:200,flexShrink:0}}>
          {['general','team','security','domains','branding','webhooks','integrations','audit'].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{display:'block',width:'100%',textAlign:'left',padding:'8px 12px',borderRadius:6,border:'none',cursor:'pointer',fontFamily:'var(--font)',fontSize:13,fontWeight:t===tab?600:400,marginBottom:2,
              background:t===tab?'var(--accent-dim)':'transparent',color:t===tab?'var(--accent)':'var(--text-3)',textTransform:'capitalize',transition:'all .15s'
            }}>{t}</button>
          ))}
        </div>
        <div style={{flex:1}}>
          {tab==='general' && (
            <GlassPanel>
              <h3 style={{fontSize:15,fontWeight:700,color:'var(--text-0)',marginBottom:16}}>General Settings</h3>
              <div style={{display:'flex',flexDirection:'column',gap:16,maxWidth:480}}>
                <div><label style={{fontSize:12,color:'var(--text-2)',marginBottom:4,display:'block'}}>Workspace Name</label><input className="input" defaultValue="NeuronStack AI"/></div>
                <div><label style={{fontSize:12,color:'var(--text-2)',marginBottom:4,display:'block'}}>Workspace URL</label><input className="input" defaultValue="neuronstack.ai"/></div>
                <div><label style={{fontSize:12,color:'var(--text-2)',marginBottom:4,display:'block'}}>Default Model</label>
                  <select style={{width:'100%',background:'var(--bg-2)',border:'1px solid var(--border)',color:'var(--text-1)',padding:'8px 10px',borderRadius:6,fontFamily:'var(--font)',fontSize:13,cursor:'pointer'}}>
                    <option>GPT-4o</option><option>Claude 3.5 Sonnet</option><option>Gemini Pro</option>
                  </select>
                </div>
                <div><label style={{fontSize:12,color:'var(--text-2)',marginBottom:4,display:'block'}}>Timezone</label><input className="input" defaultValue="America/New_York"/></div>
                <button className="btn btn-accent" style={{alignSelf:'flex-start'}}>Save Changes</button>
              </div>
            </GlassPanel>
          )}
          {tab==='team' && (
            <GlassPanel style={{padding:0,overflow:'hidden'}}>
              <div style={{padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <h3 style={{fontSize:15,fontWeight:700,color:'var(--text-0)'}}>Team Members</h3>
                <button className="btn btn-accent btn-sm"><Icons.plus size={13}/> Invite</button>
              </div>
              <table className="ns-table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {[
                    {name:'Alex Chen',email:'alex@neuronstack.ai',role:'Owner',status:'active'},
                    {name:'Sarah Kim',email:'sarah@neuronstack.ai',role:'Admin',status:'active'},
                    {name:'James Wilson',email:'james@neuronstack.ai',role:'Developer',status:'active'},
                    {name:'Maria Garcia',email:'maria@neuronstack.ai',role:'Developer',status:'active'},
                    {name:'Tom Brown',email:'tom@neuronstack.ai',role:'Viewer',status:'pending'},
                  ].map(m=>(
                    <tr key={m.email}>
                      <td style={{fontWeight:500}}>{m.name}</td>
                      <td style={{fontSize:12,color:'var(--text-3)'}}>{m.email}</td>
                      <td><span className={`badge badge-${m.role==='Owner'?'cyan':m.role==='Admin'?'violet':'blue'}`}>{m.role}</span></td>
                      <td><span className={`badge badge-${m.status==='active'?'green':'yellow'}`}>{m.status}</span></td>
                      <td><button className="btn btn-ghost btn-sm" style={{padding:4}}><Icons.settings size={13}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </GlassPanel>
          )}
          {tab==='security' && (
            <GlassPanel>
              <h3 style={{fontSize:15,fontWeight:700,color:'var(--text-0)',marginBottom:16}}>Security</h3>
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                {[
                  {title:'Two-Factor Authentication',desc:'Require 2FA for all team members',enabled:true},
                  {title:'SSO / SAML',desc:'Enable single sign-on with your identity provider',enabled:false},
                  {title:'IP Allowlist',desc:'Restrict API access to specific IP addresses',enabled:false},
                  {title:'Session Timeout',desc:'Auto-logout after inactivity (30 min)',enabled:true},
                ].map(s=>(
                  <div key={s.title} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',background:'var(--bg-2)',borderRadius:8,border:'1px solid var(--border)'}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:'var(--text-0)'}}>{s.title}</div>
                      <div style={{fontSize:11,color:'var(--text-3)',marginTop:1}}>{s.desc}</div>
                    </div>
                    <div style={{width:40,height:22,borderRadius:11,background:s.enabled?'var(--accent)':'var(--bg-4)',cursor:'pointer',position:'relative',transition:'background .2s'}}>
                      <div style={{width:18,height:18,borderRadius:'50%',background:'#fff',position:'absolute',top:2,left:s.enabled?20:2,transition:'left .2s',boxShadow:'0 1px 3px rgba(0,0,0,.3)'}}></div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          )}
          {!['general','team','security'].includes(tab) && (
            <GlassPanel>
              <EmptyState icon={<Icons.settings size={32}/>} title={`${tab.charAt(0).toUpperCase()+tab.slice(1)} Settings`} subtitle={`Configure ${tab} preferences and integrations`}
                action={<button className="btn btn-accent">Configure</button>}/>
            </GlassPanel>
          )}
        </div>
      </div>
    </div></div>
  );
};

/* ═══════════════════ MISC PAGES ═══════════════════ */
const DeploymentsPage = () => (
  <div className="page-scroll"><div className="page-inner">
    <SectionHeader title="Deployments" subtitle="Manage your deployed models and endpoints"/>
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      {[
        {name:'prod-api-v2',env:'production',model:'GPT-4o + Claude 3.5',region:'us-east-1',status:'active',uptime:'99.99%',lastDeploy:'2h ago'},
        {name:'staging-api',env:'staging',model:'GPT-4o Mini',region:'us-west-2',status:'active',uptime:'99.95%',lastDeploy:'6h ago'},
        {name:'voice-service',env:'production',model:'Whisper + TTS',region:'eu-west-1',status:'active',uptime:'99.97%',lastDeploy:'1d ago'},
        {name:'embed-service',env:'production',model:'text-embedding-3',region:'us-east-1',status:'deploying',uptime:'—',lastDeploy:'now'},
      ].map(d=>(
        <div key={d.name} className="glass-card" style={{padding:'14px 20px',display:'flex',alignItems:'center',gap:14}}>
          <Icons.rocket size={18} style={{color:'var(--accent)'}}/>
          <div style={{flex:1}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontWeight:600,color:'var(--text-0)',fontSize:14}}>{d.name}</span>
              <span className={`badge badge-${d.env==='production'?'green':'blue'}`}>{d.env}</span>
              <span className={`badge badge-${d.status==='active'?'green':d.status==='deploying'?'yellow':'red'}`}>{d.status}</span>
            </div>
            <div style={{fontSize:11,color:'var(--text-3)',marginTop:2}}>{d.model} · {d.region} · Uptime: {d.uptime}</div>
          </div>
          <span style={{fontSize:11,color:'var(--text-3)'}}>Deployed: {d.lastDeploy}</span>
          <button className="btn btn-ghost btn-sm">Manage</button>
        </div>
      ))}
    </div>
  </div></div>
);

const LogsPage = () => {
  const logs = [
    {ts:'2025-05-20T14:23:45.123Z',level:'info',service:'api-gateway',msg:'Request completed: POST /v1/chat/completions - 200 - 340ms'},
    {ts:'2025-05-20T14:23:44.891Z',level:'info',service:'voice-engine',msg:'Call terminated normally: call_8f2k - duration: 3m24s'},
    {ts:'2025-05-20T14:23:42.456Z',level:'warn',service:'rate-limiter',msg:'Rate limit approaching: pk_live_***8f2k - 890/1000 req/min'},
    {ts:'2025-05-20T14:23:41.234Z',level:'error',service:'workflow-engine',msg:'Step failed: workflow_892.step_4 - Timeout after 30s - Retrying (1/3)'},
    {ts:'2025-05-20T14:23:40.012Z',level:'info',service:'api-gateway',msg:'Request completed: POST /v1/embeddings - 200 - 45ms'},
    {ts:'2025-05-20T14:23:38.789Z',level:'info',service:'agent-runtime',msg:'Agent "SalesBot" completed task: lead_qualify - 2.4s'},
    {ts:'2025-05-20T14:23:36.567Z',level:'debug',service:'cache',msg:'Cache hit: model_response_hash_a8f2k - saved 280ms'},
    {ts:'2025-05-20T14:23:35.345Z',level:'info',service:'image-gen',msg:'Image generated: SDXL Lightning - 1024x1024 - 2.1s'},
  ];
  const lvlColor = {info:'var(--text-3)',warn:'#f59e0b',error:'#ef4444',debug:'var(--accent2)'};
  return (
    <div className="page-scroll"><div className="page-inner">
      <SectionHeader title="Logs" subtitle="Real-time platform logs and diagnostics"/>
      <GlassPanel style={{padding:0,fontFamily:'var(--mono)',fontSize:12,lineHeight:1.8,overflow:'hidden'}}>
        <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:8}}>
          <div className="sdot sdot-green"></div>
          <span style={{fontSize:11,color:'var(--text-2)',fontFamily:'var(--font)'}}>Live stream</span>
          <div style={{marginLeft:'auto',display:'flex',gap:6}}>
            {['all','info','warn','error'].map(l=>(
              <button key={l} className="btn btn-ghost btn-sm" style={{padding:'2px 8px',fontSize:10,textTransform:'uppercase'}}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{padding:'8px 16px',maxHeight:500,overflowY:'auto'}}>
          {logs.map((l,i)=>(
            <div key={i} style={{display:'flex',gap:12,padding:'3px 0',color:lvlColor[l.level]||'var(--text-3)'}}>
              <span style={{color:'var(--text-3)',flexShrink:0,width:90}}>{l.ts.split('T')[1].slice(0,12)}</span>
              <span style={{width:44,flexShrink:0,textTransform:'uppercase',fontWeight:600,color:lvlColor[l.level]}}>{l.level}</span>
              <span style={{width:120,flexShrink:0,color:'var(--accent)'}}>{l.service}</span>
              <span style={{color:'var(--text-2)'}}>{l.msg}</span>
            </div>
          ))}
        </div>
      </GlassPanel>
    </div></div>
  );
};

const TeamsPage = () => (
  <div className="page-scroll"><div className="page-inner">
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
      <SectionHeader title="Teams" subtitle="Manage team access and permissions" style={{marginBottom:0}}/>
      <button className="btn btn-accent"><Icons.plus size={14}/> Create Team</button>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:14}}>
      {[
        {name:'Engineering',members:12,agents:8,color:'var(--accent)'},
        {name:'Product',members:6,agents:4,color:'var(--accent2)'},
        {name:'Sales',members:8,agents:6,color:'var(--accent3)'},
        {name:'Support',members:5,agents:3,color:'#f59e0b'},
        {name:'Marketing',members:4,agents:2,color:'#ec4899'},
      ].map(t=>(
        <div key={t.name} className="glass-card" style={{padding:18,cursor:'pointer'}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
            <div style={{width:40,height:40,borderRadius:10,background:`${t.color}15`,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Icons.users size={18} style={{color:t.color}}/>
            </div>
            <div>
              <h3 style={{fontSize:15,fontWeight:700,color:'var(--text-0)'}}>{t.name}</h3>
              <span style={{fontSize:11,color:'var(--text-3)'}}>{t.members} members · {t.agents} agents</span>
            </div>
          </div>
          <div style={{display:'flex',gap:-6}}>
            {Array.from({length:Math.min(t.members,5)}).map((_,i)=>(
              <div key={i} style={{width:28,height:28,borderRadius:'50%',background:`hsl(${i*60+180},40%,30%)`,border:'2px solid var(--bg-2)',marginLeft:i?-6:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:600,color:'var(--text-1)'}}>
                {String.fromCharCode(65+i)}
              </div>
            ))}
            {t.members>5 && <div style={{width:28,height:28,borderRadius:'50%',background:'var(--bg-3)',border:'2px solid var(--bg-2)',marginLeft:-6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:600,color:'var(--text-3)'}}>+{t.members-5}</div>}
          </div>
        </div>
      ))}
    </div>
  </div></div>
);

const IntegrationsPage = () => (
  <div className="page-scroll"><div className="page-inner">
    <SectionHeader title="Integrations" subtitle="Connect your tools and services"/>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:14}}>
      {[
        {name:'Slack',status:'connected',color:'#E01E5A'},
        {name:'Stripe',status:'connected',color:'#635BFF'},
        {name:'GitHub',status:'connected',color:'#f0f0f0'},
        {name:'Google Sheets',status:'connected',color:'#0F9D58'},
        {name:'Salesforce',status:'available',color:'#00A1E0'},
        {name:'HubSpot',status:'available',color:'#FF7A59'},
        {name:'Zapier',status:'available',color:'#FF4A00'},
        {name:'WhatsApp',status:'available',color:'#25D366'},
        {name:'Twilio',status:'connected',color:'#F22F46'},
        {name:'AWS',status:'connected',color:'#FF9900'},
        {name:'Notion',status:'available',color:'#fff'},
        {name:'Jira',status:'available',color:'#0052CC'},
      ].map(int=>(
        <div key={int.name} className="glass-card" style={{padding:16,textAlign:'center',cursor:'pointer'}}>
          <div style={{width:44,height:44,borderRadius:12,background:`${int.color}18`,margin:'0 auto 10px',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Icons.plug size={20} style={{color:int.color}}/>
          </div>
          <h4 style={{fontSize:13,fontWeight:600,color:'var(--text-0)',marginBottom:4}}>{int.name}</h4>
          <span className={`badge badge-${int.status==='connected'?'green':'blue'}`}>{int.status}</span>
        </div>
      ))}
    </div>
  </div></div>
);

Object.assign(window, { ImageStudioPage, VideoStudioPage, APIKeysPage, BillingPage, MarketplacePage, SettingsPage, DeploymentsPage, LogsPage, TeamsPage, IntegrationsPage });
