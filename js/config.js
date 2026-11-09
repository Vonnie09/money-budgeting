/* Reference data: categories, wallet types, currencies, navigation. */

export const STORE_KEY = 'mm-demo-v4';
export const THEME_KEY = 'mm-theme';
export const EMPTY_KEY = 'mm-empty-v1';   // your own data in Empty State
export const MODE_KEY = 'mm-mode';        // 'demo' or 'empty'
export const SIZE_KEY = 'mm-demo-size';   // sample size in Demo Mode
export const DEMO_SIZES = { small: 'Small', medium: 'Medium', full: 'Full' };
// What each sample holds, shown under the size buttons and in the "Load?" dialog.
export const SIZE_INFO = {
  small:  { short: '1 month · 3 bills · 4 budgets',  long: 'About 1 month of entries, 3 bills and 4 budgets' },
  medium: { short: '3 months · 5 bills · 6 budgets', long: '3 months of entries, 5 bills and 6 budgets' },
  full:   { short: '6 months · 7 bills · 8 budgets', long: '6 months of busy entries, 7 bills and 8 budgets' },
};

/* ---------- reference data ---------- */
export const CATEGORIES = {
  expense: [
    { id: 'food',      name: 'Food & Dining', icon: 'bowl', color: '#FF8F00' },
    { id: 'groceries', name: 'Groceries',     icon: 'basket', color: '#2F8F6F' },
    { id: 'transport', name: 'Transport',     icon: 'bus', color: '#4A6378' },
    { id: 'bills',     name: 'Bills',         icon: 'bolt', color: '#FFAD33' },
    { id: 'shopping',  name: 'Shopping',      icon: 'tag', color: '#E0604A' },
    { id: 'health',    name: 'Health',        icon: 'heart', color: '#3E9AA8' },
    { id: 'fun',       name: 'Entertainment', icon: 'ticket', color: '#D9577A' },
    { id: 'education', name: 'Education',     icon: 'book', color: '#7A6A55' },
    { id: 'other',     name: 'Others',        icon: 'box', color: '#3B3F45' },
  ],
  income: [
    { id: 'salary',    name: 'Salary',    icon: 'briefcase', color: '#2F8F6F' },
    { id: 'freelance', name: 'Freelance', icon: 'laptop', color: '#4A6378' },
    { id: 'business',  name: 'Business',  icon: 'store', color: '#FF8F00' },
    { id: 'gift',      name: 'Gifts',     icon: 'gift', color: '#FFAD33' },
    { id: 'cashin',    name: 'Cash in',   icon: 'banknote', color: '#3B3F45' },
    { id: 'otherin',   name: 'Others',    icon: 'box', color: '#565B62' },
  ],
};
export const ALL_CATS = [...CATEGORIES.expense, ...CATEGORIES.income];
// Your own categories ("Others" with a name you typed), for spending or income. The store fills this in.
export const customCats = [];
export const CUSTOM_COLORS = ['#4A6378', '#2F8F6F', '#E0604A', '#D9577A', '#7A6A55', '#3E9AA8'];
export const OTHER_IDS = ['other', 'otherin'];   // the two "Others" choices that can be named
// Built-in categories, then the ones you named, with "Others" kept last.
const withCustom = (base, type) => [...base.slice(0, -1), ...customCats.filter(c => (c.type || 'expense') === type), base[base.length - 1]];
export const expenseCats = () => withCustom(CATEGORIES.expense, 'expense');
export const incomeCats = () => withCustom(CATEGORIES.income, 'income');
export const cat = id => ALL_CATS.find(c => c.id === id) || customCats.find(c => c.id === id) || CATEGORIES.expense[CATEGORIES.expense.length - 1];

export const ACCOUNT_TYPES = {
  cash:    { label: 'Cash',       icon: 'banknote' },
  bank:    { label: 'Bank',       icon: 'bank' },
  ewallet: { label: 'E-wallet',   icon: 'phone' },
  savings: { label: 'Savings',    icon: 'coins' },
  card:    { label: 'Credit card', icon: 'card' },
  invest:  { label: 'Investment', icon: 'chart' },
};
export const ACCOUNT_COLORS = ['#0E0E10', '#3B3F45', '#FF8F00', '#FFAD33', '#4A6378', '#2F8F6F', '#E0604A', '#7A6A55'];

export const CURRENCIES = [
  ['PHP', 'Philippine Peso (₱)'],
  ['USD', 'US Dollar ($)'],
  ['EUR', 'Euro (€)'],
  ['GBP', 'British Pound (£)'],
  ['JPY', 'Japanese Yen (¥)'],
  ['SGD', 'Singapore Dollar (S$)'],
  ['AUD', 'Australian Dollar (A$)'],
];

export const NAV = [
  { id: 'home',     label: 'Home',     icon: 'home' },
  { id: 'records',  label: 'History',  icon: 'list' },
  { id: 'money',    label: 'Money List', short: 'Money', icon: 'wallet' },
  { id: 'budgets',  label: 'Budgets',  icon: 'target' },
  { id: 'bills',    label: 'Bills',    icon: 'receipt' },
  { id: 'insights', label: 'Insights', icon: 'chart' },
];

export const WELCOME_KEY = 'mm-welcome-done';
