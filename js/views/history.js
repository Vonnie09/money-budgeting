/* History screen: day / week / month lists, search and filters. */
import { cat } from '../config.js';
import { icon } from '../icons.js';
import { $, addDays, endOfMonth, esc, fmtDate, parse, startOfMonth, startOfWeek } from '../utils.js';
import { money, signed } from '../money.js';
import { ui } from '../store.js';
import { account, sortTx, totals, txBetween } from '../queries.js';
import { empty, txRow } from '../components.js';

/* ----- Records ----- */
export function recordsRange() {
  const c = ui.cursor;
  if (ui.period === 'day') return [c, c, fmtDate(c, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })];
  if (ui.period === 'week') {
    const s = startOfWeek(c), e = addDays(s, 6);
    return [s, e, `${fmtDate(s, { month: 'short', day: 'numeric' })} – ${fmtDate(e, { month: 'short', day: 'numeric', year: 'numeric' })}`];
  }
  return [startOfMonth(c), endOfMonth(c), fmtDate(c, { month: 'long', year: 'numeric' })];
}

export function renderRecords() {
  const periods = { day: 'Day', week: 'Week', month: 'Month' };
  const types = { all: 'All', expense: 'Money out', income: 'Money in' };
  return `
  <div class="toolbar">
    <div class="seg" role="group" aria-label="Period">${Object.entries(periods).map(([k, v]) =>
      `<button class="${ui.period === k ? 'on' : ''}" data-action="period" data-p="${k}" aria-pressed="${ui.period === k}">${v}</button>`).join('')}</div>
    <div class="stepper">
      <button class="icon-btn sm" data-action="rec-step" data-dir="-1" aria-label="Previous">${icon('left', 18)}</button>
      <span id="rec-label"></span>
      <button class="icon-btn sm" data-action="rec-step" data-dir="1" aria-label="Next">${icon('right', 18)}</button>
    </div>
  </div>
  <div class="stat-strip" id="rec-sum"></div>
  <section class="card">
    <div class="filters">
      <label class="search">${icon('search', 18)}<input id="rec-q" class="input" type="search" enterkeyhint="search" placeholder="Search, e.g. lunch" value="${esc(ui.query)}" aria-label="Search history"></label>
      <div class="seg" role="group" aria-label="Type">${Object.entries(types).map(([k, v]) =>
        `<button class="${ui.type === k ? 'on' : ''}" data-action="rtype" data-t="${k}" aria-pressed="${ui.type === k}">${v}</button>`).join('')}</div>
    </div>
    <div id="rec-list"></div>
  </section>`;
}

export function fillRecords() {
  const [s, e, label] = recordsRange();
  let list = txBetween(s, e);
  const all = totals(list);
  if (ui.type !== 'all') list = list.filter(t => t.type === ui.type);
  const q = ui.query.trim().toLowerCase();
  if (q) list = list.filter(t => (t.note + ' ' + cat(t.category).name + ' ' + (account(t.account)?.name || '')).toLowerCase().includes(q));
  list = sortTx(list);

  $('#rec-label').textContent = label;
  $('#rec-sum').innerHTML = `
    <div><small>Money in</small><strong class="inc">+${money(all.income)}</strong></div>
    <div><small>Money out</small><strong>−${money(all.expense)}</strong></div>
    <div><small>Difference</small><strong>${signed(all.income - all.expense)}</strong></div>`;

  if (!list.length) {
    $('#rec-list').innerHTML = empty('list', q ? 'No matches' : 'Nothing here yet', q ? 'Try a different word.' : 'Entries you add for this period show up here.',
      `<button class="btn btn-primary sm" data-action="add">${icon('plus', 16)} Add entry</button>`);
    return;
  }
  const groups = new Map();
  for (const t of list) { if (!groups.has(t.date)) groups.set(t.date, []); groups.get(t.date).push(t); }
  $('#rec-list').innerHTML = [...groups].map(([date, items]) => {
    const d = parse(date), tt = totals(items);
    return `<div class="day-group">
      <div class="day-head"><span><b>${d.getDate()}</b>${fmtDate(d, { weekday: 'long', month: 'short' })}</span><span class="num">${signed(tt.income - tt.expense)}</span></div>
      ${items.map(t => txRow(t)).join('')}
    </div>`;
  }).join('');
}

export function afterRecords() {
  fillRecords();
  $('#rec-q').addEventListener('input', e => { ui.query = e.target.value; fillRecords(); });
}
