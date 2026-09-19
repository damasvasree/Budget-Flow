import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/hooks/use-theme';
import { useSettings } from '@/hooks/use-data';
import { BottomNav, type Page } from '@/components/bottom-nav';
import { Fab } from '@/components/fab';
import { QuickAddModal } from '@/components/quick-add-modal';
import { Onboarding } from '@/components/onboarding';
import { Toaster } from '@/components/ui/sonner';
import { Dashboard } from '@/pages/dashboard';
import { Expenses } from '@/pages/expenses';
import { Budgets } from '@/pages/budgets';
import { Analytics } from '@/pages/analytics';
import { Settings } from '@/pages/settings';

function AppContent() {
  const [page, setPage] = useState<Page>('dashboard');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const { settings, loading: settingsLoading } = useSettings();

  const onboardingComplete = settings.onboarding_complete === 'true';

  const handleNavigate = (p: Page) => {
    setPage(p);
    window.scrollTo(0, 0);
  };

  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!onboardingComplete) {
    return <Onboarding />;
  }

  return (
    <div className="min-h-screen bg-background">
      <BottomNav current={page} onNavigate={handleNavigate} />
      <main className="md:ml-64 pb-20 md:pb-6 min-h-screen">
        {page === 'dashboard' && <Dashboard onNavigate={handleNavigate} onQuickAdd={() => setShowQuickAdd(true)} />}
        {page === 'expenses' && <Expenses />}
        {page === 'budgets' && <Budgets />}
        {page === 'analytics' && <Analytics onNavigate={handleNavigate} />}
        {page === 'settings' && <Settings />}
      </main>
      <Fab onClick={() => setShowQuickAdd(true)} />
      <QuickAddModal open={showQuickAdd} onOpenChange={setShowQuickAdd} />
      <Toaster position="top-center" />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
