/* NeuronStack AI — Shared Components & Icons */
const {useState, useEffect, useRef, useContext, createContext, useCallback, useMemo, memo} = React;

/* ── App Context ── */
const AppContext = createContext();
const useApp = () => useContext(AppContext);

/* ── Icon System (Lucide-compatible SVG) ── */
const I = ({d, children, size=18, className='', style={}, stroke='currentColor', fill='none', sw=1.8, ...p}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    className={className} style={{flexShrink:0,...style}} {...p}>
    {d ? <path d={d}/> : children}
  </svg>
);

const Icons = {
  dashboard: p=><I {...p}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></I>,
  sparkles: p=><I {...p}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .963L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/></I>,
  cpu: p=><I {...p}><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></I>,
  bot: p=><I {...p}><path d="M12 8V4H8"/><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><circle cx="9" cy="13" r="1" fill="currentColor"/><circle cx="15" cy="13" r="1" fill="currentColor"/></I>,
  phone: p=><I {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></I>,
  gitBranch: p=><I {...p}><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></I>,
  image: p=><I {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></I>,
  film: p=><I {...p}><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/></I>,
  key: p=><I {...p}><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1h1v-1h1a1 1 0 0 0 .707-.293l.207-.207"/><circle cx="16" cy="8" r="5"/><circle cx="16" cy="8" r="1" fill="currentColor"/></I>,
  rocket: p=><I {...p}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 3 0 3 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-3 0-3"/></I>,
  fileText: p=><I {...p}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></I>,
  creditCard: p=><I {...p}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></I>,
  users: p=><I {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></I>,
  store: p=><I {...p}><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2 2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/></I>,
  plug: p=><I {...p}><path d="M12 22v-5"/><path d="M9 8V1h6v7"/><path d="M7 8h10a3 3 0 0 1 3 3v1a5 5 0 0 1-5 5h-6a5 5 0 0 1-5-5v-1a3 3 0 0 1 3-3z"/></I>,
  settings: p=><I {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></I>,
  search: p=><I {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></I>,
  bell: p=><I {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></I>,
  plus: p=><I {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></I>,
  chevDown: p=><I {...p} d="M6 9l6 6 6-6"/>,
  chevRight: p=><I {...p} d="M9 18l6-6-6-6"/>,
  chevLeft: p=><I {...p} d="M15 18l-6-6 6-6"/>,
  x: p=><I {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></I>,
  send: p=><I {...p}><line x1="22" y1="2" x2="11" y2="13"/><path d="M22 2L15 22l-4-9-9-4z"/></I>,
  upload: p=><I {...p}><polyline points="16,16 12,12 8,16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></I>,
  filter: p=><I {...p}><polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/></I>,
  activity: p=><I {...p} d="M22 12h-4l-3 9L9 3l-3 9H2"/>,
  server: p=><I {...p}><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></I>,
  globe: p=><I {...p}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></I>,
  arrowUp: p=><I {...p}><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5,12 12,5 19,12"/></I>,
  arrowDown: p=><I {...p}><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19,12 12,19 5,12"/></I>,
  menu: p=><I {...p}><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></I>,
  copy: p=><I {...p}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></I>,
  check: p=><I {...p} d="M20 6L9 17l-5-5"/>,
  zap: p=><I {...p} fill="currentColor" stroke="none"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></I>,
  mic: p=><I {...p}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></I>,
  eye: p=><I {...p}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></I>,
  trash: p=><I {...p}><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></I>,
  play: p=><I {...p} fill="currentColor" stroke="none"><polygon points="5,3 19,12 5,21"/></I>,
  pause: p=><I {...p}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></I>,
  clock: p=><I {...p}><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></I>,
  layers: p=><I {...p}><polygon points="12,2 2,7 12,12 22,7"/><polyline points="2,17 12,22 22,17"/><polyline points="2,12 12,17 22,12"/></I>,
  download: p=><I {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></I>,
  terminal: p=><I {...p}><polyline points="4,17 10,11 4,5"/><line x1="12" y1="19" x2="20" y2="19"/></I>,
  hash: p=><I {...p}><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></I>,
  workflow: p=><I {...p}><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="9" y="15" width="6" height="6" rx="1"/><path d="M6 9v3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9"/><path d="M12 12v3"/></I>,
  dollar: p=><I {...p}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></I>,
};

/* ── Animated Counter ── */
const AnimCounter = memo(({value, prefix='', suffix='', duration=1200}) => {
  const numVal = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g,'')) || 0;
  const prevRef = useRef(numVal);
  const [display, setDisplay] = useState(numVal);

  useEffect(() => {
    const from = prevRef.current;
    const to = numVal;
    prevRef.current = to;
    // If values are close (live update), just snap — no animation
    if(Math.abs(to - from) / (Math.abs(to)||1) < 0.01) { setDisplay(to); return; }
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (to - from) * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [numVal, duration]);

  const fmt = numVal >= 1e9 ? (display/1e9).toFixed(1)+'B' : numVal >= 1e6 ? (display/1e6).toFixed(1)+'M' : numVal >= 1e3 ? (display/1e3).toFixed(1)+'K' : numVal % 1 !== 0 ? display.toFixed(1) : Math.round(display).toLocaleString();
  return <span>{prefix}{fmt}{suffix}</span>;
});

/* ── Mini Sparkline ── */
const Sparkline = memo(({data=[], color='var(--accent)', w=80, h=28}) => {
  if(!data.length) return null;
  const max=Math.max(...data), min=Math.min(...data), range=max-min||1;
  const pts = data.map((v,i)=>({x:(i/(data.length-1))*w, y:h-((v-min)/range)*(h*.75)-(h*.12)}));
  const line = pts.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = line + ` L${w},${h} L0,${h} Z`;
  const id = useMemo(()=>'sp'+Math.random().toString(36).slice(2,8),[]);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{display:'block'}}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity=".3"/><stop offset="100%" stopColor={color} stopOpacity="0"/>
      </linearGradient></defs>
      <path d={area} fill={`url(#${id})`}/><path d={line} fill="none" stroke={color} strokeWidth="1.5"/>
    </svg>
  );
});

/* ── Area Chart (larger) ── */
const AreaChart = memo(({data=[], labels=[], color='var(--accent)', color2, h=160, showGrid=true, showLabels=true}) => {
  const ref = useRef(null);
  const [w, setW] = useState(500);
  useEffect(()=>{ if(ref.current) setW(ref.current.clientWidth); }, []);
  if(!data.length) return null;
  const padL=40, padR=10, padT=10, padB=showLabels?28:10;
  const cw=w-padL-padR, ch=h-padT-padB;
  const max=Math.max(...(Array.isArray(data[0])?data.flat():data))*1.1, min=0;
  const range=max-min||1;
  const makeLine = (d) => d.map((v,i)=>{
    const x=padL+(i/(d.length-1))*cw, y=padT+ch-((v-min)/range)*ch;
    return `${i?'L':'M'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const series = Array.isArray(data[0]) ? data : [data];
  const colors = [color, color2||'var(--accent2)', 'var(--accent3)'];
  const id = useMemo(()=>'ac'+Math.random().toString(36).slice(2,8),[]);
  const gridLines = [0,.25,.5,.75,1].map(p => padT + ch*(1-p));
  const gridVals = [0,.25,.5,.75,1].map(p => min + range*p);

  return (
    <div ref={ref} style={{width:'100%'}}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{display:'block'}}>
        <defs>
          {series.map((_,i)=>(
            <linearGradient key={i} id={`${id}-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors[i]} stopOpacity=".25"/>
              <stop offset="100%" stopColor={colors[i]} stopOpacity=".02"/>
            </linearGradient>
          ))}
        </defs>
        {showGrid && gridLines.map((y,i)=>(
          <g key={i}>
            <line x1={padL} y1={y} x2={w-padR} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
            <text x={padL-6} y={y+4} fill="var(--text-3)" fontSize="10" fontFamily="var(--mono)" textAnchor="end">
              {gridVals[i]>=1e6?(gridVals[i]/1e6).toFixed(0)+'M':gridVals[i]>=1e3?(gridVals[i]/1e3).toFixed(0)+'K':Math.round(gridVals[i])}
            </text>
          </g>
        ))}
        {series.map((d,i)=>{
          const line=makeLine(d);
          const area=line+` L${w-padR},${padT+ch} L${padL},${padT+ch} Z`;
          return <g key={i}><path d={area} fill={`url(#${id}-${i})`}/><path d={line} fill="none" stroke={colors[i]} strokeWidth="2"/></g>;
        })}
        {showLabels && labels.map((l,i)=>(
          <text key={i} x={padL+(i/(labels.length-1))*cw} y={h-4} fill="var(--text-3)" fontSize="10" fontFamily="var(--mono)" textAnchor="middle">{l}</text>
        ))}
      </svg>
    </div>
  );
});

/* ── Bar Chart ── */
const BarChart = memo(({data=[], labels=[], colors=[], h=140}) => {
  const ref=useRef(null); const [w,setW]=useState(400);
  useEffect(()=>{if(ref.current)setW(ref.current.clientWidth)},[]);
  const max=Math.max(...data)*1.15||1;
  const padL=8,padR=8,padB=24,padT=8,gap=6;
  const barW=(w-padL-padR-gap*(data.length-1))/data.length;
  const ch=h-padT-padB;
  return (
    <div ref={ref} style={{width:'100%'}}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{display:'block'}}>
        {data.map((v,i)=>{
          const bh=(v/max)*ch; const x=padL+i*(barW+gap); const y=padT+ch-bh;
          const c=colors[i]||'var(--accent)';
          return <g key={i}>
            <rect x={x} y={y} width={barW} height={bh} rx={4} fill={c} opacity=".8"/>
            <rect x={x} y={y} width={barW} height={Math.min(bh,2)} rx={1} fill={c}/>
            {labels[i] && <text x={x+barW/2} y={h-6} fill="var(--text-3)" fontSize="10" textAnchor="middle" fontFamily="var(--font)">{labels[i]}</text>}
          </g>;
        })}
      </svg>
    </div>
  );
});

/* ── Donut Chart ── */
const DonutChart = memo(({segments=[], size=120, thickness=14}) => {
  const r=(size-thickness)/2, cx=size/2, cy=size/2, circ=2*Math.PI*r;
  const total=segments.reduce((a,s)=>a+s.value,0)||1;
  let offset=0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-3)" strokeWidth={thickness}/>
      {segments.map((s,i)=>{
        const len=(s.value/total)*circ; const gap=2;
        const el = <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={thickness}
          strokeDasharray={`${Math.max(len-gap,0)} ${circ}`} strokeDashoffset={-offset}
          strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} style={{transition:'all .6s var(--ease)'}}/>;
        offset+=len; return el;
      })}
      <text x={cx} y={cy-4} textAnchor="middle" fill="var(--text-0)" fontSize="18" fontWeight="700" fontFamily="var(--font)">
        {total>=1e6?(total/1e6).toFixed(1)+'M':total>=1e3?(total/1e3).toFixed(1)+'K':total}
      </text>
      <text x={cx} y={cy+12} textAnchor="middle" fill="var(--text-3)" fontSize="10" fontFamily="var(--font)">total</text>
    </svg>
  );
});

