/* Short pop-up messages. */
import { $, $$, esc } from '../utils.js';

/* ---------- toasts ---------- */
export function toast(msg, tone = 'info', opts = {}) {
  const el = document.createElement('div');
  el.className = `toast ${tone}`;
  el.setAttribute('role', 'status');
  el.innerHTML = `<span>${esc(msg)}</span>${opts.action ? `<button class="toast-btn">${esc(opts.action.label)}</button>` : ''}`;
  if (opts.action) el.querySelector('button').addEventListener('click', () => { opts.action.fn(); el.remove(); });
  $('#toasts').appendChild(el);
  let remaining = opts.action ? 5000 : 3200, timer = null, startedAt = 0;
  el._run = () => { if (timer) return; startedAt = Date.now(); timer = setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 200); }, remaining); };
  el._pause = () => { if (!timer) return; clearTimeout(timer); timer = null; remaining -= Date.now() - startedAt; };
  el.addEventListener('pointerenter', el._pause);
  el.addEventListener('pointerleave', el._run);
  if (!document.hidden) el._run();
}
document.addEventListener('visibilitychange', () => {
  $$('#toasts .toast').forEach(t => (document.hidden ? t._pause() : t._run()));
});
export const buzz = () => { try { navigator.vibrate?.(12); } catch { /* not supported */ } };
