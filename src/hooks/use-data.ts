import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Expense, ExpenseInput, Category, Budget, BudgetInput, Achievement, Settings } from '@/types';
import { getCurrentMonth } from '@/lib/format';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      setExpenses((data as Expense[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const addExpense = useCallback(async (input: ExpenseInput): Promise<Expense | null> => {
    const { data, error } = await supabase
      .from('expenses')
      .insert(input)
      .select()
      .single();
    if (error) {
      setError(error.message);
      return null;
    }
    setExpenses(prev => [data as Expense, ...prev]);
    return data as Expense;
  }, []);

  const updateExpense = useCallback(async (id: string, input: Partial<ExpenseInput>): Promise<boolean> => {
    const { error } = await supabase
      .from('expenses')
      .update(input)
      .eq('id', id);
    if (error) {
      setError(error.message);
      return false;
    }
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...input } as Expense : e));
    return true;
  }, []);

  const deleteExpense = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    if (error) {
      setError(error.message);
      return false;
    }
    setExpenses(prev => prev.filter(e => e.id !== id));
    return true;
  }, []);

  return { expenses, loading, error, addExpense, updateExpense, deleteExpense, refetch: fetchExpenses };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!error && data) {
      setCategories(data as Category[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const upsertCategory = useCallback(async (cat: Partial<Category> & { name: string; icon: string; color: string }): Promise<Category | null> => {
    if (cat.id) {
      const { data, error } = await supabase
        .from('categories')
        .update({
          budget_limit: cat.budget_limit,
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
        })
        .eq('id', cat.id)
        .select()
        .single();
      if (!error && data) {
        setCategories(prev => prev.map(c => c.id === cat.id ? data as Category : c));
        return data as Category;
      }
    } else {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          budget_limit: cat.budget_limit || 0,
          is_default: false,
          sort_order: 99,
        })
        .select()
        .single();
      if (!error && data) {
        setCategories(prev => [...prev, data as Category]);
        return data as Category;
      }
    }
    return null;
  }, []);

  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (!error) {
      setCategories(prev => prev.filter(c => c.id !== id));
      return true;
    }
    return false;
  }, []);

  return { categories, loading, upsertCategory, deleteCategory, refetch: fetchCategories };
}

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setBudgets(data as Budget[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const upsertBudget = useCallback(async (input: BudgetInput): Promise<boolean> => {
    const { data, error } = await supabase
      .from('budgets')
      .upsert(input, { onConflict: 'category,month,year' })
      .select();
    if (!error && data) {
      setBudgets(prev => {
        const filtered = prev.filter(
          b => !(b.category === input.category && b.month === input.month && b.year === input.year)
        );
        return [...filtered, ...(data as Budget[])];
      });
      return true;
    }
    return false;
  }, []);

  const getCurrentBudgets = useCallback(() => {
    const { month, year } = getCurrentMonth();
    return budgets.filter(b => b.month === month && b.year === year);
  }, [budgets]);

  return { budgets, loading, upsertBudget, refetch: fetchBudgets, getCurrentBudgets };
}

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('unlocked_at', { ascending: false });
    if (!error && data) {
      setAchievements(data as Achievement[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const unlockAchievement = useCallback(async (badgeName: string, description: string): Promise<void> => {
    const { data } = await supabase
      .from('achievements')
      .select('id')
      .eq('badge_name', badgeName)
      .maybeSingle();
    if (data) return;
    const { data: newAch } = await supabase
      .from('achievements')
      .insert({ badge_name: badgeName, description })
      .select()
      .single();
    if (newAch) {
      setAchievements(prev => [newAch as Achievement, ...prev]);
    }
  }, []);

  return { achievements, loading, unlockAchievement, refetch: fetchAchievements };
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('settings')
      .select('key, value');
    if (!error && data) {
      const map: Settings = {};
      (data as { key: string; value: string }[]).forEach(item => {
        map[item.key] = item.value;
      });
      setSettings(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = useCallback(async (key: string, value: string): Promise<void> => {
    const { error } = await supabase
      .from('settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (!error) {
      setSettings(prev => ({ ...prev, [key]: value }));
    }
  }, []);

  return { settings, loading, updateSetting, refetch: fetchSettings };
}
