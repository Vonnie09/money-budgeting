/* Money formatting, safe math for amount fields, and typing commas. */

/* ---------- money ---------- */
export let fmtWhole, fmtCents, fmtCompact;
export function setCurrency(code) {
  const base = { style: 'currency', currency: code };
  fmtWhole = new Intl.NumberFormat('en-US', { ...base, minimumFractionDigits: 0, maximumFractionDigits: 0 });
  fmtCents = new Intl.NumberFormat('en-US', { ...base, minimumFractionDigits: 2, maximumFractionDigits: 2 });
  fmtCompact = new Intl.NumberFormat('en-US', { ...base, notation: 'compact', maximumFractionDigits: 1 });
}
export const money = n => (Math.abs(n % 1) < 0.005 ? fmtWhole : fmtCents).format(n);
export const moneyShort = n => Math.abs(n) >= 10000 ? fmtCompact.format(n) : money(n);
export const signed = n => (n >= 0 ? '+' : '−') + money(Math.abs(n));
export const currencySymbol = () => (fmtWhole.formatToParts(0).find(p => p.type === 'currency') || {}).value || '';
export const pct = n => `${Math.round(n)}%`;
export const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
// 2239% reads as noise; past 3x, say how many times bigger instead
export const growth = (now, before) => now / before >= 3 ? `${(now / before).toFixed(1)}×` : pct(Math.abs((now - before) / before * 100));

/* ---------- safe math (calculator + amount field) ---------- */
export function evaluate(input) {
  const s = String(input ?? '')
    .replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')
    .replace(/,/g, '').replace(/\s+/g, '');
  if (!s || !/^[\d+\-*/().%]+$/.test(s)) return null;
  let i = 0;
  const peek = () => s[i];
  const number = () => {
    const start = i;
    while (i < s.length && /[\d.]/.test(s[i])) i++;
    const v = parseFloat(s.slice(start, i));
    if (start === i || Number.isNaN(v)) throw new Error('bad number');
    return percent(v);
  };
  const percent = v => { if (s[i] === '%') { i++; return v / 100; } return v; };
  const factor = () => {
    if (peek() === '-') { i++; return -factor(); }
    if (peek() === '+') { i++; return factor(); }
    if (peek() === '(') {
      i++;
      const v = expr();
      if (s[i] !== ')') throw new Error('missing )');
      i++;
      return percent(v);
    }
    return number();
  };
  const term = () => {
    let v = factor();
    while (peek() === '*' || peek() === '/') { const op = s[i++]; const f = factor(); v = op === '*' ? v * f : v / f; }
    return v;
  };
  const expr = () => {
    let v = term();
    while (peek() === '+' || peek() === '-') { const op = s[i++]; const t = term(); v = op === '+' ? v + t : v - t; }
    return v;
  };
  try {
    const v = expr();
    return i === s.length && Number.isFinite(v) ? v : null;
  } catch { return null; }
}

/* ---------- commas while typing ---------- */
// Adds thousands separators to every number in a typed amount, leaving the
// decimals and any math alone: "1250000+300.5" -> "1,250,000+300.5".
export function groupDigits(text) {
  return String(text ?? '').replace(/,/g, '').replace(/\d+(\.\d*)?/g, (whole, decimals = '') => {
    const int = whole.slice(0, whole.length - decimals.length);
    return int.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + decimals;
  });
}

// Re-formats an input as the person types and keeps the cursor next to the
// same digit, so inserting a comma never makes it jump.
export function formatTypedAmount(input) {
  const before = input.value;
  const caret = input.selectionStart ?? before.length;
  const keep = before.slice(0, caret).replace(/,/g, '').length;
  const after = groupDigits(before);
  if (after === before) return;
  input.value = after;
  let pos = 0;
  for (let seen = 0; pos < after.length && seen < keep; pos++) {
    if (after[pos] !== ',') seen++;
  }
  input.setSelectionRange(pos, pos);
}
