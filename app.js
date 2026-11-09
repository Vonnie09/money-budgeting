/* =========================================================
   Money Manager — demo web app
   No server, no database. Sample data is generated on first
   visit and saved in this browser's localStorage only.
   ========================================================= */
(() => {
'use strict';

const STORE_KEY = 'mm-demo-v3';
const THEME_KEY = 'mm-theme';

/* ---------- reference data ---------- */
const CATEGORIES = {
  expense: [
    { id: 'food',      name: 'Food & Dining', icon: 'bowl', color: '#FC563C' },
    { id: 'groceries', name: 'Groceries',     icon: 'basket', color: '#1E7B74' },
    { id: 'transport', name: 'Transport',     icon: 'bus', color: '#2B6A86' },
    { id: 'bills',     name: 'Bills',         icon: 'bolt', color: '#E8A33D' },
    { id: 'shopping',  name: 'Shopping',      icon: 'tag', color: '#E07A5F' },
    { id: 'health',    name: 'Health',        icon: 'heart', color: '#4E9A94' },
    { id: 'fun',       name: 'Entertainment', icon: 'ticket', color: '#B85C8A' },
    { id: 'education', name: 'Education',     icon: 'book', color: '#8C6E5A' },
    { id: 'other',     name: 'Others',        icon: 'box', color: '#6E7575' },
  ],
  income: [
    { id: 'salary',    name: 'Salary',    icon: 'briefcase', color: '#172A39' },
    { id: 'freelance', name: 'Freelance', icon: 'laptop', color: '#2B6A86' },
    { id: 'business',  name: 'Business',  icon: 'store', color: '#1E7B74' },
    { id: 'gift',      name: 'Gifts',     icon: 'gift', color: '#E8A33D' },
  ],
};
const ALL_CATS = [...CATEGORIES.expense, ...CATEGORIES.income];
const cat = id => ALL_CATS.find(c => c.id === id) || CATEGORIES.expense[CATEGORIES.expense.length - 1];

const ACCOUNT_TYPES = {
  cash:    { label: 'Cash',       icon: 'banknote' },
  bank:    { label: 'Bank',       icon: 'bank' },
  ewallet: { label: 'E-wallet',   icon: 'phone' },
  savings: { label: 'Savings',    icon: 'coins' },
  card:    { label: 'Credit card', icon: 'card' },
  invest:  { label: 'Investment', icon: 'chart' },
};
const ACCOUNT_COLORS = ['#172A39', '#FC563C', '#2B6A86', '#1E7B74', '#E8A33D', '#E07A5F', '#8C6E5A', '#6E7575'];

const CURRENCIES = [
  ['PHP', 'Philippine Peso (₱)'],
  ['USD', 'US Dollar ($)'],
  ['EUR', 'Euro (€)'],
  ['GBP', 'British Pound (£)'],
  ['JPY', 'Japanese Yen (¥)'],
  ['SGD', 'Singapore Dollar (S$)'],
  ['AUD', 'Australian Dollar (A$)'],
];

const NAV = [
  { id: 'home',     label: 'Home',     icon: 'home' },
  { id: 'records',  label: 'History',  icon: 'list' },
  { id: 'budgets',  label: 'Budgets',  icon: 'target' },
  { id: 'bills',    label: 'Bills',    icon: 'receipt' },
  { id: 'insights', label: 'Insights', icon: 'chart' },
];

const WELCOME_KEY = 'mm-welcome-done';

/* ---------- icons (24px stroke) ---------- */
const ICONS = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/><path d="M10 20v-5h4v5"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01" stroke-width="3"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  chart: '<path d="M4 4v16h16"/><path d="m7.5 14.5 3.5-4 3 3 5-6.5"/>',
  wallet: '<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3"/><path d="M4 7.5v10A2.5 2.5 0 0 0 6.5 20H20V8H6.5A2.5 2.5 0 0 1 4 5.5"/><circle cx="16" cy="14" r="1.2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  arrowDown: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  arrowUp: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  calc: '<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M8.5 7.5h7"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01" stroke-width="2.6"/>',
  bell: '<path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9z"/><path d="M10 20a2.2 2.2 0 0 0 4 0"/>',
  gear: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  left: '<path d="m15 5-7 7 7 7"/>',
  right: '<path d="m9 5 7 7-7 7"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  trash: '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  calendar: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  // categories
  bowl: '<path d="M4 11h16a8 8 0 0 1-16 0z"/><path d="M9.5 4c0 1.5 1 1.5 1 3M13.5 4c0 1.5 1 1.5 1 3"/>',
  basket: '<path d="M5 9h14l-1.6 11H6.6z"/><path d="M9 9V7a3 3 0 0 1 6 0v2"/>',
  bus: '<rect x="5" y="3.5" width="14" height="14" rx="3"/><path d="M5 11h14M8 17.5v3M16 17.5v3"/><path d="M8.5 14.5h.01M15.5 14.5h.01" stroke-width="2.6"/>',
  bolt: '<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z"/>',
  tag: '<path d="M3.5 12.5 12 4h7.5v7.5L11 20z"/><circle cx="15.5" cy="8" r="1.3"/>',
  heart: '<path d="M12 19.5s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 7.5 2.5c0 5.4-7.5 10-7.5 10z"/>',
  ticket: '<path d="M4 7h16v3.2a1.8 1.8 0 0 0 0 3.6V17H4v-3.2a1.8 1.8 0 0 0 0-3.6z"/><path d="M14.5 7v10" stroke-dasharray="1.6 2"/>',
  book: '<path d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5z"/><path d="M12 6.5v13"/>',
  box: '<path d="M4 8 12 4l8 4v8l-8 4-8-4z"/><path d="m4 8 8 4 8-4M12 12v8"/>',
  briefcase: '<rect x="3.5" y="7" width="17" height="12" rx="2"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3.5 12.5h17"/>',
  laptop: '<rect x="5" y="5" width="14" height="10" rx="1.5"/><path d="M3 19h18"/>',
  store: '<path d="M4 9h16l-1.5-5h-13z"/><path d="M5.5 9v11h13V9"/><path d="M10 20v-5h4v5"/>',
  gift: '<rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M3 9h18M12 9v11"/><path d="M12 9C10.5 5 7 4.5 7 6.8S10 9 12 9c2 0 5 0 5-2.2S13.5 5 12 9z"/>',
  // wallets
  banknote: '<rect x="3" y="6.5" width="18" height="11" rx="2"/><circle cx="12" cy="12" r="2.5"/>',
  bank: '<path d="M3.5 9 12 4l8.5 5"/><path d="M5 20h14M6.5 11v6M10.2 11v6M13.8 11v6M17.5 11v6"/>',
  phone: '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/>',
  coins: '<ellipse cx="12" cy="6.5" rx="7" ry="2.5"/><path d="M5 6.5v5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-5M5 11.5v5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-5"/>',
  card: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/>',
  // insights
  trendDown: '<path d="m4 7 6 6 3-3 7 7"/><path d="M20 12v5h-5"/>',
  trendUp: '<path d="m4 17 6-6 3 3 7-7"/><path d="M20 12V7h-5"/>',
  alert: '<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4"/><path d="M12 16.8h.01" stroke-width="2.6"/>',
  coin: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/>',
  sprout: '<path d="M12 20v-8"/><path d="M12 12C12 8 9 6 5 6c0 4 3 6 7 6zM12 12c0-3 2-5 6-5 0 3-2 5-6 5z"/>',
  shield: '<path d="M12 3.5 5 6v6c0 4.5 3 7.5 7 8.5 4-1 7-4 7-8.5V6z"/>',
};
const icon = (name, size = 20) =>
  `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

/* ---------- small helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sum = (arr, f = x => x) => arr.reduce((s, x) => s + f(x), 0);
const uid = () => Math.random().toString(36).slice(2, 10);
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const round2 = n => Math.round(n * 100) / 100;

/* ---------- dates ---------- */
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const startOfMonth = d => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = d => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const startOfWeek = d => addDays(new Date(d.getFullYear(), d.getMonth(), d.getDate()), -((d.getDay() + 6) % 7));
const monthKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
const sameMonth = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
const fmtDate = (d, opts) => d.toLocaleDateString('en-US', opts);
const daysBetween = (a, b) => Math.round((b - a) / 86400000);

/* ---------- money ---------- */
let fmtWhole, fmtCents, fmtCompact;
function setCurrency(code) {
  const base = { style: 'currency', currency: code };
  fmtWhole = new Intl.NumberFormat('en-US', { ...base, minimumFractionDigits: 0, maximumFractionDigits: 0 });
  fmtCents = new Intl.NumberFormat('en-US', { ...base, minimumFractionDigits: 2, maximumFractionDigits: 2 });
  fmtCompact = new Intl.NumberFormat('en-US', { ...base, notation: 'compact', maximumFractionDigits: 1 });
}
const money = n => (Math.abs(n % 1) < 0.005 ? fmtWhole : fmtCents).format(n);
const moneyShort = n => Math.abs(n) >= 10000 ? fmtCompact.format(n) : money(n);
const signed = n => (n >= 0 ? '+' : '−') + money(Math.abs(n));
const currencySymbol = () => (fmtWhole.formatToParts(0).find(p => p.type === 'currency') || {}).value || '';
const pct = n => `${Math.round(n)}%`;
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
// 2239% reads as noise; past 3x, say how many times bigger instead
const growth = (now, before) => now / before >= 3 ? `${(now / before).toFixed(1)}×` : pct(Math.abs((now - before) / before * 100));

/* ---------- safe math (calculator + amount field) ---------- */
function evaluate(input) {
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

/* ---------- sample data ---------- */
function mulberry32(a) {
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function seed() {
  const rnd = mulberry32(20261102);
  const between = (a, b) => a + rnd() * (b - a);
  const step = (n, s) => Math.round(n / s) * s;
  const pick = arr => arr[Math.floor(rnd() * arr.length)];

  const accounts = [
    { id: 'cash',      name: 'Cash Wallet',    type: 'cash',    start: 3500,  color: '#E8A33D' },
    { id: 'bank',      name: 'Savings Bank',   type: 'bank',    start: 38000, color: '#172A39' },
    { id: 'ewallet',   name: 'E-Wallet',       type: 'ewallet', start: 1800,  color: '#2B6A86' },
    { id: 'emergency', name: 'Emergency Fund', type: 'savings', start: 26000, color: '#FC563C', emergency: true },
  ];
  const bills = [
    { id: 'b1', name: 'Apartment Rent',  amount: 9000, dueDay: 1,  category: 'bills',  account: 'bank' },
    { id: 'b2', name: 'Fiber Internet',  amount: 1699, dueDay: 5,  category: 'bills',  account: 'bank' },
    { id: 'b3', name: 'Electricity',     amount: 2350, dueDay: 10, category: 'bills',  account: 'ewallet' },
    { id: 'b4', name: 'Water',           amount: 420,  dueDay: 12, category: 'bills',  account: 'ewallet' },
    { id: 'b5', name: 'Mobile Postpaid', amount: 999,  dueDay: 18, category: 'bills',  account: 'bank' },
    { id: 'b6', name: 'Streaming Plan',  amount: 549,  dueDay: 22, category: 'fun',    account: 'bank' },
    { id: 'b7', name: 'Gym Membership',  amount: 1500, dueDay: 27, category: 'health', account: 'bank' },
  ].map(b => ({ ...b, paid: [] }));

  const tx = [];
  let n = 0;
  const add = (type, amount, category, account, date, note, extra = {}) =>
    tx.push({ id: 't' + (++n), ts: n, type, amount: round2(amount), category, account, date: ymd(date), note, ...extra });

  const end = today();
  for (let d = addMonths(end, -5); d <= end; d = addDays(d, 1)) {
    const day = d.getDate(), dow = d.getDay(), last = endOfMonth(d).getDate();

    if (day === 15 || day === last) add('income', 22500, 'salary', 'bank', d, 'Payroll');
    if (rnd() < 0.045) add('income', step(between(2500, 9000), 50), 'freelance', 'ewallet', d, pick(['Logo design', 'Website gig', 'Video edit', 'Tutoring']));
    if (rnd() < 0.01) add('income', step(between(1000, 3000), 100), 'gift', 'cash', d, pick(['Birthday gift', 'Ninong & ninang', 'Bonus treat']));

    const meals = 1 + Math.floor(rnd() * 2);
    for (let k = 0; k < meals; k++) {
      add('expense', step(between(80, 380), 5), 'food', rnd() < 0.55 ? 'cash' : 'ewallet', d,
        pick(['Lunch', 'Coffee', 'Merienda', 'Dinner out', 'Milk tea', 'Breakfast', 'Food delivery']));
    }
    if (dow >= 1 && dow <= 5 && rnd() < 0.85) add('expense', step(between(40, 180), 5), 'transport', rnd() < 0.6 ? 'cash' : 'ewallet', d, pick(['Jeep & MRT', 'Ride-hailing', 'Bus fare', 'Tricycle']));
    if (dow === 6) add('expense', step(between(1400, 2700), 10), 'groceries', 'bank', d, pick(['Weekly groceries', 'Supermarket run', 'Market haul']));
    if (rnd() < 0.08) add('expense', step(between(350, 2600), 10), 'shopping', pick(['bank', 'ewallet']), d, pick(['New shoes', 'Online order', 'Home stuff', 'Clothes', 'Phone case']));
    if ((dow === 5 || dow === 6) && rnd() < 0.35) add('expense', step(between(250, 1100), 10), 'fun', pick(['cash', 'ewallet']), d, pick(['Movie night', 'Karaoke', 'Concert ticket', 'Board game café', 'Bowling']));
    if (rnd() < 0.03) add('expense', step(between(150, 900), 10), 'health', 'cash', d, pick(['Pharmacy', 'Vitamins', 'Check-up']));
    if (rnd() < 0.025) add('expense', step(between(300, 1400), 10), 'education', 'ewallet', d, pick(['Online course', 'Books', 'School supplies']));
    if (rnd() < 0.02) add('expense', step(between(100, 600), 10), 'other', 'cash', d, pick(['Donation', 'Laundry', 'Haircut']));

    for (const b of bills) {
      if (b.dueDay === day) {
        add('expense', b.amount, b.category, b.account, d, b.name, { billId: b.id, billMonth: monthKey(d) });
        b.paid.push(monthKey(d));
      }
    }
  }

  // Everyday wallets only spend in this sample, so pick starting balances
  // that leave them with a realistic positive amount today.
  const targets = { cash: 2850, ewallet: 1940 };
  for (const a of accounts) {
    if (targets[a.id] == null) continue;
    const net = sum(tx.filter(t => t.account === a.id), t => t.type === 'income' ? t.amount : -t.amount);
    a.start = Math.max(a.start, targets[a.id] - net);
  }

  const budgets = { food: 8500, groceries: 9000, transport: 2500, bills: 15000, shopping: 3500, fun: 2500, health: 2500, education: 1500 };
  return { version: 1, currency: 'PHP', accounts, bills, tx, budgets };
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && data.version === 1) return data;
    }
  } catch { /* storage blocked or corrupted: fall back to fresh demo data */ }
  return seed();
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(db)); } catch { /* private mode: keep working in memory */ }
}

let db = load();
setCurrency(db.currency);

const ui = {
  period: 'month',
  cursor: today(),
  type: 'all',
  query: '',
  bMonth: startOfMonth(today()),
  iMonth: startOfMonth(today()),
  lastView: null,
};

/* ---------- queries ---------- */
const txBetween = (a, b) => { const s = ymd(a), e = ymd(b); return db.tx.filter(t => t.date >= s && t.date <= e); };
const totals = list => ({
  income: sum(list.filter(t => t.type === 'income'), t => t.amount),
  expense: sum(list.filter(t => t.type === 'expense'), t => t.amount),
});
const byCategory = (list, type = 'expense') => {
  const m = {};
  for (const t of list) if (t.type === type) m[t.category] = (m[t.category] || 0) + t.amount;
  return Object.entries(m).map(([id, value]) => ({ ...cat(id), value })).sort((a, b) => b.value - a.value);
};
const sortTx = list => list.slice().sort((a, b) => b.date.localeCompare(a.date) || b.ts - a.ts);
const account = id => db.accounts.find(a => a.id === id);
const accountBalance = a => a.start + sum(db.tx.filter(t => t.account === a.id), t => t.type === 'income' ? t.amount : -t.amount);
const netWorth = () => sum(db.accounts, accountBalance);

function budgetRows(monthDate) {
  const spent = {};
  for (const t of txBetween(startOfMonth(monthDate), endOfMonth(monthDate))) {
    if (t.type === 'expense') spent[t.category] = (spent[t.category] || 0) + t.amount;
  }
  return Object.entries(db.budgets).map(([id, limit]) => {
    const s = spent[id] || 0;
    const p = limit > 0 ? s / limit * 100 : 0;
    return { ...cat(id), limit, spent: s, pct: p, state: p >= 100 ? 'over' : p >= 80 ? 'warn' : 'ok' };
  }).sort((a, b) => b.pct - a.pct);
}

function avgMonthlySpend(catId, months = 3) {
  const t = today();
  let total = 0;
  for (let k = 1; k <= months; k++) {
    const m = addMonths(t, -k);
    total += sum(txBetween(startOfMonth(m), endOfMonth(m)).filter(x => x.type === 'expense' && (!catId || x.category === catId)), x => x.amount);
  }
  return total / months;
}

function billStatus(b) {
  const t = today();
  const due = new Date(t.getFullYear(), t.getMonth(), Math.min(b.dueDay, endOfMonth(t).getDate()));
  const days = daysBetween(t, due);
  if (b.paid.includes(monthKey(t))) return { state: 'paid', due, days, label: 'Paid' };
  if (days < 0) return { state: 'overdue', due, days, label: `Overdue ${-days}d` };
  if (days === 0) return { state: 'soon', due, days, label: 'Due today' };
  if (days <= 3) return { state: 'soon', due, days, label: `Due in ${days}d` };
  return { state: 'upcoming', due, days, label: `In ${days} days` };
}

function alerts() {
  const out = [];
  for (const r of budgetRows(today())) {
    if (r.state === 'over') out.push({ tone: 'bad', icon: r.icon, title: `${r.name} is over budget`, text: `Spent ${money(r.spent)} of ${money(r.limit)}, over by ${money(r.spent - r.limit)}.`, href: '#/budgets' });
    else if (r.state === 'warn') out.push({ tone: 'warn', icon: r.icon, title: `${r.name} is at ${pct(r.pct)}`, text: `${money(r.limit - r.spent)} left for this month.`, href: '#/budgets' });
  }
  for (const b of db.bills) {
    const s = billStatus(b);
    if (s.state === 'overdue' || s.state === 'soon') {
      out.push({ tone: s.state === 'overdue' ? 'bad' : 'warn', icon: 'receipt', title: `${b.name}: ${s.label.toLowerCase()}`, text: `${money(b.amount)} due ${fmtDate(s.due, { month: 'short', day: 'numeric' })}.`, href: '#/bills' });
    }
  }
  return out;
}

/* ---------- personal insights ---------- */
function insights() {
  const t = today();
  const out = [];
  const last30 = txBetween(addDays(t, -29), t);
  const prev30 = txBetween(addDays(t, -59), addDays(t, -30));
  const e30 = totals(last30).expense, ePrev = totals(prev30).expense;

  if (ePrev > 0) {
    const ch = (e30 - ePrev) / ePrev * 100;
    out.push(ch <= 0
      ? { tone: 'good', icon: 'trendDown', title: `You spent ${pct(-ch)} less`, text: `${money(e30)} in the last 30 days vs ${money(ePrev)} the 30 days before. Keep it up!` }
      : { tone: 'warn', icon: 'trendUp', title: `Spending is up ${growth(e30, ePrev)}`, text: `${money(e30)} in the last 30 days vs ${money(ePrev)} before. Check which category grew below.` });
  }

  const top = byCategory(last30)[0];
  if (top && e30 > 0) {
    out.push({ tone: 'info', icon: top.icon, title: `${top.name} is your biggest spend`, text: `${pct(top.value / e30 * 100)} of the last 30 days (${money(top.value)}). Cutting it by 15% would save about ${money(Math.round(top.value * 0.15))} a month.` });
  }

  const over = budgetRows(t).filter(r => r.state === 'over');
  if (over.length) {
    const r = over[0];
    out.push({ tone: 'bad', icon: 'alert', title: `${r.name} went over budget`, text: `Over by ${money(r.spent - r.limit)} this month. Try a 48-hour pause before non-essential buys.` });
  }

  const small = last30.filter(x => x.type === 'expense' && x.amount <= 150);
  if (small.length >= 10) {
    out.push({ tone: 'info', icon: 'coin', title: 'Small buys add up', text: `${small.length} purchases of ${money(150)} or less totalled ${money(sum(small, x => x.amount))} in 30 days.` });
  }

  const lm = addMonths(t, -1);
  const lmT = totals(txBetween(startOfMonth(lm), endOfMonth(lm)));
  if (lmT.income > 0) {
    const rate = (lmT.income - lmT.expense) / lmT.income * 100;
    out.push(rate >= 20
      ? { tone: 'good', icon: 'sprout', title: `You saved ${pct(rate)} in ${fmtDate(lm, { month: 'long' })}`, text: 'That beats the common goal of saving 20% of what you earn. Nice work.' }
      : { tone: 'warn', icon: 'target', title: `You saved ${pct(Math.max(rate, 0))} in ${fmtDate(lm, { month: 'long' })}`, text: `A common goal is to save 20% of what you earn. For you that is ${money(Math.round(lmT.income * 0.2))} a month.` });
  }

  const ef = emergencyFund();
  if (ef.monthly > 0) {
    out.push(ef.months >= 3
      ? { tone: 'good', icon: 'shield', title: `Emergency fund: ${ef.months.toFixed(1)} months`, text: 'You have a healthy cushion. Aim for 6 months for extra peace of mind.' }
      : { tone: 'warn', icon: 'shield', title: `Emergency fund: ${ef.months.toFixed(1)} months`, text: `Aim for at least 3 months of expenses (${money(ef.monthly * 3)}). Small automatic transfers help.` });
  }

  const wkEnd = sum(last30.filter(x => x.type === 'expense' && [0, 6].includes(parse(x.date).getDay())), x => x.amount);
  if (e30 > 0 && wkEnd / e30 > 0.35) {
    out.push({ tone: 'info', icon: 'calendar', title: 'Weekends cost more', text: `${pct(wkEnd / e30 * 100)} of your spending happens on Saturdays and Sundays. Plan free weekend activities.` });
  }
  return out;
}

function emergencyFund() {
  const accts = db.accounts.filter(a => a.emergency);
  const current = sum(accts, accountBalance);
  const monthly = avgMonthlySpend(null, 3);
  return { current, monthly, months: monthly > 0 ? current / monthly : 0, target: monthly * 6 };
}

/* ---------- charts ---------- */
function donut(segs, { size = 200, stroke = 30 } = {}) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, mid = size / 2;
  const total = sum(segs, s => s.value) || 1;
  let off = 0;
  const arcs = segs.map(s => {
    const len = s.value / total * c;
    const gap = segs.length > 1 ? Math.min(2.5, len / 2) : 0;
    const el = `<circle r="${r}" cx="${mid}" cy="${mid}" fill="none" style="stroke:${s.color}" stroke-width="${stroke}"
      stroke-dasharray="${Math.max(len - gap, 0)} ${c}" stroke-dashoffset="${-off}" transform="rotate(-90 ${mid} ${mid})"><title>${esc(s.label)}: ${money(s.value)}</title></circle>`;
    off += len;
    return el;
  }).join('');
  return `<svg class="donut" viewBox="0 0 ${size} ${size}" role="img" aria-label="Breakdown chart">
    <circle r="${r + stroke / 2}" cx="${mid}" cy="${mid}" fill="none" style="stroke:var(--surface)" stroke-width="0"/>
    <circle r="${r - stroke / 2}" cx="${mid}" cy="${mid}" fill="none" style="stroke:var(--surface)" stroke-width="0"/>
    <circle r="${r}" cx="${mid}" cy="${mid}" fill="none" style="stroke:var(--surface-2)" stroke-width="${stroke - 1.5}"/>
    ${arcs}</svg>`;
}

function topSegments(cats, max = 5) {
  const segs = cats.map(c => ({ label: c.name, value: c.value, color: c.color, icon: c.icon }));
  if (segs.length <= max + 1) return segs;
  return [...segs.slice(0, max), { label: 'Everything else', value: sum(segs.slice(max), s => s.value), color: 'var(--ink-3)', icon: null }];
}

function legend(segs) {
  const total = sum(segs, s => s.value) || 1;
  return `<ul class="legend">${segs.map(s => `
    <li><span class="dot" style="background:${s.color}"></span>
      <span class="lg-name">${esc(s.label)}</span>
      <span class="lg-val">${pct(s.value / total * 100)}</span></li>`).join('')}</ul>`;
}

/* ---------- shared bits ---------- */
const empty = (name, title, text, btn = '') =>
  `<div class="empty"><span class="empty-ico">${icon(name, 26)}</span><strong>${title}</strong><p>${text}</p>${btn}</div>`;

function txRow(t, withDate = false) {
  const c = cat(t.category), a = account(t.account);
  const meta = [withDate ? fmtDate(parse(t.date), { month: 'short', day: 'numeric' }) : '', c.name, a ? a.name : ''].filter(Boolean).join(' · ');
  return `<button class="tx${t.id === ui.flashId ? ' flash' : ''}" data-action="edit-tx" data-id="${t.id}">
    <span class="tx-ico" style="--c:${c.color}">${icon(c.icon)}</span>
    <span class="tx-main"><strong>${esc(t.note || c.name)}</strong><small>${esc(meta)}</small></span>
    <span class="amt ${t.type === 'income' ? 'inc' : 'exp'}">${t.type === 'income' ? '+' : '−'}${money(t.amount)}</span>
  </button>`;
}

const progress = (p, state) => `<div data-state="${state}"><div class="progress"><span style="width:${clamp(p, 0, 100)}%"></span></div></div>`;

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

/* =========================================================
   VIEWS
   ========================================================= */

function showWelcome() {
  try { return !localStorage.getItem(WELCOME_KEY); } catch { return false; }
}
function setWelcomeDone(done) {
  try { if (done) localStorage.setItem(WELCOME_KEY, '1'); else localStorage.removeItem(WELCOME_KEY); } catch { /* ignore */ }
}

function welcomeCard() {
  const first = !ui.welcomeShown;
  ui.welcomeShown = true;
  return `<section class="card welcome${first ? ' first' : ''}">
    <div>
      <h2>Welcome to Money Manager</h2>
      <p>This demo is filled with sample data so you can try everything. Your changes stay on this device.</p>
    </div>
    <ol class="steps">
      <li><span><b>Add</b> what you spend or earn with the <b>+</b> button.</span></li>
      <li><span><b>Set budgets</b> to see how much you have left.</span></li>
      <li><span><b>Check Insights</b> for tips on where to save.</span></li>
    </ol>
    <button class="btn" data-action="dismiss-welcome">Got it</button>
  </section>`;
}

function renderHome() {
  const t = today(), me = endOfMonth(t);
  const month = totals(txBetween(startOfMonth(t), me));
  const rows = budgetRows(t);
  const budgetTotal = sum(rows, r => r.limit), budgetSpent = sum(rows, r => r.spent);
  const left = budgetTotal - budgetSpent;
  const daysLeft = me.getDate() - t.getDate() + 1;
  const usedPct = budgetTotal ? budgetSpent / budgetTotal * 100 : 0;
  const usedState = usedPct >= 100 ? 'over' : usedPct >= 80 ? 'warn' : 'ok';
  const warnings = rows.filter(r => r.state !== 'ok').slice(0, 2);

  const segs = topSegments(byCategory(txBetween(addDays(t, -29), t)), 4);
  const spent30 = sum(segs, s => s.value);
  const dueSoon = db.bills.map(b => ({ b, s: billStatus(b) })).filter(x => x.s.state !== 'paid').sort((a, b) => a.s.days - b.s.days).slice(0, 3);
  const tips = insights();
  const tip = tips.length ? tips[t.getDate() % tips.length] : null;
  const recent = sortTx(db.tx).slice(0, 5);

  return `${showWelcome() ? welcomeCard() : ''}
  <div class="grid">
    <section class="card hero col-7">
      <div>
        <p class="hero-label">Total balance</p>
        <h2 class="hero-amount${money(netWorth()).length > 11 ? ' long' : ''}">${money(netWorth())}</h2>
      </div>
      <div class="hero-split">
        <div><span class="hs-ico in">${icon('arrowDown', 16)}</span><small>Money in this month</small><strong>+${money(month.income)}</strong></div>
        <div><span class="hs-ico out">${icon('arrowUp', 16)}</span><small>Money out this month</small><strong>−${money(month.expense)}</strong></div>
      </div>
      <div class="hero-actions">
        <button class="btn btn-primary" data-action="add-expense">${icon('minus', 18)} Add expense</button>
        <button class="btn btn-light" data-action="quick-income">${icon('plus', 18)} Add income</button>
      </div>
    </section>

    <section class="card col-5">
      <div class="card-head"><h2 class="card-title">Left to spend</h2><a class="link-btn" href="#/budgets">Budgets</a></div>
      ${budgetTotal ? `
        <p class="big-number">${left >= 0 ? money(left) : `−${money(-left)}`}</p>
        <p class="card-sub">${left >= 0
          ? `About <b>${money(Math.floor(left / daysLeft))}</b> a day for the next ${daysLeft} day${daysLeft === 1 ? '' : 's'}`
          : 'You went over your budget this month.'}</p>
        <div class="budget-bar" data-state="${usedState}"><div class="progress lg"><span style="width:${clamp(usedPct, 0, 100)}%"></span></div></div>
        <p class="card-sub">${money(budgetSpent)} of ${money(budgetTotal)} used</p>
        ${warnings.map(r => `<p class="note-line" data-state="${r.state}">${r.name} ${r.state === 'over' ? 'is over budget' : `is at ${pct(r.pct)} of its budget`}</p>`).join('')}`
      : empty('target', 'No budget yet', 'Set a monthly limit to see how much is left.', `<button class="btn btn-primary sm" data-action="new-budget">Set a budget</button>`)}
    </section>

    <section class="card col-6">
      <div class="card-head"><h2 class="card-title">Where your money went</h2><span class="card-sub">Last 30 days</span></div>
      ${segs.length ? `<div class="donut-row">
        <div class="donut-wrap">${donut(segs)}<div class="donut-center"><small>Spent</small><strong>${moneyShort(spent30)}</strong></div></div>
        ${legend(segs)}
      </div>` : empty('chart', 'Nothing spent yet', 'Add an expense and it will show up here.')}
    </section>

    <section class="card col-6">
      <div class="card-head"><h2 class="card-title">Bills due soon</h2><a class="link-btn" href="#/bills">All bills</a></div>
      ${dueSoon.length ? dueSoon.map(({ b, s }) => `
        <div class="mini-bill">
          <div class="mini-date"><small>${fmtDate(s.due, { month: 'short' })}</small><b>${s.due.getDate()}</b></div>
          <div class="tx-main"><strong>${esc(b.name)}</strong><small class="${s.state === 'overdue' ? 'bad-text' : ''}">${money(b.amount)} · ${s.label}</small></div>
          <button class="btn sm" data-action="pay-bill" data-id="${b.id}">Pay</button>
        </div>`).join('') : empty('check', 'All paid', 'Every bill is settled this month.')}
    </section>

    <section class="card col-4 insight-card">
      <h2 class="card-title">Tip for you</h2>
      ${tip ? `<p class="insight-big">${esc(tip.title)}</p><p>${esc(tip.text)}</p>` : '<p class="insight-big">Add a few entries to get tips.</p>'}
      <a class="btn sm" style="margin-top:16px" href="#/insights">More tips ${icon('right', 16)}</a>
    </section>

    <section class="card col-8">
      <div class="card-head"><h2 class="card-title">Recent activity</h2><a class="link-btn" href="#/records">See all</a></div>
      ${recent.length ? recent.map(r => txRow(r, true)).join('') : empty('receipt', 'Nothing here yet', 'Tap + to add your first expense.')}
    </section>

    <section class="card col-12">
      <div class="card-head"><h2 class="card-title">My wallets</h2><button class="btn sm" data-action="new-account">${icon('plus', 16)} Add wallet</button></div>
      <div class="wallet-grid">
        ${db.accounts.map(a => `<button class="wallet" data-action="edit-account" data-id="${a.id}">
          <span class="acct-swatch" style="background:${a.color}">${icon(ACCOUNT_TYPES[a.type]?.icon || 'wallet', 22)}</span>
          <span class="tx-main"><strong>${esc(a.name)}</strong><small>${ACCOUNT_TYPES[a.type]?.label || 'Wallet'}</small></span>
          <span class="amt">${money(accountBalance(a))}</span>
        </button>`).join('')}
      </div>
    </section>
  </div>`;
}

/* ----- Records ----- */
function recordsRange() {
  const c = ui.cursor;
  if (ui.period === 'day') return [c, c, fmtDate(c, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })];
  if (ui.period === 'week') {
    const s = startOfWeek(c), e = addDays(s, 6);
    return [s, e, `${fmtDate(s, { month: 'short', day: 'numeric' })} – ${fmtDate(e, { month: 'short', day: 'numeric', year: 'numeric' })}`];
  }
  return [startOfMonth(c), endOfMonth(c), fmtDate(c, { month: 'long', year: 'numeric' })];
}

function renderRecords() {
  const periods = { day: 'Day', week: 'Week', month: 'Month' };
  const types = { all: 'All', expense: 'Money out', income: 'Money in' };
  return `
  <div class="toolbar">
    <div class="seg" role="group" aria-label="Period">${Object.entries(periods).map(([k, v]) =>
      `<button class="${ui.period === k ? 'on' : ''}" data-action="period" data-p="${k}" aria-pressed="${ui.period === k}">${v}</button>`).join('')}</div>
    <div class="stepper">
      <button class="icon-btn sm" data-action="rec-step" data-dir="-1" aria-label="Previous">${icon('left', 18)}</button>
      <span id="rec-label"></span>
      <button class="icon-btn sm" data-action="rec-step" data-dir="1" aria-label="Next">${icon('right', 18)}</button>
    </div>
  </div>
  <div class="stat-strip" id="rec-sum"></div>
  <section class="card">
    <div class="filters">
      <label class="search">${icon('search', 18)}<input id="rec-q" class="input" type="search" enterkeyhint="search" placeholder="Search, e.g. lunch" value="${esc(ui.query)}" aria-label="Search history"></label>
      <div class="seg" role="group" aria-label="Type">${Object.entries(types).map(([k, v]) =>
        `<button class="${ui.type === k ? 'on' : ''}" data-action="rtype" data-t="${k}" aria-pressed="${ui.type === k}">${v}</button>`).join('')}</div>
    </div>
    <div id="rec-list"></div>
  </section>`;
}

function fillRecords() {
  const [s, e, label] = recordsRange();
  let list = txBetween(s, e);
  const all = totals(list);
  if (ui.type !== 'all') list = list.filter(t => t.type === ui.type);
  const q = ui.query.trim().toLowerCase();
  if (q) list = list.filter(t => (t.note + ' ' + cat(t.category).name + ' ' + (account(t.account)?.name || '')).toLowerCase().includes(q));
  list = sortTx(list);

  $('#rec-label').textContent = label;
  $('#rec-sum').innerHTML = `
    <div><small>Money in</small><strong class="inc">+${money(all.income)}</strong></div>
    <div><small>Money out</small><strong>−${money(all.expense)}</strong></div>
    <div><small>Difference</small><strong>${signed(all.income - all.expense)}</strong></div>`;

  if (!list.length) {
    $('#rec-list').innerHTML = empty('list', q ? 'No matches' : 'Nothing here yet', q ? 'Try a different word.' : 'Entries you add for this period show up here.',
      `<button class="btn btn-primary sm" data-action="add">${icon('plus', 16)} Add entry</button>`);
    return;
  }
  const groups = new Map();
  for (const t of list) { if (!groups.has(t.date)) groups.set(t.date, []); groups.get(t.date).push(t); }
  $('#rec-list').innerHTML = [...groups].map(([date, items]) => {
    const d = parse(date), tt = totals(items);
    return `<div class="day-group">
      <div class="day-head"><span><b>${d.getDate()}</b>${fmtDate(d, { weekday: 'long', month: 'short' })}</span><span class="num">${signed(tt.income - tt.expense)}</span></div>
      ${items.map(t => txRow(t)).join('')}
    </div>`;
  }).join('');
}

/* ----- Budgets ----- */
function renderBudgets() {
  const m = ui.bMonth, t = today();
  const rows = budgetRows(m);
  const total = sum(rows, r => r.limit), spent = sum(rows, r => r.spent);
  const isNow = sameMonth(m, t);
  const daysLeft = isNow ? endOfMonth(t).getDate() - t.getDate() + 1 : 0;
  const totalPct = total ? spent / total * 100 : 0;
  const totalState = totalPct >= 100 ? 'over' : totalPct >= 80 ? 'warn' : 'ok';

  const spentBy = byCategory(txBetween(startOfMonth(m), endOfMonth(m)));
  const unbudgeted = spentBy.filter(c => db.budgets[c.id] == null);
  const free = CATEGORIES.expense.filter(c => db.budgets[c.id] == null);

  return `
  <div class="toolbar">
    <div class="stepper">
      <button class="icon-btn sm" data-action="b-step" data-dir="-1" aria-label="Previous month">${icon('left', 18)}</button>
      <span>${fmtDate(m, { month: 'long', year: 'numeric' })}</span>
      <button class="icon-btn sm" data-action="b-step" data-dir="1" aria-label="Next month">${icon('right', 18)}</button>
    </div>
    ${free.length ? `<button class="btn btn-primary" data-action="new-budget">${icon('plus', 18)} New budget</button>` : ''}
  </div>

  <div class="stack">
    ${rows.length ? `<section class="card">
      <div class="kpis">
          <div class="kpi"><small>Monthly budget</small><strong>${money(total)}</strong></div>
          <div class="kpi"><small>Spent so far</small><strong>${money(spent)}</strong></div>
          <div class="kpi"><small>${total - spent >= 0 ? 'Left' : 'Over by'}</small><strong class="${total - spent >= 0 ? 'inc' : ''}">${money(Math.abs(total - spent))}</strong></div>
          ${isNow && total - spent > 0 ? `<div class="kpi"><small>You can spend</small><strong>${money(Math.floor((total - spent) / daysLeft))}</strong><span>a day for ${plural(daysLeft, 'day')}</span></div>` : ''}
      </div>
      <div class="budget-bar" data-state="${totalState}"><div class="progress lg"><span style="width:${clamp(totalPct, 0, 100)}%"></span></div></div>
      <p class="card-sub">${pct(totalPct)} of this month's budget used</p>
    </section>` : ''}

    ${rows.length ? `<div class="budget-list">${rows.map(r => `
      <article class="card budget-card" data-state="${r.state}">
        ${r.state === 'over' ? '<span class="stamp over">Over</span>' : ''}
        <div class="b-head">
          <span class="tx-ico" style="--c:${r.color}">${icon(r.icon)}</span>
          <div class="b-name"><strong>${r.name}</strong><small>${money(r.limit)} monthly</small></div>
          <button class="icon-btn sm ghost" data-action="edit-budget" data-cat="${r.id}" aria-label="Edit ${r.name} budget">${icon('edit', 18)}</button>
        </div>
        <div class="b-amt">${money(r.spent)} <small>spent</small></div>
        ${progress(r.pct, r.state)}
        <div class="b-foot">
          <span>${r.state === 'over' ? `Over by <b>${money(r.spent - r.limit)}</b>` : `<b>${money(r.limit - r.spent)}</b> left`}</span>
          <span class="pill ${r.state === 'over' ? 'bad' : r.state === 'warn' ? 'warn' : 'good'}">${r.pct >= 1000 ? '999%+' : pct(r.pct)}</span>
        </div>
      </article>`).join('')}</div>`
    : `<section class="card">${empty('target', 'No budgets yet', 'Create a budget for the categories you spend most on.', `<button class="btn btn-primary sm" data-action="new-budget">Create budget</button>`)}</section>`}

    ${unbudgeted.length ? `<section class="card">
      <div class="card-head"><h2 class="card-title">Spending without a budget</h2></div>
      <p class="card-sub" style="margin-bottom:12px">These categories had spending this month but no limit. Tap one to set a budget.</p>
      <div class="chip-row">${unbudgeted.map(c => `<button class="chip" data-action="edit-budget" data-cat="${c.id}">${c.name} · ${money(c.value)}</button>`).join('')}</div>
    </section>` : ''}
  </div>`;
}

/* ----- Bills ----- */
function renderBills() {
  const t = today();
  const items = db.bills.map(b => ({ b, s: billStatus(b) })).sort((x, y) => x.b.dueDay - y.b.dueDay);
  const total = sum(items, x => x.b.amount);
  const paid = sum(items.filter(x => x.s.state === 'paid'), x => x.b.amount);

  return `
  <div class="toolbar">
    <p class="muted">${fmtDate(t, { month: 'long', year: 'numeric' })}${items.length ? ` · ${items.filter(x => x.s.state === 'paid').length} of ${items.length} paid` : ''}</p>
    <button class="btn btn-primary" data-action="new-bill">${icon('plus', 18)} New bill</button>
  </div>
  ${items.length ? `<div class="stat-strip">
    <div><small>Bills this month</small><strong>${money(total)}</strong></div>
    <div><small>Paid</small><strong class="inc">${money(paid)}</strong></div>
    <div><small>Still to pay</small><strong>${money(total - paid)}</strong></div>
  </div>` : ''}
  ${items.length ? `<div class="bill-list">${items.map(({ b, s }) => {
    const c = cat(b.category), a = account(b.account);
    return `<article class="bill" data-state="${s.state}">
      <div class="bill-date"><small>${fmtDate(s.due, { month: 'short' })}</small><b>${s.due.getDate()}</b></div>
      ${s.state === 'paid' ? `<span class="stamp${b.id === ui.stampId ? ' fresh' : ''}">${icon('check', 14)} Paid</span>` : s.state === 'overdue' ? '<span class="stamp over">Overdue</span>' : ''}
      <div class="bill-body">
        <div class="bill-top">
          <div style="min-width:0"><strong class="bill-name">${esc(b.name)}</strong><small>${c.name}${a ? ' · ' + esc(a.name) : ''}</small></div>
          <button class="icon-btn sm ghost" data-action="edit-bill" data-id="${b.id}" aria-label="Edit ${esc(b.name)}">${icon('edit', 18)}</button>
        </div>
        <div class="bill-foot">
          <span class="amt">${money(b.amount)}</span>
          ${s.state === 'paid'
            ? `<button class="btn sm" data-action="unpay-bill" data-id="${b.id}" aria-label="Undo payment for ${esc(b.name)}">Undo</button>`
            : `<span class="pill ${s.state === 'overdue' ? 'bad' : s.state === 'soon' ? 'warn' : ''}">${s.label}</span>
               <button class="btn btn-primary sm" data-action="pay-bill" data-id="${b.id}">Mark paid</button>`}
        </div>
      </div>
    </article>`;
  }).join('')}</div>`
  : `<section class="card">${empty('receipt', 'No bills yet', 'Add rent, utilities and subscriptions so you never miss a due date.')}</section>`}`;
}

/* ----- Insights ----- */
function renderInsights() {
  const t = today();
  const last30 = txBetween(addDays(t, -29), t), prev30 = txBetween(addDays(t, -59), addDays(t, -30));
  const e30 = totals(last30).expense, ePrev = totals(prev30).expense;
  const change = ePrev ? (e30 - ePrev) / ePrev * 100 : 0;
  const lm = addMonths(t, -1), lmT = totals(txBetween(startOfMonth(lm), endOfMonth(lm)));
  const rate = lmT.income ? (lmT.income - lmT.expense) / lmT.income * 100 : 0;
  const cats = byCategory(last30);
  const ef = emergencyFund();
  const efPct = ef.target ? clamp(ef.current / ef.target * 100, 0, 100) : 0;
  const efAccount = db.accounts.find(a => a.emergency);
  const tips = insights();

  // money in vs out, last 6 months
  const flow = Array.from({ length: 6 }, (_, i) => addMonths(t, i - 5)).map(m => ({ m, ...totals(txBetween(startOfMonth(m), endOfMonth(m))) }));
  const max = Math.max(1, ...flow.flatMap(f => [f.income, f.expense]));

  // spending calendar
  const m = ui.iMonth, ms = startOfMonth(m), me = endOfMonth(m);
  const perDay = {};
  for (const x of txBetween(ms, me)) if (x.type === 'expense') perDay[x.date] = (perDay[x.date] || 0) + x.amount;
  const dayMax = Math.max(1, ...Object.values(perDay));
  const cells = [];
  for (let k = 0; k < (ms.getDay() + 6) % 7; k++) cells.push('<span class="heat-cell blank"></span>');
  for (let d = 1; d <= me.getDate(); d++) {
    const date = new Date(m.getFullYear(), m.getMonth(), d), key = ymd(date), v = perDay[key] || 0;
    const future = date > t;
    const level = v ? clamp(Math.ceil(v / dayMax * 4), 1, 4) : 0;
    cells.push(`<button class="heat-cell ${future ? 'future' : ''} ${key === ymd(t) ? 'today' : ''}" data-l="${level}" ${future ? 'disabled' : `data-action="goto-day" data-d="${key}"`} title="${fmtDate(date, { month: 'short', day: 'numeric' })}: ${money(v)}">${d}</button>`);
  }

  // biggest changes by category
  const prevMap = Object.fromEntries(byCategory(prev30).map(c => [c.id, c.value]));
  const movers = CATEGORIES.expense.map(c => {
    const now = (cats.find(x => x.id === c.id) || {}).value || 0, before = prevMap[c.id] || 0;
    return { ...c, now, before, diff: now - before };
  }).filter(x => x.now || x.before).sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff)).slice(0, 5);

  return `<div class="grid">
    <section class="card col-12">
      <div class="card-head"><h2 class="card-title">For you</h2><span class="card-sub">Based on your last 30 days</span></div>
      ${tips.length ? `<div class="insight-rows">${tips.map(x => `<div class="insight" data-tone="${x.tone}">
          <span class="tx-ico">${icon(x.icon)}</span>
          <div><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></div>
        </div>`).join('')}</div>` : empty('sprout', 'No tips yet', 'Add a few entries and tips will appear here.')}
    </section>

    <section class="card col-12">
      <div class="kpis">
        <div class="kpi"><small>You spend per day</small><strong>${money(Math.round(e30 / 30))}</strong><span>average, last 30 days</span></div>
        <div class="kpi"><small>Compared with the 30 days before</small><strong class="${change <= 0 ? 'inc' : ''}">${!ePrev ? '—' : `${change <= 0 ? '↓' : '↑'} ${growth(e30, ePrev)} ${change <= 0 ? 'less' : 'more'}`}</strong><span>${money(e30)} vs ${money(ePrev)}</span></div>
        <div class="kpi"><small>You saved in ${fmtDate(lm, { month: 'long' })}</small><strong>${lmT.income ? pct(Math.max(rate, 0)) : '—'}</strong><span>of what you earned</span></div>
      </div>
    </section>

    <section class="card col-7">
      <div class="card-head">
        <h2 class="card-title">Money in vs money out</h2>
        <div class="chart-legend"><span><i style="background:var(--ink)"></i>In</span><span><i style="background:var(--accent)"></i>Out</span></div>
      </div>
      ${flow.every(f => !f.income && !f.expense) ? empty('chart', 'No history yet', 'Your monthly totals will show up here.') : `<div class="bars">
        ${flow.map((f, i) => `<div class="bar-col ${i === 5 ? 'current' : ''}">
          <div class="bar-pair">
            <span class="bar inc" style="height:${f.income / max * 100}%" title="Money in ${money(f.income)}"></span>
            <span class="bar exp" style="height:${f.expense / max * 100}%" title="Money out ${money(f.expense)}"></span>
          </div>
          <span class="bar-label">${fmtDate(f.m, { month: 'short' })}</span>
        </div>`).join('')}
      </div>`}
    </section>

    <section class="card col-5">
      <div class="card-head"><h2 class="card-title">Emergency fund</h2>${ef.monthly ? `<span class="pill ${ef.months >= 3 ? 'good' : 'warn'}">${ef.months.toFixed(1)} months</span>` : ''}</div>
      <p class="big-number">${money(ef.current)}</p>
      <p class="card-sub">Savings for surprises like a hospital bill or losing your job. ${ef.monthly ? `A good goal is 6 months of spending: <b>${money(Math.round(ef.target))}</b>.` : 'Once you have a month of spending recorded, we will suggest a goal.'}</p>
      <div class="budget-bar" data-state="${efPct >= 50 ? 'ok' : 'warn'}"><div class="progress lg"><span style="width:${efPct}%"></span></div></div>
      ${efAccount ? `<button class="btn sm" data-action="ef-add" data-id="${efAccount.id}">${icon('plus', 16)} Add money to it</button>` : ''}
    </section>

    <section class="card col-7">
      <div class="card-head">
        <h2 class="card-title">Spending calendar</h2>
        <div class="stepper">
          <button class="icon-btn sm" data-action="i-step" data-dir="-1" aria-label="Previous month">${icon('left', 16)}</button>
          <span style="min-width:110px;font-size:15px">${fmtDate(m, { month: 'short', year: 'numeric' })}</span>
          <button class="icon-btn sm" data-action="i-step" data-dir="1" aria-label="Next month">${icon('right', 16)}</button>
        </div>
      </div>
      <p class="card-sub" style="margin-bottom:12px">Darker days are days you spent more. Tap a day to see what you bought.</p>
      <div class="heat-head">${['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => `<span>${d}</span>`).join('')}</div>
      <div class="heat">${cells.join('')}</div>
    </section>

    <section class="card col-5">
      <div class="card-head"><h2 class="card-title">What changed</h2><span class="card-sub">vs the 30 days before</span></div>
      ${movers.length ? movers.map(x => {
        const p = x.before ? x.diff / x.before * 100 : 100;
        return `<div class="mover">
          <span class="tx-ico" style="--c:${x.color}">${icon(x.icon)}</span>
          <div class="tx-main"><strong>${x.name}</strong><small>${money(x.before)} → ${money(x.now)}</small></div>
          <span class="delta ${x.diff > 0 ? 'up' : 'down'}">${x.diff > 0 ? '↑' : '↓'} ${pct(Math.abs(p))}</span>
        </div>`;
      }).join('') : empty('chart', 'Not enough data', 'Keep adding entries to see trends.')}
    </section>

    <section class="card col-12">
      <div class="card-head"><h2 class="card-title">Simple ways to spend smarter</h2></div>
      <ol class="tips">
        <li><span><b>Save first.</b> On payday, move your savings to a separate wallet before you spend anything.</span></li>
        <li><span><b>Wait a day.</b> Before buying something you don't need that costs over ${money(1000)}, sleep on it.</span></li>
        <li><span><b>Check your subscriptions.</b> Cancel any you haven't used in the last month.</span></li>
        <li><span><b>Write it down right away.</b> Entries you add later are easy to forget.</span></li>
      </ol>
    </section>
  </div>`;
}

const VIEWS = {
  home:     { title: 'Home',     sub: () => `${greeting()} · ${fmtDate(today(), { weekday: 'long', month: 'long', day: 'numeric' })}`, render: renderHome },
  records:  { title: 'History',  sub: () => 'Everything you spent and earned', render: renderRecords, after: afterRecords },
  budgets:  { title: 'Budgets',  sub: () => 'A monthly limit for each category', render: renderBudgets },
  bills:    { title: 'Bills',    sub: () => 'Due dates and payments', render: renderBills },
  insights: { title: 'Insights', sub: () => 'Tips and trends from your spending', render: renderInsights },
};

function afterRecords() {
  fillRecords();
  $('#rec-q').addEventListener('input', e => { ui.query = e.target.value; fillRecords(); });
}

function currentView() {
  const name = location.hash.replace(/^#\/?/, '');
  return VIEWS[name] ? name : 'home';
}

function render() {
  const v = currentView();
  const view = VIEWS[v];
  $$('[data-nav]').forEach(a => {
    const on = a.dataset.nav === v;
    a.classList.toggle('active', on);
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  $('#page-title').textContent = view.title;
  $('#page-sub').textContent = view.sub();
  document.title = `${view.title} · Money Manager`;
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
}

function commit() { save(); render(); }

function updateBell() {
  const n = alerts().length;
  $('#btn-bell').innerHTML = icon('bell') + (n ? `<span class="badge">${n}</span>` : '');
}

/* =========================================================
   MODALS
   ========================================================= */
const modalRoot = $('#modal-root');

function openModal(html, { cls = '', onClose } = {}) {
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
  void layer.offsetWidth; // commit the closed position so the open state transitions from it
  layer.classList.add('open');
  enableSheetDrag(layer);
  const focusEl = layer.querySelector('[data-autofocus]') || layer.querySelector('input, select, button:not([data-action="close-modal"])');
  focusEl?.focus({ preventScroll: true });
  return layer.querySelector('.modal');
}

const isSheet = () => window.matchMedia('(max-width: 640px)').matches;
// Layers that are animating out stay in the DOM briefly; they no longer count as open.
const topLayer = () => [...modalRoot.children].filter(l => !l.classList.contains('closing')).pop() || null;

function closeModal() {
  const layer = topLayer();
  if (!layer) return;
  layer.classList.add('closing');
  layer._onClose?.();
  setTimeout(() => layer.remove(), isSheet() ? 230 : 160);
  layer._returnFocus?.focus?.({ preventScroll: true });
}

/* Phone bottom sheet: drag the grip or header down to dismiss.
   Tracks the finger 1:1, rubber-bands upward, and uses release velocity
   to decide (a quick flick closes it even after a short drag). */
function rubberband(over, size, c = 0.55) {
  return (over * size * c) / (size + c * Math.abs(over));
}
function projectMomentum(velocityPxPerMs, rate = 0.998) {
  return velocityPxPerMs * rate / (1 - rate);
}
function enableSheetDrag(layer) {
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

const modalHead = title => `<header class="modal-head"><h2>${title}</h2><button class="icon-btn sm" data-action="close-modal" aria-label="Close">${icon('x', 18)}</button></header>`;

/* ----- transaction form ----- */
function catChips(type, selected) {
  const list = CATEGORIES[type];
  const sel = list.some(c => c.id === selected) ? selected : list[0].id;
  return list.map(c => `<label class="cat-chip" style="--c:${c.color}">
    <input type="radio" name="category" value="${c.id}" ${c.id === sel ? 'checked' : ''}>
    <span class="cat-emoji">${icon(c.icon, 22)}</span><span>${c.name}</span></label>`).join('');
}

function dayLabel(s) {
  if (!s) return 'Today';
  const d = parse(s), t = today();
  if (ymd(d) === ymd(t)) return 'Today';
  if (ymd(d) === ymd(addDays(t, -1))) return 'Yesterday';
  return fmtDate(d, { month: 'short', day: 'numeric', year: d.getFullYear() === t.getFullYear() ? undefined : 'numeric' });
}

function openTx(id, preset = {}) {
  const t = id ? db.tx.find(x => x.id === id) : null;
  if (id && !t) return;
  const d = t ? { ...t } : {
    type: preset.type || 'expense',
    amount: preset.amount ?? '',
    category: preset.category || (preset.type === 'income' ? 'salary' : 'food'),
    account: preset.account || db.accounts[0]?.id,
    date: preset.date || ymd(today()),
    note: preset.note || '',
  };
  const m = openModal(`${modalHead(t ? 'Edit entry' : 'New entry')}
    <form id="tx-form" class="form" data-id="${t ? t.id : ''}" autocomplete="off" novalidate>
      <div class="seg wide" role="radiogroup" aria-label="Type">
        ${['expense', 'income'].map(ty => `<input type="radio" name="type" id="ty-${ty}" value="${ty}" ${d.type === ty ? 'checked' : ''}><label for="ty-${ty}">${ty === 'expense' ? 'Expense' : 'Income'}</label>`).join('')}
      </div>
      <div class="amount-field">
        <span class="cur">${currencySymbol()}</span>
        <input name="amount" class="amount-input" inputmode="decimal" enterkeyhint="done" placeholder="0" value="${d.amount}" aria-label="Amount" data-autofocus>
        <button type="button" class="icon-btn sm" data-action="calc-into" aria-label="Open calculator" title="Calculator">${icon('calc', 18)}</button>
      </div>
      <div>
        <p class="field-label">Category</p>
        <div class="cat-grid" id="cat-grid">${catChips(d.type, d.category)}</div>
      </div>
      <label class="field"><span>Note <span class="opt">(optional)</span></span>
        <input name="note" class="input" maxlength="60" enterkeyhint="done" placeholder="e.g. Lunch with friends" value="${esc(d.note)}">
      </label>
      <details class="more">
        <summary><span class="more-sum">${icon('calendar', 16)}<span id="sum-date"></span>${icon('wallet', 16)}<span id="sum-acct"></span></span><span class="more-change">Change</span></summary>
        <div class="row2" style="margin-top:12px">
          <label class="field">Date<input type="date" name="date" class="input" value="${d.date}" required></label>
          <label class="field">Wallet
            <select name="account" class="input">${db.accounts.map(a => `<option value="${a.id}" ${a.id === d.account ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select>
          </label>
        </div>
      </details>
      <div class="form-actions">
        ${t ? `<button type="button" class="btn btn-danger" data-action="delete-tx" data-id="${t.id}">${icon('trash', 18)} Delete</button>` : ''}
        <button type="submit" class="btn btn-primary btn-big">${icon('check', 18)} Save</button>
      </div>
    </form>`);
  const form = $('#tx-form', m);
  const sync = () => {
    $('#sum-date', m).textContent = dayLabel(form.date.value);
    $('#sum-acct', m).textContent = form.account.selectedOptions[0]?.textContent || '';
  };
  form.date.addEventListener('change', sync);
  form.account.addEventListener('change', sync);
  sync();
  $$('input[name="type"]', m).forEach(r => r.addEventListener('change', () => {
    const grid = $('#cat-grid', m);
    grid.innerHTML = catChips(r.value, null);
    grid.classList.remove('swap'); void grid.offsetWidth; grid.classList.add('swap');
  }));
}

function saveTx(form) {
  const f = new FormData(form);
  const amount = evaluate(f.get('amount'));
  if (!amount || amount <= 0) {
    const field = form.querySelector('.amount-field');
    field.classList.remove('shake'); void field.offsetWidth; field.classList.add('shake');
    toast('Enter an amount greater than zero', 'warn');
    form.amount.focus();
    return;
  }
  const rec = {
    type: f.get('type'),
    amount: round2(amount),
    category: f.get('category'),
    account: f.get('account'),
    date: f.get('date') || ymd(today()),
    note: String(f.get('note') || '').trim(),
  };
  const id = form.dataset.id;
  if (id) Object.assign(db.tx.find(t => t.id === id), rec);
  else db.tx.push({ id: uid(), ts: Date.now(), ...rec });
  ui.flashId = id || db.tx[db.tx.length - 1].id;
  closeModal();
  commit();
  buzz();
  toast(id ? 'Entry updated' : `${rec.type === 'expense' ? 'Expense' : 'Income'} of ${money(rec.amount)} saved`, 'good');
  if (rec.type === 'expense') budgetCheck(rec);
}

function budgetCheck(rec) {
  const row = budgetRows(parse(rec.date)).find(r => r.id === rec.category);
  if (!row) return;
  const before = (row.spent - rec.amount) / row.limit * 100;
  setTimeout(() => {
    if (row.pct >= 100 && before < 100) toast(`${row.name} is now over budget by ${money(row.spent - row.limit)}`, 'bad');
    else if (row.pct >= 80 && before < 80) toast(`Heads up: ${row.name} is at ${pct(row.pct)} of its budget`, 'warn');
  }, 450);
}

function deleteTx(id) {
  const i = db.tx.findIndex(t => t.id === id);
  if (i < 0) return;
  const [removed] = db.tx.splice(i, 1);
  if (removed.billId) {
    const b = db.bills.find(x => x.id === removed.billId);
    if (b) b.paid = b.paid.filter(k => k !== removed.billMonth);
  }
  closeModal();
  commit();
  toast('Entry deleted', 'info', {
    action: { label: 'Undo', fn: () => {
      db.tx.splice(i, 0, removed);
      if (removed.billId) db.bills.find(x => x.id === removed.billId)?.paid.push(removed.billMonth);
      commit();
    } },
  });
}

/* ----- calculator ----- */
function openCalc(target) {
  let expr = target ? String(target.value || '') : '';
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
    $('#calc-expr', m).textContent = expr || ' ';
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
    if (target) { target.value = round2(v); target.focus(); }
    else openTx(null, { amount: round2(v) });
  });
  update();
}

/* ----- budget form ----- */
function openBudget(catId) {
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
        <input name="limit" class="input" inputmode="decimal" enterkeyhint="done" value="${editing ? db.budgets[catId] : ''}" placeholder="e.g. 5000" data-autofocus>
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

function saveBudget(form) {
  const id = form.dataset.editing || form.category.value;
  const limit = evaluate(form.limit.value);
  if (!limit || limit <= 0) { toast('Enter a limit greater than zero', 'warn'); form.limit.focus(); return; }
  db.budgets[id] = round2(limit);
  closeModal();
  commit();
  toast(`${cat(id).name} budget set to ${money(limit)}`, 'good');
}

/* ----- bill form ----- */
function openBill(id) {
  const b = id ? db.bills.find(x => x.id === id) : null;
  const d = b || { name: '', amount: '', dueDay: today().getDate(), category: 'bills', account: db.accounts[0]?.id };
  openModal(`${modalHead(b ? 'Edit bill' : 'New bill')}
    <form id="bill-form" class="form" data-id="${b ? b.id : ''}" novalidate>
      <label class="field">Name<input name="name" class="input" maxlength="40" value="${esc(d.name)}" placeholder="e.g. Internet" data-autofocus></label>
      <div class="row2">
        <label class="field">Amount<input name="amount" class="input" inputmode="decimal" value="${d.amount}" placeholder="0"></label>
        <label class="field">Due day of month<input name="dueDay" class="input" type="number" inputmode="numeric" min="1" max="31" value="${d.dueDay}"></label>
      </div>
      <div class="row2">
        <label class="field">Category<select name="category" class="input">${CATEGORIES.expense.map(c => `<option value="${c.id}" ${c.id === d.category ? 'selected' : ''}>${c.name}</option>`).join('')}</select></label>
        <label class="field">Pay from<select name="account" class="input">${db.accounts.map(a => `<option value="${a.id}" ${a.id === d.account ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select></label>
      </div>
      <div class="form-actions">
        ${b ? `<button type="button" class="btn btn-danger" data-action="delete-bill" data-id="${b.id}">${icon('trash', 18)} Delete</button>` : ''}
        <span class="spacer"></span>
        <button type="button" class="btn" data-action="close-modal">Cancel</button>
        <button type="submit" class="btn btn-primary">${icon('check', 18)} Save</button>
      </div>
    </form>`, { cls: 'narrow' });
}

function saveBill(form) {
  const name = form.name.value.trim();
  const amount = evaluate(form.amount.value);
  const dueDay = clamp(parseInt(form.dueDay.value, 10) || 1, 1, 31);
  if (!name) { toast('Give the bill a name', 'warn'); form.name.focus(); return; }
  if (!amount || amount <= 0) { toast('Enter an amount greater than zero', 'warn'); form.amount.focus(); return; }
  const rec = { name, amount: round2(amount), dueDay, category: form.category.value, account: form.account.value };
  const id = form.dataset.id;
  if (id) Object.assign(db.bills.find(b => b.id === id), rec);
  else db.bills.push({ id: uid(), paid: [], ...rec });
  closeModal();
  commit();
  toast(id ? 'Bill updated' : `${name} added to your bills`, 'good');
}

function payBill(id) {
  const b = db.bills.find(x => x.id === id);
  if (!b) return;
  const key = monthKey(today());
  db.tx.push({ id: uid(), ts: Date.now(), type: 'expense', amount: b.amount, category: b.category, account: b.account, date: ymd(today()), note: b.name, billId: b.id, billMonth: key });
  b.paid.push(key);
  ui.stampId = b.id;
  commit();
  buzz();
  toast(`${b.name} paid · ${money(b.amount)} recorded`, 'good');
  budgetCheck({ date: ymd(today()), category: b.category, amount: b.amount });
}

function unpayBill(id) {
  const b = db.bills.find(x => x.id === id);
  if (!b) return;
  const key = monthKey(today());
  b.paid = b.paid.filter(k => k !== key);
  db.tx = db.tx.filter(t => !(t.billId === id && t.billMonth === key));
  commit();
  toast(`${b.name} marked as unpaid`, 'info');
}

/* ----- account form ----- */
function openAccount(id) {
  const a = id ? account(id) : null;
  const d = a || { name: '', type: 'bank', start: '', color: ACCOUNT_COLORS[db.accounts.length % ACCOUNT_COLORS.length], emergency: false };
  openModal(`${modalHead(a ? 'Edit wallet' : 'New wallet')}
    <form id="account-form" class="form" data-id="${a ? a.id : ''}" novalidate>
      <label class="field">Name<input name="name" class="input" maxlength="30" value="${esc(d.name)}" placeholder="e.g. GCash or Payroll card" data-autofocus></label>
      <div class="row2">
        <label class="field">Type<select name="type" class="input">${Object.entries(ACCOUNT_TYPES).map(([k, v]) => `<option value="${k}" ${k === d.type ? 'selected' : ''}>${v.label}</option>`).join('')}</select></label>
        <label class="field">Starting balance<input name="start" class="input" inputmode="decimal" value="${d.start}" placeholder="0"></label>
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

function saveAccount(form) {
  const name = form.name.value.trim();
  if (!name) { toast('Give the wallet a name', 'warn'); form.name.focus(); return; }
  const start = form.start.value.trim() ? evaluate(form.start.value) : 0;
  if (start == null) { toast('Starting balance must be a number', 'warn'); form.start.focus(); return; }
  const rec = { name, type: form.type.value, start: round2(start), color: (form.querySelector('input[name="color"]:checked') || {}).value || ACCOUNT_COLORS[0], emergency: form.emergency.checked };
  const id = form.dataset.id;
  if (id) Object.assign(account(id), rec);
  else db.accounts.push({ id: uid(), ...rec });
  closeModal();
  commit();
  toast(id ? 'Wallet updated' : `${name} added`, 'good');
}

function deleteAccount(id) {
  const used = db.tx.some(t => t.account === id) || db.bills.some(b => b.account === id);
  if (used) { toast('This wallet has entries or bills. Move or delete those first.', 'warn'); return; }
  if (db.accounts.length <= 1) { toast('Keep at least one wallet', 'warn'); return; }
  db.accounts = db.accounts.filter(a => a.id !== id);
  closeModal();
  commit();
  toast('Wallet deleted', 'info');
}

/* ----- alerts + settings ----- */
function openAlerts() {
  const list = alerts();
  openModal(`${modalHead('Notifications')}
    ${list.length ? list.map(a => `<a class="alert-item" href="${a.href}" data-action="close-modal" data-tone="${a.tone}">
      <span class="tx-ico">${icon(a.icon)}</span>
      <span><strong>${esc(a.title)}</strong><small>${esc(a.text)}</small></span>
    </a>`).join('') : empty('check', 'All clear', 'No budget warnings or bills due soon.')}`, { cls: 'narrow' });
}

function openSettings() {
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

/* ---------- toasts ---------- */
function toast(msg, tone = 'info', opts = {}) {
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
const buzz = () => { try { navigator.vibrate?.(12); } catch { /* not supported */ } };

/* ---------- theme ---------- */
let theme = (() => { try { return localStorage.getItem(THEME_KEY) || 'system'; } catch { return 'system'; } })();
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
const effectiveTheme = () => theme === 'system' ? (darkQuery.matches ? 'dark' : 'light') : theme;

function setTheme(t) {
  theme = t;
  try { if (t === 'system') localStorage.removeItem(THEME_KEY); else localStorage.setItem(THEME_KEY, t); } catch { /* ignore */ }
  if (t === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = t;
  paintThemeButton();
}
function paintThemeButton() {
  const dark = effectiveTheme() === 'dark';
  const auto = theme === 'system';
  $$('meta[name="theme-color"]').forEach(m => {
    const forDark = m.media.includes('dark');
    m.setAttribute('content', auto ? (forDark ? '#0F1D28' : '#E9E4E0') : (dark ? '#0F1D28' : '#E9E4E0'));
  });
}
darkQuery.addEventListener?.('change', paintThemeButton);

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

  'reset-demo': () => {
    if (!confirm('Replace everything with fresh sample data?')) return;
    const currency = db.currency;
    db = seed(); db.currency = currency;
    closeModal(); commit();
    toast('Sample data restored', 'good');
  },
  'clear-all': () => {
    if (!confirm('Remove all entries, bills and budgets? Your wallets stay, with a zero balance.')) return;
    db.tx = []; db.bills = []; db.budgets = {};
    db.accounts.forEach(a => { a.start = 0; });
    closeModal(); commit();
    toast('Starting fresh. Tap + to add your first record.', 'good');
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

document.addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  if (f.id === 'tx-form') saveTx(f);
  else if (f.id === 'budget-form') saveBudget(f);
  else if (f.id === 'bill-form') saveBill(f);
  else if (f.id === 'account-form') saveAccount(f);
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
const navHtml = mobile => NAV.map(n => `<a href="#/${n.id}" data-nav="${n.id}">${icon(n.icon, mobile ? 22 : 20)}<span>${n.label}</span></a>`).join('');
$('#side-nav').innerHTML = navHtml(false);
$('#bottom-nav').innerHTML = navHtml(true);
$('#btn-calc').innerHTML = icon('calc');
$('#btn-settings').innerHTML = icon('gear');
paintThemeButton();

window.addEventListener('hashchange', render);
save();
render();
})();
