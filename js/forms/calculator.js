/* The built-in calculator. */
import { $, round2 } from '../utils.js';
import { evaluate, groupDigits } from '../money.js';
import { closeModal, modalHead, openModal, topLayer } from '../ui/modal.js';
import { openTx } from './entry.js';
import { toast } from '../ui/toast.js';

/* ----- calculator ----- */
export function openCalc(target) {
  let expr = target ? String(target.value || '').replace(/,/g, '') : '';
  const keys = [
    ['C', 'fn'], ['⌫', 'fn'], ['%', 'op'], ['÷', 'op'],
    ['7'], ['8'], ['9'], ['×', 'op'],
    ['4'], ['5'], ['6'], ['−', 'op'],
    ['1'], ['2'], ['3'], ['+', 'op'],
    ['00'], ['0'], ['.'], ['=', 'eq'],
  ];
  let layer;
  const m = openModal(`${modalHead('Calculator')}
    <div class="calc-display"><div class="calc-expr" id="calc-expr"></div><div class="calc-out" id="calc-out">0</div></div>
    <div class="calc-keys">${keys.map(([k, c = '']) => `<button type="button" class="key ${c}" data-k="${k}" aria-label="${{ '⌫': 'Backspace', C: 'Clear', '−': 'Minus', '×': 'Times', '÷': 'Divide' }[k] || k}">${k}</button>`).join('')}</div>
    <button type="button" class="btn btn-primary wide" id="calc-use">${target ? 'Use this amount' : 'Add as expense'}</button>`,
    { cls: 'narrow', onClose: () => document.removeEventListener('keydown', onKey) });
  layer = m.parentElement;

  const fmtNum = new Intl.NumberFormat('en-US', { maximumFractionDigits: 8 });
  const update = () => {
    $('#calc-expr', m).textContent = groupDigits(expr) || ' ';
    const v = evaluate(expr);
    $('#calc-out', m).textContent = v == null ? (expr ? '…' : '0') : fmtNum.format(v);
  };
  const press = k => {
    if (k === 'C') expr = '';
    else if (k === '⌫') expr = expr.slice(0, -1);
    else if (k === '=') { const v = evaluate(expr); if (v != null) expr = String(Math.round(v * 1e8) / 1e8); }
    else expr += k;
    update();
  };
  const keyMap = { '*': '×', x: '×', '/': '÷', '-': '−', Enter: '=', '=': '=', Backspace: '⌫', Delete: 'C' };
  function onKey(e) {
    if (topLayer() !== layer) return;
    const k = keyMap[e.key] || (/^[\d.+%()]$/.test(e.key) ? e.key : null);
    if (!k) return;
    e.preventDefault();
    press(k);
  }
  document.addEventListener('keydown', onKey);
  m.addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b) press(b.dataset.k); });
  $('#calc-use', m).addEventListener('click', () => {
    const v = evaluate(expr);
    if (!v || v <= 0) { toast('Calculate an amount first', 'warn'); return; }
    closeModal();
    if (target) { target.value = groupDigits(round2(v)); target.focus(); }
    else openTx(null, { amount: round2(v) });
  });
  update();
}
