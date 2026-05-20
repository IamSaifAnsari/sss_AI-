/* NeuronStack AI — Playground Page */
const PlaygroundPage = () => {
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant.');
  const [messages, setMessages] = useState([
    {role:'assistant', content:'Hello! I\'m ready to help. You can select different models, adjust parameters, and start chatting. What would you like to explore?', tokens:28, latency:0}
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [compareMode, setCompareMode] = useState(false);
  const [compareModel, setCompareModel] = useState('claude-3.5-sonnet');
  const chatRef = useRef(null);

  const models = [
    {id:'gpt-4o',name:'GPT-4o',provider:'OpenAI',ctx:'128K',speed:'Fast',cost:'$5/$15'},
    {id:'claude-3.5-sonnet',name:'Claude 3.5 Sonnet',provider:'Anthropic',ctx:'200K',speed:'Fast',cost:'$3/$15'},
    {id:'gemini-pro',name:'Gemini Pro',provider:'Google',ctx:'1M',speed:'Medium',cost:'$3.5/$10.5'},
    {id:'deepseek-v3',name:'DeepSeek V3',provider:'DeepSeek',ctx:'128K',speed:'Fast',cost:'$0.27/$1.10'},
    {id:'llama-3.1-70b',name:'Llama 3.1 70B',provider:'Meta',ctx:'128K',speed:'Medium',cost:'$0.59/$0.79'},
    {id:'mistral-large',name:'Mistral Large',provider:'Mistral',ctx:'128K',speed:'Fast',cost:'$2/$6'},
    {id:'grok-2',name:'Grok 2',provider:'xAI',ctx:'131K',speed:'Fast',cost:'$2/$10'},
  ];

  const curModel = models.find(m=>m.id===selectedModel);

  const handleSend = () => {
    if(!input.trim()||streaming) return;
    const userMsg = {role:'user', content:input.trim()};
    setMessages(p=>[...p, userMsg]);
    setInput('');
    setStreaming(true);

    const responses = [
      "That's a great question! Let me break this down for you.\n\nFirst, it's important to understand the underlying architecture. Modern transformer models use attention mechanisms that allow them to process context in parallel, which is why they can handle such large context windows.\n\n```python\nimport openai\n\nclient = openai.OpenAI()\nresponse = client.chat.completions.create(\n    model=\"gpt-4o\",\n    messages=[{\"role\": \"user\", \"content\": \"Hello!\"}],\n    temperature=0.7\n)\nprint(response.choices[0].message.content)\n```\n\nThe key factors to consider are:\n1. **Latency** — How quickly the model responds\n2. **Cost** — Token pricing varies significantly between providers\n3. **Quality** — Output quality differs by task type\n4. **Context Window** — How much information you can provide\n\nWould you like me to elaborate on any of these aspects?",
      "Here's a comprehensive analysis of the current AI model landscape:\n\n## Performance Comparison\n\nWhen evaluating models, we look at several benchmarks:\n\n| Model | MMLU | HumanEval | MT-Bench |\n|-------|------|-----------|----------|\n| GPT-4o | 88.7 | 90.2 | 9.3 |\n| Claude 3.5 | 88.3 | 92.0 | 9.1 |\n| Gemini Pro | 85.9 | 84.1 | 8.8 |\n\n```json\n{\n  \"recommendation\": \"GPT-4o for general tasks\",\n  \"cost_efficient\": \"DeepSeek V3 for high-volume\",\n  \"coding\": \"Claude 3.5 Sonnet\",\n  \"multimodal\": \"Gemini Pro\"\n}\n```\n\nFor production deployments, I'd recommend implementing a **routing layer** that automatically selects the best model based on task complexity and budget constraints.",
    ];

    const response = responses[messages.length % responses.length];
    let idx = 0;
    const aiMsg = {role:'assistant', content:'', tokens:0, latency: Math.round(180+Math.random()*300)};
    setMessages(p=>[...p, aiMsg]);

    const timer = setInterval(()=>{
      idx += Math.floor(Math.random()*4)+2;
      if(idx >= response.length) {
        idx = response.length;
        clearInterval(timer);
        setStreaming(false);
        setMessages(p=>{
          const n=[...p]; n[n.length-1]={...n[n.length-1], content:response, tokens:Math.round(response.length/4)};
          return n;
        });
      } else {
        setMessages(p=>{
          const n=[...p]; n[n.length-1]={...n[n.length-1], content:response.slice(0,idx)};
          return n;
        });
      }
    }, 20);
  };

  useEffect(()=>{
    if(chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const renderContent = (content) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part,i) => {
      if(part.startsWith('```')) {
        const lines = part.split('\n');
        const lang = lines[0].replace('```','').trim();
        const code = lines.slice(1,-1).join('\n');
        return (
          <div key={i} style={{margin:'10px 0',borderRadius:8,overflow:'hidden',border:'1px solid var(--border)'}}>
            <div style={{padding:'6px 12px',background:'var(--bg-3)',display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:11,color:'var(--text-3)'}}>
              <span>{lang||'code'}</span>
              <button className="btn btn-ghost btn-sm" style={{padding:'2px 8px',fontSize:10}} onClick={()=>navigator.clipboard.writeText(code)}>
                <Icons.copy size={11}/> Copy
              </button>
            </div>
            <pre style={{padding:12,background:'var(--bg-1)',fontSize:12,fontFamily:'var(--mono)',color:'var(--text-1)',overflowX:'auto',margin:0,lineHeight:1.6}}>{code}</pre>
          </div>
        );
      }
      return part.split('\n').map((line,j) => {
        if(line.startsWith('## ')) return <h3 key={`${i}-${j}`} style={{fontSize:15,fontWeight:700,color:'var(--text-0)',margin:'12px 0 6px'}}>{line.slice(3)}</h3>;
        if(line.startsWith('**') && line.endsWith('**')) return <strong key={`${i}-${j}`} style={{color:'var(--text-0)'}}>{line.slice(2,-2)}</strong>;
        if(line.startsWith('- ') || line.match(/^\d+\./)) return <div key={`${i}-${j}`} style={{paddingLeft:16,margin:'2px 0',position:'relative'}}><span style={{position:'absolute',left:0,color:'var(--accent)'}}>{line.match(/^\d+\./) ? line.match(/^\d+\./)[0] : '·'}</span>{line.replace(/^[-\d.]+\s*/,'').replace(/\*\*(.*?)\*\*/g, '$1')}</div>;
        if(line.startsWith('|')) return null;
        if(line.trim()==='') return <div key={`${i}-${j}`} style={{height:8}}></div>;
        return <div key={`${i}-${j}`} style={{margin:'2px 0'}}>{line}</div>;
      });
    });
  };

  const sliderStyle = {width:'100%',height:4,borderRadius:2,appearance:'none',background:'var(--bg-3)',outline:'none',cursor:'pointer'};

  return (
    <div className="page-scroll" style={{padding:0,display:'flex',height:'100%'}}>
      {/* Chat Area */}
      <div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0}}>
        {/* Toolbar */}
        <div style={{padding:'12px 20px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
          <select value={selectedModel} onChange={e=>setSelectedModel(e.target.value)}
            style={{background:'var(--bg-2)',border:'1px solid var(--border)',color:'var(--text-1)',padding:'6px 12px',borderRadius:6,fontFamily:'var(--font)',fontSize:13,fontWeight:600,cursor:'pointer',minWidth:180}}>
            {models.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          {curModel && <>
            <span className="badge badge-cyan">{curModel.provider}</span>
            <span style={{fontSize:11,color:'var(--text-3)'}}>CTX: {curModel.ctx}</span>
            <span style={{fontSize:11,color:'var(--text-3)'}}>Cost: {curModel.cost}/M</span>
          </>}
          <div style={{marginLeft:'auto',display:'flex',gap:8}}>
            <button className={`btn btn-ghost btn-sm ${compareMode?'glow-border':''}`} onClick={()=>setCompareMode(!compareMode)}>
              <Icons.layers size={13}/> Compare
            </button>
            <button className={`btn btn-ghost btn-sm`} onClick={()=>setShowSettings(!showSettings)}>
              <Icons.settings size={13}/> Settings
            </button>
            <button className="btn btn-ghost btn-sm" onClick={()=>{setMessages([]);setStreaming(false)}}>
              <Icons.trash size={13}/> Clear
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={chatRef} style={{flex:1,overflowY:'auto',padding:'20px 24px'}}>
          {messages.map((msg,i) => (
            <div key={i} style={{display:'flex',gap:12,marginBottom:20,animation:'fadeIn .3s ease',maxWidth:720}}>
              <div style={{width:30,height:30,borderRadius:8,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,
                background: msg.role==='user' ? 'var(--accent2-dim)' : 'var(--accent-dim)',
                color: msg.role==='user' ? 'var(--accent2)' : 'var(--accent)',
                marginTop:2
              }}>
                {msg.role==='user' ? 'U' : 'AI'}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                  <span style={{fontSize:12,fontWeight:600,color:'var(--text-0)'}}>{msg.role==='user' ? 'You' : curModel?.name}</span>
                  {msg.latency > 0 && <span style={{fontSize:10,color:'var(--text-3)',fontFamily:'var(--mono)'}}>{msg.latency}ms</span>}
                  {msg.tokens > 0 && <span style={{fontSize:10,color:'var(--text-3)',fontFamily:'var(--mono)'}}>{msg.tokens} tokens</span>}
                </div>
                <div style={{fontSize:13.5,lineHeight:1.65,color:'var(--text-1)'}}>
                  {renderContent(msg.content)}
                  {streaming && i===messages.length-1 && msg.role==='assistant' && (
                    <span style={{display:'inline-flex',gap:3,marginLeft:4,verticalAlign:'middle'}}>
                      {[0,1,2].map(d=><span key={d} style={{width:4,height:4,borderRadius:'50%',background:'var(--accent)',animation:`typing-dot 1s ease-in-out ${d*0.15}s infinite`}}></span>)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{padding:'12px 20px 16px',borderTop:'1px solid var(--border)',flexShrink:0}}>
          <div style={{display:'flex',gap:10,alignItems:'flex-end'}}>
            <div style={{flex:1,position:'relative'}}>
              <textarea value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleSend();}}}
                placeholder="Send a message..."
                rows={input.split('\n').length > 3 ? 4 : 2}
                style={{width:'100%',background:'var(--bg-2)',border:'1px solid var(--border)',color:'var(--text-1)',padding:'10px 14px',borderRadius:10,fontFamily:'var(--font)',fontSize:13,outline:'none',resize:'none',transition:'border-color .2s',lineHeight:1.5}}
              />
            </div>
            <button className="btn btn-accent" onClick={handleSend} disabled={streaming||!input.trim()}
              style={{height:40,width:40,padding:0,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',opacity:input.trim()?1:.5}}>
              <Icons.arrowUp size={18}/>
            </button>
          </div>
          <div style={{display:'flex',gap:12,marginTop:8,fontSize:11,color:'var(--text-3)'}}>
            <button style={{background:'none',border:'none',color:'var(--text-3)',cursor:'pointer',display:'flex',alignItems:'center',gap:4,fontFamily:'var(--font)',fontSize:11}}>
              <Icons.upload size={12}/> Attach file
            </button>
            <span>Press Enter to send, Shift+Enter for newline</span>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div style={{width:280,borderLeft:'1px solid var(--border)',background:'var(--bg-1)',padding:20,overflowY:'auto',flexShrink:0,animation:'slideInLeft .2s ease'}}>
          <h3 style={{fontSize:13,fontWeight:700,color:'var(--text-0)',marginBottom:16}}>Parameters</h3>

          <div style={{marginBottom:18}}>
            <label style={{fontSize:12,color:'var(--text-2)',marginBottom:6,display:'flex',justifyContent:'space-between'}}>
              <span>Temperature</span><span className="mono" style={{color:'var(--accent)'}}>{temperature}</span>
            </label>
            <input type="range" min="0" max="2" step="0.1" value={temperature} onChange={e=>setTemperature(+e.target.value)}
              style={sliderStyle}/>
            <style>{`input[type=range]::-webkit-slider-thumb{appearance:none;width:14px;height:14px;border-radius:50%;background:var(--accent);cursor:pointer;border:2px solid var(--bg-1);box-shadow:0 0 8px var(--accent-dim)}`}</style>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'var(--text-3)',marginTop:4}}>
              <span>Precise</span><span>Creative</span>
            </div>
          </div>

          <div style={{marginBottom:18}}>
            <label style={{fontSize:12,color:'var(--text-2)',marginBottom:6,display:'flex',justifyContent:'space-between'}}>
              <span>Max Tokens</span><span className="mono" style={{color:'var(--accent)'}}>{maxTokens}</span>
            </label>
            <input type="range" min="256" max="16384" step="256" value={maxTokens} onChange={e=>setMaxTokens(+e.target.value)}
              style={sliderStyle}/>
          </div>

          <div style={{marginBottom:18}}>
            <label style={{fontSize:12,color:'var(--text-2)',marginBottom:6,display:'block'}}>System Prompt</label>
            <textarea value={systemPrompt} onChange={e=>setSystemPrompt(e.target.value)}
              rows={4} style={{width:'100%',background:'var(--bg-2)',border:'1px solid var(--border)',color:'var(--text-1)',padding:'8px 10px',borderRadius:6,fontFamily:'var(--font)',fontSize:12,outline:'none',resize:'vertical',lineHeight:1.5}}/>
          </div>

          <div style={{borderTop:'1px solid var(--border)',paddingTop:14,marginTop:14}}>
            <h3 style={{fontSize:13,fontWeight:700,color:'var(--text-0)',marginBottom:12}}>Session Stats</h3>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {[
                ['Messages', messages.length],
                ['Total Tokens', messages.reduce((a,m)=>a+(m.tokens||0),0).toLocaleString()],
                ['Avg Latency', Math.round(messages.filter(m=>m.latency).reduce((a,m)=>a+m.latency,0)/(messages.filter(m=>m.latency).length||1))+'ms'],
                ['Est. Cost', '$'+((messages.reduce((a,m)=>a+(m.tokens||0),0)/1000)*0.015).toFixed(4)],
              ].map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between',fontSize:12}}>
                  <span style={{color:'var(--text-3)'}}>{k}</span>
                  <span style={{fontFamily:'var(--mono)',color:'var(--text-1)',fontSize:11}}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {compareMode && (
            <div style={{borderTop:'1px solid var(--border)',paddingTop:14,marginTop:14}}>
              <h3 style={{fontSize:13,fontWeight:700,color:'var(--text-0)',marginBottom:12}}>Compare With</h3>
              <select value={compareModel} onChange={e=>setCompareModel(e.target.value)}
                style={{width:'100%',background:'var(--bg-2)',border:'1px solid var(--border)',color:'var(--text-1)',padding:'6px 10px',borderRadius:6,fontFamily:'var(--font)',fontSize:12,cursor:'pointer'}}>
                {models.filter(m=>m.id!==selectedModel).map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

Object.assign(window, { PlaygroundPage });
