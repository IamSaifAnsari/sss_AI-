import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Icons } from './Icons.jsx';

export const AnimCounter = memo(({ value, prefix = '', suffix = '', duration = 1200 }) => {
  const numVal = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
  const prevRef = useRef(numVal);
  const [display, setDisplay] = useState(numVal);

  useEffect(() => {
    const from = prevRef.current;
    const to = numVal;
    prevRef.current = to;
    if (Math.abs(to - from) / (Math.abs(to) || 1) < 0.01) { setDisplay(to); return; }
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

  const fmt = numVal >= 1e9 ? (display / 1e9).toFixed(1) + 'B'
    : numVal >= 1e6 ? (display / 1e6).toFixed(1) + 'M'
      : numVal >= 1e3 ? (display / 1e3).toFixed(1) + 'K'
        : numVal % 1 !== 0 ? display.toFixed(1) : Math.round(display).toLocaleString();
  return <span>{prefix}{fmt}{suffix}</span>;
});

export const Sparkline = memo(({ data = [], color = 'var(--accent)', w = 80, h = 28 }) => {
  if (!data.length) return null;
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * w, y: h - ((v - min) / range) * (h * 0.75) - (h * 0.12) }));
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = line + ` L${w},${h} L0,${h} Z`;
  const id = useMemo(() => 'sp' + Math.random().toString(36).slice(2, 8), []);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity=".3" /><stop offset="100%" stopColor={color} stopOpacity="0" />
      </linearGradient></defs>
      <path d={area} fill={`url(#${id})`} /><path d={line} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
});

