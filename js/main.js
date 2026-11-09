/* Entry point: click, form and keyboard handling, then first render. */
import { saveListLine } from './forms/moneylist.js';
import { formatTypedAmount } from './money.js';
import { cat, DEMO_SIZES, NAV } from './config.js';
import { icon } from './icons.js';
import { $, $$, addDays, addMonths, endOfMonth, parse, ymd } from './utils.js';
import { db, demoSize, mode, resetMode, save, setDemoSize, setMode, ui } from './store.js';
import { setWelcomeDone } from './views/home.js';
import { commit, currentView, render } from './render.js';
import { closeModal, topLayer } from './ui/modal.js';
import { deleteTx, openTx, saveTx } from './forms/entry.js';
import { openCalc } from './forms/calculator.js';
import { openBudget, saveBudget } from './forms/budget.js';
import { openBill, payBill, saveBill, unpayBill } from './forms/bill.js';
import { deleteAccount, openAccount, saveAccount } from './forms/wallet.js';
import { openAlerts, openSettings } from './forms/settings.js';
import { toast } from './ui/toast.js';
import { effectiveTheme, paintThemeButton, setTheme } from './theme.js';

/* =========================================================
   EVENTS
   ========================================================= */
const actions = {
  'close-modal': () => closeModal(),
  add: () => openTx(null, ui.period === 'day' && currentView() === 'records' ? { date: ymd(ui.cursor) } : {}),
  'add-expense': () => openTx(null, { type: 'expense' }),
  'quick-income': () => openTx(null, { type: 'income' }),
  'ef-add': el => openTx(null, { type: 'income', category: 'gift', account: el.dataset.id, note: 'Saved to emergency fund' }),
  'dismiss-welcome': el => {
    setWelcomeDone(true);
    const card = el.closest('.welcome');
    card.classList.add('leaving');
    setTimeout(render, 200);
  },
  'show-welcome': () => { setWelcomeDone(false); closeModal(); if (currentView() === 'home') render(); else location.hash = '#/home'; },
  'edit-tx': el => openTx(el.dataset.id),
  'delete-tx': el => deleteTx(el.dataset.id),
  calc: () => openCalc(null),
  'calc-into': el => openCalc(el.closest('form').amount),
  alerts: () => openAlerts(),
  settings: () => openSettings(),
  theme: () => setTheme(effectiveTheme() === 'dark' ? 'light' : 'dark'),

  period: el => { ui.period = el.dataset.p; render(); },
  rtype: el => { ui.type = el.dataset.t; render(); },
  'rec-step': el => {
    const dir = +el.dataset.dir, c = ui.cursor;
    if (ui.period === 'day') ui.cursor = addDays(c, dir);
    else if (ui.period === 'week') ui.cursor = addDays(c, 7 * dir);
    else {
      const target = new Date(c.getFullYear(), c.getMonth() + dir, 1);
      ui.cursor = new Date(target.getFullYear(), target.getMonth(), Math.min(c.getDate(), endOfMonth(target).getDate()));
    }
    render();
  },
  'goto-day': el => {
    ui.period = 'day'; ui.cursor = parse(el.dataset.d); ui.type = 'all'; ui.query = '';
    if (currentView() === 'records') render(); else location.hash = '#/records';
  },

  'b-step': el => { ui.bMonth = addMonths(ui.bMonth, +el.dataset.dir); render(); },
  'new-budget': () => openBudget(null),
  'edit-budget': el => openBudget(el.dataset.cat),
  'remove-budget': el => {
    const id = el.dataset.cat;
    delete db.budgets[id];
    delete db.budgetFrom[id];
    closeModal(); commit();
    toast(`${cat(id).name} budget removed`, 'info');
  },

  'new-bill': () => openBill(null),
  'edit-bill': el => openBill(el.dataset.id),
  'pay-bill': el => payBill(el.dataset.id),
  'unpay-bill': el => unpayBill(el.dataset.id),
  'delete-bill': el => {
    const b = db.bills.find(x => x.id === el.dataset.id);
    if (!b || !confirm(`Delete "${b.name}"? Past payments stay in your records.`)) return;
    db.bills = db.bills.filter(x => x.id !== b.id);
    closeModal(); commit();
    toast('Bill deleted', 'info');
  },

  'i-step': el => { ui.iMonth = addMonths(ui.iMonth, +el.dataset.dir); render(); },

  'new-account': () => openAccount(null),
  'edit-account': el => openAccount(el.dataset.id),
  'delete-account': el => deleteAccount(el.dataset.id),

  'ml-pick': el => { ui.listId = el.dataset.id; ui.mlAll = false; render(); },
  'ml-open': el => {
    ui.listId = el.dataset.id; ui.mlAll = false;
    if (currentView() === 'money') render(); else location.hash = '#/money';
  },
  'ml-all': () => { ui.mlAll = true; render(); },
  'set-size': el => {
    const size = el.dataset.size;
    if (size === demoSize()) return;
    if (!confirm(`Load the ${DEMO_SIZES[size]} sample data? Changes you made in Demo Mode will be replaced.`)) return;
    setDemoSize(size);
    resetMode();
    commit();
    toast(`${DEMO_SIZES[size]} sample data loaded`, 'good');
  },
  'set-mode': el => {
    if (el.dataset.mode === mode) return;
    setMode(el.dataset.mode);
    render();
    toast(mode === 'empty' ? 'Empty State: add your own entries from scratch' : 'Demo Mode: exploring sample data', 'good');
  },
  'reset-mode': () => {
    const question = mode === 'demo'
      ? 'Reset the demo? Changes you made to the sample data will be replaced with fresh sample data.'
      : 'Reset Empty State? Everything you added in Empty State will be cleared.';
    if (!confirm(question)) return;
    resetMode();
    commit();
    toast(mode === 'demo' ? 'Demo reset with fresh sample data' : 'Empty State cleared', 'good');
  },
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  const fn = actions[el.dataset.action];
  if (!fn) return;
  if (el.tagName !== 'A') e.preventDefault();
  fn(el, e);
});

