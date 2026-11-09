/* Dialogs and the drag-to-close phone sheet. */
import { icon } from '../icons.js';
import { $, clamp } from '../utils.js';
import { ui } from '../store.js';

/* =========================================================
   MODALS
   ========================================================= */
export const modalRoot = $('#modal-root');

export function openModal(html, { cls = '', onClose } = {}) {
  const layer = document.createElement('div');
  layer.className = 'modal-layer' + (ui.instantModal ? ' instant' : '');
  ui.instantModal = false;
  layer.innerHTML = `<div class="modal-backdrop" data-action="close-modal"></div><div class="modal ${cls}" role="dialog" aria-modal="true"><div class="sheet-grip" aria-hidden="true"></div>${html}</div>`;
  layer._onClose = onClose;
  layer._returnFocus = document.activeElement;
  const heading = layer.querySelector('.modal-head h2');
  if (heading) {
    heading.id = `modal-title-${modalRoot.children.length}`;
    layer.querySelector('.modal').setAttribute('aria-labelledby', heading.id);
  }
  modalRoot.appendChild(layer);
  document.documentElement.classList.add('modal-open');
  void layer.offsetWidth; // commit the closed position so the open state transitions from it
  layer.classList.add('open');
  enableSheetDrag(layer);
  const focusEl = layer.querySelector('[data-autofocus]') || layer.querySelector('input, select, button:not([data-action="close-modal"])');
  focusEl?.focus({ preventScroll: true });
  return layer.querySelector('.modal');
}

export const isSheet = () => window.matchMedia('(max-width: 640px)').matches;
// Layers that are animating out stay in the DOM briefly; they no longer count as open.
export const topLayer = () => [...modalRoot.children].filter(l => !l.classList.contains('closing')).pop() || null;

export function closeModal() {
  const layer = topLayer();
  if (!layer) return;
  layer.classList.add('closing');
  layer._onClose?.();
  setTimeout(() => {
    layer.remove();
    if (!topLayer()) document.documentElement.classList.remove('modal-open');
  }, isSheet() ? 230 : 160);
  layer._returnFocus?.focus?.({ preventScroll: true });
}

/* Phone bottom sheet: drag the grip or header down to dismiss.
   Tracks the finger 1:1, rubber-bands upward, and uses release velocity
   to decide (a quick flick closes it even after a short drag). */
export function rubberband(over, size, c = 0.55) {
  return (over * size * c) / (size + c * Math.abs(over));
}
export function projectMomentum(velocityPxPerMs, rate = 0.998) {
  return velocityPxPerMs * rate / (1 - rate);
}
export function enableSheetDrag(layer) {
  const sheet = layer.querySelector('.modal');
  const backdrop = layer.querySelector('.modal-backdrop');
  const handles = layer.querySelectorAll('.sheet-grip, .modal-head');
  let drag = null;

  const currentOffset = () => new DOMMatrixReadOnly(getComputedStyle(sheet).transform).m42 || 0;
  const setOffset = y => {
    sheet.style.transform = `translateY(${y}px)`;
    backdrop.style.opacity = String(1 - clamp(y / sheet.offsetHeight, 0, 1));
  };
  const finish = () => {
    if (!drag) return;
    const { history, offset } = drag;
    drag = null;
    const a = history[0], b = history[history.length - 1];
    const velocity = b.t > a.t ? (b.y - a.y) / (b.t - a.t) : 0; // px per ms
    if (offset > 0 && (offset + projectMomentum(velocity) > sheet.offsetHeight * 0.5 || velocity > 0.5)) {
      sheet.style.transition = 'transform 220ms var(--ease-out)';
      sheet.style.transform = 'translateY(100%)';
      backdrop.style.transition = 'opacity 220ms ease';
      backdrop.style.opacity = '0';
      closeModal();
      return;
    }
    sheet.style.transition = 'transform 360ms var(--ease-drawer)';
    sheet.style.transform = '';
    backdrop.style.transition = 'opacity 260ms ease';
    backdrop.style.opacity = '';
    sheet.addEventListener('transitionend', () => { if (!drag) sheet.style.transition = ''; }, { once: true });
  };

  handles.forEach(h => {
    h.addEventListener('pointerdown', e => {
      if (!isSheet() || e.target.closest('button') || layer.classList.contains('closing')) return;
      const start = currentOffset(); // grab mid-animation without a jump
      sheet.style.transition = 'none';
      backdrop.style.transition = 'none';
      setOffset(start);
      try { h.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
      drag = { startY: e.clientY - start, offset: start, history: [{ y: e.clientY, t: e.timeStamp }] };
    });
    h.addEventListener('pointermove', e => {
      if (!drag) return;
      const raw = e.clientY - drag.startY;
      drag.offset = raw < 0 ? rubberband(raw, sheet.offsetHeight) : raw;
      setOffset(drag.offset);
      drag.history.push({ y: e.clientY, t: e.timeStamp });
      while (drag.history.length > 2 && e.timeStamp - drag.history[0].t > 100) drag.history.shift();
    });
    h.addEventListener('pointerup', finish);
    h.addEventListener('pointercancel', finish);
    h.addEventListener('lostpointercapture', finish);
  });
}

export const modalHead = title => `<header class="modal-head"><h2>${title}</h2><button class="icon-btn sm" data-action="close-modal" aria-label="Close">${icon('x', 18)}</button></header>`;

/* In-app "Are you sure?" dialog. It replaces the browser's confirm(), which phone
   in-app browsers (Messenger, Facebook, Instagram) often block without showing anything.
   Resolves true for the main button, false for Cancel, the backdrop, Esc or a swipe down. */
export function askConfirm({ title, message, ok = 'Yes', cancel = 'Cancel', danger = false }) {
  return new Promise(resolve => {
    let answered = false;
    const m = openModal(`${modalHead(title)}
      <p class="confirm-msg">${message}</p>
      <div class="form-actions confirm-actions">
        <button type="button" class="btn" data-confirm="no">${cancel}</button>
        <button type="button" class="btn ${danger ? 'btn-danger-solid' : 'btn-primary'}" data-confirm="yes" data-autofocus>${ok}</button>
      </div>`, { cls: 'narrow confirm', onClose: () => { if (!answered) resolve(false); } });
    m.addEventListener('click', e => {
      const b = e.target.closest('[data-confirm]');
      if (!b) return;
      answered = true;
      resolve(b.dataset.confirm === 'yes');
      closeModal();
    });
  });
}
