import { LayoutDashboard, Receipt, PiggyBank, BarChart3, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Page = 'dashboard' | 'expenses' | 'budgets' | 'analytics' | 'settings';

interface BottomNavProps {
  current: Page;
  onNavigate: (page: Page) => void;
}

const navItems: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'budgets', label: 'Budgets', icon: PiggyBank },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export function BottomNav({ current, onNavigate }: BottomNavProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col border-r bg-card z-40">
        <div className="flex items-center gap-2 px-6 h-16 border-b">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-primary-foreground">
              <path d="M3 12h4l3-8 4 16 3-8h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-bold text-lg">BudgetFlow</span>
        </div>
        <div className="flex flex-col gap-1 p-3 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  current === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </div>
        <div className="p-4 border-t">
          <p className="text-xs text-muted-foreground">BudgetFlow v1.0</p>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t">
        <div className="flex items-center justify-around h-16 pb-safe">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-2 py-1.5 transition-colors',
                  current === item.id
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
