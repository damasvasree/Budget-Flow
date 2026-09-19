import { useState, useMemo } from 'react';
import { useExpenses, useCategories, useSettings } from '@/hooks/use-data';
import { formatCurrency, formatShortDate, getCurrentMonth, getMonthName } from '@/lib/format';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Search, Trash2, Plus, Receipt, Filter, Mic } from 'lucide-react';
import type { Currency, Expense } from '@/types';
import { toast } from 'sonner';
import { QuickAddModal } from '@/components/quick-add-modal';

export function Expenses() {
  const { expenses, loading, deleteExpense } = useExpenses();
  const { categories } = useCategories();
  const { settings } = useSettings();
  const currency = (settings.currency as Currency) || 'INR';

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('current');
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const { month, year } = getCurrentMonth();

  const filtered = useMemo(() => {
    return expenses.filter(e => {
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
      if (typeFilter !== 'all' && e.type !== typeFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        const matchSearch =
          e.merchant?.toLowerCase().includes(s) ||
          e.category.toLowerCase().includes(s) ||
          e.notes?.toLowerCase().includes(s);
        if (!matchSearch) return false;
      }
      if (monthFilter === 'current') {
        const d = new Date(e.date);
        if (d.getMonth() + 1 !== month || d.getFullYear() !== year) return false;
      }
      return true;
    });
  }, [expenses, categoryFilter, typeFilter, search, monthFilter, month, year]);

  const grouped = useMemo(() => {
    const groups: Record<string, Expense[]> = {};
    filtered.forEach(e => {
      const key = e.date;
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const totalAmount = filtered.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const success = await deleteExpense(deleteTarget.id);
    if (success) {
      toast.success('Transaction deleted');
    } else {
      toast.error('Failed to delete');
    }
    setDeleteTarget(null);
  };

  if (loading) {
    return (
      <div className="space-y-3 p-4 md:p-8 max-w-3xl mx-auto animate-pulse">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="h-16 bg-muted rounded-xl" />
        {[1,2,3].map(i => <div key={i} className="h-20 bg-muted rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-8 max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} transactions · {formatCurrency(totalAmount, currency)} spent
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <Filter className="h-3 w-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => (
                <SelectItem key={c.id} value={c.name}>{c.icon} {c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[100px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="expense">Expenses</SelectItem>
              <SelectItem value="income">Income</SelectItem>
            </SelectContent>
          </Select>
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">{getMonthName(month)} {year}</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Transaction list */}
      {grouped.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="h-14 w-14 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
              <Receipt className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">No transactions found</p>
            <Button size="sm" onClick={() => setShowAdd(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Transaction
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {grouped.map(([date, items]) => {
            const dayTotal = items.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
            return (
              <div key={date}>
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {formatShortDate(date)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(dayTotal, currency)}
                  </span>
                </div>
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    {items.map((expense, i) => (
                      <div
                        key={expense.id}
                        className={`flex items-center justify-between p-3 ${i > 0 ? 'border-t' : ''}`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                            expense.type === 'income'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted'
                          }`}>
                            {categories.find(c => c.name === expense.category)?.icon || '📝'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {expense.merchant || expense.category}
                            </p>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs text-muted-foreground">{expense.category}</span>
                              {expense.source === 'voice' && (
                                <Badge variant="secondary" className="text-[10px] h-4 px-1">
                                  <Mic className="h-2.5 w-2.5 mr-0.5" /> Voice
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-[10px] h-4 px-1 uppercase">
                                {expense.payment_method}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-sm font-semibold ${
                            expense.type === 'income' ? 'text-primary' : 'text-foreground'
                          }`}>
                            {expense.type === 'income' ? '+' : '−'}{formatCurrency(expense.amount, currency)}
                          </span>
                          <button
                            onClick={() => setDeleteTarget(expense)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Delete Transaction?</DialogTitle>
            <DialogDescription>
              This will permanently remove {deleteTarget && formatCurrency(deleteTarget.amount, currency)} from {deleteTarget?.category}. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <QuickAddModal open={showAdd} onOpenChange={setShowAdd} />
    </div>
  );
}
