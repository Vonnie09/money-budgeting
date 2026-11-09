/* Create and edit budgets. */
import { CATEGORIES, cat } from '../config.js';
import { icon } from '../icons.js';
import { $, round2 } from '../utils.js';
import { evaluate, groupDigits, money } from '../money.js';
import { db } from '../store.js';
import { avgMonthlySpend } from '../queries.js';
import { commit } from '../render.js';
import { closeModal, modalHead, openModal } from '../ui/modal.js';
import { toast } from '../ui/toast.js';

/* ----- budget form ----- */
export function openBudget(catId) {
  const editing = catId && db.budgets[catId] != null;
  const options = CATEGORIES.expense.filter(c => c.id === catId || db.budgets[c.id] == null);
  if (!options.length) { toast('Every category already has a budget', 'info'); return; }
  const sel = catId || options[0].id;
  const suggestion = id => {
    const avg = avgMonthlySpend(id, 3);
    return avg ? `You spent about <b>${money(Math.round(avg))}</b>/month on this over the last 3 months.` : 'No spending history yet for this category.';
  };
  const m = openModal(`${modalHead(editing ? 'Edit budget' : 'New budget')}
    <form id="budget-form" class="form" data-editing="${editing ? catId : ''}" novalidate>
      <label class="field">Category
        <select name="category" class="input" ${editing ? 'disabled' : ''}>${options.map(c => `<option value="${c.id}" ${c.id === sel ? 'selected' : ''}>${c.name}</option>`).join('')}</select>
      </label>
      <label class="field">Monthly limit
        <input name="limit" class="input" inputmode="decimal" enterkeyhint="done" value="${editing ? groupDigits(db.budgets[catId]) : ''}" placeholder="e.g. 5,000" data-money data-autofocus>
      </label>
      <p class="hint" id="budget-hint">${suggestion(sel)}</p>
      <div class="form-actions">
        ${editing ? `<button type="button" class="btn btn-danger" data-action="remove-budget" data-cat="${catId}">${icon('trash', 18)} Remove</button>` : ''}
        <span class="spacer"></span>
        <button type="button" class="btn" data-action="close-modal">Cancel</button>
        <button type="submit" class="btn btn-primary">${icon('check', 18)} Save</button>
      </div>
    </form>`, { cls: 'narrow' });
  $('select[name="category"]', m).addEventListener('change', e => { $('#budget-hint', m).innerHTML = suggestion(e.target.value); });
}

export function saveBudget(form) {
  const id = form.dataset.editing || form.category.value;
  const limit = evaluate(form.limit.value);
  if (!limit || limit <= 0) { toast('Enter a limit greater than zero', 'warn'); form.limit.focus(); return; }
  db.budgets[id] = round2(limit);
  closeModal();
  commit();
  toast(`${cat(id).name} budget set to ${money(limit)}`, 'good');
}
