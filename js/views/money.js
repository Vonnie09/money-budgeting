/* Money List screen: each list (wallet) as a ledger with a running balance. */
import { ACCOUNT_TYPES, CATEGORIES, cat, expenseCats } from '../config.js';
import { icon } from '../icons.js';
import { $, $$, esc, fmtDate, inkOn, parse, today, ymd } from '../utils.js';
import { money } from '../money.js';
import { db, ui } from '../store.js';
import { accountBalance, budgetRows, freeToSpend, listLines, listReserve } from '../queries.js';
import { empty } from '../components.js';

// Category options for the quick-add row: spending categories or money-in sources.
export function lineCategories(kind, selected) {
  const list = kind === 'in' ? CATEGORIES.income : expenseCats();
  const sel = list.some(c => c.id === selected) ? selected : (kind === 'in' ? 'cashin' : 'other');
  return list.map(c => `<option value="${c.id}" ${c.id === sel ? 'selected' : ''}>${esc(c.name)}</option>`).join('');
}

export function renderMoney() {
  const lists = db.accounts;
  if (!lists.length) {
    return `<section class="card">${empty('wallet', 'No money lists yet', 'Make one for your cash on hand, a bank account or an e-wallet.', `<button class="btn btn-primary sm" data-action="new-account">${icon('plus', 16)} New list</button>`)}</section>`;
  }
  const a = lists.find(x => x.id === ui.listId) || lists[0];
  ui.listId = a.id;
  const lines = listLines(a);
  const shown = ui.mlAll ? lines : lines.slice(-40);
  const balance = accountBalance(a), reserved = listReserve(a.id), free = balance - reserved;
  const funded = budgetRows(today()).filter(r => r.from === a.id);
  const dateLabel = s => fmtDate(parse(s), { month: 'short', day: 'numeric' });

  return `<div class="ml-layout">
    <aside class="ml-lists" aria-label="Money lists">
      ${lists.map(x => `<button class="ml-pick${x.id === a.id ? ' on' : ''}" data-action="ml-pick" data-id="${x.id}" aria-pressed="${x.id === a.id}">
        <span class="acct-swatch" style="background:${x.color};--on:${inkOn(x.color)}">${icon(ACCOUNT_TYPES[x.type]?.icon || 'wallet', 20)}</span>
        <span class="tx-main"><strong>${esc(x.name)}</strong><small>${money(freeToSpend(x))} free to spend</small></span>
        <span class="amt">${money(accountBalance(x))}</span>
      </button>`).join('')}
      <button class="btn wide" data-action="new-account">${icon('plus', 16)} New list</button>
    </aside>

    <section class="card ml-ledger">
      <div class="ml-head">
        <div>
          <p class="card-sub">${ACCOUNT_TYPES[a.type]?.label || 'Money list'}</p>
          <h2>${esc(a.name)}</h2>
        </div>
        <button class="btn sm" data-action="edit-account" data-id="${a.id}">${icon('edit', 16)} Edit list</button>
      </div>

      <div class="ml-totals">
        <div><small>Balance</small><strong>${money(balance)}</strong></div>
        <div><small>Set aside for budgets</small><strong>${money(reserved)}</strong></div>
        <div><small>Free to spend</small><strong class="${free < 0 ? 'bad-text' : 'inc'}">${money(free)}</strong></div>
      </div>

      ${funded.length ? `<div class="ml-funded">
        <p class="field-label">Budgets taking money from this list</p>
        ${funded.map(r => `<a class="ml-fund" href="#/budgets">
          <span class="tx-ico" style="--c:${r.color}">${icon(r.icon, 18)}</span>
          <span class="tx-main"><strong>${esc(r.name)}</strong><small>${money(r.spent)} used of ${money(r.limit)}</small></span>
          <span class="amt">${money(Math.max(r.limit - r.spent, 0))} left</span>
        </a>`).join('')}
      </div>` : ''}

      <form id="ml-form" class="ml-form" data-id="${a.id}" autocomplete="off" novalidate>
        <div class="seg" role="radiogroup" aria-label="Add or spend">
          <input type="radio" name="kind" id="mk-out" value="out" checked><label for="mk-out">− Spend</label>
          <input type="radio" name="kind" id="mk-in" value="in"><label for="mk-in">+ Add money</label>
        </div>
        <input name="amount" class="input" inputmode="decimal" enterkeyhint="next" placeholder="e.g. 200 or -200" aria-label="Amount" data-money>
        <input name="note" class="input" maxlength="60" enterkeyhint="done" placeholder="What for? e.g. T-shirt" aria-label="What for">
        <select name="category" class="input" aria-label="Category">${lineCategories('out')}</select>
        <input type="date" name="date" class="input" value="${ymd(today())}" aria-label="Date">
        <button type="submit" class="btn btn-primary">${icon('plus', 18)} Add line</button>
      </form>

      <div class="ml-table" role="table" aria-label="${esc(a.name)} lines">
        <div class="ml-table-head" role="row"><span>Date</span><span>What</span><span>Amount</span><span>Balance</span></div>
        ${shown.slice().reverse().map(({ t, balance: after }) => {
          const c = cat(t.category);
          return `<button class="ml-row${t.id === ui.flashId ? ' flash' : ''}" data-action="edit-tx" data-id="${t.id}" role="row">
            <span class="ml-date">${dateLabel(t.date)}</span>
            <span class="tx-main"><strong>${esc(t.note || c.name)}</strong><small>${esc(c.name)}<span class="ml-date-sm"> · ${dateLabel(t.date)}</span></small></span>
            <span class="amt ${t.type === 'income' ? 'inc' : 'exp'}">${t.type === 'income' ? '+' : '−'}${money(t.amount)}</span>
            <span class="ml-bal">${money(after)}</span>
          </button>`;
        }).join('')}
        ${lines.length > shown.length
          ? `<button class="ml-more" data-action="ml-all">Show all ${lines.length} lines</button>`
          : `<div class="ml-row start" role="row">
              <span class="ml-date">Start</span>
              <span class="tx-main"><strong>Starting balance</strong><small>Set when the list was made</small></span>
              <span class="amt">${money(a.start)}</span>
              <span class="ml-bal">${money(a.start)}</span>
            </div>`}
      </div>
    </section>
  </div>`;
}

export function afterMoney() {
  const form = $('#ml-form');
  if (!form) return;
  // switching between Spend and Add money swaps the category list
  $$('input[name="kind"]', form).forEach(r => r.addEventListener('change', () => {
    form.category.innerHTML = lineCategories(r.value);
  }));
  // typing a sign picks the side: "-200" spends, "+10000" adds
  form.amount.addEventListener('input', () => {
    const sign = form.amount.value.trim()[0];
    const kind = sign === '-' || sign === '−' ? 'out' : sign === '+' ? 'in' : null;
    if (kind && form.kind.value !== kind) {
      form.querySelector(`#mk-${kind}`).checked = true;
      form.category.innerHTML = lineCategories(kind);
    }
  });
}