/* ── Metric Card ── */
const MetricCard = ({icon, label, value, prefix, suffix, change, changeDir, spark, delay=0, color='var(--accent)'}) => (
  <div className="glass-card anim-in" style={{padding:'18px 20px', animationDelay:`${delay}s`, display:'flex', flexDirection:'column', gap:10}}>
    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <div style={{width:32,height:32,borderRadius:8,background:`${color}15`,display:'flex',alignItems:'center',justifyContent:'center',color}}>
          {icon}
        </div>
        <span style={{fontSize:12,color:'var(--text-3)',fontWeight:500}}>{label}</span>
      </div>
      {change && <span style={{fontSize:11,fontWeight:600,color:changeDir==='up'?'#10b981':'#ef4444',display:'flex',alignItems:'center',gap:2}}>
        {changeDir==='up' ? <Icons.arrowUp size={12}/> : <Icons.arrowDown size={12}/>}{change}
      </span>}
    </div>
    <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between'}}>
      <span style={{fontSize:26,fontWeight:700,color:'var(--text-0)',letterSpacing:'-0.02em',lineHeight:1}}>
        <AnimCounter value={value} prefix={prefix} suffix={suffix}/>
      </span>
      {spark && <Sparkline data={spark} color={color} w={70} h={24}/>}
    </div>
  </div>
);

