/* Create, edit, pay and un-pay bills. */
import { expenseCats } from '../config.js';
import { icon } from '../icons.js';
import { clamp, esc, monthKey, round2, today, uid, ymd } from '../utils.js';
import { evaluate, groupDigits, money } from '../money.js';
import { db, ui } from '../store.js';
import { commit } from '../render.js';
import { closeModal, modalHead, openModal } from '../ui/modal.js';
import { budgetCheck } from './entry.js';
import { buzz, toast } from '../ui/toast.js';

/* ----- bill form ----- */
export function openBill(id) {
  const b = id ? db.bills.find(x => x.id === id) : null;
  const d = b || { name: '', amount: '', dueDay: today().getDate(), category: 'bills', account: db.accounts[0]?.id };
  openModal(`${modalHead(b ? 'Edit bill' : 'New bill')}
    <form id="bill-form" class="form" data-id="${b ? b.id : ''}" novalidate>
      <label class="field">Name<input name="name" class="input" maxlength="40" value="${esc(d.name)}" placeholder="e.g. Internet" data-autofocus></label>
      <div class="row2">
        <label class="field">Amount<input name="amount" class="input" inputmode="decimal" value="${groupDigits(d.amount)}" placeholder="0" data-money></label>
        <label class="field">Due day of month<input name="dueDay" class="input" type="number" inputmode="numeric" min="1" max="31" value="${d.dueDay}"></label>
      </div>
      <div class="row2">
        <label class="field">Category<select name="category" class="input">${expenseCats().map(c => `<option value="${c.id}" ${c.id === d.category ? 'selected' : ''}>${c.name}</option>`).join('')}</select></label>
        <label class="field">Pay from<select name="account" class="input">${db.accounts.map(a => `<option value="${a.id}" ${a.id === d.account ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select></label>
      </div>
      <div class="form-actions">
        ${b ? `<button type="button" class="btn btn-danger" data-action="delete-bill" data-id="${b.id}">${icon('trash', 18)} Delete</button>` : ''}
        <span class="spacer"></span>
        <button type="button" class="btn" data-action="close-modal">Cancel</button>
        <button type="submit" class="btn btn-primary">${icon('check', 18)} Save</button>
      </div>
    </form>`, { cls: 'narrow' });
}

export function saveBill(form) {
  const name = form.name.value.trim();
  const amount = evaluate(form.amount.value);
  const dueDay = clamp(parseInt(form.dueDay.value, 10) || 1, 1, 31);
  if (!name) { toast('Give the bill a name', 'warn'); form.name.focus(); return; }
  if (!amount || amount <= 0) { toast('Enter an amount greater than zero', 'warn'); form.amount.focus(); return; }
  const rec = { name, amount: round2(amount), dueDay, category: form.category.value, account: form.account.value };
  const id = form.dataset.id;
  if (id) Object.assign(db.bills.find(b => b.id === id), rec);
  else db.bills.push({ id: uid(), paid: [], ...rec });
  closeModal();
  commit();
  toast(id ? 'Bill updated' : `${name} added to your bills`, 'good');
}

export function payBill(id) {
  const b = db.bills.find(x => x.id === id);
  if (!b) return;
  const key = monthKey(today());
  db.tx.push({ id: uid(), ts: Date.now(), type: 'expense', amount: b.amount, category: b.category, account: b.account, date: ymd(today()), note: b.name, billId: b.id, billMonth: key });
  b.paid.push(key);
  ui.stampId = b.id;
  commit();
  buzz();
  toast(`${b.name} paid · ${money(b.amount)} recorded`, 'good');
  budgetCheck({ date: ymd(today()), category: b.category, amount: b.amount });
}

export function unpayBill(id) {
  const b = db.bills.find(x => x.id === id);
  if (!b) return;
  const key = monthKey(today());
  b.paid = b.paid.filter(k => k !== key);
  db.tx = db.tx.filter(t => !(t.billId === id && t.billMonth === key));
  commit();
  toast(`${b.name} marked as unpaid`, 'info');
}
