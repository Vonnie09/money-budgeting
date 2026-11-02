/* =========================================================
   Money Manager — demo web app
   No server, no database. Sample data is generated on first
   visit and saved in this browser's localStorage only.
   ========================================================= */
(() => {
'use strict';

const STORE_KEY = 'mm-demo-v1';
const THEME_KEY = 'mm-theme';

/* ---------- reference data ---------- */
const CATEGORIES = {
  expense: [
    { id: 'food',      name: 'Food & Dining', emoji: '🍜', color: '#F26B4F' },
    { id: 'groceries', name: 'Groceries',     emoji: '🥬', color: '#7BC47F' },
    { id: 'transport', name: 'Transport',     emoji: '🚌', color: '#4F8DF2' },
    { id: 'bills',     name: 'Bills',         emoji: '💡', color: '#F2B84F' },
    { id: 'shopping',  name: 'Shopping',      emoji: '🛍️', color: '#C77DF2' },
    { id: 'health',    name: 'Health',        emoji: '💊', color: '#4FC7C0' },
    { id: 'fun',       name: 'Entertainment', emoji: '🎬', color: '#F27DB5' },
    { id: 'education', name: 'Education',     emoji: '📚', color: '#B08D57' },
    { id: 'other',     name: 'Others',        emoji: '📦', color: '#9AA39C' },
  ],
  income: [
    { id: 'salary',    name: 'Salary',    emoji: '💼', color: '#3E8E63' },
    { id: 'freelance', name: 'Freelance', emoji: '💻', color: '#6FB58A' },
    { id: 'business',  name: 'Business',  emoji: '🏪', color: '#A9D18E' },
    { id: 'gift',      name: 'Gifts',     emoji: '🎁', color: '#C9F26B' },
  ],
};
const ALL_CATS = [...CATEGORIES.expense, ...CATEGORIES.income];
const cat = id => ALL_CATS.find(c => c.id === id) || CATEGORIES.expense[CATEGORIES.expense.length - 1];

const ACCOUNT_TYPES = {
  cash:    { label: 'Cash',       emoji: '💵' },
  bank:    { label: 'Bank',       emoji: '🏦' },
  ewallet: { label: 'E-wallet',   emoji: '📱' },
  savings: { label: 'Savings',    emoji: '🐷' },
  card:    { label: 'Credit card', emoji: '💳' },
  invest:  { label: 'Investment', emoji: '📈' },
};
const ACCOUNT_COLORS = ['#F2B84F', '#4F8DF2', '#4FC7C0', '#7BC47F', '#C77DF2', '#F27DB5', '#F26B4F', '#9AA39C'];

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
  { id: 'home',     label: 'Overview', short: 'Home',     icon: 'home' },
  { id: 'records',  label: 'Records',  short: 'Records',  icon: 'list' },
  { id: 'budgets',  label: 'Budgets',  short: 'Budgets',  icon: 'target' },
  { id: 'bills',    label: 'Bills',    short: 'Bills',    icon: 'receipt' },
  { id: 'insights', label: 'Insights', short: 'Insights', icon: 'chart' },
  { id: 'assets',   label: 'Assets',   short: 'Assets',   icon: 'wallet' },
];

/* ---------- icons (24px stroke) ---------- */
const ICONS = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/><path d="M10 20v-5h4v5"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01" stroke-width="3"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  chart: '<path d="M4 4v16h16"/><path d="m7.5 14.5 3.5-4 3 3 5-6.5"/>',
  wallet: '<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3"/><path d="M4 7.5v10A2.5 2.5 0 0 0 6.5 20H20V8H6.5A2.5 2.5 0 0 1 4 5.5"/><circle cx="16" cy="14" r="1.2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
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
    { id: 'cash',      name: 'Cash Wallet',    type: 'cash',    start: 3500,  color: '#F2B84F' },
    { id: 'bank',      name: 'Savings Bank',   type: 'bank',    start: 38000, color: '#4F8DF2' },
    { id: 'ewallet',   name: 'E-Wallet',       type: 'ewallet', start: 1800,  color: '#4FC7C0' },
    { id: 'emergency', name: 'Emergency Fund', type: 'savings', start: 26000, color: '#7BC47F', emergency: true },
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
    if (r.state === 'over') out.push({ tone: 'bad', emoji: r.emoji, title: `${r.name} is over budget`, text: `Spent ${money(r.spent)} of ${money(r.limit)}, over by ${money(r.spent - r.limit)}.`, href: '#/budgets' });
    else if (r.state === 'warn') out.push({ tone: 'warn', emoji: r.emoji, title: `${r.name} is at ${pct(r.pct)}`, text: `${money(r.limit - r.spent)} left for this month.`, href: '#/budgets' });
  }
  for (const b of db.bills) {
    const s = billStatus(b);
    if (s.state === 'overdue' || s.state === 'soon') {
      out.push({ tone: s.state === 'overdue' ? 'bad' : 'warn', emoji: '🧾', title: `${b.name}: ${s.label.toLowerCase()}`, text: `${money(b.amount)} due ${fmtDate(s.due, { month: 'short', day: 'numeric' })}.`, href: '#/bills' });
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
      ? { tone: 'good', emoji: '📉', title: `You spent ${pct(-ch)} less`, text: `${money(e30)} in the last 30 days vs ${money(ePrev)} the 30 days before. Keep it up!` }
      : { tone: 'warn', emoji: '📈', title: `Spending is up ${pct(ch)}`, text: `${money(e30)} in the last 30 days vs ${money(ePrev)} before. Check which category grew below.` });
  }

  const top = byCategory(last30)[0];
  if (top && e30 > 0) {
    out.push({ tone: 'info', emoji: top.emoji, title: `${top.name} is your biggest spend`, text: `${pct(top.value / e30 * 100)} of the last 30 days (${money(top.value)}). Cutting it by 15% would save about ${money(top.value * 0.15)} a month.` });
  }

  const over = budgetRows(t).filter(r => r.state === 'over');
  if (over.length) {
    const r = over[0];
    out.push({ tone: 'bad', emoji: '🚨', title: `${r.name} went over budget`, text: `Over by ${money(r.spent - r.limit)} this month. Try a 48-hour pause before non-essential buys.` });
  }

  const small = last30.filter(x => x.type === 'expense' && x.amount <= 150);
  if (small.length >= 10) {
    out.push({ tone: 'info', emoji: '🪙', title: 'Small buys add up', text: `${small.length} purchases of ${money(150)} or less totalled ${money(sum(small, x => x.amount))} in 30 days.` });
  }

  const lm = addMonths(t, -1);
  const lmT = totals(txBetween(startOfMonth(lm), endOfMonth(lm)));
  if (lmT.income > 0) {
    const rate = (lmT.income - lmT.expense) / lmT.income * 100;
    out.push(rate >= 20
      ? { tone: 'good', emoji: '🌱', title: `You saved ${pct(rate)} in ${fmtDate(lm, { month: 'long' })}`, text: 'That beats the 20% savings goal from the 50/30/20 rule. Nice work.' }
      : { tone: 'warn', emoji: '🎯', title: `Savings rate: ${pct(Math.max(rate, 0))} in ${fmtDate(lm, { month: 'long' })}`, text: `The 50/30/20 rule suggests saving 20%. That would be ${money(lmT.income * 0.2)} a month for you.` });
  }

  const ef = emergencyFund();
  if (ef.monthly > 0) {
    out.push(ef.months >= 3
      ? { tone: 'good', emoji: '🛟', title: `Emergency fund: ${ef.months.toFixed(1)} months`, text: 'You have a healthy cushion. Aim for 6 months for extra peace of mind.' }
      : { tone: 'warn', emoji: '🛟', title: `Emergency fund: ${ef.months.toFixed(1)} months`, text: `Aim for at least 3 months of expenses (${money(ef.monthly * 3)}). Small automatic transfers help.` });
  }

  const wkEnd = sum(last30.filter(x => x.type === 'expense' && [0, 6].includes(parse(x.date).getDay())), x => x.amount);
  if (e30 > 0 && wkEnd / e30 > 0.35) {
    out.push({ tone: 'info', emoji: '🎉', title: 'Weekends cost more', text: `${pct(wkEnd / e30 * 100)} of your spending happens on Saturdays and Sundays. Plan free weekend activities.` });
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
    <circle r="${r + stroke / 2}" cx="${mid}" cy="${mid}" fill="none" style="stroke:var(--line)" stroke-width="1.5"/>
    <circle r="${r - stroke / 2}" cx="${mid}" cy="${mid}" fill="none" style="stroke:var(--line)" stroke-width="1.5"/>
    <circle r="${r}" cx="${mid}" cy="${mid}" fill="none" style="stroke:var(--surface-2)" stroke-width="${stroke - 1.5}"/>
    ${arcs}</svg>`;
}

function topSegments(cats, max = 5) {
  const segs = cats.map(c => ({ label: c.name, value: c.value, color: c.color, emoji: c.emoji }));
  if (segs.length <= max + 1) return segs;
  return [...segs.slice(0, max), { label: 'Everything else', value: sum(segs.slice(max), s => s.value), color: 'var(--ink-3)', emoji: '•' }];
}

function legend(segs) {
  const total = sum(segs, s => s.value) || 1;
  return `<ul class="legend">${segs.map(s => `
    <li><span class="dot" style="background:${s.color}"></span>
      <span class="lg-name">${s.emoji} ${esc(s.label)}</span>
      <span class="lg-val">${pct(s.value / total * 100)}</span></li>`).join('')}</ul>`;
}

/* ---------- shared bits ---------- */
const empty = (emoji, title, text, btn = '') =>
  `<div class="empty"><span class="big">${emoji}</span><strong>${title}</strong><p>${text}</p>${btn}</div>`;

function txRow(t, withDate = false) {
  const c = cat(t.category), a = account(t.account);
  const meta = [withDate ? fmtDate(parse(t.date), { month: 'short', day: 'numeric' }) : '', c.name, a ? a.name : ''].filter(Boolean).join(' · ');
  return `<button class="tx" data-action="edit-tx" data-id="${t.id}">
    <span class="tx-ico" style="--c:${c.color}">${c.emoji}</span>
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

function renderHome() {
  const t = today(), ms = startOfMonth(t), me = endOfMonth(t);
  const month = totals(txBetween(ms, me));
  const rows = budgetRows(t);
  const budgetTotal = sum(rows, r => r.limit), budgetSpent = sum(rows, r => r.spent);
  const left = budgetTotal - budgetSpent;
  const daysLeft = me.getDate() - t.getDate() + 1;
  const usedPct = budgetTotal ? budgetSpent / budgetTotal * 100 : 0;

  // Where it went: last 30 days
  const last30 = txBetween(addDays(t, -29), t);
  const segs = topSegments(byCategory(last30));
  const spent30 = sum(segs, s => s.value);

  // Cash flow: 6 months
  const months = Array.from({ length: 6 }, (_, i) => addMonths(t, i - 5));
  const flow = months.map(m => ({ m, ...totals(txBetween(startOfMonth(m), endOfMonth(m))) }));
  const max = Math.max(1, ...flow.flatMap(f => [f.income, f.expense]));
  const avgNet = sum(flow.slice(0, 5), f => f.income - f.expense) / 5;

  const upcoming = db.bills.map(b => ({ b, s: billStatus(b) })).filter(x => x.s.state !== 'paid').sort((a, b) => a.s.days - b.s.days).slice(0, 4);
  const tips = insights();
  const tip = tips.length ? tips[t.getDate() % tips.length] : null;
  const recent = sortTx(db.tx).slice(0, 6);
  const quick = ['food', 'transport', 'groceries', 'shopping', 'bills', 'fun'].map(cat);

  return `<div class="grid">
    <section class="card hero col-8">
      <div class="hero-top">
        <div>
          <p class="eyebrow">${greeting()} 👋</p>
          <h2 class="hero-title">You've spent <em>${money(month.expense)}</em> in ${fmtDate(t, { month: 'long' })}</h2>
        </div>
        <span class="pill lime">${daysLeft} day${daysLeft === 1 ? '' : 's'} left</span>
      </div>
      <div>
        <div class="meter ${left < 0 ? 'over' : ''}"><span style="width:${clamp(usedPct, 0, 100)}%"></span></div>
        <div class="meter-legend">
          <span>${money(budgetSpent)} of ${money(budgetTotal)} budgeted</span>
          <span>${left >= 0 ? `${money(left)} left · ${money(left / daysLeft)}/day` : `Over budget by ${money(-left)}`}</span>
        </div>
      </div>
      <div class="hero-stats">
        <div><small>Income</small><strong>${money(month.income)}</strong></div>
        <div><small>Expenses</small><strong>${money(month.expense)}</strong></div>
        <div><small>Cash flow</small><strong>${signed(month.income - month.expense)}</strong></div>
        <div><small>Net worth</small><strong>${moneyShort(netWorth())}</strong></div>
      </div>
    </section>

    <section class="card col-4">
      <div class="card-head"><h2 class="card-title">Quick add</h2><span class="card-sub">2 taps to log</span></div>
      <div class="cat-grid">
        ${quick.map(c => `<button class="cat-chip" style="--c:${c.color}" data-action="quick" data-cat="${c.id}"><span class="cat-emoji">${c.emoji}</span><span>${c.name}</span></button>`).join('')}
      </div>
      <button class="btn wide" style="margin-top:12px" data-action="quick-income">${icon('plus', 18)} Add income</button>
    </section>

    <section class="card col-5">
      <div class="card-head"><h2 class="card-title">Where it went</h2><a class="link-btn" href="#/insights">Insights</a></div>
      ${segs.length ? `<div class="donut-row">
        <div class="donut-wrap">${donut(segs)}<div class="donut-center"><small>Last 30 days</small><strong>${moneyShort(spent30)}</strong></div></div>
        ${legend(segs)}
      </div>` : empty('🌤️', 'Nothing spent yet', 'Your category breakdown will show up here.')}
    </section>

    <section class="card col-7">
      <div class="card-head">
        <h2 class="card-title">Cash flow</h2>
        <div class="chart-legend"><span><i style="background:var(--lime)"></i>Income</span><span><i style="background:var(--expense)"></i>Expenses</span></div>
      </div>
      <div class="bars">
        ${flow.map((f, i) => `<div class="bar-col ${i === 5 ? 'current' : ''}">
          <div class="bar-pair">
            <span class="bar inc" style="height:${f.income / max * 100}%" title="Income ${money(f.income)}"></span>
            <span class="bar exp" style="height:${f.expense / max * 100}%" title="Expenses ${money(f.expense)}"></span>
          </div>
          <span class="bar-label">${fmtDate(f.m, { month: 'short' })}</span>
        </div>`).join('')}
      </div>
      <p class="card-sub" style="margin-top:12px">Average net per month: <b class="${avgNet >= 0 ? 'inc' : ''}">${signed(avgNet)}</b></p>
    </section>

    <section class="card col-4">
      <div class="card-head"><h2 class="card-title">Budgets</h2><a class="link-btn" href="#/budgets">All budgets</a></div>
      ${rows.length ? `<div class="budget-mini">${rows.slice(0, 4).map(r => `
        <div class="b-row">
          <span class="tx-ico" style="--c:${r.color}">${r.emoji}</span>
          <div>
            <div class="b-top"><b>${r.name}</b><span class="muted num">${moneyShort(r.spent)} / ${moneyShort(r.limit)}</span></div>
            ${progress(r.pct, r.state)}
          </div>
        </div>`).join('')}</div>` : empty('🎯', 'No budgets yet', 'Set one to stay on track.', `<button class="btn sm" data-action="new-budget">Create budget</button>`)}
    </section>

    <section class="card col-4">
      <div class="card-head"><h2 class="card-title">Upcoming bills</h2><a class="link-btn" href="#/bills">All bills</a></div>
      ${upcoming.length ? upcoming.map(({ b, s }) => `
        <div class="mini-bill">
          <div class="mini-date"><small>${fmtDate(s.due, { month: 'short' })}</small><b>${s.due.getDate()}</b></div>
          <div class="tx-main"><strong>${esc(b.name)}</strong><small>${money(b.amount)}</small></div>
          <span class="pill ${s.state === 'overdue' ? 'bad' : s.state === 'soon' ? 'warn' : ''}">${s.label}</span>
        </div>`).join('') : empty('🎉', 'All paid', 'Every bill is settled this month.')}
    </section>

    <section class="card col-4 insight-card">
      <p class="eyebrow">Insight of the day</p>
      ${tip ? `<p class="insight-big">${tip.emoji} ${esc(tip.title)}</p><p>${esc(tip.text)}</p>` : '<p class="insight-big">Add a few records to unlock insights.</p>'}
      <a class="btn sm" style="margin-top:16px" href="#/insights">More insights ${icon('right', 16)}</a>
    </section>

    <section class="card col-12">
      <div class="card-head"><h2 class="card-title">Recent records</h2><a class="link-btn" href="#/records">See all</a></div>
      ${recent.length ? recent.map(r => txRow(r, true)).join('') : empty('🧾', 'No records yet', 'Tap + to add your first expense.')}
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
  const periods = { day: 'Daily', week: 'Weekly', month: 'Monthly' };
  const types = { all: 'All', expense: 'Expenses', income: 'Income' };
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
      <label class="search">${icon('search', 18)}<input id="rec-q" class="input" type="search" placeholder="Search notes or categories" value="${esc(ui.query)}" aria-label="Search records"></label>
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
    <div><small>Income</small><strong class="inc">+${money(all.income)}</strong></div>
    <div><small>Expenses</small><strong>−${money(all.expense)}</strong></div>
    <div><small>Net</small><strong>${signed(all.income - all.expense)}</strong></div>
    <div><small>Records</small><strong>${list.length}</strong></div>`;

  if (!list.length) {
    $('#rec-list').innerHTML = empty('🗂️', q ? 'No matches' : 'Nothing recorded here', q ? 'Try a different search word.' : 'Records you add for this period show up here.',
      `<button class="btn btn-primary sm" data-action="add">${icon('plus', 16)} Add record</button>`);
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
  const ringColor = totalPct >= 100 ? 'var(--expense)' : totalPct >= 80 ? 'var(--warn)' : 'var(--income)';

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
    <section class="card">
      <div class="summary-row">
        <div class="ring-wrap">
          ${donut([{ label: 'Spent', value: Math.min(spent, total), color: ringColor }, { label: 'Left', value: Math.max(total - spent, 0), color: 'var(--surface-2)' }], { size: 150, stroke: 22 })}
          <div class="donut-center"><small>Used</small><strong>${pct(totalPct)}</strong></div>
        </div>
        <div class="kpis">
          <div class="kpi"><small>Total budget</small><strong>${money(total)}</strong></div>
          <div class="kpi"><small>Spent</small><strong>${money(spent)}</strong></div>
          <div class="kpi"><small>${total - spent >= 0 ? 'Left' : 'Over by'}</small><strong class="${total - spent >= 0 ? 'inc' : ''}">${money(Math.abs(total - spent))}</strong></div>
          ${isNow && total - spent > 0 ? `<div class="kpi"><small>Safe to spend</small><strong>${money((total - spent) / daysLeft)}</strong><span>per day for ${daysLeft} days</span></div>` : ''}
        </div>
      </div>
    </section>

    ${rows.length ? `<div class="budget-list">${rows.map(r => `
      <article class="card budget-card" data-state="${r.state}">
        <div class="b-head">
          <span class="tx-ico" style="--c:${r.color}">${r.emoji}</span>
          <div class="b-name"><strong>${r.name}</strong><small>${money(r.limit)} monthly</small></div>
          <button class="icon-btn sm ghost" data-action="edit-budget" data-cat="${r.id}" aria-label="Edit ${r.name} budget">${icon('edit', 18)}</button>
        </div>
        <div class="b-amt">${money(r.spent)} <small>spent</small></div>
        ${progress(r.pct, r.state)}
        <div class="b-foot">
          <span>${r.state === 'over' ? `Over by <b>${money(r.spent - r.limit)}</b>` : `<b>${money(r.limit - r.spent)}</b> left`}</span>
          <span class="pill ${r.state === 'over' ? 'bad' : r.state === 'warn' ? 'warn' : 'good'}">${pct(r.pct)}</span>
        </div>
      </article>`).join('')}</div>`
    : `<section class="card">${empty('🎯', 'No budgets yet', 'Create a budget for the categories you spend most on.', `<button class="btn btn-primary sm" data-action="new-budget">Create budget</button>`)}</section>`}

    ${unbudgeted.length ? `<section class="card">
      <div class="card-head"><h2 class="card-title">Spending without a budget</h2></div>
      <p class="card-sub" style="margin-bottom:12px">These categories had spending this month but no limit. Tap one to set a budget.</p>
      <div class="chip-row">${unbudgeted.map(c => `<button class="chip" data-action="edit-budget" data-cat="${c.id}">${c.emoji} ${c.name} · ${money(c.value)}</button>`).join('')}</div>
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
    <p class="muted">${fmtDate(t, { month: 'long', year: 'numeric' })} · ${items.filter(x => x.s.state === 'paid').length} of ${items.length} paid</p>
    <button class="btn btn-primary" data-action="new-bill">${icon('plus', 18)} New bill</button>
  </div>
  <div class="stat-strip">
    <div><small>Monthly bills</small><strong>${money(total)}</strong></div>
    <div><small>Paid</small><strong class="inc">${money(paid)}</strong></div>
    <div><small>Still to pay</small><strong>${money(total - paid)}</strong></div>
    <div><small>Overdue</small><strong>${items.filter(x => x.s.state === 'overdue').length}</strong></div>
  </div>
  ${items.length ? `<div class="bill-list">${items.map(({ b, s }) => {
    const c = cat(b.category), a = account(b.account);
    return `<article class="bill" data-state="${s.state}">
      <div class="bill-date"><small>${fmtDate(s.due, { month: 'short' })}</small><b>${s.due.getDate()}</b></div>
      <div class="bill-body">
        <div class="bill-top">
          <div style="min-width:0"><strong class="bill-name">${esc(b.name)}</strong><small>${c.emoji} ${c.name}${a ? ' · ' + esc(a.name) : ''}</small></div>
          <button class="icon-btn sm ghost" data-action="edit-bill" data-id="${b.id}" aria-label="Edit ${esc(b.name)}">${icon('edit', 18)}</button>
        </div>
        <div class="bill-foot">
          <span class="amt">${money(b.amount)}</span>
          ${s.state === 'paid'
            ? `<button class="btn sm" data-action="unpay-bill" data-id="${b.id}">${icon('check', 16)} Paid</button>`
            : `<span class="pill ${s.state === 'overdue' ? 'bad' : s.state === 'soon' ? 'warn' : ''}">${s.label}</span>
               <button class="btn btn-primary sm" data-action="pay-bill" data-id="${b.id}">Mark paid</button>`}
        </div>
      </div>
    </article>`;
  }).join('')}</div>`
  : `<section class="card">${empty('🧾', 'No bills yet', 'Add rent, utilities and subscriptions so you never miss a due date.')}</section>`}`;
}

/* ----- Insights ----- */
function renderInsights() {
  const t = today();
  const last30 = txBetween(addDays(t, -29), t), prev30 = txBetween(addDays(t, -59), addDays(t, -30));
  const e30 = totals(last30).expense, ePrev = totals(prev30).expense;
  const change = ePrev ? (e30 - ePrev) / ePrev * 100 : 0;
  const lm = addMonths(t, -1), lmT = totals(txBetween(startOfMonth(lm), endOfMonth(lm)));
  const rate = lmT.income ? (lmT.income - lmT.expense) / lmT.income * 100 : 0;
  const cats = byCategory(last30), top = cats[0];
  const ef = emergencyFund();

  // spending calendar
  const m = ui.iMonth, ms = startOfMonth(m), me = endOfMonth(m);
  const perDay = {};
  for (const x of txBetween(ms, me)) if (x.type === 'expense') perDay[x.date] = (perDay[x.date] || 0) + x.amount;
  const dayMax = Math.max(1, ...Object.values(perDay));
  const lead = (ms.getDay() + 6) % 7;
  const cells = [];
  for (let k = 0; k < lead; k++) cells.push('<span class="heat-cell blank"></span>');
  for (let d = 1; d <= me.getDate(); d++) {
    const date = new Date(m.getFullYear(), m.getMonth(), d), key = ymd(date), v = perDay[key] || 0;
    const future = date > t;
    const level = v ? clamp(Math.ceil(v / dayMax * 4), 1, 4) : 0;
    cells.push(`<button class="heat-cell ${future ? 'future' : ''} ${key === ymd(t) ? 'today' : ''}" data-l="${level}" ${future ? 'disabled' : `data-action="goto-day" data-d="${key}"`} title="${fmtDate(date, { month: 'short', day: 'numeric' })}: ${money(v)}">${d}</button>`);
  }

  // weekday pattern over the last 8 weeks
  const wk = [0, 0, 0, 0, 0, 0, 0];
  for (const x of txBetween(addDays(t, -55), t)) if (x.type === 'expense') wk[(parse(x.date).getDay() + 6) % 7] += x.amount / 8;
  const wkMax = Math.max(1, ...wk), hot = wk.indexOf(Math.max(...wk));

  // category movers
  const prevMap = Object.fromEntries(byCategory(prev30).map(c => [c.id, c.value]));
  const movers = CATEGORIES.expense.map(c => {
    const now = (cats.find(x => x.id === c.id) || {}).value || 0, before = prevMap[c.id] || 0;
    return { ...c, now, before, diff: now - before };
  }).filter(x => x.now || x.before).sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff)).slice(0, 6);

  const efPct = ef.target ? clamp(ef.current / ef.target * 100, 0, 100) : 0;
  const list = insights();

  return `<div class="grid">
    <section class="card col-12">
      <div class="kpis">
        <div class="kpi"><small>Avg. daily spend</small><strong>${money(e30 / 30)}</strong><span>last 30 days</span></div>
        <div class="kpi"><small>vs previous 30 days</small><strong class="${change <= 0 ? 'inc' : ''}">${change <= 0 ? '↓' : '↑'} ${pct(Math.abs(change))}</strong><span>${money(e30)} vs ${money(ePrev)}</span></div>
        <div class="kpi"><small>Savings rate</small><strong>${pct(rate)}</strong><span>${fmtDate(lm, { month: 'long' })}</span></div>
        <div class="kpi"><small>Top category</small><strong>${top ? top.emoji + ' ' + pct(top.value / (e30 || 1) * 100) : '—'}</strong><span>${top ? top.name : 'No spending yet'}</span></div>
      </div>
    </section>

    <section class="card col-7">
      <div class="card-head">
        <h2 class="card-title">Spending calendar</h2>
        <div class="stepper">
          <button class="icon-btn sm" data-action="i-step" data-dir="-1" aria-label="Previous month">${icon('left', 16)}</button>
          <span style="min-width:120px;font-size:15px">${fmtDate(m, { month: 'short', year: 'numeric' })}</span>
          <button class="icon-btn sm" data-action="i-step" data-dir="1" aria-label="Next month">${icon('right', 16)}</button>
        </div>
      </div>
      <div class="heat-head">${['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => `<span>${d}</span>`).join('')}</div>
      <div class="heat">${cells.join('')}</div>
      <div class="heat-legend">Less <i data-l="0" class="heat-cell" style="aspect-ratio:auto;padding:0"></i><i class="heat-cell" data-l="1" style="aspect-ratio:auto;padding:0"></i><i class="heat-cell" data-l="2" style="aspect-ratio:auto;padding:0"></i><i class="heat-cell" data-l="3" style="aspect-ratio:auto;padding:0"></i><i class="heat-cell" data-l="4" style="aspect-ratio:auto;padding:0"></i> More · tap a day to open it</div>
    </section>

    <div class="col-5 stack">
      <section class="card">
        <div class="card-head"><h2 class="card-title">Emergency fund</h2><span class="pill ${ef.months >= 3 ? 'good' : 'warn'}">${ef.months.toFixed(1)} months</span></div>
        <div class="b-amt" style="font:600 28px var(--font-display)">${money(ef.current)}</div>
        <p class="card-sub" style="margin:4px 0 12px">Goal: 6 months of expenses (${money(ef.target)})</p>
        ${progress(efPct, efPct >= 50 ? 'ok' : 'warn')}
      </section>
      <section class="card">
        <div class="card-head"><h2 class="card-title">Your week</h2><span class="card-sub">avg. per weekday</span></div>
        <div class="bars" style="height:140px">
          ${wk.map((v, i) => `<div class="bar-col"><div class="bar-pair"><span class="bar one ${i === hot ? 'hot' : ''}" style="height:${v / wkMax * 100}%" title="${money(v)}"></span></div><span class="bar-label">${'MTWTFSS'[i]}</span></div>`).join('')}
        </div>
      </section>
    </div>

    <section class="card col-5">
      <div class="card-head"><h2 class="card-title">What changed</h2><span class="card-sub">last 30 vs prior 30 days</span></div>
      ${movers.length ? movers.map(x => {
        const p = x.before ? x.diff / x.before * 100 : 100;
        return `<div class="mover">
          <span class="tx-ico" style="--c:${x.color}">${x.emoji}</span>
          <div class="tx-main"><strong>${x.name}</strong><small>${money(x.before)} → ${money(x.now)}</small></div>
          <span class="delta ${x.diff > 0 ? 'up' : 'down'}">${x.diff > 0 ? '↑' : '↓'} ${pct(Math.abs(p))}</span>
        </div>`;
      }).join('') : empty('📊', 'Not enough data', 'Keep logging to see trends.')}
    </section>

    <section class="col-7 stack">
      <div class="insight-list">
        ${list.map(x => `<article class="card insight" data-tone="${x.tone}">
          <span class="tx-ico">${x.emoji}</span>
          <div><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></div>
        </article>`).join('')}
      </div>
    </section>

    <section class="card col-12">
      <div class="card-head"><h2 class="card-title">Tips to spend smarter</h2></div>
      <ol class="tips">
        <li><span><b>Pay yourself first.</b> Move savings to a separate account on payday, before you spend anything.</span></li>
        <li><span><b>Use a 24-hour rule.</b> Wait a day before any non-essential purchase over ${money(1000)}.</span></li>
        <li><span><b>Audit subscriptions every quarter.</b> Cancel anything you haven't used in the last 30 days.</span></li>
        <li><span><b>Build 3–6 months of emergency savings,</b> kept apart from your everyday wallet.</span></li>
        <li><span><b>Log expenses the moment they happen.</b> Records added later are often forgotten.</span></li>
      </ol>
    </section>
  </div>`;
}

/* ----- Assets ----- */
function renderAssets() {
  const t = today();
  const rows = db.accounts.map(a => {
    const month = totals(txBetween(startOfMonth(t), endOfMonth(t)).filter(x => x.account === a.id));
    return { ...a, bal: accountBalance(a), month };
  });
  const assets = sum(rows.filter(r => r.bal > 0), r => r.bal);
  const debts = sum(rows.filter(r => r.bal < 0), r => -r.bal);
  const segs = rows.filter(r => r.bal > 0).map(r => ({ label: r.name, value: r.bal, color: r.color, emoji: ACCOUNT_TYPES[r.type]?.emoji || '💰' }));

  return `<div class="grid">
    <section class="card hero col-5">
      <p class="eyebrow">Net worth</p>
      <h2 class="hero-title" style="font-size:40px"><em>${money(assets - debts)}</em></h2>
      <div class="hero-stats" style="grid-template-columns:1fr 1fr">
        <div><small>Assets</small><strong>${money(assets)}</strong></div>
        <div><small>Liabilities</small><strong>${money(debts)}</strong></div>
      </div>
    </section>
    <section class="card col-7">
      <div class="card-head"><h2 class="card-title">How it's spread</h2></div>
      ${segs.length ? `<div class="donut-row">
        <div class="donut-wrap">${donut(segs)}<div class="donut-center"><small>Assets</small><strong>${moneyShort(assets)}</strong></div></div>
        ${legend(segs)}
      </div>` : empty('💰', 'No assets yet', 'Add an account to see the breakdown.')}
    </section>
    <section class="col-12">
      <div class="toolbar"><h2 class="card-title">Accounts</h2><button class="btn btn-primary" data-action="new-account">${icon('plus', 18)} New account</button></div>
      <div class="acct-list">
        ${rows.map(r => `<button class="acct" data-action="edit-account" data-id="${r.id}">
          <span class="acct-swatch" style="background:${r.color}">${ACCOUNT_TYPES[r.type]?.emoji || '💰'}</span>
          <span style="min-width:0">
            <strong>${esc(r.name)}${r.emergency ? ' <span class="pill good" style="margin-left:6px">Emergency</span>' : ''}</strong>
            <small>${ACCOUNT_TYPES[r.type]?.label || 'Account'} · this month +${moneyShort(r.month.income)} / −${moneyShort(r.month.expense)}</small>
            <div class="share"><span style="width:${assets ? clamp(r.bal / assets * 100, 0, 100) : 0}%;background:${r.color}"></span></div>
          </span>
          <span class="amt ${r.bal < 0 ? '' : ''}">${money(r.bal)}</span>
        </button>`).join('')}
      </div>
    </section>
  </div>`;
}

const VIEWS = {
  home:     { title: 'Overview', sub: () => fmtDate(today(), { weekday: 'long', month: 'long', day: 'numeric' }), render: renderHome },
  records:  { title: 'Records',  sub: () => 'Daily, weekly and monthly history', render: renderRecords, after: afterRecords },
  budgets:  { title: 'Budgets',  sub: () => 'Set limits and stick to them', render: renderBudgets },
  bills:    { title: 'Bills',    sub: () => 'Never miss a due date', render: renderBills },
  insights: { title: 'Insights', sub: () => 'Patterns and tips from your spending', render: renderInsights },
  assets:   { title: 'Assets',   sub: () => 'Your accounts in one place', render: renderAssets },
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
  if (ui.lastView !== v) {
    el.classList.remove('view-enter'); void el.offsetWidth; el.classList.add('view-enter');
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
  layer.className = 'modal-layer';
  layer.innerHTML = `<div class="modal-backdrop" data-action="close-modal"></div><div class="modal ${cls}" role="dialog" aria-modal="true">${html}</div>`;
  layer._onClose = onClose;
  layer._returnFocus = document.activeElement;
  modalRoot.appendChild(layer);
  requestAnimationFrame(() => layer.classList.add('open'));
  const focusEl = layer.querySelector('[data-autofocus]') || layer.querySelector('input, select, button:not([data-action="close-modal"])');
  focusEl?.focus({ preventScroll: true });
  return layer.querySelector('.modal');
}

function closeModal() {
  const layer = modalRoot.lastElementChild;
  if (!layer) return;
  layer._onClose?.();
  layer.remove();
  layer._returnFocus?.focus?.({ preventScroll: true });
}

const modalHead = title => `<header class="modal-head"><h2>${title}</h2><button class="icon-btn sm" data-action="close-modal" aria-label="Close">${icon('x', 18)}</button></header>`;

/* ----- transaction form ----- */
function catChips(type, selected) {
  const list = CATEGORIES[type];
  const sel = list.some(c => c.id === selected) ? selected : list[0].id;
  return list.map(c => `<label class="cat-chip" style="--c:${c.color}">
    <input type="radio" name="category" value="${c.id}" ${c.id === sel ? 'checked' : ''}>
    <span class="cat-emoji">${c.emoji}</span><span>${c.name}</span></label>`).join('');
}

function openTx(id, preset = {}) {
  const t = id ? db.tx.find(x => x.id === id) : null;
  if (id && !t) return;
  const d = t ? { ...t } : {
    type: preset.type || 'expense',
    amount: preset.amount ?? '',
    category: preset.category || (preset.type === 'income' ? 'salary' : 'food'),
    account: db.accounts[0]?.id,
    date: preset.date || ymd(today()),
    note: '',
  };
  const m = openModal(`${modalHead(t ? 'Edit record' : 'New record')}
    <form id="tx-form" class="form" data-id="${t ? t.id : ''}" autocomplete="off" novalidate>
      <div class="seg wide" role="radiogroup" aria-label="Type">
        ${['expense', 'income'].map(ty => `<input type="radio" name="type" id="ty-${ty}" value="${ty}" ${d.type === ty ? 'checked' : ''}><label for="ty-${ty}">${ty === 'expense' ? 'Expense' : 'Income'}</label>`).join('')}
      </div>
      <div>
        <div class="amount-field">
          <span class="cur">${currencySymbol()}</span>
          <input name="amount" class="amount-input" inputmode="decimal" placeholder="0" value="${d.amount}" aria-label="Amount" data-autofocus>
          <button type="button" class="icon-btn sm" data-action="calc-into" aria-label="Open calculator" title="Calculator">${icon('calc', 18)}</button>
        </div>
        <p class="hint" style="margin-top:6px">Tip: type math like <code>120+85</code> and it adds up for you.</p>
      </div>
      <div class="cat-grid" id="cat-grid">${catChips(d.type, d.category)}</div>
      <div class="row2">
        <label class="field">Account
          <select name="account" class="input">${db.accounts.map(a => `<option value="${a.id}" ${a.id === d.account ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select>
        </label>
        <label class="field">Date<input type="date" name="date" class="input" value="${d.date}" required></label>
      </div>
      <label class="field">Note<input name="note" class="input" maxlength="60" placeholder="What was it for?" value="${esc(d.note)}"></label>
      <div class="form-actions">
        ${t ? `<button type="button" class="btn btn-danger" data-action="delete-tx" data-id="${t.id}">${icon('trash', 18)} Delete</button>` : ''}
        <span class="spacer"></span>
        <button type="button" class="btn" data-action="close-modal">Cancel</button>
        <button type="submit" class="btn btn-primary">${icon('check', 18)} Save</button>
      </div>
    </form>`);
  $$('input[name="type"]', m).forEach(r => r.addEventListener('change', () => { $('#cat-grid', m).innerHTML = catChips(r.value, null); }));
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
  closeModal();
  commit();
  toast(id ? 'Record updated' : `${rec.type === 'expense' ? 'Expense' : 'Income'} of ${money(rec.amount)} saved`, 'good');
  if (rec.type === 'expense') budgetCheck(rec);
}

function budgetCheck(rec) {
  const row = budgetRows(parse(rec.date)).find(r => r.id === rec.category);
  if (!row) return;
  const before = (row.spent - rec.amount) / row.limit * 100;
  setTimeout(() => {
    if (row.pct >= 100 && before < 100) toast(`${row.emoji} ${row.name} is now over budget by ${money(row.spent - row.limit)}`, 'bad');
    else if (row.pct >= 80 && before < 80) toast(`${row.emoji} Heads up: ${row.name} is at ${pct(row.pct)} of its budget`, 'warn');
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
  toast('Record deleted', 'info', {
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
    if (modalRoot.lastElementChild !== layer) return;
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
        <select name="category" class="input" ${editing ? 'disabled' : ''}>${options.map(c => `<option value="${c.id}" ${c.id === sel ? 'selected' : ''}>${c.emoji} ${c.name}</option>`).join('')}</select>
      </label>
      <label class="field">Monthly limit
        <input name="limit" class="input" inputmode="decimal" value="${editing ? db.budgets[catId] : ''}" placeholder="e.g. 5000" data-autofocus>
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
        <label class="field">Due day of month<input name="dueDay" class="input" type="number" min="1" max="31" value="${d.dueDay}"></label>
      </div>
      <div class="row2">
        <label class="field">Category<select name="category" class="input">${CATEGORIES.expense.map(c => `<option value="${c.id}" ${c.id === d.category ? 'selected' : ''}>${c.emoji} ${c.name}</option>`).join('')}</select></label>
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
  commit();
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
  openModal(`${modalHead(a ? 'Edit account' : 'New account')}
    <form id="account-form" class="form" data-id="${a ? a.id : ''}" novalidate>
      <label class="field">Name<input name="name" class="input" maxlength="30" value="${esc(d.name)}" placeholder="e.g. Payroll account" data-autofocus></label>
      <div class="row2">
        <label class="field">Type<select name="type" class="input">${Object.entries(ACCOUNT_TYPES).map(([k, v]) => `<option value="${k}" ${k === d.type ? 'selected' : ''}>${v.emoji} ${v.label}</option>`).join('')}</select></label>
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
  if (!name) { toast('Give the account a name', 'warn'); form.name.focus(); return; }
  const start = form.start.value.trim() ? evaluate(form.start.value) : 0;
  if (start == null) { toast('Starting balance must be a number', 'warn'); form.start.focus(); return; }
  const rec = { name, type: form.type.value, start: round2(start), color: (form.querySelector('input[name="color"]:checked') || {}).value || ACCOUNT_COLORS[0], emergency: form.emergency.checked };
  const id = form.dataset.id;
  if (id) Object.assign(account(id), rec);
  else db.accounts.push({ id: uid(), ...rec });
  closeModal();
  commit();
  toast(id ? 'Account updated' : `${name} added`, 'good');
}

function deleteAccount(id) {
  const used = db.tx.some(t => t.account === id) || db.bills.some(b => b.account === id);
  if (used) { toast('This account has records or bills. Move or delete those first.', 'warn'); return; }
  if (db.accounts.length <= 1) { toast('Keep at least one account', 'warn'); return; }
  db.accounts = db.accounts.filter(a => a.id !== id);
  closeModal();
  commit();
  toast('Account deleted', 'info');
}

/* ----- alerts + settings ----- */
function openAlerts() {
  const list = alerts();
  openModal(`${modalHead('Notifications')}
    ${list.length ? list.map(a => `<a class="alert-item" href="${a.href}" data-action="close-modal" data-tone="${a.tone}">
      <span class="tx-ico">${a.emoji}</span>
      <span><strong>${esc(a.title)}</strong><small>${esc(a.text)}</small></span>
    </a>`).join('') : empty('✨', 'All clear', 'No budget warnings or bills due soon.')}`, { cls: 'narrow' });
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
      <h3>Demo data</h3>
      <p class="hint">This is a demo. Everything is saved only in this browser, so nothing leaves your device.</p>
      <div class="form-actions">
        <button class="btn" data-action="reset-demo">Reset sample data</button>
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
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, opts.action ? 5000 : 3200);
}

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
  $('#btn-theme').innerHTML = icon(dark ? 'sun' : 'moon');
  document.querySelector('meta[name="theme-color"]').setAttribute('content', dark ? '#0F1512' : '#F3EEE3');
}
darkQuery.addEventListener?.('change', paintThemeButton);

/* =========================================================
   EVENTS
   ========================================================= */
const actions = {
  'close-modal': () => closeModal(),
  add: () => openTx(null, ui.period === 'day' && currentView() === 'records' ? { date: ymd(ui.cursor) } : {}),
  quick: el => openTx(null, { category: el.dataset.cat }),
  'quick-income': () => openTx(null, { type: 'income' }),
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
    if (!confirm('Remove all records, bills and budgets? Your accounts stay, with a zero balance.')) return;
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
  if (e.key === 'Escape' && modalRoot.lastElementChild) { e.preventDefault(); closeModal(); return; }
  const typing = /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement?.tagName);
  if (!typing && !modalRoot.lastElementChild && !e.metaKey && !e.ctrlKey && !e.altKey) {
    if (e.key === 'n') { e.preventDefault(); actions.add(); }
    if (e.key === 'c') { e.preventDefault(); openCalc(null); }
  }
});

/* ---------- boot ---------- */
const navHtml = short => NAV.map(n => `<a href="#/${n.id}" data-nav="${n.id}">${icon(n.icon, short ? 22 : 20)}<span>${short ? n.short : n.label}</span></a>`).join('');
$('#side-nav').innerHTML = navHtml(false);
$('#bottom-nav').innerHTML = navHtml(true);
$('#btn-calc').innerHTML = icon('calc');
$('#btn-settings').innerHTML = icon('gear');
paintThemeButton();

window.addEventListener('hashchange', render);
save();
render();
})();
