/* Notifications list and the settings dialog. */
import { CURRENCIES } from '../config.js';
import { icon } from '../icons.js';
import { $, $$, esc } from '../utils.js';
import { setCurrency } from '../money.js';
import { db } from '../store.js';
import { alerts } from '../queries.js';
import { empty } from '../components.js';
import { commit } from '../render.js';
import { modalHead, openModal } from '../ui/modal.js';
import { toast } from '../ui/toast.js';
import { setTheme, theme } from '../theme.js';

/* ----- alerts + settings ----- */
export function openAlerts() {
  const list = alerts();
  openModal(`${modalHead('Notifications')}
    ${list.length ? list.map(a => `<a class="alert-item" href="${a.href}" data-action="close-modal" data-tone="${a.tone}">
      <span class="tx-ico">${icon(a.icon)}</span>
      <span><strong>${esc(a.title)}</strong><small>${esc(a.text)}</small></span>
    </a>`).join('') : empty('check', 'All clear', 'No budget warnings or bills due soon.')}`, { cls: 'narrow' });
}

export function openSettings() {
  openModal(`${modalHead('Settings')}
    <div class="settings-group">
      <h3>Currency</h3>
      <select id="set-currency" class="input">${CURRENCIES.map(([c, l]) => `<option value="${c}" ${c === db.currency ? 'selected' : ''}>${l}</option>`).join('')}</select>
      <p class="hint">Changes the symbol only. Amounts are not converted.</p>
    </div>
    <div class="settings-group">
      <h3>Appearance</h3>
      <div class="seg wide" role="radiogroup" aria-label="Theme">
        ${['system', 'light', 'dark'].map(t => `<input type="radio" name="theme" id="th-${t}" value="${t}" ${theme === t ? 'checked' : ''}><label for="th-${t}">${t[0].toUpperCase() + t.slice(1)}</label>`).join('')}
      </div>
    </div>
    <div class="settings-group">
      <h3>Help</h3>
      <button class="btn" data-action="show-welcome">Show the welcome guide again</button>
    </div>
    <div class="settings-group">
      <h3>Demo data</h3>
      <p class="hint">This is a demo. Everything is saved only in this browser, so nothing leaves your device.</p>
      <div class="form-actions">
        <button class="btn" data-action="reset-demo">Bring back sample data</button>
        <button class="btn btn-danger" data-action="clear-all">Start empty</button>
      </div>
    </div>`, { cls: 'narrow' });
  $('#set-currency').addEventListener('change', e => { db.currency = e.target.value; setCurrency(db.currency); commit(); toast('Currency updated', 'good'); });
  $$('input[name="theme"]').forEach(r => r.addEventListener('change', () => setTheme(r.value)));
}
