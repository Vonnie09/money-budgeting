/* Create, edit and delete wallets. */
import { ACCOUNT_COLORS, ACCOUNT_TYPES } from '../config.js';
import { icon } from '../icons.js';
import { esc, round2, uid } from '../utils.js';
import { evaluate, groupDigits } from '../money.js';
import { db, ui } from '../store.js';
import { account } from '../queries.js';
import { commit } from '../render.js';
import { closeModal, modalHead, openModal } from '../ui/modal.js';
import { toast } from '../ui/toast.js';

/* ----- account form ----- */
export function openAccount(id) {
  const a = id ? account(id) : null;
  const d = a || { name: '', type: 'bank', start: '', color: ACCOUNT_COLORS[db.accounts.length % ACCOUNT_COLORS.length], emergency: false };
  openModal(`${modalHead(a ? 'Edit money list' : 'New money list')}
    <form id="account-form" class="form" data-id="${a ? a.id : ''}" novalidate>
      <label class="field">Name<input name="name" class="input" maxlength="30" value="${esc(d.name)}" placeholder="e.g. On hand cash, GCash" data-autofocus></label>
      <div class="row2">
        <label class="field">Type<select name="type" class="input">${Object.entries(ACCOUNT_TYPES).map(([k, v]) => `<option value="${k}" ${k === d.type ? 'selected' : ''}>${v.label}</option>`).join('')}</select></label>
        <label class="field">Starting balance<input name="start" class="input" inputmode="decimal" value="${groupDigits(d.start)}" placeholder="0" data-money></label>
      </div>
      <div class="field">Color
        <div class="swatches">${ACCOUNT_COLORS.map(c => `<label class="swatch"><input type="radio" name="color" value="${c}" ${c === d.color ? 'checked' : ''}><span style="background:${c}"></span></label>`).join('')}</div>
      </div>
      <label class="field" style="flex-direction:row;align-items:center;gap:10px"><input type="checkbox" name="emergency" ${d.emergency ? 'checked' : ''}> Count this as my emergency fund</label>
      <div class="form-actions">
        ${a ? `<button type="button" class="btn btn-danger" data-action="delete-account" data-id="${a.id}">${icon('trash', 18)} Delete</button>` : ''}
        <span class="spacer"></span>
        <button type="button" class="btn" data-action="close-modal">Cancel</button>
        <button type="submit" class="btn btn-primary">${icon('check', 18)} Save</button>
      </div>
    </form>`, { cls: 'narrow' });
}

export function saveAccount(form) {
  const name = form.name.value.trim();
  if (!name) { toast('Give the list a name', 'warn'); form.name.focus(); return; }
  const start = form.start.value.trim() ? evaluate(form.start.value) : 0;
  if (start == null) { toast('Starting balance must be a number', 'warn'); form.start.focus(); return; }
  const rec = { name, type: form.type.value, start: round2(start), color: (form.querySelector('input[name="color"]:checked') || {}).value || ACCOUNT_COLORS[0], emergency: form.emergency.checked };
  const id = form.dataset.id;
  if (id) Object.assign(account(id), rec);
  else {
    const newId = uid();
    db.accounts.push({ id: newId, ...rec });
    ui.listId = newId;
  }
  closeModal();
  commit();
  toast(id ? 'List updated' : `${name} added`, 'good');
}

export function deleteAccount(id) {
  const used = db.tx.some(t => t.account === id) || db.bills.some(b => b.account === id);
  if (used) { toast('This list has entries or bills. Move or delete those first.', 'warn'); return; }
  if (db.accounts.length <= 1) { toast('Keep at least one money list', 'warn'); return; }
  db.accounts = db.accounts.filter(a => a.id !== id);
  for (const k of Object.keys(db.budgetFrom)) if (db.budgetFrom[k] === id) delete db.budgetFrom[k];
  if (ui.listId === id) ui.listId = null;
  closeModal();
  commit();
  toast('List deleted', 'info');
}