/* ── Glass Panel ── */
const GlassPanel = ({children, style={}, className='', ...p}) => (
  <div className={`glass-card-static ${className}`} style={{padding:20,...style}} {...p}>{children}</div>
);

/* ── Section Header ── */
const SectionHeader = ({title, subtitle, action, style={}}) => (
  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,...style}}>
    <div>
      <h2 style={{fontSize:18,fontWeight:700,color:'var(--text-0)',lineHeight:1.3}}>{title}</h2>
      {subtitle && <p style={{fontSize:13,color:'var(--text-3)',marginTop:2}}>{subtitle}</p>}
    </div>
    {action}
  </div>
);

/* ── Tabs ── */
const Tabs = ({tabs=[], active, onChange, style={}}) => (
  <div style={{display:'flex',gap:2,padding:3,background:'var(--bg-2)',borderRadius:'var(--radius-sm)',border:'1px solid var(--border)',...style}}>
    {tabs.map(t => (
      <button key={t.id||t} onClick={()=>onChange(t.id||t)} style={{
        padding:'6px 14px', borderRadius:6, border:'none', cursor:'pointer',
        fontFamily:'var(--font)', fontSize:12, fontWeight:600, transition:'all .18s var(--ease)',
        background: (t.id||t)===active ? 'var(--bg-4)' : 'transparent',
        color: (t.id||t)===active ? 'var(--text-0)' : 'var(--text-3)',
        boxShadow: (t.id||t)===active ? '0 1px 4px rgba(0,0,0,.3)' : 'none',
      }}>{t.label||t}</button>
    ))}
  </div>
);

