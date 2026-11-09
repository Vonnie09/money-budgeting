/* Bills screen. */
import { cat } from '../config.js';
import { icon } from '../icons.js';
import { esc, fmtDate, sum, today } from '../utils.js';
import { money } from '../money.js';
import { db, ui } from '../store.js';
import { account, billStatus } from '../queries.js';
import { empty } from '../components.js';

/* ----- Bills ----- */
export function renderBills() {
  const t = today();
  const items = db.bills.map(b => ({ b, s: billStatus(b) })).sort((x, y) => x.b.dueDay - y.b.dueDay);
  const total = sum(items, x => x.b.amount);
  const paid = sum(items.filter(x => x.s.state === 'paid'), x => x.b.amount);

  return `
  <div class="toolbar">
    <p class="muted">${fmtDate(t, { month: 'long', year: 'numeric' })}${items.length ? ` · ${items.filter(x => x.s.state === 'paid').length} of ${items.length} paid` : ''}</p>
    <button class="btn btn-primary" data-action="new-bill">${icon('plus', 18)} New bill</button>
  </div>
  ${items.length ? `<div class="stat-strip">
    <div><small>Bills this month</small><strong>${money(total)}</strong></div>
    <div><small>Paid</small><strong class="inc">${money(paid)}</strong></div>
    <div><small>Still to pay</small><strong>${money(total - paid)}</strong></div>
  </div>` : ''}
  ${items.length ? `<div class="bill-list">${items.map(({ b, s }) => {
    const c = cat(b.category), a = account(b.account);
    return `<article class="bill" data-state="${s.state}">
      <div class="bill-date"><small>${fmtDate(s.due, { month: 'short' })}</small><b>${s.due.getDate()}</b></div>
      ${s.state === 'paid' ? `<span class="stamp${b.id === ui.stampId ? ' fresh' : ''}">${icon('check', 14)} Paid</span>` : s.state === 'overdue' ? '<span class="stamp over">Overdue</span>' : ''}
      <div class="bill-body">
        <div class="bill-top">
          <div style="min-width:0"><strong class="bill-name">${esc(b.name)}</strong><small>${c.name}${a ? ' · ' + esc(a.name) : ''}</small></div>
          <button class="icon-btn sm ghost" data-action="edit-bill" data-id="${b.id}" aria-label="Edit ${esc(b.name)}">${icon('edit', 18)}</button>
        </div>
        <div class="bill-foot">
          <span class="amt">${money(b.amount)}</span>
          ${s.state === 'paid'
            ? `<button class="btn sm" data-action="unpay-bill" data-id="${b.id}" aria-label="Undo payment for ${esc(b.name)}">Undo</button>`
            : `<span class="pill ${s.state === 'overdue' ? 'bad' : s.state === 'soon' ? 'warn' : ''}">${s.label}</span>
               <button class="btn btn-primary sm" data-action="pay-bill" data-id="${b.id}">Mark paid</button>`}
        </div>
      </div>
    </article>`;
  }).join('')}</div>`
  : `<section class="card">${empty('receipt', 'No bills yet', 'Add rent, utilities and subscriptions so you never miss a due date.')}</section>`}`;
}
