/* Light / dark / system theme. */
import { THEME_KEY } from './config.js';
import { $$ } from './utils.js';

/* ---------- theme ---------- */
export let theme = (() => { try { return localStorage.getItem(THEME_KEY) || 'system'; } catch { return 'system'; } })();
export const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
export const effectiveTheme = () => theme === 'system' ? (darkQuery.matches ? 'dark' : 'light') : theme;

export function setTheme(t) {
  theme = t;
  try { if (t === 'system') localStorage.removeItem(THEME_KEY); else localStorage.setItem(THEME_KEY, t); } catch { /* ignore */ }
  if (t === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = t;
  paintThemeButton();
}
export function paintThemeButton() {
  const dark = effectiveTheme() === 'dark';
  const auto = theme === 'system';
  $$('meta[name="theme-color"]').forEach(m => {
    const forDark = m.media.includes('dark');
    m.setAttribute('content', auto ? (forDark ? '#0E0E10' : '#D9DDE1') : (dark ? '#0E0E10' : '#D9DDE1'));
  });
}
darkQuery.addEventListener?.('change', paintThemeButton);
