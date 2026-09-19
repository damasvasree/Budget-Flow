export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget_limit: number;
  is_default: boolean;
  sort_order: number;
  created_at: string;
}

export interface Expense {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  merchant: string | null;
  date: string;
  notes: string | null;
  payment_method: 'cash' | 'upi' | 'card' | 'other';
  source: 'manual' | 'voice';
  created_at: string;
}

export interface Budget {
  id: string;
  category: string;
  month: number;
  year: number;
  limit_amount: number;
  created_at: string;
}

export interface Achievement {
  id: string;
  badge_name: string;
  description: string;
  unlocked_at: string;
}

export interface Settings {
  [key: string]: string;
}

export type Currency = 'INR' | 'USD' | 'EUR';

export interface ExpenseInput {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  merchant?: string | null;
  date: string;
  notes?: string | null;
  payment_method: 'cash' | 'upi' | 'card' | 'other';
  source: 'manual' | 'voice';
}

export interface BudgetInput {
  category: string;
  month: number;
  year: number;
  limit_amount: number;
}
