import { useState, useMemo } from 'react';
import { useBudgets, useCategories, useExpenses, useSettings } from '@/hooks/use-data';
import { formatCurrency, getCurrentMonth, getMonthName } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { PiggyBank, Plus, Check, AlertCircle, Pencil } from 'lucide-react';
import type { Currency } from '@/types';
import { toast } from 'sonner';

export function Budgets() {
  const { budgets, loading, upsertBudget } = useBudgets();
  const { categories } = useCategories();
  const { expenses } = useExpenses();
  const { settings } = useSettings();
  const currency = (settings.currency as Currency) || 'INR';

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const { month, year } = getCurrentMonth();

  const budgetMap = useMemo(() => {
    const map: Record<string, number> = {};
    budgets
      .filter(b => b.month === month && b.year === year)
      .forEach(b => { map[b.category] = b.limit_amount; });
    return map;
  }, [budgets, month, year]);

  const spentMap = useMemo(() => {
    const map: Record<string, number> = {};
    expenses
      .filter(e => {
        const d = new Date(e.date);
        return d.getMonth() + 1 === month && d.getFullYear() === year && e.type === 'expense';
      })
      .forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return map;
  }, [expenses, month, year]);

  const categoriesWithBudgets = categories.filter(c => budgetMap[c.name] !== undefined);
  const categoriesWithoutBudgets = categories.filter(c => budgetMap[c.name] === undefined);

  const totalBudget = Object.values(budgetMap).reduce((s, v) => s + v, 0);
  const totalSpent = Object.values(spentMap).reduce((s, v) => s + v, 0);

  const handleSaveBudget = async () => {
    if (!editingCategory) return;
    const amt = parseFloat(editAmount);
    if (isNaN(amt) || amt < 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    const success = await upsertBudget({
      category: editingCategory,
      month,
      year,
      limit_amount: amt,
    });
    if (success) {
      toast.success('Budget updated');
      setEditingCategory(null);
    } else {
      toast.error('Failed to update budget');
    }
  };

  const handleAddBudget = async () => {
    if (!newCategory) {
      toast.error('Select a category');
      return;
    }
    const amt = parseFloat(newAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    const success = await upsertBudget({
      category: newCategory,
      month,
      year,
      limit_amount: amt,
    });
    if (success) {
      toast.success('Budget added');
      setShowAdd(false);
      setNewCategory('');
      setNewAmount('');
    } else {
      toast.error('Failed to add budget');
    }
  };

  const startEdit = (category: string, current: number) => {
    setEditingCategory(category);
    setEditAmount(String(current));
  };

  if (loading) {
    return (
      <div className="space-y-3 p-4 md:p-8 max-w-3xl mx-auto animate-pulse">
        <div className="h-8 bg-muted rounded w-40" />
        <div className="h-24 bg-muted rounded-xl" />
        {[1,2,3].map(i => <div key={i} className="h-20 bg-muted rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-8 max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
          <p className="text-sm text-muted-foreground">{getMonthName(month)} {year}</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)} disabled={categoriesWithoutBudgets.length === 0}>
          <Plus className="h-4 w-4 mr-1" /> Add Budget
        </Button>
      </div>

      {/* Total summary */}
      {totalBudget > 0 && (
        <Card className="border-0 bg-gradient-to-br from-primary/90 to-primary text-primary-foreground">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Total Monthly Budget</span>
              <PiggyBank className="h-5 w-5 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-3">{formatCurrency(totalBudget, currency)}</div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="opacity-90">Spent: {formatCurrency(totalSpent, currency)}</span>
              <span className="opacity-90">{Math.round((totalSpent/totalBudget)*100)}%</span>
            </div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${Math.min((totalSpent/totalBudget)*100, 100)}%` }}
              />
            </div>
            <p className="text-sm mt-2 opacity-90">
              {formatCurrency(totalBudget - totalSpent, currency)} remaining
            </p>
          </CardContent>
        </Card>
      )}

      {/* Budget list */}
      {categoriesWithBudgets.length === 0 && totalBudget === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="h-14 w-14 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
              <PiggyBank className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">No budgets set</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Set spending limits for categories to track your progress and get alerts.
            </p>
            <Button size="sm" onClick={() => setShowAdd(true)}>
              <Plus className="h-4 w-4 mr-1" /> Set Your First Budget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {categoriesWithBudgets.map(cat => {
            const limit = budgetMap[cat.name] || 0;
            const spent = spentMap[cat.name] || 0;
            const pct = limit > 0 ? (spent / limit) * 100 : 0;
            const isOver = pct > 100;
            const isNear = pct > 80 && pct <= 100;

            return (
              <Card key={cat.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cat.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(spent, currency)} of {formatCurrency(limit, currency)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isOver && (
                        <span className="flex items-center gap-1 text-xs text-destructive">
                          <AlertCircle className="h-3 w-3" />
                          Over
                        </span>
                      )}
                      <button
                        onClick={() => startEdit(cat.name, limit)}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <Progress
                    value={Math.min(pct, 100)}
                    className={`h-2.5 ${isOver ? '[&>*]:bg-destructive' : isNear ? '[&>*]:bg-amber-500' : ''}`}
                  />
                  <div className="flex justify-between mt-1.5">
                    <span className={`text-xs font-medium ${
                      isOver ? 'text-destructive' : isNear ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
                    }`}>
                      {Math.round(pct)}% used
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {isOver
                        ? `${formatCurrency(spent - limit, currency)} over`
                        : `${formatCurrency(limit - spent, currency)} left`
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit budget dialog */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
            <DialogDescription>
              Set monthly spending limit for {editingCategory}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="edit-amount">Monthly Limit</Label>
              <Input
                id="edit-amount"
                type="number"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="0"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditingCategory(null)}>Cancel</Button>
            <Button size="sm" onClick={handleSaveBudget}>
              <Check className="h-4 w-4 mr-1" /> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add budget dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Add Budget</DialogTitle>
            <DialogDescription>Set a spending limit for a category</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="new-category">Category</Label>
              <select
                id="new-category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring mt-1"
              >
                <option value="">Select category...</option>
                {categoriesWithoutBudgets.map(c => (
                  <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="new-amount">Monthly Limit</Label>
              <Input
                id="new-amount"
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAddBudget}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
