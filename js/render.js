/* Routing between screens and re-rendering after changes. */
import { afterMoney, renderMoney } from './views/money.js';
import { icon } from './icons.js';
import { $, $$, fmtDate, today } from './utils.js';
import { save, ui } from './store.js';
import { alerts } from './queries.js';
import { greeting, modeBar } from './components.js';
import { renderHome } from './views/home.js';
import { afterRecords, renderRecords } from './views/history.js';
import { renderBudgets } from './views/budgets.js';
import { renderBills } from './views/bills.js';
import { renderInsights } from './views/insights.js';

export const VIEWS = {
  home:     { title: 'Home',     sub: () => `${greeting()} · ${fmtDate(today(), { weekday: 'long', month: 'long', day: 'numeric' })}`, render: renderHome },
  money:    { title: 'Money List', sub: () => 'Every peso in and out, with a running balance', render: renderMoney, after: afterMoney },
  records:  { title: 'History',  sub: () => 'Everything you spent and earned', render: renderRecords, after: afterRecords },
  budgets:  { title: 'Budgets',  sub: () => 'A monthly limit for each category', render: renderBudgets },
  bills:    { title: 'Bills',    sub: () => 'Due dates and payments', render: renderBills },
  insights: { title: 'Insights', sub: () => 'Tips and trends from your spending', render: renderInsights },
};

export function currentView() {
  const name = location.hash.replace(/^#\/?/, '');
  return VIEWS[name] ? name : 'home';
}

export function render() {
  const v = currentView();
  const view = VIEWS[v];
  $$('[data-nav]').forEach(a => {
    const on = a.dataset.nav === v;
    a.classList.toggle('active', on);
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  $('#page-title').textContent = view.title;
  $('#page-sub').textContent = view.sub();
  document.title = `${view.title} · Money Budgeting`;
  const el = $('#view');
  el.innerHTML = view.render();
  view.after?.();
  ui.flashId = null;
  ui.stampId = null;
  if (ui.lastView !== v) {
    window.scrollTo(0, 0);
    ui.lastView = v;
  }
  updateBell();
  paintModeBars();
}

export function paintModeBars() {
  $$('[data-mode-slot]').forEach(el => { el.innerHTML = modeBar(); });
}
document.addEventListener('themechange', paintModeBars);

export function commit() { save(); render(); }

export function updateBell() {
  const n = alerts().length;
  $('#btn-bell').innerHTML = icon('bell') + (n ? `<span class="badge">${n}</span>` : '');
}