document.addEventListener('input', e => {
  if (e.target.matches?.('[data-money]')) formatTypedAmount(e.target);
});

document.addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  if (f.id === 'tx-form') saveTx(f);
  else if (f.id === 'budget-form') saveBudget(f);
  else if (f.id === 'bill-form') saveBill(f);
  else if (f.id === 'account-form') saveAccount(f);
  else if (f.id === 'ml-form') saveListLine(f);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && topLayer()) { e.preventDefault(); closeModal(); return; }
  if (e.key === 'Tab' && topLayer()) {
    // keep keyboard focus inside the open dialog
    const items = $$('button, input, select, summary, a[href]', topLayer().querySelector('.modal'))
      .filter(el => !el.disabled && el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    return;
  }
  const typing = /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement?.tagName);
  if (!typing && !topLayer() && !e.metaKey && !e.ctrlKey && !e.altKey) {
    if (e.key === 'n') { e.preventDefault(); ui.instantModal = true; actions.add(); }
    if (e.key === 'c') { e.preventDefault(); ui.instantModal = true; openCalc(null); }
  }
});

/* ---------- boot ---------- */
const navHtml = mobile => NAV.map(n => `<a href="#/${n.id}" data-nav="${n.id}">${icon(n.icon, mobile ? 22 : 20)}<span>${mobile ? (n.short || n.label) : n.label}</span></a>`).join('');
$('#side-nav').innerHTML = navHtml(false);
$('#bottom-nav').innerHTML = navHtml(true);
$('#btn-calc').innerHTML = icon('calc');
$('#btn-settings').innerHTML = icon('gear');
paintThemeButton();

window.addEventListener('hashchange', render);
save();
render();
