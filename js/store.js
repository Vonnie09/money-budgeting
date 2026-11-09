/* Sample data, saving to this browser, and shared app state. */
import { customCats, EMPTY_KEY, MODE_KEY, SIZE_KEY, STORE_KEY } from './config.js';
import { addDays, addMonths, endOfMonth, monthKey, round2, startOfMonth, sum, today, ymd } from './utils.js';
import { setCurrency } from './money.js';

/* ---------- sample data ---------- */
export function mulberry32(a) {
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Sample sizes for Demo Mode: how many months back, and how busy each day is.
const SIZES = { small: { months: 1, k: 0.6 }, medium: { months: 2, k: 0.85 }, full: { months: 5, k: 1 } };
export const demoSize = () => { try { const s = localStorage.getItem(SIZE_KEY); return SIZES[s] ? s : 'medium'; } catch { return 'medium'; } };
export function setDemoSize(size) { try { localStorage.setItem(SIZE_KEY, size); } catch { /* ignore */ } }

export function seed(size = demoSize()) {
  const { months, k } = SIZES[size] || SIZES.medium;
  const rnd = mulberry32(20261102);
  const between = (a, b) => a + rnd() * (b - a);
  const step = (n, s) => Math.round(n / s) * s;
  const pick = arr => arr[Math.floor(rnd() * arr.length)];

  const accounts = [
    { id: 'cash',      name: 'On hand cash',    type: 'cash',    start: 3500,  color: '#FFAD33' },
    { id: 'bank',      name: 'Savings Bank',   type: 'bank',    start: 38000, color: '#3B3F45' },
    { id: 'ewallet',   name: 'E-Wallet',       type: 'ewallet', start: 1800,  color: '#4A6378' },
    { id: 'emergency', name: 'Emergency Fund', type: 'savings', start: 26000, color: '#FF8F00', emergency: true },
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
  for (let d = addMonths(end, -months); d <= end; d = addDays(d, 1)) {
    const day = d.getDate(), dow = d.getDay(), last = endOfMonth(d).getDate();

    if (day === 15 || day === last) add('income', 22500, 'salary', 'bank', d, 'Payroll');
    if (rnd() < 0.045 * k) add('income', step(between(2500, 9000), 50), 'freelance', 'ewallet', d, pick(['Logo design', 'Website gig', 'Video edit', 'Tutoring']));
    if (rnd() < 0.01 * k) add('income', step(between(1000, 3000), 100), 'gift', 'cash', d, pick(['Birthday gift', 'Ninong & ninang', 'Bonus treat']));

    const meals = 1 + (rnd() < 0.5 * k ? 1 : 0);
    for (let k = 0; k < meals; k++) {
      add('expense', step(between(80, 380), 5), 'food', rnd() < 0.55 ? 'cash' : 'ewallet', d,
        pick(['Lunch', 'Coffee', 'Merienda', 'Dinner out', 'Milk tea', 'Breakfast', 'Food delivery']));
    }
    if (dow >= 1 && dow <= 5 && rnd() < 0.85) add('expense', step(between(40, 180), 5), 'transport', rnd() < 0.6 ? 'cash' : 'ewallet', d, pick(['Jeep & MRT', 'Ride-hailing', 'Bus fare', 'Tricycle']));
    if (dow === 6) add('expense', step(between(1400, 2700), 10), 'groceries', 'bank', d, pick(['Weekly groceries', 'Supermarket run', 'Market haul']));
    if (rnd() < 0.08 * k) add('expense', step(between(350, 2600), 10), 'shopping', pick(['bank', 'ewallet']), d, pick(['New shoes', 'Online order', 'Home stuff', 'Clothes', 'Phone case']));
    if ((dow === 5 || dow === 6) && rnd() < 0.35 * k) add('expense', step(between(250, 1100), 10), 'fun', pick(['cash', 'ewallet']), d, pick(['Movie night', 'Karaoke', 'Concert ticket', 'Board game café', 'Bowling']));
    if (rnd() < 0.03 * k) add('expense', step(between(150, 900), 10), 'health', 'cash', d, pick(['Pharmacy', 'Vitamins', 'Check-up']));
    if (rnd() < 0.025 * k) add('expense', step(between(300, 1400), 10), 'education', 'ewallet', d, pick(['Online course', 'Books', 'School supplies']));
    if (rnd() < 0.02 * k) add('expense', step(between(100, 600), 10), 'other', 'cash', d, pick(['Donation', 'Laundry', 'Haircut']));

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
  // Food, groceries and shopping budgets take their money from the bank list
  const budgetFrom = { food: 'bank', groceries: 'bank', shopping: 'bank' };
  return { version: 1, currency: 'PHP', accounts, bills, tx, budgets, budgetFrom, customCats: [] };
}

/* ---------- Demo Mode / Empty State ----------
   Each mode keeps its own saved data, so switching never loses anything. */
const keyFor = m => (m === 'empty' ? EMPTY_KEY : STORE_KEY);

// Empty State starts with the usual wallets at zero and nothing else.
export function blank(currency = 'PHP') {
  return {
    version: 1, currency, bills: [], tx: [], budgets: {}, budgetFrom: {}, customCats: [],
    accounts: [
      { id: 'cash',      name: 'On hand cash',    type: 'cash',    start: 0, color: '#FFAD33' },
      { id: 'bank',      name: 'Savings Bank',   type: 'bank',    start: 0, color: '#3B3F45' },
      { id: 'ewallet',   name: 'E-Wallet',       type: 'ewallet', start: 0, color: '#4A6378' },
      { id: 'emergency', name: 'Emergency Fund', type: 'savings', start: 0, color: '#FF8F00', emergency: true },
    ],
  };
}

export let mode = (() => { try { return localStorage.getItem(MODE_KEY) === 'empty' ? 'empty' : 'demo'; } catch { return 'demo'; } })();

function normalize(data) {
  data.budgetFrom ||= {};
  data.customCats ||= [];
  return data;
}

// Keep the shared custom-category list in step with the loaded data.
export function syncCustom() {
  customCats.length = 0;
  customCats.push(...db.customCats);
}

export function load(m = mode) {
  try {
    const raw = localStorage.getItem(keyFor(m));
    if (raw) {
      const data = JSON.parse(raw);
      if (data && data.version === 1) return normalize(data);
    }
  } catch { /* storage blocked or corrupted: fall back to fresh data */ }
  return m === 'empty' ? blank() : seed();
}
export function save() {
  try { localStorage.setItem(keyFor(mode), JSON.stringify(db)); } catch { /* private mode: keep working in memory */ }
}

export let db = load();
setCurrency(db.currency);
syncCustom();

// Switch datasets; the current one is saved first.
export function setMode(next) {
  if (next === mode) return;
  save();
  mode = next;
  try { localStorage.setItem(MODE_KEY, next); } catch { /* ignore */ }
  db = load(next);
  setCurrency(db.currency);
  syncCustom();
}

// "Reset demo" brings back fresh sample data; "Reset empty state" clears your entries.
export function resetMode() {
  const currency = db.currency;
  db = mode === 'empty' ? blank(currency) : Object.assign(seed(), { currency });
  syncCustom();
}

export const ui = {
  period: 'month',
  cursor: today(),
  type: 'all',
  query: '',
  bMonth: startOfMonth(today()),
  iMonth: startOfMonth(today()),
  listId: null,     // open money list
  mlAll: false,     // show every line, not just the latest 40
  lastView: null,
};

