export type TransactionType = 'income' | 'expense';
export type Category = 'Food' | 'Transport' | 'Shopping' | 'Entertainment' | 'Bills' | 'Health' | 'Education' | 'Other';

export type Transaction = {
  id: string;
  user_id?: string;
  merchant: string;
  category: Category;
  amount: number;
  type: TransactionType;
  date: string;
  notes?: string;
  recurring?: boolean;
  goal_id?: string;
};

export type Goal = {
  id: string;
  user_id?: string;
  name: string;
  current: number;
  target: number;
  deadline?: string;
  priority: 'low' | 'medium' | 'high';
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  currency: string;
};
