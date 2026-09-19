import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Receipt, PiggyBank, Sparkles, ChevronRight } from 'lucide-react';
import { useSettings } from '@/hooks/use-data';

const STEPS = [
  {
    icon: Mic,
    title: 'Voice Input',
    description: 'Just speak naturally: "Add ₹150 for lunch at canteen". BudgetFlow understands and categorizes automatically.',
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    icon: Sparkles,
    title: 'AI Categorization',
    description: 'Your expenses are automatically sorted into smart categories — from Food & Dining to Transport, Education, and more.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: PiggyBank,
    title: 'Smart Budgeting',
    description: 'Set monthly budgets, get predictive alerts before you overspend, and watch your savings grow with insights.',
    color: 'bg-amber-500/10 text-amber-500',
  },
];

export function Onboarding() {
  const [step, setStep] = useState(0);
  const { updateSetting } = useSettings();

  const handleComplete = async () => {
    await updateSetting('onboarding_complete', 'true');
  };

  const handleSkip = async () => {
    await updateSetting('onboarding_complete', 'true');
  };

  const isLastStep = step === STEPS.length - 1;
  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col">
      <div className="flex justify-end p-4">
        <button
          onClick={handleSkip}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto w-full">
        <div className={`h-24 w-24 rounded-3xl flex items-center justify-center mb-8 ${current.color}`}>
          <Icon className="h-12 w-12" />
        </div>

        <h2 className="text-2xl font-bold text-center mb-3">{current.title}</h2>
        <p className="text-center text-muted-foreground leading-relaxed mb-8">
          {current.description}
        </p>

        {/* Progress dots */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step ? 'w-8 bg-primary' : 'w-2 bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-6 max-w-md mx-auto w-full">
        <Button
          className="w-full"
          size="lg"
          onClick={() => isLastStep ? handleComplete() : setStep(step + 1)}
        >
          {isLastStep ? 'Get Started' : 'Next'}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
