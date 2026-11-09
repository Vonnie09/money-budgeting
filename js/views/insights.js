/* Insights screen. */
import { CATEGORIES } from '../config.js';
import { icon } from '../icons.js';
import { addDays, addMonths, clamp, endOfMonth, esc, fmtDate, startOfMonth, today, ymd } from '../utils.js';
import { growth, money, pct } from '../money.js';
import { db, ui } from '../store.js';
import { byCategory, emergencyFund, insights, totals, txBetween } from '../queries.js';
import { empty } from '../components.js';

/* ----- Insights ----- */
export function renderInsights() {
  const t = today();
  const last30 = txBetween(addDays(t, -29), t), prev30 = txBetween(addDays(t, -59), addDays(t, -30));
  const e30 = totals(last30).expense, ePrev = totals(prev30).expense;
  const change = ePrev ? (e30 - ePrev) / ePrev * 100 : 0;
  const lm = addMonths(t, -1), lmT = totals(txBetween(startOfMonth(lm), endOfMonth(lm)));
  const rate = lmT.income ? (lmT.income - lmT.expense) / lmT.income * 100 : 0;
  const cats = byCategory(last30);
  const ef = emergencyFund();
  const efPct = ef.target ? clamp(ef.current / ef.target * 100, 0, 100) : 0;
  const efAccount = db.accounts.find(a => a.emergency);
  const tips = insights();

  // money in vs out, last 6 months
  const flow = Array.from({ length: 6 }, (_, i) => addMonths(t, i - 5)).map(m => ({ m, ...totals(txBetween(startOfMonth(m), endOfMonth(m))) }));
  const max = Math.max(1, ...flow.flatMap(f => [f.income, f.expense]));

  // spending calendar
  const m = ui.iMonth, ms = startOfMonth(m), me = endOfMonth(m);
  const perDay = {};
  for (const x of txBetween(ms, me)) if (x.type === 'expense') perDay[x.date] = (perDay[x.date] || 0) + x.amount;
  const dayMax = Math.max(1, ...Object.values(perDay));
  const cells = [];
  for (let k = 0; k < (ms.getDay() + 6) % 7; k++) cells.push('<span class="heat-cell blank"></span>');
  for (let d = 1; d <= me.getDate(); d++) {
    const date = new Date(m.getFullYear(), m.getMonth(), d), key = ymd(date), v = perDay[key] || 0;
    const future = date > t;
    const level = v ? clamp(Math.ceil(v / dayMax * 4), 1, 4) : 0;
    cells.push(`<button class="heat-cell ${future ? 'future' : ''} ${key === ymd(t) ? 'today' : ''}" data-l="${level}" ${future ? 'disabled' : `data-action="goto-day" data-d="${key}"`} title="${fmtDate(date, { month: 'short', day: 'numeric' })}: ${money(v)}">${d}</button>`);
  }

  // biggest changes by category
  const prevMap = Object.fromEntries(byCategory(prev30).map(c => [c.id, c.value]));
  const movers = CATEGORIES.expense.map(c => {
    const now = (cats.find(x => x.id === c.id) || {}).value || 0, before = prevMap[c.id] || 0;
    return { ...c, now, before, diff: now - before };
  }).filter(x => x.now || x.before).sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff)).slice(0, 5);

  return `<div class="grid">
    <section class="card col-12">
      <div class="card-head"><h2 class="card-title">For you</h2><span class="card-sub">Based on your last 30 days</span></div>
      ${tips.length ? `<div class="insight-rows">${tips.map(x => `<div class="insight" data-tone="${x.tone}">
          <span class="tx-ico">${icon(x.icon)}</span>
          <div><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></div>
        </div>`).join('')}</div>` : empty('sprout', 'No tips yet', 'Add a few entries and tips will appear here.')}
    </section>

    <section class="card col-12">
      <div class="kpis">
        <div class="kpi"><small>You spend per day</small><strong>${money(Math.round(e30 / 30))}</strong><span>average, last 30 days</span></div>
        <div class="kpi"><small>Compared with the 30 days before</small><strong class="${change <= 0 ? 'inc' : ''}">${!ePrev ? '—' : `${change <= 0 ? '↓' : '↑'} ${growth(e30, ePrev)} ${change <= 0 ? 'less' : 'more'}`}</strong><span>${money(e30)} vs ${money(ePrev)}</span></div>
        <div class="kpi"><small>You saved in ${fmtDate(lm, { month: 'long' })}</small><strong>${lmT.income ? pct(Math.max(rate, 0)) : '—'}</strong><span>of what you earned</span></div>
      </div>
    </section>

    <section class="card col-7">
      <div class="card-head">
        <h2 class="card-title">Money in vs money out</h2>
        <div class="chart-legend"><span><i style="background:var(--ink)"></i>In</span><span><i style="background:var(--accent)"></i>Out</span></div>
      </div>
      ${flow.every(f => !f.income && !f.expense) ? empty('chart', 'No history yet', 'Your monthly totals will show up here.') : `<div class="bars">
        ${flow.map((f, i) => `<div class="bar-col ${i === 5 ? 'current' : ''}">
          <div class="bar-pair">
            <span class="bar inc" style="height:${f.income / max * 100}%" title="Money in ${money(f.income)}"></span>
            <span class="bar exp" style="height:${f.expense / max * 100}%" title="Money out ${money(f.expense)}"></span>
          </div>
          <span class="bar-label">${fmtDate(f.m, { month: 'short' })}</span>
        </div>`).join('')}
      </div>`}
    </section>

    <section class="card col-5">
      <div class="card-head"><h2 class="card-title">Emergency fund</h2>${ef.monthly ? `<span class="pill ${ef.months >= 3 ? 'good' : 'warn'}">${ef.months.toFixed(1)} months</span>` : ''}</div>
      <p class="big-number">${money(ef.current)}</p>
      <p class="card-sub">Savings for surprises like a hospital bill or losing your job. ${ef.monthly ? `A good goal is 6 months of spending: <b>${money(Math.round(ef.target))}</b>.` : 'Once you have a month of spending recorded, we will suggest a goal.'}</p>
      <div class="budget-bar" data-state="${efPct >= 50 ? 'ok' : 'warn'}"><div class="progress lg"><span style="width:${efPct}%"></span></div></div>
      ${efAccount ? `<button class="btn sm" data-action="ef-add" data-id="${efAccount.id}">${icon('plus', 16)} Add money to it</button>` : ''}
    </section>

    <section class="card col-7">
      <div class="card-head">
        <h2 class="card-title">Spending calendar</h2>
        <div class="stepper">
          <button class="icon-btn sm" data-action="i-step" data-dir="-1" aria-label="Previous month">${icon('left', 16)}</button>
          <span style="min-width:110px;font-size:15px">${fmtDate(m, { month: 'short', year: 'numeric' })}</span>
          <button class="icon-btn sm" data-action="i-step" data-dir="1" aria-label="Next month">${icon('right', 16)}</button>
        </div>
      </div>
      <p class="card-sub" style="margin-bottom:12px">Darker days are days you spent more. Tap a day to see what you bought.</p>
      <div class="heat-head">${['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => `<span>${d}</span>`).join('')}</div>
      <div class="heat">${cells.join('')}</div>
    </section>

    <section class="card col-5">
      <div class="card-head"><h2 class="card-title">What changed</h2><span class="card-sub">vs the 30 days before</span></div>
      ${movers.length ? movers.map(x => {
        const p = x.before ? x.diff / x.before * 100 : 100;
        return `<div class="mover">
          <span class="tx-ico" style="--c:${x.color}">${icon(x.icon)}</span>
          <div class="tx-main"><strong>${x.name}</strong><small>${money(x.before)} → ${money(x.now)}</small></div>
          <span class="delta ${x.diff > 0 ? 'up' : 'down'}">${x.diff > 0 ? '↑' : '↓'} ${pct(Math.abs(p))}</span>
        </div>`;
      }).join('') : empty('chart', 'Not enough data', 'Keep adding entries to see trends.')}
    </section>

    <section class="card col-12">
      <div class="card-head"><h2 class="card-title">Simple ways to spend smarter</h2></div>
      <ol class="tips">
        <li><span><b>Save first.</b> On payday, move your savings to a separate wallet before you spend anything.</span></li>
        <li><span><b>Wait a day.</b> Before buying something you don't need that costs over ${money(1000)}, sleep on it.</span></li>
        <li><span><b>Check your subscriptions.</b> Cancel any you haven't used in the last month.</span></li>
        <li><span><b>Write it down right away.</b> Entries you add later are easy to forget.</span></li>
      </ol>
    </section>
  </div>`;
}
