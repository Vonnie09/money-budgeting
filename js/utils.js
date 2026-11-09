/* Small DOM, number and date helpers. */

/* ---------- small helpers ---------- */
export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const sum = (arr, f = x => x) => arr.reduce((s, x) => s + f(x), 0);
export const uid = () => Math.random().toString(36).slice(2, 10);
export const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
export const round2 = n => Math.round(n * 100) / 100;
// Black or white, whichever reads better on a #RRGGBB background.
export const inkOn = hex => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.18 ? '#0E0E10' : '#F7F8F9';
};

/* ---------- dates ---------- */
export const pad = n => String(n).padStart(2, '0');
export const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const startOfMonth = d => new Date(d.getFullYear(), d.getMonth(), 1);
export const endOfMonth = d => new Date(d.getFullYear(), d.getMonth() + 1, 0);
export const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
export const startOfWeek = d => addDays(new Date(d.getFullYear(), d.getMonth(), d.getDate()), -((d.getDay() + 6) % 7));
export const monthKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
export const sameMonth = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
export const fmtDate = (d, opts) => d.toLocaleDateString('en-US', opts);
export const daysBetween = (a, b) => Math.round((b - a) / 86400000);
