import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from './AuthProvider.jsx';

const DEFAULTS = {
  accentColor: '#3b82f6',
  theme: 'Light',
  fontFamily: 'DM Sans',
  sidebarStyle: 'Solid',
  cardStyle: 'Border',
  density: 'Comfortable',
};

const TweaksCtx = createContext(null);
export const useTweaks = () => useContext(TweaksCtx);

export function TweaksProvider({ children }) {
  const { user } = useAuth() || {};
  const [tweaks, setTweaksState] = useState(() => {
    try { return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem('ns_tweaks') || '{}')) }; }
    catch { return DEFAULTS; }
  });
  const saveTimer = useRef(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    api.getSettings().then(({ tweaks: t }) => {
      if (active && t && Object.keys(t).length) setTweaksState((prev) => ({ ...prev, ...t }));
    }).catch(() => { /* noop */ });
    return () => { active = false; };
  }, [user]);

  const setTweak = useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null ? keyOrEdits : { [keyOrEdits]: val };
    setTweaksState((prev) => {
      const next = { ...prev, ...edits };
      try { localStorage.setItem('ns_tweaks', JSON.stringify(next)); } catch { /* noop */ }
      if (user) {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
          api.saveTweaks(next).catch((e) => console.warn('saveTweaks failed', e));
        }, 400);
      }
      return next;
    });
  }, [user]);

  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty('--accent', tweaks.accentColor);
    r.style.setProperty('--accent-dim', tweaks.accentColor + '22');
    r.style.setProperty('--border-focus', tweaks.accentColor + '66');

    const fonts = {
      'DM Sans': "'DM Sans',-apple-system,sans-serif",
      'Inter': "'Inter',-apple-system,sans-serif",
      'Plus Jakarta Sans': "'Plus Jakarta Sans',-apple-system,sans-serif",
      'Manrope': "'Manrope',-apple-system,sans-serif",
    };
    if (fonts[tweaks.fontFamily]) r.style.setProperty('--font', fonts[tweaks.fontFamily]);

    const root = document.getElementById('root');
    if (root) {
      root.className = '';
      if (tweaks.theme === 'Charcoal') root.classList.add('theme-charcoal');
      else if (tweaks.theme === 'Pitch') root.classList.add('theme-pitch');
      else if (tweaks.theme === 'Light') root.classList.add('theme-light');
    }

    const body = document.body;
    body.classList.remove('card-glass', 'card-solid', 'card-border', 'density-compact', 'density-default', 'density-comfortable');
    if (tweaks.cardStyle === 'Solid') body.classList.add('card-solid');
    else if (tweaks.cardStyle === 'Border') body.classList.add('card-border');
    if (tweaks.density === 'Compact') body.classList.add('density-compact');
    else if (tweaks.density === 'Comfortable') body.classList.add('density-comfortable');
  }, [tweaks]);

  useEffect(() => {
    if (tweaks.fontFamily && tweaks.fontFamily !== 'DM Sans') {
      const id = 'gfont-' + tweaks.fontFamily.replace(/\s/g, '-');
      if (!document.getElementById(id)) {
        const link = document.createElement('link');
        link.id = id; link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(tweaks.fontFamily)}:wght@300;400;500;600;700&display=swap`;
        document.head.appendChild(link);
      }
    }
  }, [tweaks.fontFamily]);

  return (
    <TweaksCtx.Provider value={{ tweaks, setTweak }}>{children}</TweaksCtx.Provider>
  );
}
