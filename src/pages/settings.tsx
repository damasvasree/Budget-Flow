import { useState, useMemo } from 'react';
import { useSettings, useAchievements, useExpenses, useCategories } from '@/hooks/use-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/use-theme';
import { Download, Award, Moon, Sun, Monitor, IndianRupee, DollarSign, Euro, Flame, Info } from 'lucide-react';
import type { Currency } from '@/types';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const ACHIEVEMENT_DEFS = [
  { name: '7-Day Logger', description: 'Logged expenses for 7 consecutive days', icon: '🔥' },
  { name: '30-Day Master', description: 'Logged expenses for 30 consecutive days', icon: '👑' },
  { name: 'Budget Master', description: 'Stayed within budget for a full month', icon: '🎯' },
  { name: 'Savings Champion', description: 'Saved more than 20% of income', icon: '💰' },
  { name: 'Active Tracker', description: 'Logged 50 expenses in a single month', icon: '📝' },
  { name: 'No-Spend Weekend', description: 'Zero spending on a Saturday and Sunday', icon: '🏖️' },
];

export function Settings() {
  const { settings, updateSetting } = useSettings();
  const { achievements } = useAchievements();
  const { expenses } = useExpenses();
  const { categories } = useCategories();
  const { theme, setTheme } = useTheme();
  const [showExport, setShowExport] = useState(false);
  const [showClear, setShowClear] = useState(false);

  const currency = (settings.currency as Currency) || 'INR';
  const streak = parseInt(settings.streak || '0');

  const currencyOptions: { value: Currency; label: string; icon: typeof IndianRupee }[] = [
    { value: 'INR', label: 'INR (₹)', icon: IndianRupee },
    { value: 'USD', label: 'USD ($)', icon: DollarSign },
    { value: 'EUR', label: 'EUR (€)', icon: Euro },
  ];

  const themeOptions: { value: 'light' | 'dark' | 'system'; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const handleCurrencyChange = (newCurrency: Currency) => {
    updateSetting('currency', newCurrency);
    toast.success(`Currency changed to ${newCurrency}`);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    toast.success(`Theme set to ${newTheme}`);
  };

  const exportData = (format: 'csv' | 'json') => {
    if (format === 'csv') {
      const headers = ['Date', 'Type', 'Category', 'Amount', 'Merchant', 'Payment Method', 'Notes', 'Source'];
      const rows = expenses.map(e => [
        e.date,
        e.type,
        e.category,
        e.amount,
        e.merchant || '',
        e.payment_method,
        e.notes || '',
        e.source,
      ]);
      const csv = [headers, ...rows]
        .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n');
      downloadFile(csv, 'budgetflow-export.csv', 'text/csv');
    } else {
      const data = {
        exportedAt: new Date().toISOString(),
        expenses,
        categories,
        settings,
        achievements,
      };
      downloadFile(JSON.stringify(data, null, 2), 'budgetflow-export.json', 'application/json');
    }
    toast.success(`Data exported as ${format.toUpperCase()}`);
    setShowExport(false);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    // This would need a more sophisticated approach with supabase
    toast.info('Clear data is not available in this demo. Use export to backup your data first.');
    setShowClear(false);
  };

  const unlockedAchievements = useMemo(() => {
    return ACHIEVEMENT_DEFS.map(def => {
      const unlocked = achievements.find(a => a.badge_name === def.name);
      return { ...def, unlocked: !!unlocked, unlockedAt: unlocked?.unlocked_at };
    });
  }, [achievements]);

  return (
    <div className="space-y-4 p-4 md:p-8 max-w-2xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Customize your experience</p>
      </div>

      {/* Streak and stats */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-orange-500/10 flex items-center justify-center">
              <Flame className="h-7 w-7 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{streak}</p>
              <p className="text-sm text-muted-foreground">Day logging streak</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Currency */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Currency</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-2">
            {currencyOptions.map(opt => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleCurrencyChange(opt.value)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-lg border transition-all ${
                    currency === opt.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map(opt => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleThemeChange(opt.value)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-lg border transition-all ${
                    theme === opt.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            Achievements
            <Badge variant="secondary" className="text-[10px]">
              {achievements.length}/{ACHIEVEMENT_DEFS.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-2">
            {unlockedAchievements.map(ach => (
              <div
                key={ach.name}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  ach.unlocked
                    ? 'border-primary/20 bg-primary/5'
                    : 'border-border opacity-50'
                }`}
              >
                <span className="text-2xl">{ach.unlocked ? ach.icon : '🔒'}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{ach.name}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{ach.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data management */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Data Management</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <Button variant="outline" className="w-full justify-start" onClick={() => setShowExport(true)}>
            <Download className="h-4 w-4 mr-2" /> Export Data
          </Button>
          <p className="text-xs text-muted-foreground px-1 flex items-start gap-1.5">
            <Info className="h-3 w-3 mt-0.5 shrink-0" />
            Your data is stored securely in the cloud. Export regularly as backup.
          </p>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-primary-foreground">
                <path d="M3 12h4l3-8 4 16 3-8h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold">BudgetFlow</p>
              <p className="text-xs text-muted-foreground">Version 1.0.0</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            A smart, India-first budget tracker with voice input, AI categorization, and predictive spending insights.
          </p>
        </CardContent>
      </Card>

      {/* Export dialog */}
      <Dialog open={showExport} onOpenChange={setShowExport}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Export Data</DialogTitle>
            <DialogDescription>Download your transaction data for backup or analysis</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => exportData('csv')}>
              <Download className="h-4 w-4 mr-2" /> Export as CSV
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => exportData('json')}>
              <Download className="h-4 w-4 mr-2" /> Export as JSON
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
