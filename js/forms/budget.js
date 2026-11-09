/* Create and edit budgets. */
import { cat, expenseCats } from '../config.js';
import { icon } from '../icons.js';
import { $, esc, round2, today } from '../utils.js';
import { evaluate, groupDigits, money } from '../money.js';
import { customCategory, db } from '../store.js';
import { account, avgMonthlySpend, budgetRows, freeToSpend } from '../queries.js';
import { commit } from '../render.js';
import { closeModal, modalHead, openModal } from '../ui/modal.js';
import { toast } from '../ui/toast.js';

/* ----- budget form ----- */
export function openBudget(catId) {
  const editing = catId && db.budgets[catId] != null;
  // "Others" stays available so you can always make a budget with your own name
  const options = expenseCats().filter(c => c.id === catId || db.budgets[c.id] == null || (!editing && c.id === 'other'));
  const sel = catId || options[0].id;
  const from = (editing && db.budgetFrom[catId]) || '';
  // free money in a list, counting this budget's own set-aside as free when editing it
  const freeIn = a => {
    const own = editing && db.budgetFrom[catId] === a.id ? budgetRows(today()).find(r => r.id === catId) : null;
    return freeToSpend(a) + (own ? Math.max(own.limit - own.spent, 0) : 0);
  };
  const suggestion = id => {
    const avg = avgMonthlySpend(id, 3);
    return avg ? `You spent about <b>${money(Math.round(avg))}</b>/month on this over the last 3 months.` : 'No spending history yet for this category.';
  };
  const m = openModal(`${modalHead(editing ? 'Edit budget' : 'New budget')}
    <form id="budget-form" class="form" data-editing="${editing ? catId : ''}" novalidate>
      <label class="field">Category
        <select name="category" class="input" ${editing ? 'disabled' : ''}>${options.map(c => `<option value="${c.id}" ${c.id === sel ? 'selected' : ''}>${esc(c.id === 'other' && !editing ? 'Others (type your own)' : c.name)}</option>`).join('')}</select>
      </label>
      <label class="field" id="custom-name" ${sel === 'other' && !editing ? '' : 'hidden'}>Name it
        <input name="customName" class="input" maxlength="30" placeholder="e.g. Pet food, Gifts for Mom" autocomplete="off">
      </label>
      <label class="field">Monthly limit
        <input name="limit" class="input" inputmode="decimal" enterkeyhint="done" value="${editing ? groupDigits(db.budgets[catId]) : ''}" placeholder="e.g. 5,000" data-money data-autofocus>
      </label>
      <p class="hint" id="budget-hint">${suggestion(sel)}</p>
      <label class="field">Take the money from
        <select name="from" class="input">
          <option value="">Don't take from a money list</option>
          ${db.accounts.map(a => `<option value="${a.id}" ${a.id === from ? 'selected' : ''}>${esc(a.name)} · ${money(freeIn(a))} free</option>`).join('')}
        </select>
      </label>
      <p class="hint">The budget amount is set aside from that list, so its "free to spend" goes down. Spending in this category comes from it too.</p>
      <div class="form-actions">
        ${editing ? `<button type="button" class="btn btn-danger" data-action="remove-budget" data-cat="${catId}">${icon('trash', 18)} Remove</button>` : ''}
        <span class="spacer"></span>
        <button type="button" class="btn" data-action="close-modal">Cancel</button>
        <button type="submit" class="btn btn-primary">${icon('check', 18)} Save</button>
      </div>
    </form>`, { cls: 'narrow' });
  $('select[name="category"]', m).addEventListener('change', e => {
    $('#budget-hint', m).innerHTML = suggestion(e.target.value);
    $('#custom-name', m).hidden = e.target.value !== 'other';
  });
  m.freeIn = freeIn;
}

export function saveBudget(form) {
  const editing = form.dataset.editing;
  let id = editing || form.category.value;
  const limit = evaluate(form.limit.value);
  const custom = !editing && id === 'other' ? form.customName.value.trim() : '';
  if (!editing && id === 'other' && !custom && db.budgets.other != null) {
    toast('Type a name for this budget', 'warn'); form.customName.focus(); return;
  }
  if (!limit || limit <= 0) { toast('Enter a limit greater than zero', 'warn'); form.limit.focus(); return; }
  if (custom) {
    id = customCategory(custom, 'expense').id;  // reuses one you named before
  }
  db.budgets[id] = round2(limit);
  const fromId = form.from.value;
  let note = '';
  if (fromId) {
    const a = account(fromId);
    const free = form.closest('.modal').freeIn(a);
    db.budgetFrom[id] = fromId;
    note = ` from ${a.name}`;
    if (limit > free) toast(`Heads up: ${a.name} only has ${money(Math.max(free, 0))} free`, 'warn');
  } else {
    delete db.budgetFrom[id];
  }
  closeModal();
  commit();
  toast(`${cat(id).name} budget set to ${money(limit)}${note}`, 'good');
}
