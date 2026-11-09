/* Read-only questions about the data: totals, budgets, bills, insights. */
import { cat } from './config.js';
import { addDays, addMonths, daysBetween, endOfMonth, fmtDate, monthKey, parse, startOfMonth, sum, today, ymd } from './utils.js';
import { growth, money, pct } from './money.js';
import { db, save } from './store.js';

/* ---------- queries ---------- */
export const txBetween = (a, b) => { const s = ymd(a), e = ymd(b); return db.tx.filter(t => t.date >= s && t.date <= e); };
export const totals = list => ({
  income: sum(list.filter(t => t.type === 'income'), t => t.amount),
  expense: sum(list.filter(t => t.type === 'expense'), t => t.amount),
});
export const byCategory = (list, type = 'expense') => {
  const m = {};
  for (const t of list) if (t.type === type) m[t.category] = (m[t.category] || 0) + t.amount;
  return Object.entries(m).map(([id, value]) => ({ ...cat(id), value })).sort((a, b) => b.value - a.value);
};
export const sortTx = list => list.slice().sort((a, b) => b.date.localeCompare(a.date) || b.ts - a.ts);
export const account = id => db.accounts.find(a => a.id === id);
export const accountBalance = a => a.start + sum(db.tx.filter(t => t.account === a.id), t => t.type === 'income' ? t.amount : -t.amount);
export const netWorth = () => sum(db.accounts, accountBalance);

export function budgetRows(monthDate) {
  const spent = {};
  for (const t of txBetween(startOfMonth(monthDate), endOfMonth(monthDate))) {
    if (t.type === 'expense') spent[t.category] = (spent[t.category] || 0) + t.amount;
  }
  return Object.entries(db.budgets).map(([id, limit]) => {
    const s = spent[id] || 0;
    const p = limit > 0 ? s / limit * 100 : 0;
    return { ...cat(id), id, limit, spent: s, pct: p, from: db.budgetFrom[id] || null, state: p >= 100 ? 'over' : p >= 80 ? 'warn' : 'ok' };
  }).sort((a, b) => b.pct - a.pct);
}

export function avgMonthlySpend(catId, months = 3) {
  const t = today();
  let total = 0;
  for (let k = 1; k <= months; k++) {
    const m = addMonths(t, -k);
    total += sum(txBetween(startOfMonth(m), endOfMonth(m)).filter(x => x.type === 'expense' && (!catId || x.category === catId)), x => x.amount);
  }
  return total / months;
}

export function billStatus(b) {
  const t = today();
  const due = new Date(t.getFullYear(), t.getMonth(), Math.min(b.dueDay, endOfMonth(t).getDate()));
  const days = daysBetween(t, due);
  if (b.paid.includes(monthKey(t))) return { state: 'paid', due, days, label: 'Paid' };
  if (days < 0) return { state: 'overdue', due, days, label: `Overdue ${-days}d` };
  if (days === 0) return { state: 'soon', due, days, label: 'Due today' };
  if (days <= 3) return { state: 'soon', due, days, label: `Due in ${days}d` };
  return { state: 'upcoming', due, days, label: `In ${days} days` };
}

export function alerts() {
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
export function insights() {
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

export function emergencyFund() {
  const accts = db.accounts.filter(a => a.emergency);
  const current = sum(accts, accountBalance);
  const monthly = avgMonthlySpend(null, 3);
  return { current, monthly, months: monthly > 0 ? current / monthly : 0, target: monthly * 6 };
}

/* ---------- money lists ---------- */
// Every line of a list in date order, with the balance after each one.
export function listLines(a) {
  let balance = a.start;
  return db.tx.filter(t => t.account === a.id)
    .sort((x, y) => x.date.localeCompare(y.date) || x.ts - y.ts)
    .map(t => {
      balance += t.type === 'income' ? t.amount : -t.amount;
      return { t, balance };
    });
}
// Money set aside this month for budgets funded by this list and not spent yet.
export function listReserve(id) {
  return sum(budgetRows(today()).filter(r => r.from === id), r => Math.max(r.limit - r.spent, 0));
}
export const freeToSpend = a => accountBalance(a) - listReserve(a.id);
