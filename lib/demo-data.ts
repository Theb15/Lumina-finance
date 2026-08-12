import type { Goal, Transaction } from './types';

const iso = (daysAgo: number) => {
  const d = new Date(); d.setDate(d.getDate() - daysAgo); return d.toISOString().slice(0, 10);
};

export const demoTransactions: Transaction[] = [
  { id: 't1', merchant: 'Salary', category: 'Other', amount: 65000, type: 'income', date: iso(11), notes: 'Monthly salary' },
  { id: 't2', merchant: 'Swiggy', category: 'Food', amount: 420, type: 'expense', date: iso(1) },
  { id: 't3', merchant: 'Amazon', category: 'Shopping', amount: 2399, type: 'expense', date: iso(2) },
  { id: 't4', merchant: 'Metro / Cab', category: 'Transport', amount: 3400, type: 'expense', date: iso(3) },
  { id: 't5', merchant: 'Netflix', category: 'Entertainment', amount: 649, type: 'expense', date: iso(5), recurring: true },
  { id: 't6', merchant: 'Electricity', category: 'Bills', amount: 1800, type: 'expense', date: iso(7), recurring: true },
  { id: 't7', merchant: 'Zomato', category: 'Food', amount: 880, type: 'expense', date: iso(8) },
  { id: 't8', merchant: 'Pharmacy', category: 'Health', amount: 520, type: 'expense', date: iso(9) },
  { id: 't9', merchant: 'Udemy', category: 'Education', amount: 599, type: 'expense', date: iso(12) },
  { id: 't10', merchant: 'Shopping', category: 'Shopping', amount: 2401, type: 'expense', date: iso(14) },
  { id: 't11', merchant: 'Restaurant', category: 'Food', amount: 4920, type: 'expense', date: iso(16) },
  { id: 't12', merchant: 'Fuel', category: 'Transport', amount: 1000, type: 'expense', date: iso(18) },
  { id: 't13', merchant: 'Phone Bill', category: 'Bills', amount: 1500, type: 'expense', date: iso(20), recurring: true },
  { id: 't14', merchant: 'Concert', category: 'Entertainment', amount: 1050, type: 'expense', date: iso(22) },
  { id: 't15', merchant: 'Grocery', category: 'Food', amount: 2982, type: 'expense', date: iso(24) },
];

export const demoGoals: Goal[] = [
  { id: 'g1', name: 'Emergency Fund', current: 150000, target: 200000, deadline: '2026-12-31', priority: 'high' },
  { id: 'g2', name: 'Laptop', current: 42000, target: 60000, deadline: '2026-12-01', priority: 'medium' },
  { id: 'g3', name: 'Travel', current: 18500, target: 40000, deadline: '2027-02-01', priority: 'low' },
];
