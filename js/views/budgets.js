/* Budgets screen. */
import { CATEGORIES } from '../config.js';
import { icon } from '../icons.js';
import { clamp, endOfMonth, fmtDate, sameMonth, startOfMonth, sum, today } from '../utils.js';
import { money, pct, plural } from '../money.js';
import { db, ui } from '../store.js';
import { budgetRows, byCategory, txBetween } from '../queries.js';
import { empty, progress } from '../components.js';

/* ----- Budgets ----- */
export function renderBudgets() {
  const m = ui.bMonth, t = today();
  const rows = budgetRows(m);
  const total = sum(rows, r => r.limit), spent = sum(rows, r => r.spent);
  const isNow = sameMonth(m, t);
  const daysLeft = isNow ? endOfMonth(t).getDate() - t.getDate() + 1 : 0;
  const totalPct = total ? spent / total * 100 : 0;
  const totalState = totalPct >= 100 ? 'over' : totalPct >= 80 ? 'warn' : 'ok';

  const spentBy = byCategory(txBetween(startOfMonth(m), endOfMonth(m)));
  const unbudgeted = spentBy.filter(c => db.budgets[c.id] == null);
  const free = CATEGORIES.expense.filter(c => db.budgets[c.id] == null);

  return `
  <div class="toolbar">
    <div class="stepper">
      <button class="icon-btn sm" data-action="b-step" data-dir="-1" aria-label="Previous month">${icon('left', 18)}</button>
      <span>${fmtDate(m, { month: 'long', year: 'numeric' })}</span>
      <button class="icon-btn sm" data-action="b-step" data-dir="1" aria-label="Next month">${icon('right', 18)}</button>
    </div>
    ${free.length ? `<button class="btn btn-primary" data-action="new-budget">${icon('plus', 18)} New budget</button>` : ''}
  </div>

  <div class="stack">
    ${rows.length ? `<section class="card">
      <div class="kpis">
          <div class="kpi"><small>Monthly budget</small><strong>${money(total)}</strong></div>
          <div class="kpi"><small>Spent so far</small><strong>${money(spent)}</strong></div>
          <div class="kpi"><small>${total - spent >= 0 ? 'Left' : 'Over by'}</small><strong class="${total - spent >= 0 ? 'inc' : ''}">${money(Math.abs(total - spent))}</strong></div>
          ${isNow && total - spent > 0 ? `<div class="kpi"><small>You can spend</small><strong>${money(Math.floor((total - spent) / daysLeft))}</strong><span>a day for ${plural(daysLeft, 'day')}</span></div>` : ''}
      </div>
      <div class="budget-bar" data-state="${totalState}"><div class="progress lg"><span style="width:${clamp(totalPct, 0, 100)}%"></span></div></div>
      <p class="card-sub">${pct(totalPct)} of this month's budget used</p>
    </section>` : ''}

    ${rows.length ? `<div class="budget-list">${rows.map(r => `
      <article class="card budget-card" data-state="${r.state}">
        ${r.state === 'over' ? '<span class="stamp over">Over</span>' : ''}
        <div class="b-head">
          <span class="tx-ico" style="--c:${r.color}">${icon(r.icon)}</span>
          <div class="b-name"><strong>${r.name}</strong><small>${money(r.limit)} monthly</small></div>
          <button class="icon-btn sm ghost" data-action="edit-budget" data-cat="${r.id}" aria-label="Edit ${r.name} budget">${icon('edit', 18)}</button>
        </div>
        <div class="b-amt">${money(r.spent)} <small>spent</small></div>
        ${progress(r.pct, r.state)}
        <div class="b-foot">
          <span>${r.state === 'over' ? `Over by <b>${money(r.spent - r.limit)}</b>` : `<b>${money(r.limit - r.spent)}</b> left`}</span>
          <span class="pill ${r.state === 'over' ? 'bad' : r.state === 'warn' ? 'warn' : 'good'}">${r.pct >= 1000 ? '999%+' : pct(r.pct)}</span>
        </div>
      </article>`).join('')}</div>`
    : `<section class="card">${empty('target', 'No budgets yet', 'Create a budget for the categories you spend most on.', `<button class="btn btn-primary sm" data-action="new-budget">Create budget</button>`)}</section>`}

    ${unbudgeted.length ? `<section class="card">
      <div class="card-head"><h2 class="card-title">Spending without a budget</h2></div>
      <p class="card-sub" style="margin-bottom:12px">These categories had spending this month but no limit. Tap one to set a budget.</p>
      <div class="chip-row">${unbudgeted.map(c => `<button class="chip" data-action="edit-budget" data-cat="${c.id}">${c.name} · ${money(c.value)}</button>`).join('')}</div>
    </section>` : ''}
  </div>`;
}
