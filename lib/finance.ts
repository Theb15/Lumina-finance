import type { Goal, Transaction } from './types';

export const money = (n: number, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Math.round(n));

export function isCurrentMonth(date: string, now = new Date()) {
  const d = new Date(`${date}T00:00:00`);
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export function monthlySnapshot(transactions: Transaction[], now = new Date()) {
  const current = transactions.filter(t => isCurrentMonth(t.date, now));
  const income = current.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const goalContributions = current.filter(t => t.type === 'expense' && !!t.goal_id).reduce((s, t) => s + t.amount, 0);
  // Dashboard expenses include both ordinary spending and money moved into goals.
  // Keep goalContributions separate as a useful breakdown, but expose the full
  // monthly cash outflow as `expenses` so the dashboard and pie chart stay in sync.
  const ordinaryExpenses = current.filter(t => t.type === 'expense' && !t.goal_id).reduce((s, t) => s + t.amount, 0);
  const expenses = ordinaryExpenses + goalContributions;
  const available = income - expenses;
  const savingsRate = income > 0 ? (available / income) * 100 : 0;
  const categories = current.filter(t => t.type === 'expense').reduce<Record<string, number>>((acc, t) => {
    const category = t.goal_id ? 'Goal contributions' : t.category;
    acc[category] = (acc[category] ?? 0) + t.amount;
    return acc;
  }, {});
  return { income, expenses, goalContributions, available, savingsRate, categories, transactions: current };
}

export function buildCashflow(transactions: Transaction[], days = 14, now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  const result: { d: string; i: number; e: number }[] = [];
  for (let idx = 0; idx < days; idx += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + idx);
    const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    const day = transactions.filter(t => t.date === key);
    result.push({
      d: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      i: day.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      e: day.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    });
  }
  return result;
}

export function financialHealthScore(snapshot: ReturnType<typeof monthlySnapshot>) {
  if (snapshot.income <= 0) return 35;
  const savings = Math.max(0, Math.min(100, snapshot.savingsRate));
  const buffer = snapshot.available > 0 ? 20 : 0;
  return Math.max(0, Math.min(99, Math.round(45 + savings * 0.45 + buffer)));
}

export function goalProgress(goal: Goal) {
  return Math.min(100, Math.round((goal.current / Math.max(goal.target, 1)) * 100));
}

export function requiredMonthly(goal: Goal) {
  if (!goal.deadline) return Math.max(0, goal.target - goal.current);
  const now = new Date();
  const end = new Date(`${goal.deadline}T00:00:00`);
  const months = Math.max(1, (end.getFullYear() - now.getFullYear()) * 12 + end.getMonth() - now.getMonth());
  return Math.max(0, (goal.target - goal.current) / months);
}
