/* Add / edit / delete an income or expense entry. */
import { CATEGORIES, expenseCats } from '../config.js';
import { icon } from '../icons.js';
import { $, $$, addDays, esc, fmtDate, parse, round2, today, uid, ymd } from '../utils.js';
import { currencySymbol, evaluate, groupDigits, money, pct } from '../money.js';
import { db, ui } from '../store.js';
import { account, budgetRows } from '../queries.js';
import { commit } from '../render.js';
import { closeModal, modalHead, openModal } from '../ui/modal.js';
import { buzz, toast } from '../ui/toast.js';

/* ----- transaction form ----- */
export function catChips(type, selected) {
  const list = type === 'expense' ? expenseCats() : CATEGORIES.income;
  const sel = list.some(c => c.id === selected) ? selected : list[0].id;
  return list.map(c => `<label class="cat-chip" style="--c:${c.color}">
    <input type="radio" name="category" value="${c.id}" ${c.id === sel ? 'checked' : ''}>
    <span class="cat-emoji">${icon(c.icon, 22)}</span><span>${c.name}</span></label>`).join('');
}

export function dayLabel(s) {
  if (!s) return 'Today';
  const d = parse(s), t = today();
  if (ymd(d) === ymd(t)) return 'Today';
  if (ymd(d) === ymd(addDays(t, -1))) return 'Yesterday';
  return fmtDate(d, { month: 'short', day: 'numeric', year: d.getFullYear() === t.getFullYear() ? undefined : 'numeric' });
}

export function openTx(id, preset = {}) {
  const t = id ? db.tx.find(x => x.id === id) : null;
  if (id && !t) return;
  const d = t ? { ...t } : {
    type: preset.type || 'expense',
    amount: preset.amount ?? '',
    category: preset.category || (preset.type === 'income' ? 'salary' : 'food'),
    account: preset.account || db.accounts[0]?.id,
    date: preset.date || ymd(today()),
    note: preset.note || '',
  };
  const m = openModal(`${modalHead(t ? 'Edit entry' : 'New entry')}
    <form id="tx-form" class="form" data-id="${t ? t.id : ''}" autocomplete="off" novalidate>
      <div class="seg wide" role="radiogroup" aria-label="Type">
        ${['expense', 'income'].map(ty => `<input type="radio" name="type" id="ty-${ty}" value="${ty}" ${d.type === ty ? 'checked' : ''}><label for="ty-${ty}">${ty === 'expense' ? 'Expense' : 'Income'}</label>`).join('')}
      </div>
      <div class="amount-field">
        <span class="cur">${currencySymbol()}</span>
        <input name="amount" class="amount-input" inputmode="decimal" enterkeyhint="done" placeholder="0" value="${groupDigits(d.amount)}" data-money aria-label="Amount" data-autofocus>
        <button type="button" class="icon-btn sm" data-action="calc-into" aria-label="Open calculator" title="Calculator">${icon('calc', 18)}</button>
      </div>
      <div>
        <p class="field-label">Category</p>
        <div class="cat-grid" id="cat-grid">${catChips(d.type, d.category)}</div>
      </div>
      <label class="field"><span>Note <span class="opt">(optional)</span></span>
        <input name="note" class="input" maxlength="60" enterkeyhint="done" placeholder="e.g. Lunch with friends" value="${esc(d.note)}">
      </label>
      <details class="more">
        <summary><span class="more-sum">${icon('calendar', 16)}<span id="sum-date"></span>${icon('wallet', 16)}<span id="sum-acct"></span></span><span class="more-change">Change</span></summary>
        <div class="row2" style="margin-top:12px">
          <label class="field">Date<input type="date" name="date" class="input" value="${d.date}" required></label>
          <label class="field">Money list
            <select name="account" class="input">${db.accounts.map(a => `<option value="${a.id}" ${a.id === d.account ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select>
          </label>
        </div>
      </details>
      <div class="form-actions">
        ${t ? `<button type="button" class="btn btn-danger" data-action="delete-tx" data-id="${t.id}">${icon('trash', 18)} Delete</button>` : ''}
        <button type="submit" class="btn btn-primary btn-big">${icon('check', 18)} Save</button>
      </div>
    </form>`);
  const form = $('#tx-form', m);
  const sync = () => {
    $('#sum-date', m).textContent = dayLabel(form.date.value);
    $('#sum-acct', m).textContent = form.account.selectedOptions[0]?.textContent || '';
  };
  form.date.addEventListener('change', sync);
  form.account.addEventListener('change', sync);
  sync();
  // a category whose budget takes money from a list pre-selects that list
  const followBudget = () => {
    const c = form.querySelector('input[name="category"]:checked')?.value;
    const from = db.budgetFrom[c];
    if (!t && form.querySelector('input[name="type"]:checked').value === 'expense' && from && account(from)) {
      form.account.value = from;
      sync();
    }
  };
  $('#cat-grid', m).addEventListener('change', followBudget);
  if (!preset.account) followBudget();
  $$('input[name="type"]', m).forEach(r => r.addEventListener('change', () => {
    const grid = $('#cat-grid', m);
    grid.innerHTML = catChips(r.value, null);
    grid.classList.remove('swap'); void grid.offsetWidth; grid.classList.add('swap');
  }));
}

export function saveTx(form) {
  const f = new FormData(form);
  const amount = evaluate(f.get('amount'));
  if (!amount || amount <= 0) {
    const field = form.querySelector('.amount-field');
    field.classList.remove('shake'); void field.offsetWidth; field.classList.add('shake');
    toast('Enter an amount greater than zero', 'warn');
    form.amount.focus();
    return;
  }
  const rec = {
    type: f.get('type'),
    amount: round2(amount),
    category: f.get('category'),
    account: f.get('account'),
    date: f.get('date') || ymd(today()),
    note: String(f.get('note') || '').trim(),
  };
  const id = form.dataset.id;
  if (id) Object.assign(db.tx.find(t => t.id === id), rec);
  else db.tx.push({ id: uid(), ts: Date.now(), ...rec });
  ui.flashId = id || db.tx[db.tx.length - 1].id;
  closeModal();
  commit();
  buzz();
  toast(id ? 'Entry updated' : `${rec.type === 'expense' ? 'Expense' : 'Income'} of ${money(rec.amount)} saved`, 'good');
  if (rec.type === 'expense') budgetCheck(rec);
}

export function budgetCheck(rec) {
  const row = budgetRows(parse(rec.date)).find(r => r.id === rec.category);
  if (!row) return;
  const before = (row.spent - rec.amount) / row.limit * 100;
  setTimeout(() => {
    if (row.pct >= 100 && before < 100) toast(`${row.name} is now over budget by ${money(row.spent - row.limit)}`, 'bad');
    else if (row.pct >= 80 && before < 80) toast(`Heads up: ${row.name} is at ${pct(row.pct)} of its budget`, 'warn');
  }, 450);
}

export function deleteTx(id) {
  const i = db.tx.findIndex(t => t.id === id);
  if (i < 0) return;
  const [removed] = db.tx.splice(i, 1);
  if (removed.billId) {
    const b = db.bills.find(x => x.id === removed.billId);
    if (b) b.paid = b.paid.filter(k => k !== removed.billMonth);
  }
  closeModal();
  commit();
  toast('Entry deleted', 'info', {
    action: { label: 'Undo', fn: () => {
      db.tx.splice(i, 0, removed);
      if (removed.billId) db.bills.find(x => x.id === removed.billId)?.paid.push(removed.billMonth);
      commit();
    } },
  });
}
