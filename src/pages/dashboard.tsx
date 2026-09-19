import { useMemo } from 'react';
import { useExpenses, useBudgets, useSettings, useAchievements } from '@/hooks/use-data';
import { generateInsights } from '@/lib/ai';
import { formatCurrency, getCurrentMonth, getMonthName, getDaysInMonth, getDayOfMonth } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  TrendingUp, TrendingDown, Wallet, Target, Flame, Award,
  AlertCircle, Lightbulb, Zap, Sparkles, Clock, BarChart3, Scissors,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import type { Page } from '@/components/bottom-nav';
import type { Currency } from '@/types';

const ICON_MAP: Record<string, typeof AlertCircle> = {
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'alert-circle': AlertCircle,
  lightbulb: Lightbulb,
  zap: Zap,
  sparkles: Sparkles,
  clock: Clock,
  'bar-chart-3': BarChart3,
  scissors: Scissors,
};

interface DashboardProps {
  onNavigate: (page: Page) => void;
  onQuickAdd: () => void;
}

export function Dashboard({ onNavigate, onQuickAdd }: DashboardProps) {
  const { expenses, loading } = useExpenses();
  const { getCurrentBudgets } = useBudgets();
  const { settings } = useSettings();
  const { achievements } = useAchievements();
  const currency = (settings.currency as Currency) || 'INR';
  const streak = parseInt(settings.streak || '0');

  const { month, year } = getCurrentMonth();
  const currentBudgets = getCurrentBudgets();

  const stats = useMemo(() => {
    const monthExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });

    const totalIncome = monthExpenses
      .filter(e => e.type === 'income')
      .reduce((s, e) => s + e.amount, 0);
    const totalExpenses = monthExpenses
      .filter(e => e.type === 'expense')
      .reduce((s, e) => s + e.amount, 0);
    const balance = totalIncome - totalExpenses;

    const categoryTotals: Record<string, number> = {};
    monthExpenses
      .filter(e => e.type === 'expense')
      .forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
      });

    const topCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const totalBudget = currentBudgets.reduce((s, b) => s + b.limit_amount, 0);
    const budgetUsed = currentBudgets.reduce((s, b) => {
      return s + (categoryTotals[b.category] || 0);
    }, 0);
    const budgetPct = totalBudget > 0 ? (budgetUsed / totalBudget) * 100 : 0;

    const merchantTotals: Record<string, number> = {};
    monthExpenses
      .filter(e => e.type === 'expense' && e.merchant)
      .forEach(e => {
        merchantTotals[e.merchant!] = (merchantTotals[e.merchant!] || 0) + e.amount;
      });
    const topMerchants = Object.entries(merchantTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      totalIncome,
      totalExpenses,
      balance,
      topCategories,
      totalBudget,
      budgetUsed,
      budgetPct,
      topMerchants,
      monthExpenses,
    };
  }, [expenses, month, year, currentBudgets]);

  const insights = useMemo(() =>
    generateInsights(expenses, currentBudgets, currency),
    [expenses, currentBudgets, currency]
  );

  const recentExpenses = expenses.slice(0, 5);
  const daysInMonth = getDaysInMonth(month, year);
  const dayOfMonth = getDayOfMonth();

  if (loading) {
    return (
      <div className="space-y-4 p-4 md:p-8 animate-pulse">
        <div className="h-32 bg-muted rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-muted rounded-xl" />
          <div className="h-24 bg-muted rounded-xl" />
        </div>
        <div className="h-48 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header with month and streak */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{getMonthName(month)} {year}</p>
        </div>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-full">
              <Flame className="h-4 w-4" />
              <span className="text-sm font-semibold">{streak}</span>
            </div>
          )}
          {achievements.length > 0 && (
            <button
              onClick={() => onNavigate('settings')}
              className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full"
            >
              <Award className="h-4 w-4" />
              <span className="text-sm font-semibold">{achievements.length}</span>
            </button>
          )}
        </div>
      </div>

      {/* Balance card */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm opacity-90">Monthly Balance</span>
            <Wallet className="h-5 w-5 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-4">
            {formatCurrency(stats.balance, currency)}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <ArrowDownRight className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs opacity-80">Income</p>
                <p className="text-sm font-semibold">{formatCurrency(stats.totalIncome, currency)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs opacity-80">Expenses</p>
                <p className="text-sm font-semibold">{formatCurrency(stats.totalExpenses, currency)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget progress */}
      {stats.totalBudget > 0 && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">Budget Usage</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(stats.budgetUsed, currency)} / {formatCurrency(stats.totalBudget, currency)}
              </span>
            </div>
            <Progress
              value={Math.min(stats.budgetPct, 100)}
              className="h-3"
            />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{Math.round(stats.budgetPct)}% used</span>
              <span>Day {dayOfMonth} of {daysInMonth}</span>
            </div>
            {stats.budgetPct > 80 && (
              <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                You're approaching your budget limit
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Insights */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">AI Insights</h2>
        </div>
        <div className="space-y-2">
          {insights.slice(0, 3).map((insight, i) => {
            const Icon = ICON_MAP[insight.icon] || Sparkles;
            const colors = {
              alert: 'bg-destructive/10 text-destructive border-destructive/20',
              prediction: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
              suggestion: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
              positive: 'bg-primary/10 text-primary border-primary/20',
            };
            return (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg border ${colors[insight.type]}`}
              >
                <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="text-sm leading-snug">{insight.message}</p>
              </div>
            );
          })}
        </div>
        <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={() => onNavigate('analytics')}>
          View all insights <BarChart3 className="h-3 w-3 ml-1" />
        </Button>
      </div>

      {/* Top categories */}
      {stats.topCategories.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Top Categories</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {stats.topCategories.map(([cat, amount], i) => {
                const pct = stats.totalExpenses > 0 ? (amount / stats.totalExpenses) * 100 : 0;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{cat}</span>
                      <span className="text-muted-foreground">{formatCurrency(amount, currency)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: `hsl(var(--chart-${(i % 5) + 1}))`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent transactions */}
      <Card>
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="text-sm">Recent Activity</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => onNavigate('expenses')}>
            View all
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          {recentExpenses.length === 0 ? (
            <div className="text-center py-8">
              <div className="h-12 w-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                <Receipt className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">No transactions yet</p>
              <Button size="sm" onClick={onQuickAdd}>Add your first expense</Button>
            </div>
          ) : (
            <div className="space-y-1">
              {recentExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                      expense.type === 'income'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {expense.type === 'income' ? '+' : '−'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {expense.merchant || expense.category}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {expense.category} · {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold shrink-0 ${
                    expense.type === 'income' ? 'text-primary' : 'text-foreground'
                  }`}>
                    {expense.type === 'income' ? '+' : '−'}{formatCurrency(expense.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { Receipt } from 'lucide-react';
