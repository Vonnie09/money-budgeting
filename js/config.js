/* Reference data: categories, wallet types, currencies, navigation. */

export const STORE_KEY = 'mm-demo-v4';
export const THEME_KEY = 'mm-theme';
export const EMPTY_KEY = 'mm-empty-v1';   // your own data in Empty State
export const MODE_KEY = 'mm-mode';        // 'demo' or 'empty'
export const SIZE_KEY = 'mm-demo-size';   // sample size in Demo Mode
export const DEMO_SIZES = { small: 'Small', medium: 'Medium', full: 'Full' };

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
  ],
};
export const ALL_CATS = [...CATEGORIES.expense, ...CATEGORIES.income];
// Your own budget categories ("Others" with a name you typed). The store fills this in.
export const customCats = [];
export const CUSTOM_COLORS = ['#4A6378', '#2F8F6F', '#E0604A', '#D9577A', '#7A6A55', '#3E9AA8'];
export const expenseCats = () => [...CATEGORIES.expense, ...customCats];
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
