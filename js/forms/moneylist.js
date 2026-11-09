/* Add a + or − line to a money list. Each line is a normal entry, so it also
   shows in History, totals and budgets. */
import { incomeCats } from '../config.js';
import { $, round2, uid, ymd, today } from '../utils.js';
import { evaluate, money } from '../money.js';
import { db, ui } from '../store.js';
import { account, accountBalance } from '../queries.js';
import { commit } from '../render.js';
import { buzz, toast } from '../ui/toast.js';
import { budgetCheck } from './entry.js';

export function saveListLine(form) {
  const raw = form.amount.value.trim();
  const value = evaluate(raw);
  if (value == null || value === 0) {
    toast('Enter an amount, like 200 or -200', 'warn');
    form.amount.focus();
    return;
  }
  const kind = /^[-−]/.test(raw) ? 'out' : /^\+/.test(raw) ? 'in' : form.kind.value;
  const type = kind === 'in' ? 'income' : 'expense';
  // a sign typed after picking a category can flip the side: fall back to a matching category
  let category = form.category.value;
  const isIncomeCategory = incomeCats().some(c => c.id === category);
  if ((type === 'income') !== isIncomeCategory) category = type === 'income' ? 'cashin' : 'other';
  const rec = {
    id: uid(), ts: Date.now(), type,
    amount: round2(Math.abs(value)),
    category,
    account: form.dataset.id,
    date: form.date.value || ymd(today()),
    note: form.note.value.trim(),
  };
  db.tx.push(rec);
  ui.flashId = rec.id;
  commit();
  buzz();
  const list = account(rec.account);
  toast(`${type === 'income' ? '+' : '−'}${money(rec.amount)} ${type === 'income' ? 'to' : 'from'} ${list.name} · balance ${money(accountBalance(list))}`, 'good');
  if (type === 'expense') budgetCheck(rec);
  $('#ml-form [name="amount"]')?.focus({ preventScroll: true });
}
