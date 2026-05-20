/* NeuronStack AI — Login Page */

const LoginPage = ({onLogin}) => {
  const [step, setStep] = useState('login'); // login | magic | forgot | tfa
  const [authMode, setAuthMode] = useState('password'); // password | magic
  const [email, setEmail] = useState('admin@neuronstack.ai');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tfaCode, setTfaCode] = useState(['','','','','','']);
  const [magicSent, setMagicSent] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const tfaRefs = useRef([]);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    if(!email.trim()) { setError('Email is required'); return; }
    if(authMode==='password' && !password) { setError('Password is required'); return; }
    setLoading(true);
    setTimeout(()=>{
      setLoading(false);
      if(authMode==='password') {
        setStep('tfa');
      }
    }, 1200);
  };

  const handleMagicLink = (e) => {
    e.preventDefault();
    if(!email.trim()) { setError('Email is required'); return; }
    setLoading(true);
    setTimeout(()=>{ setLoading(false); setMagicSent(true); }, 1000);
  };

  const handleTFA = () => {
    const code = tfaCode.join('');
    if(code.length < 6) return;
    setLoading(true);
    setTimeout(()=>{
      setLoading(false);
      onLogin({email, role:'owner'});
    }, 800);
  };

  const handleTFAInput = (idx, val) => {
    if(val.length > 1) val = val.slice(-1);
    if(val && !/\d/.test(val)) return;
    const next = [...tfaCode];
    next[idx] = val;
    setTfaCode(next);
    if(val && idx < 5) tfaRefs.current[idx+1]?.focus();
    if(next.every(d=>d)) setTimeout(handleTFA, 200);
  };

  const handleTFAKeyDown = (idx, e) => {
    if(e.key==='Backspace' && !tfaCode[idx] && idx > 0) {
      tfaRefs.current[idx-1]?.focus();
    }
  };

  const handleForgot = (e) => {
    e.preventDefault();
    if(!email.trim()) { setError('Enter your email above first'); return; }
    setLoading(true);
    setTimeout(()=>{ setLoading(false); setForgotSent(true); }, 1000);
  };

  const inputStyle = {
    width:'100%', padding:'11px 14px', background:'var(--bg-2)', border:'1px solid var(--border)',
    borderRadius:8, color:'var(--text-0)', fontFamily:'var(--font)', fontSize:14, outline:'none',
    transition:'border-color .15s, box-shadow .15s',
  };

  const focusStyle = {borderColor:'var(--accent)', boxShadow:'0 0 0 3px var(--accent-dim)'};

  return (
    <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',background:'var(--bg-0)'}}>
      {/* Animated background */}
      <div style={{position:'absolute',inset:0,overflow:'hidden'}}>
        <div style={{
          position:'absolute',width:'140%',height:'140%',top:'-20%',left:'-20%',
          background:`
            radial-gradient(ellipse 30% 40% at 20% 30%, rgba(59,130,246,0.08), transparent 60%),
            radial-gradient(ellipse 35% 30% at 75% 70%, rgba(139,92,246,0.06), transparent 60%),
            radial-gradient(ellipse 25% 35% at 50% 50%, rgba(59,130,246,0.04), transparent 50%)
          `,
          animation:'login-bg-drift 20s ease-in-out infinite alternate',
        }}/>
        {/* Grid pattern */}
        <div style={{
          position:'absolute',inset:0,
          backgroundImage:'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize:'64px 64px',
        }}/>
      </div>

      <style>{`
        @keyframes login-bg-drift {
          0% { transform: translate(0,0) rotate(0deg); }
          100% { transform: translate(3%,-2%) rotate(1deg); }
        }
        .login-input:focus { border-color: var(--accent) !important; box-shadow: 0 0 0 3px var(--accent-dim) !important; }
        .login-input::placeholder { color: var(--text-3); }
      `}</style>

      {/* Login card */}
      <div style={{
        position:'relative', width:420, maxWidth:'92vw', zIndex:1,
        background:'rgba(10,10,20,0.85)', backdropFilter:'blur(24px)',
        border:'1px solid var(--border-light)', borderRadius:16,
        padding:'40px 36px', animation:'fadeInScale .4s ease',
        boxShadow:'0 32px 80px rgba(0,0,0,0.5)',
      }}>
        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{width:44,height:44,borderRadius:12,background:'var(--accent)',display:'inline-flex',alignItems:'center',justifyContent:'center',marginBottom:14}}>
            <Icons.zap size={22} style={{color:'#000'}}/>
          </div>
          <h1 style={{fontSize:22,fontWeight:700,color:'var(--text-0)',letterSpacing:'-0.02em'}}>NeuronStack AI</h1>
          <p style={{fontSize:13,color:'var(--text-3)',marginTop:4}}>Enterprise AI Infrastructure Platform</p>
        </div>

        {/* ─── Login Step ─── */}
        {step==='login' && <>
          {/* Auth mode tabs */}
          <div style={{display:'flex',gap:2,padding:3,background:'var(--bg-2)',borderRadius:8,marginBottom:24,border:'1px solid var(--border)'}}>
            {[{id:'password',label:'Password'},{id:'magic',label:'Magic Link'}].map(m=>(
              <button key={m.id} onClick={()=>{setAuthMode(m.id);setError('');setMagicSent(false)}}
                style={{flex:1,padding:'8px 0',borderRadius:6,border:'none',cursor:'pointer',fontFamily:'var(--font)',fontSize:13,fontWeight:600,transition:'all .15s',
                  background:authMode===m.id?'var(--bg-4)':'transparent',
                  color:authMode===m.id?'var(--text-0)':'var(--text-3)',
                }}>{m.label}</button>
            ))}
          </div>

          {authMode==='password' ? (
            <form onSubmit={handleLogin}>
              <div style={{marginBottom:16}}>
                <label style={{fontSize:12,fontWeight:500,color:'var(--text-2)',marginBottom:6,display:'block'}}>Email</label>
                <input className="login-input" type="email" value={email} onChange={e=>setEmail(e.target.value)}
                  placeholder="you@company.com" style={inputStyle} autoFocus/>
              </div>
              <div style={{marginBottom:8}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                  <label style={{fontSize:12,fontWeight:500,color:'var(--text-2)'}}>Password</label>
                  <button type="button" onClick={()=>{setStep('forgot');setForgotSent(false);setError('')}}
                    style={{fontSize:11,color:'var(--accent)',background:'none',border:'none',cursor:'pointer',fontFamily:'var(--font)',fontWeight:500}}>
                    Forgot password?
                  </button>
                </div>
                <input className="login-input" type="password" value={password} onChange={e=>setPassword(e.target.value)}
                  placeholder="Enter your password" style={inputStyle}/>
              </div>

              {/* Remember me */}
              <label style={{display:'flex',alignItems:'center',gap:8,marginBottom:20,cursor:'pointer',fontSize:13,color:'var(--text-2)'}}
                onClick={()=>setRemember(!remember)}>
                <div style={{width:16,height:16,borderRadius:4,border:'1px solid var(--border-light)',background:remember?'var(--accent)':'var(--bg-3)',
                  display:'flex',alignItems:'center',justifyContent:'center',transition:'all .15s',flexShrink:0}}>
                  {remember && <Icons.check size={11} style={{color:'#000',strokeWidth:3}}/>}
                </div>
                Remember this device
              </label>

              {error && <div style={{padding:'8px 12px',borderRadius:6,background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',color:'#f87171',fontSize:12,marginBottom:14}}>{error}</div>}

              <button type="submit" className="btn btn-accent" disabled={loading}
                style={{width:'100%',justifyContent:'center',padding:'11px 0',fontSize:14,borderRadius:8,opacity:loading?.7:1}}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleMagicLink}>
              <div style={{marginBottom:20}}>
                <label style={{fontSize:12,fontWeight:500,color:'var(--text-2)',marginBottom:6,display:'block'}}>Email</label>
                <input className="login-input" type="email" value={email} onChange={e=>setEmail(e.target.value)}
                  placeholder="you@company.com" style={inputStyle} autoFocus/>
              </div>

              {magicSent ? (
                <div style={{textAlign:'center',padding:'16px 0'}}>
                  <div style={{width:48,height:48,borderRadius:12,background:'rgba(16,185,129,0.12)',display:'inline-flex',alignItems:'center',justifyContent:'center',marginBottom:12}}>
                    <Icons.check size={24} style={{color:'#10b981'}}/>
                  </div>
                  <p style={{fontSize:14,fontWeight:600,color:'var(--text-0)',marginBottom:4}}>Check your email</p>
                  <p style={{fontSize:12,color:'var(--text-3)',lineHeight:1.5}}>We sent a sign-in link to<br/><strong style={{color:'var(--text-1)'}}>{email}</strong></p>
                  <button type="button" onClick={()=>onLogin({email,role:'owner'})} className="btn btn-ghost" style={{marginTop:16,fontSize:12}}>
                    Simulate: Open magic link
                  </button>
                </div>
              ) : (
                <>
                  {error && <div style={{padding:'8px 12px',borderRadius:6,background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',color:'#f87171',fontSize:12,marginBottom:14}}>{error}</div>}
                  <button type="submit" className="btn btn-accent" disabled={loading}
                    style={{width:'100%',justifyContent:'center',padding:'11px 0',fontSize:14,borderRadius:8,opacity:loading?.7:1}}>
                    {loading ? 'Sending...' : 'Send magic link'}
                  </button>
                </>
              )}
            </form>
          )}

          <div style={{marginTop:20,textAlign:'center'}}>
            <p style={{fontSize:11,color:'var(--text-3)'}}>
              Don't have an account? <button style={{color:'var(--accent)',background:'none',border:'none',cursor:'pointer',fontFamily:'var(--font)',fontSize:11,fontWeight:600}}>Request access</button>
            </p>
          </div>
        </>}

        {/* ─── 2FA Step ─── */}
        {step==='tfa' && (
          <div>
            <div style={{textAlign:'center',marginBottom:24}}>
              <div style={{width:48,height:48,borderRadius:12,background:'var(--accent-dim)',display:'inline-flex',alignItems:'center',justifyContent:'center',marginBottom:12}}>
                <Icons.key size={22} style={{color:'var(--accent)'}}/>
              </div>
              <h2 style={{fontSize:17,fontWeight:700,color:'var(--text-0)',marginBottom:4}}>Two-factor authentication</h2>
              <p style={{fontSize:12,color:'var(--text-3)',lineHeight:1.5}}>Enter the 6-digit code from your authenticator app</p>
            </div>

            <div style={{display:'flex',gap:8,justifyContent:'center',marginBottom:24}}>
              {tfaCode.map((d,i)=>(
                <input key={i} ref={el=>tfaRefs.current[i]=el}
                  type="text" inputMode="numeric" maxLength={1} value={d}
                  onChange={e=>handleTFAInput(i,e.target.value)}
                  onKeyDown={e=>handleTFAKeyDown(i,e)}
                  autoFocus={i===0}
                  style={{
                    width:44,height:52,textAlign:'center',fontSize:20,fontWeight:700,fontFamily:'var(--mono)',
                    background:'var(--bg-2)',border:`1px solid ${d?'var(--accent)':'var(--border)'}`,
                    borderRadius:8,color:'var(--text-0)',outline:'none',
                    transition:'border-color .15s, box-shadow .15s',
                    boxShadow:d?'0 0 0 2px var(--accent-dim)':'none',
                  }}
                />
              ))}
            </div>

            <button onClick={handleTFA} className="btn btn-accent" disabled={loading || tfaCode.some(d=>!d)}
              style={{width:'100%',justifyContent:'center',padding:'11px 0',fontSize:14,borderRadius:8,opacity:(loading||tfaCode.some(d=>!d))?.5:1}}>
              {loading ? 'Verifying...' : 'Verify & sign in'}
            </button>

            <div style={{textAlign:'center',marginTop:16}}>
              <button onClick={()=>{setStep('login');setTfaCode(['','','','','',''])}}
                style={{fontSize:12,color:'var(--text-3)',background:'none',border:'none',cursor:'pointer',fontFamily:'var(--font)'}}>
                ← Back to login
              </button>
            </div>
          </div>
        )}

        {/* ─── Forgot Password ─── */}
        {step==='forgot' && (
          <div>
            <div style={{textAlign:'center',marginBottom:24}}>
              <h2 style={{fontSize:17,fontWeight:700,color:'var(--text-0)',marginBottom:4}}>Reset password</h2>
              <p style={{fontSize:12,color:'var(--text-3)',lineHeight:1.5}}>Enter your email and we'll send reset instructions</p>
            </div>

            {forgotSent ? (
              <div style={{textAlign:'center',padding:'16px 0'}}>
                <div style={{width:48,height:48,borderRadius:12,background:'rgba(16,185,129,0.12)',display:'inline-flex',alignItems:'center',justifyContent:'center',marginBottom:12}}>
                  <Icons.check size={24} style={{color:'#10b981'}}/>
                </div>
                <p style={{fontSize:14,fontWeight:600,color:'var(--text-0)',marginBottom:4}}>Reset email sent</p>
                <p style={{fontSize:12,color:'var(--text-3)',lineHeight:1.5}}>Check your inbox for password reset instructions</p>
              </div>
            ) : (
              <form onSubmit={handleForgot}>
                <div style={{marginBottom:20}}>
                  <label style={{fontSize:12,fontWeight:500,color:'var(--text-2)',marginBottom:6,display:'block'}}>Email</label>
                  <input className="login-input" type="email" value={email} onChange={e=>setEmail(e.target.value)}
                    placeholder="you@company.com" style={inputStyle} autoFocus/>
                </div>
                {error && <div style={{padding:'8px 12px',borderRadius:6,background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',color:'#f87171',fontSize:12,marginBottom:14}}>{error}</div>}
                <button type="submit" className="btn btn-accent" disabled={loading}
                  style={{width:'100%',justifyContent:'center',padding:'11px 0',fontSize:14,borderRadius:8,opacity:loading?.7:1}}>
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
            )}

            <div style={{textAlign:'center',marginTop:16}}>
              <button onClick={()=>{setStep('login');setError('')}}
                style={{fontSize:12,color:'var(--text-3)',background:'none',border:'none',cursor:'pointer',fontFamily:'var(--font)'}}>
                ← Back to login
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{marginTop:28,paddingTop:16,borderTop:'1px solid var(--border)',textAlign:'center'}}>
          <p style={{fontSize:10,color:'var(--text-3)'}}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>

      {/* Version tag */}
      <div style={{position:'fixed',bottom:16,left:'50%',transform:'translateX(-50%)',fontSize:10,color:'var(--text-3)',opacity:.5}}>
        NeuronStack AI v2.4.1 · © 2025
      </div>
    </div>
  );
};

Object.assign(window, { LoginPage });
