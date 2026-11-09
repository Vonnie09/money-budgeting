/* Shared markup: charts, list rows, empty states, progress bars. */
import { cat } from './config.js';
import { icon } from './icons.js';
import { clamp, esc, fmtDate, parse, sum } from './utils.js';
import { money, pct } from './money.js';
import { ui } from './store.js';
import { account } from './queries.js';

/* ---------- charts ---------- */
export function donut(segs, { size = 200, stroke = 30 } = {}) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, mid = size / 2;
  const total = sum(segs, s => s.value) || 1;
  let off = 0;
  const arcs = segs.map(s => {
    const len = s.value / total * c;
    const gap = segs.length > 1 ? Math.min(2.5, len / 2) : 0;
    const el = `<circle r="${r}" cx="${mid}" cy="${mid}" fill="none" style="stroke:${s.color}" stroke-width="${stroke}"
      stroke-dasharray="${Math.max(len - gap, 0)} ${c}" stroke-dashoffset="${-off}" transform="rotate(-90 ${mid} ${mid})"><title>${esc(s.label)}: ${money(s.value)}</title></circle>`;
    off += len;
    return el;
  }).join('');
  return `<svg class="donut" viewBox="0 0 ${size} ${size}" role="img" aria-label="Breakdown chart">
    <circle r="${r + stroke / 2}" cx="${mid}" cy="${mid}" fill="none" style="stroke:var(--surface)" stroke-width="0"/>
    <circle r="${r - stroke / 2}" cx="${mid}" cy="${mid}" fill="none" style="stroke:var(--surface)" stroke-width="0"/>
    <circle r="${r}" cx="${mid}" cy="${mid}" fill="none" style="stroke:var(--surface-2)" stroke-width="${stroke - 1.5}"/>
    ${arcs}</svg>`;
}

export function topSegments(cats, max = 5) {
  const segs = cats.map(c => ({ label: c.name, value: c.value, color: c.color, icon: c.icon }));
  if (segs.length <= max + 1) return segs;
  return [...segs.slice(0, max), { label: 'Everything else', value: sum(segs.slice(max), s => s.value), color: 'var(--ink-3)', icon: null }];
}

export function legend(segs) {
  const total = sum(segs, s => s.value) || 1;
  return `<ul class="legend">${segs.map(s => `
    <li><span class="dot" style="background:${s.color}"></span>
      <span class="lg-name">${esc(s.label)}</span>
      <span class="lg-val">${pct(s.value / total * 100)}</span></li>`).join('')}</ul>`;
}

/* ---------- shared bits ---------- */
export const empty = (name, title, text, btn = '') =>
  `<div class="empty"><span class="empty-ico">${icon(name, 26)}</span><strong>${title}</strong><p>${text}</p>${btn}</div>`;

export function txRow(t, withDate = false) {
  const c = cat(t.category), a = account(t.account);
  const meta = [withDate ? fmtDate(parse(t.date), { month: 'short', day: 'numeric' }) : '', c.name, a ? a.name : ''].filter(Boolean).join(' · ');
  return `<button class="tx${t.id === ui.flashId ? ' flash' : ''}" data-action="edit-tx" data-id="${t.id}">
    <span class="tx-ico" style="--c:${c.color}">${icon(c.icon)}</span>
    <span class="tx-main"><strong>${esc(t.note || c.name)}</strong><small>${esc(meta)}</small></span>
    <span class="amt ${t.type === 'income' ? 'inc' : 'exp'}">${t.type === 'income' ? '+' : '−'}${money(t.amount)}</span>
  </button>`;
}

export const progress = (p, state) => `<div data-state="${state}"><div class="progress"><span style="width:${clamp(p, 0, 100)}%"></span></div></div>`;

export function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}
