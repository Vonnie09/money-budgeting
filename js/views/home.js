/* Home screen and the first-visit welcome guide. */
import { ACCOUNT_TYPES, WELCOME_KEY } from '../config.js';
import { icon } from '../icons.js';
import { addDays, clamp, endOfMonth, esc, fmtDate, inkOn, startOfMonth, sum, today } from '../utils.js';
import { money, moneyShort, pct } from '../money.js';
import { db, mode, save, ui } from '../store.js';
import { accountBalance, billStatus, budgetRows, byCategory, insights, netWorth, sortTx, totals, txBetween } from '../queries.js';
import { donut, empty, legend, topSegments, txRow } from '../components.js';

/* =========================================================
   VIEWS
   ========================================================= */

export function showWelcome() {
  try { return !localStorage.getItem(WELCOME_KEY); } catch { return false; }
}
export function setWelcomeDone(done) {
  try { if (done) localStorage.setItem(WELCOME_KEY, '1'); else localStorage.removeItem(WELCOME_KEY); } catch { /* ignore */ }
}

export function welcomeCard() {
  const first = !ui.welcomeShown;
  ui.welcomeShown = true;
  return `<section class="card welcome${first ? ' first' : ''}">
    <div>
      <h2>Welcome to Money Manager</h2>
      <p>${mode === 'empty' ? 'You are in Empty State: a clean start for your own income and expenses.' : 'This demo is filled with sample data so you can try everything.'} Your changes stay on this device.</p>
    </div>
    <ol class="steps">
      <li><span><b>Add</b> what you spend or earn with the <b>+</b> button.</span></li>
      <li><span><b>Set budgets</b> to see how much you have left.</span></li>
      <li><span><b>Check Insights</b> for tips on where to save.</span></li>
    </ol>
    <button class="btn" data-action="dismiss-welcome">Got it</button>
  </section>`;
}