export const AreaChart = memo(({ data = [], labels = [], color = 'var(--accent)', color2, h = 160, showGrid = true, showLabels = true }) => {
  const ref = useRef(null);
  const [w, setW] = useState(500);
  useEffect(() => { if (ref.current) setW(ref.current.clientWidth); }, []);
  if (!data.length) return null;
  const padL = 40, padR = 10, padT = 10, padB = showLabels ? 28 : 10;
  const cw = w - padL - padR, ch = h - padT - padB;
  const max = Math.max(...(Array.isArray(data[0]) ? data.flat() : data)) * 1.1, min = 0;
  const range = max - min || 1;
  const makeLine = (d) => d.map((v, i) => {
    const x = padL + (i / (d.length - 1)) * cw, y = padT + ch - ((v - min) / range) * ch;
    return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const series = Array.isArray(data[0]) ? data : [data];
  const colors = [color, color2 || 'var(--accent2)', 'var(--accent3)'];
  const id = useMemo(() => 'ac' + Math.random().toString(36).slice(2, 8), []);
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(p => padT + ch * (1 - p));
  const gridVals = [0, 0.25, 0.5, 0.75, 1].map(p => min + range * p);

  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
        <defs>
          {series.map((_, i) => (
            <linearGradient key={i} id={`${id}-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors[i]} stopOpacity=".25" />
              <stop offset="100%" stopColor={colors[i]} stopOpacity=".02" />
            </linearGradient>
          ))}
        </defs>
        {showGrid && gridLines.map((y, i) => (
          <g key={i}>
            <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <text x={padL - 6} y={y + 4} fill="var(--text-3)" fontSize="10" fontFamily="var(--mono)" textAnchor="end">
              {gridVals[i] >= 1e6 ? (gridVals[i] / 1e6).toFixed(0) + 'M' : gridVals[i] >= 1e3 ? (gridVals[i] / 1e3).toFixed(0) + 'K' : Math.round(gridVals[i])}
            </text>
          </g>
        ))}
        {series.map((d, i) => {
          const line = makeLine(d);
          const area = line + ` L${w - padR},${padT + ch} L${padL},${padT + ch} Z`;
          return <g key={i}><path d={area} fill={`url(#${id}-${i})`} /><path d={line} fill="none" stroke={colors[i]} strokeWidth="2" /></g>;
        })}
        {showLabels && labels.map((l, i) => (
          <text key={i} x={padL + (i / (labels.length - 1)) * cw} y={h - 4} fill="var(--text-3)" fontSize="10" fontFamily="var(--mono)" textAnchor="middle">{l}</text>
        ))}
      </svg>
    </div>
  );
});

export const BarChart = memo(({ data = [], labels = [], colors = [], h = 140 }) => {
  const ref = useRef(null); const [w, setW] = useState(400);
  useEffect(() => { if (ref.current) setW(ref.current.clientWidth); }, []);
  const max = Math.max(...data) * 1.15 || 1;
  const padL = 8, padR = 8, padB = 24, padT = 8, gap = 6;
  const barW = (w - padL - padR - gap * (data.length - 1)) / data.length;
  const ch = h - padT - padB;
  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
        {data.map((v, i) => {
          const bh = (v / max) * ch; const x = padL + i * (barW + gap); const y = padT + ch - bh;
          const c = colors[i] || 'var(--accent)';
          return <g key={i}>
            <rect x={x} y={y} width={barW} height={bh} rx={4} fill={c} opacity=".8" />
            <rect x={x} y={y} width={barW} height={Math.min(bh, 2)} rx={1} fill={c} />
            {labels[i] && <text x={x + barW / 2} y={h - 6} fill="var(--text-3)" fontSize="10" textAnchor="middle" fontFamily="var(--font)">{labels[i]}</text>}
          </g>;
        })}
      </svg>
    </div>
  );
});

export const DonutChart = memo(({ segments = [], size = 120, thickness = 14 }) => {
  const r = (size - thickness) / 2, cx = size / 2, cy = size / 2, circ = 2 * Math.PI * r;
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-3)" strokeWidth={thickness} />
      {segments.map((s, i) => {
        const len = (s.value / total) * circ; const gap = 2;
        const el = <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={thickness}
          strokeDasharray={`${Math.max(len - gap, 0)} ${circ}`} strokeDashoffset={-offset}
          strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} style={{ transition: 'all .6s var(--ease)' }} />;
        offset += len; return el;
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" fill="var(--text-0)" fontSize="18" fontWeight="700" fontFamily="var(--font)">
        {total >= 1e6 ? (total / 1e6).toFixed(1) + 'M' : total >= 1e3 ? (total / 1e3).toFixed(1) + 'K' : total}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="var(--text-3)" fontSize="10" fontFamily="var(--font)">total</text>
    </svg>
  );
});

export const MetricCard = ({ icon, label, value, prefix, suffix, change, changeDir, spark, delay = 0, color = 'var(--accent)' }) => (
  <div className="glass-card anim-in" style={{ padding: '18px 20px', animationDelay: `${delay}s`, display: 'flex', flexDirection: 'column', gap: 10 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
          {icon}
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>{label}</span>
      </div>
      {change && <span style={{ fontSize: 11, fontWeight: 600, color: changeDir === 'up' ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: 2 }}>
        {changeDir === 'up' ? <Icons.arrowUp size={12} /> : <Icons.arrowDown size={12} />}{change}
      </span>}
    </div>
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-0)', letterSpacing: '-0.02em', lineHeight: 1 }}>
        <AnimCounter value={value} prefix={prefix} suffix={suffix} />
      </span>
      {spark && <Sparkline data={spark} color={color} w={70} h={24} />}
    </div>
  </div>
);

export const GlassPanel = ({ children, style = {}, className = '', ...p }) => (
  <div className={`glass-card-static ${className}`} style={{ padding: 20, ...style }} {...p}>{children}</div>
);

export const SectionHeader = ({ title, subtitle, action, style = {} }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, ...style }}>
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-0)', lineHeight: 1.3 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const Tabs = ({ tabs = [], active, onChange, style = {} }) => (
  <div style={{ display: 'flex', gap: 2, padding: 3, background: 'var(--bg-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', ...style }}>
    {tabs.map(t => (
      <button key={t.id || t} onClick={() => onChange(t.id || t)} style={{
        padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
        fontFamily: 'var(--font)', fontSize: 12, fontWeight: 600, transition: 'all .18s var(--ease)',
        background: (t.id || t) === active ? 'var(--bg-4)' : 'transparent',
        color: (t.id || t) === active ? 'var(--text-0)' : 'var(--text-3)',
        boxShadow: (t.id || t) === active ? '0 1px 4px rgba(0,0,0,.3)' : 'none',
      }}>{t.label || t}</button>
    ))}
  </div>
);

export const Modal = ({ open, onClose, title, children, width = 480 }) => {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn .2s ease' }}>
      <div onClick={e => e.stopPropagation()} className="glass-card-static" style={{ width, maxWidth: '90vw', maxHeight: '80vh', overflow: 'auto', padding: 24, animation: 'fadeInScale .25s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-0)' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 4 }}><Icons.x size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const EmptyState = ({ icon, title, subtitle, action }) => (
  <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-3)' }}>
    <div style={{ marginBottom: 12, opacity: 0.5 }}>{icon}</div>
    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-2)', marginBottom: 4 }}>{title}</p>
    {subtitle && <p style={{ fontSize: 13, marginBottom: 16 }}>{subtitle}</p>}
    {action}
  </div>
);