/* ── Modal ── */
const Modal = ({open, onClose, title, children, width=480}) => {
  if(!open) return null;
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',animation:'fadeIn .2s ease'}}>
      <div onClick={e=>e.stopPropagation()} className="glass-card-static" style={{width,maxWidth:'90vw',maxHeight:'80vh',overflow:'auto',padding:24,animation:'fadeInScale .25s ease'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
          <h3 style={{fontSize:16,fontWeight:700,color:'var(--text-0)'}}>{title}</h3>
          <button onClick={onClose} style={{background:'none',border:'none',color:'var(--text-3)',cursor:'pointer',padding:4}}><Icons.x size={18}/></button>
        </div>
        {children}
      </div>
    </div>
  );
};

/* ── Empty State ── */
const EmptyState = ({icon, title, subtitle, action}) => (
  <div style={{textAlign:'center',padding:'48px 24px',color:'var(--text-3)'}}>
    <div style={{marginBottom:12,opacity:.5}}>{icon}</div>
    <p style={{fontSize:15,fontWeight:600,color:'var(--text-2)',marginBottom:4}}>{title}</p>
    {subtitle && <p style={{fontSize:13,marginBottom:16}}>{subtitle}</p>}
    {action}
  </div>
);

/* ── Activity Item ── */
const ActivityItem = ({icon, text, detail, time, color='var(--accent)', badge}) => (
  <div style={{display:'flex',gap:10,padding:'10px 0',borderBottom:'1px solid var(--border)',alignItems:'flex-start'}}>
    <div style={{width:28,height:28,borderRadius:7,background:`${color}12`,display:'flex',alignItems:'center',justifyContent:'center',color,flexShrink:0,marginTop:1}}>
      {icon}
    </div>
    <div style={{flex:1,minWidth:0}}>
      <div style={{fontSize:13,color:'var(--text-1)'}}>{text}</div>
      {detail && <div style={{fontSize:11,color:'var(--text-3)',marginTop:1}}>{detail}</div>}
    </div>
    <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:3,flexShrink:0}}>
      {badge && <span className={`badge badge-${badge.color||'cyan'}`}>{badge.label}</span>}
      <span style={{fontSize:11,color:'var(--text-3)',whiteSpace:'nowrap'}}>{time}</span>
    </div>
  </div>
);

/* ── Data generation helpers ── */
const genSparkData = (n=12, base=50, vol=20) => Array.from({length:n},()=>base+Math.random()*vol-(vol*.3));
const genTrendData = (n=30, base=100, growth=2, vol=15) => {
  let v=base; return Array.from({length:n},(_,i)=>{v+=growth+Math.random()*vol-vol*.4; return Math.max(0,v);});
};
const genLabels = (n=7) => {
  const d=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  return n<=7 ? d.slice(0,n) : Array.from({length:n},(_,i)=>`${i+1}`);
};
const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmtNum = v => v>=1e9?(v/1e9).toFixed(1)+'B':v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e3?(v/1e3).toFixed(1)+'K':v.toString();

/* ── Export ── */
Object.assign(window, {
  AppContext, useApp, I, Icons, AnimCounter, Sparkline, AreaChart, BarChart, DonutChart,
  MetricCard, GlassPanel, SectionHeader, Tabs, Modal, EmptyState, ActivityItem,
  genSparkData, genTrendData, genLabels, monthLabels, fmtNum, memo
});