export function renderHome() {
  const t = today(), me = endOfMonth(t);
  const month = totals(txBetween(startOfMonth(t), me));
  const rows = budgetRows(t);
  const budgetTotal = sum(rows, r => r.limit), budgetSpent = sum(rows, r => r.spent);
  const left = budgetTotal - budgetSpent;
  const daysLeft = me.getDate() - t.getDate() + 1;
  const usedPct = budgetTotal ? budgetSpent / budgetTotal * 100 : 0;
  const usedState = usedPct >= 100 ? 'over' : usedPct >= 80 ? 'warn' : 'ok';
  const warnings = rows.filter(r => r.state !== 'ok').slice(0, 2);

  const segs = topSegments(byCategory(txBetween(addDays(t, -29), t)), 4);
  const spent30 = sum(segs, s => s.value);
  const dueSoon = db.bills.map(b => ({ b, s: billStatus(b) })).filter(x => x.s.state !== 'paid').sort((a, b) => a.s.days - b.s.days).slice(0, 3);
  const tips = insights();
  const tip = tips.length ? tips[t.getDate() % tips.length] : null;
  const recent = sortTx(db.tx).slice(0, 5);

  return `${showWelcome() ? welcomeCard() : ''}
  <div class="grid">
    <section class="card hero col-7">
      <div>
        <p class="hero-label">Total balance</p>
        <h2 class="hero-amount${money(netWorth()).length > 11 ? ' long' : ''}">${money(netWorth())}</h2>
      </div>
      <div class="hero-split">
        <div><span class="hs-ico in">${icon('arrowDown', 16)}</span><small>Money in this month</small><strong>+${money(month.income)}</strong></div>
        <div><span class="hs-ico out">${icon('arrowUp', 16)}</span><small>Money out this month</small><strong>−${money(month.expense)}</strong></div>
      </div>
      <div class="hero-actions">
        <button class="btn btn-primary" data-action="add-expense">${icon('minus', 18)} Add expense</button>
        <button class="btn btn-light" data-action="quick-income">${icon('plus', 18)} Add income</button>
      </div>
    </section>

    <section class="card col-5">
      <div class="card-head"><h2 class="card-title">Left to spend</h2><a class="link-btn" href="#/budgets">Budgets</a></div>
      ${budgetTotal ? `
        <p class="big-number">${left >= 0 ? money(left) : `−${money(-left)}`}</p>
        <p class="card-sub">${left >= 0
          ? `About <b>${money(Math.floor(left / daysLeft))}</b> a day for the next ${daysLeft} day${daysLeft === 1 ? '' : 's'}`
          : 'You went over your budget this month.'}</p>
        <div class="budget-bar" data-state="${usedState}"><div class="progress lg"><span style="width:${clamp(usedPct, 0, 100)}%"></span></div></div>
        <p class="card-sub">${money(budgetSpent)} of ${money(budgetTotal)} used</p>
        ${warnings.map(r => `<p class="note-line" data-state="${r.state}">${r.name} ${r.state === 'over' ? 'is over budget' : `is at ${pct(r.pct)} of its budget`}</p>`).join('')}`
      : empty('target', 'No budget yet', 'Set a monthly limit to see how much is left.', `<button class="btn btn-primary sm" data-action="new-budget">Set a budget</button>`)}
    </section>

    <section class="card col-6">
      <div class="card-head"><h2 class="card-title">Where your money went</h2><span class="card-sub">Last 30 days</span></div>
      ${segs.length ? `<div class="donut-row">
        <div class="donut-wrap">${donut(segs)}<div class="donut-center"><small>Spent</small><strong>${moneyShort(spent30)}</strong></div></div>
        ${legend(segs)}
      </div>` : empty('chart', 'Nothing spent yet', 'Add an expense and it will show up here.')}
    </section>

    <section class="card col-6">
      <div class="card-head"><h2 class="card-title">Bills due soon</h2><a class="link-btn" href="#/bills">All bills</a></div>
      ${dueSoon.length ? dueSoon.map(({ b, s }) => `
        <div class="mini-bill">
          <div class="mini-date"><small>${fmtDate(s.due, { month: 'short' })}</small><b>${s.due.getDate()}</b></div>
          <div class="tx-main"><strong>${esc(b.name)}</strong><small class="${s.state === 'overdue' ? 'bad-text' : ''}">${money(b.amount)} · ${s.label}</small></div>
          <button class="btn sm" data-action="pay-bill" data-id="${b.id}">Pay</button>
        </div>`).join('') : empty('check', 'All paid', 'Every bill is settled this month.')}
    </section>

    <section class="card col-4 insight-card">
      <h2 class="card-title">Tip for you</h2>
      ${tip ? `<p class="insight-big">${esc(tip.title)}</p><p>${esc(tip.text)}</p>` : '<p class="insight-big">Add a few entries to get tips.</p>'}
      <a class="btn sm" style="margin-top:16px" href="#/insights">More tips ${icon('right', 16)}</a>
    </section>

    <section class="card col-8">
      <div class="card-head"><h2 class="card-title">Recent activity</h2><a class="link-btn" href="#/records">See all</a></div>
      ${recent.length ? recent.map(r => txRow(r, true)).join('') : empty('receipt', 'Nothing here yet', 'Tap + to add your first expense.')}
    </section>

    <section class="card col-12">
      <div class="card-head"><h2 class="card-title">Money lists</h2><a class="link-btn" href="#/money">Open Money List</a></div>
      <div class="wallet-grid">
        ${db.accounts.map(a => `<button class="wallet" data-action="ml-open" data-id="${a.id}">
          <span class="acct-swatch" style="background:${a.color};--on:${inkOn(a.color)}">${icon(ACCOUNT_TYPES[a.type]?.icon || 'wallet', 22)}</span>
          <span class="tx-main"><strong>${esc(a.name)}</strong><small>${ACCOUNT_TYPES[a.type]?.label || 'Wallet'}</small></span>
          <span class="amt">${money(accountBalance(a))}</span>
        </button>`).join('')}
      </div>
    </section>
  </div>`;
}
