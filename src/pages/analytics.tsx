import { useMemo, useState } from 'react';
import { useExpenses, useBudgets, useSettings, useCategories } from '@/hooks/use-data';
import { generateInsights } from '@/lib/ai';
import { formatCurrency, getCurrentMonth, getMonthName, getDaysInMonth, getDayOfMonth } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  BarChart3, PieChart, Sparkles, AlertCircle, Lightbulb, Zap, Clock, Scissors,
} from 'lucide-react';
import {
  PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, BarChart, Bar,
} from 'recharts';
import type { Currency } from '@/types';
import type { Page } from '@/components/bottom-nav';

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

const CHART_COLORS = [
  'hsl(158, 76%, 36%)',
  'hsl(200, 80%, 50%)',
  'hsl(25, 95%, 55%)',
  'hsl(280, 65%, 60%)',
  'hsl(340, 75%, 55%)',
  'hsl(142, 72%, 45%)',
  'hsl(38, 92%, 50%)',
  'hsl(270, 60%, 55%)',
  'hsl(190, 85%, 45%)',
  'hsl(10, 80%, 55%)',
  'hsl(60, 75%, 50%)',
  'hsl(220, 70%, 55%)',
];

interface AnalyticsProps {
  onNavigate: (page: Page) => void;
}

export function Analytics({ onNavigate }: AnalyticsProps) {
  const { expenses } = useExpenses();
  const { getCurrentBudgets } = useBudgets();
  const { categories } = useCategories();
  const { settings } = useSettings();
  const currency = (settings.currency as Currency) || 'INR';

  const [range, setRange] = useState<'month' | '3months' | '6months'>('3months');

  const { month, year } = getCurrentMonth();
  const currentBudgets = getCurrentBudgets();

  const monthData = useMemo(() => {
    const months: { label: string; month: number; year: number; income: number; expenses: number }[] = [];
    const numMonths = range === 'month' ? 1 : range === '3months' ? 3 : 6;

    for (let i = numMonths - 1; i >= 0; i--) {
      const d = new Date(year, month - 1 - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const monthExpenses = expenses.filter(e => {
        const ed = new Date(e.date);
        return ed.getMonth() + 1 === m && ed.getFullYear() === y;
      });
      const income = monthExpenses.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
      const exp = monthExpenses.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
      months.push({
        label: getMonthName(m),
        month: m,
        year: y,
        income,
        expenses: exp,
      });
    }
    return months;
  }, [expenses, month, year, range]);

  const categoryBreakdown = useMemo(() => {
    const numMonths = range === 'month' ? 1 : range === '3months' ? 3 : 6;
    const totals: Record<string, number> = {};

    for (let i = numMonths - 1; i >= 0; i--) {
      const d = new Date(year, month - 1 - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      expenses
        .filter(e => {
          const ed = new Date(e.date);
          return ed.getMonth() + 1 === m && ed.getFullYear() === y && e.type === 'expense';
        })
        .forEach(e => {
          totals[e.category] = (totals[e.category] || 0) + e.amount;
        });
    }

    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
  }, [expenses, month, year, range]);

  const merchantStats = useMemo(() => {
    const numMonths = range === 'month' ? 1 : range === '3months' ? 3 : 6;
    const totals: Record<string, { amount: number; count: number }> = {};

    for (let i = numMonths - 1; i >= 0; i--) {
      const d = new Date(year, month - 1 - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      expenses
        .filter(e => {
          const ed = new Date(e.date);
          return ed.getMonth() + 1 === m && ed.getFullYear() === y && e.type === 'expense' && e.merchant;
        })
        .forEach(e => {
          if (!totals[e.merchant!]) totals[e.merchant!] = { amount: 0, count: 0 };
          totals[e.merchant!].amount += e.amount;
          totals[e.merchant!].count += 1;
        });
    }

    return Object.entries(totals)
      .sort((a, b) => b[1].amount - a[1].amount)
      .slice(0, 10)
      .map(([name, stats]) => ({ name, ...stats }));
  }, [expenses, month, year, range]);

  const insights = useMemo(() =>
    generateInsights(expenses, currentBudgets, currency),
    [expenses, currentBudgets, currency]
  );

  const totalIncome = monthData.reduce((s, m) => s + m.income, 0);
  const totalExpenses = monthData.reduce((s, m) => s + m.expenses, 0);
  const savings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

  const avgDailySpend = useMemo(() => {
    const currentMonthData = monthData[monthData.length - 1];
    if (!currentMonthData) return 0;
    const dim = getDaysInMonth(currentMonthData.month, currentMonthData.year);
    return currentMonthData.expenses / getDayOfMonth();
  }, [monthData]);

  return (
    <div className="space-y-4 p-4 md:p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">Spending insights and trends</p>
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(['month', '3months', '6months'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                range === r ? 'bg-background shadow-sm' : 'text-muted-foreground'
              }`}
            >
              {r === 'month' ? '1M' : r === '3months' ? '3M' : '6M'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <ArrowDownRight className="h-3 w-3 text-primary" /> Income
            </div>
            <p className="text-lg font-bold">{formatCurrency(totalIncome, currency)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <ArrowUpRight className="h-3 w-3 text-destructive" /> Expenses
            </div>
            <p className="text-lg font-bold">{formatCurrency(totalExpenses, currency)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <TrendingUp className="h-3 w-3" /> Savings
            </div>
            <p className={`text-lg font-bold ${savings >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {formatCurrency(savings, currency)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <PieChart className="h-3 w-3" /> Savings Rate
            </div>
            <p className={`text-lg font-bold ${savingsRate >= 20 ? 'text-primary' : savingsRate >= 0 ? 'text-amber-500' : 'text-destructive'}`}>
              {Math.round(savingsRate)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Income vs Expenses trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Income vs Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => formatCurrency(value, currency)}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="income" stroke="hsl(var(--primary))" strokeWidth={2} name="Income" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="expenses" stroke="hsl(var(--destructive))" strokeWidth={2} name="Expenses" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category breakdown */}
      {categoryBreakdown.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 items-center">
              <ResponsiveContainer width="100%" height={220}>
                <RechartsPieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={2}
                  >
                    {categoryBreakdown.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => formatCurrency(value, currency)}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {categoryBreakdown.slice(0, 6).map((cat, i) => {
                  const total = categoryBreakdown.reduce((s, c) => s + c.value, 0);
                  const pct = total > 0 ? (cat.value / total) * 100 : 0;
                  const categoryObj = categories.find(c => c.name === cat.name);
                  return (
                    <div key={cat.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="truncate">{categoryObj?.icon || '📝'} {cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-muted-foreground text-xs">{Math.round(pct)}%</span>
                        <span className="font-medium">{formatCurrency(cat.value, currency)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly comparison bar chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Monthly Spending Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => formatCurrency(value, currency)}
              />
              <Bar dataKey="income" fill="hsl(var(--primary))" name="Income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="hsl(var(--chart-3))" name="Expenses" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top merchants */}
      {merchantStats.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Top Merchants</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {merchantStats.map((m, i) => (
                <div key={m.name} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.count} transactions</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold shrink-0">{formatCurrency(m.amount, currency)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All AI Insights */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">All Insights</h2>
        </div>
        <div className="space-y-2">
          {insights.map((insight, i) => {
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
                <div className="flex-1">
                  <p className="text-sm leading-snug">{insight.message}</p>
                  <Badge variant="secondary" className="text-[10px] mt-1.5 capitalize">
                    {insight.type}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
