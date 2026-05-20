export const fmtNum = (v) => {
  const n = Number(v) || 0;
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toString();
};

export const genSparkData = (n = 12, base = 50, vol = 20) =>
  Array.from({ length: n }, () => base + Math.random() * vol - vol * 0.3);

export const genTrendData = (n = 30, base = 100, growth = 2, vol = 15) => {
  let v = base;
  return Array.from({ length: n }, () => {
    v += growth + Math.random() * vol - vol * 0.4;
    return Math.max(0, v);
  });
};

export const genLabels = (n = 7) => {
  const d = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return n <= 7 ? d.slice(0, n) : Array.from({ length: n }, (_, i) => `${i + 1}`);
};

export const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const maskKey = (id, prefix = 'pk_live_') => {
  return prefix + '*'.repeat(27) + (id || '').slice(-4).padStart(4, 'x');
};
