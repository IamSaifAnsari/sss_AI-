/* NeuronStack AI — Onboarding Wizard */

const OnboardingWizard = ({onComplete}) => {
  const [step, setStep] = useState(0);
  const [workspaceName, setWorkspaceName] = useState('');
  const [selectedModels, setSelectedModels] = useState(['gpt-4o','claude-3.5']);
  const [useCase, setUseCase] = useState('');

  const steps = ['Welcome','Workspace','Models','Use Case','Ready'];

  const toggleModel = (id) => {
    setSelectedModels(prev => prev.includes(id) ? prev.filter(m=>m!==id) : [...prev, id]);
  };

  const models = [
    {id:'gpt-4o',name:'GPT-4o',provider:'OpenAI',desc:'Best all-around model'},
    {id:'claude-3.5',name:'Claude 3.5 Sonnet',provider:'Anthropic',desc:'Great for coding & analysis'},
    {id:'gemini-pro',name:'Gemini Pro',provider:'Google',desc:'1M context window'},
    {id:'deepseek-v3',name:'DeepSeek V3',provider:'DeepSeek',desc:'Cost-effective MoE'},
    {id:'llama-3.1',name:'Llama 3.1 70B',provider:'Meta',desc:'Best open-weight model'},
    {id:'mistral-large',name:'Mistral Large',provider:'Mistral',desc:'Multilingual powerhouse'},
  ];

  const useCases = [
    {id:'api',label:'API & Model Routing',icon:<Icons.activity size={20}/>,desc:'Route requests to the best model'},
    {id:'agents',label:'AI Agents',icon:<Icons.bot size={20}/>,desc:'Build autonomous AI assistants'},
    {id:'voice',label:'Voice AI',icon:<Icons.phone size={20}/>,desc:'AI-powered phone calls'},
    {id:'automation',label:'Workflow Automation',icon:<Icons.workflow size={20}/>,desc:'Automate business processes'},
    {id:'media',label:'Image & Video Gen',icon:<Icons.image size={20}/>,desc:'Generate visual content'},
    {id:'all',label:'All of the Above',icon:<Icons.layers size={20}/>,desc:'Full platform access'},
  ];

  const canNext = step===0 || (step===1 && workspaceName.trim()) || (step===2 && selectedModels.length>0) || (step===3 && useCase) || step===4;

  return (
    <div style={{position:'fixed',inset:0,zIndex:99990,background:'var(--bg-0)',display:'flex',alignItems:'center',justifyContent:'center',overflow:'auto'}}>
      {/* Background */}
      <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(59,130,246,0.04), transparent 70%)'}}/>

      <div style={{position:'relative',width:600,maxWidth:'94vw',padding:40,zIndex:1}}>
        {/* Progress */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:4,marginBottom:36}}>
          {steps.map((s,i)=>(
            <React.Fragment key={i}>
              <div style={{width:8,height:8,borderRadius:4,transition:'all .2s',
                background:i<=step?'var(--accent)':'var(--bg-4)',
                transform:i===step?'scale(1.3)':'scale(1)',
              }}/>
              {i<steps.length-1 && <div style={{width:32,height:2,borderRadius:1,background:i<step?'var(--accent)':'var(--bg-4)',transition:'background .3s'}}/>}
            </React.Fragment>
          ))}
        </div>

        {/* Step 0: Welcome */}
        {step===0 && (
          <div style={{textAlign:'center',animation:'fadeIn .4s ease'}}>
            <div style={{width:56,height:56,borderRadius:14,background:'var(--accent)',display:'inline-flex',alignItems:'center',justifyContent:'center',marginBottom:20}}>
              <Icons.zap size={28} style={{color:'#000'}}/>
            </div>
            <h1 style={{fontSize:28,fontWeight:700,color:'var(--text-0)',letterSpacing:'-0.03em',marginBottom:8}}>Welcome to NeuronStack AI</h1>
            <p style={{fontSize:15,color:'var(--text-2)',lineHeight:1.6,maxWidth:440,margin:'0 auto'}}>
              Let's get your workspace set up in under 2 minutes. You'll be deploying AI models, building agents, and automating workflows in no time.
            </p>
          </div>
        )}

        {/* Step 1: Workspace */}
        {step===1 && (
          <div style={{animation:'fadeIn .4s ease'}}>
            <h2 style={{fontSize:22,fontWeight:700,color:'var(--text-0)',textAlign:'center',marginBottom:6}}>Name your workspace</h2>
            <p style={{fontSize:13,color:'var(--text-3)',textAlign:'center',marginBottom:28}}>This is where your team will collaborate on AI projects</p>
            <div style={{maxWidth:400,margin:'0 auto'}}>
              <input className="input" value={workspaceName} onChange={e=>setWorkspaceName(e.target.value)}
                placeholder="e.g. Acme Corp, My Startup" autoFocus
                style={{fontSize:16,padding:'14px 16px',textAlign:'center',borderRadius:10}}/>
              <p style={{fontSize:11,color:'var(--text-3)',textAlign:'center',marginTop:8}}>You can change this later in settings</p>
            </div>
          </div>
        )}

        {/* Step 2: Models */}
        {step===2 && (
          <div style={{animation:'fadeIn .4s ease'}}>
            <h2 style={{fontSize:22,fontWeight:700,color:'var(--text-0)',textAlign:'center',marginBottom:6}}>Choose your models</h2>
            <p style={{fontSize:13,color:'var(--text-3)',textAlign:'center',marginBottom:24}}>Select which AI models you'd like to enable. You can add more anytime.</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:10}}>
              {models.map(m=>{
                const sel = selectedModels.includes(m.id);
                return (
                  <div key={m.id} onClick={()=>toggleModel(m.id)} style={{
                    padding:'14px 16px',borderRadius:10,cursor:'pointer',transition:'all .12s',
                    background:sel?'var(--accent-dim)':'var(--bg-2)',
                    border:`1px solid ${sel?'var(--accent)':'var(--border)'}`,
                    display:'flex',alignItems:'center',gap:12,
                  }}>
                    <div style={{width:18,height:18,borderRadius:5,border:`2px solid ${sel?'var(--accent)':'var(--border-light)'}`,
                      background:sel?'var(--accent)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all .12s'}}>
                      {sel && <Icons.check size={11} style={{color:'#000',strokeWidth:3}}/>}
                    </div>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:'var(--text-0)'}}>{m.name}</div>
                      <div style={{fontSize:11,color:'var(--text-3)'}}>{m.provider} · {m.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p style={{fontSize:11,color:'var(--text-3)',textAlign:'center',marginTop:10}}>{selectedModels.length} model{selectedModels.length!==1?'s':''} selected</p>
          </div>
        )}

        {/* Step 3: Use Case */}
        {step===3 && (
          <div style={{animation:'fadeIn .4s ease'}}>
            <h2 style={{fontSize:22,fontWeight:700,color:'var(--text-0)',textAlign:'center',marginBottom:6}}>What will you build?</h2>
            <p style={{fontSize:13,color:'var(--text-3)',textAlign:'center',marginBottom:24}}>This helps us customize your experience</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:10}}>
              {useCases.map(uc=>{
                const sel = useCase===uc.id;
                return (
                  <div key={uc.id} onClick={()=>setUseCase(uc.id)} style={{
                    padding:'16px',borderRadius:10,cursor:'pointer',transition:'all .12s',
                    background:sel?'var(--accent-dim)':'var(--bg-2)',
                    border:`1px solid ${sel?'var(--accent)':'var(--border)'}`,
                  }}>
                    <div style={{color:sel?'var(--accent)':'var(--text-3)',marginBottom:8}}>{uc.icon}</div>
                    <div style={{fontSize:13,fontWeight:600,color:'var(--text-0)',marginBottom:2}}>{uc.label}</div>
                    <div style={{fontSize:11,color:'var(--text-3)'}}>{uc.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Ready */}
        {step===4 && (
          <div style={{textAlign:'center',animation:'fadeIn .4s ease'}}>
            <div style={{width:56,height:56,borderRadius:14,background:'rgba(16,185,129,0.12)',display:'inline-flex',alignItems:'center',justifyContent:'center',marginBottom:20}}>
              <Icons.check size={28} style={{color:'#10b981'}}/>
            </div>
            <h2 style={{fontSize:24,fontWeight:700,color:'var(--text-0)',marginBottom:8}}>You're all set!</h2>
            <p style={{fontSize:14,color:'var(--text-2)',lineHeight:1.6,maxWidth:400,margin:'0 auto',marginBottom:8}}>
              Your workspace <strong style={{color:'var(--text-0)'}}>{workspaceName || 'NeuronStack AI'}</strong> is ready with {selectedModels.length} models enabled.
            </p>
            <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap',marginTop:16}}>
              {selectedModels.slice(0,4).map(id=>{
                const m = models.find(x=>x.id===id);
                return m ? <span key={id} className="badge badge-cyan">{m.name}</span> : null;
              })}
              {selectedModels.length>4 && <span className="badge badge-blue">+{selectedModels.length-4} more</span>}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{display:'flex',justifyContent:'space-between',marginTop:36}}>
          {step > 0 ? (
            <button className="btn btn-ghost" onClick={()=>setStep(s=>s-1)}>← Back</button>
          ) : <div/>}
          <button className="btn btn-accent" onClick={()=>step===4?onComplete({workspaceName,selectedModels,useCase}):setStep(s=>s+1)}
            disabled={!canNext} style={{opacity:canNext?1:.5,padding:'10px 28px',fontSize:14}}>
            {step===4 ? 'Launch Dashboard' : step===0 ? 'Get Started' : 'Continue →'}
          </button>
        </div>

        {/* Skip */}
        {step < 4 && step > 0 && (
          <div style={{textAlign:'center',marginTop:12}}>
            <button onClick={()=>onComplete({workspaceName,selectedModels,useCase,skipped:true})} style={{fontSize:11,color:'var(--text-3)',background:'none',border:'none',cursor:'pointer',fontFamily:'var(--font)'}}>
              Skip setup →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { OnboardingWizard });
