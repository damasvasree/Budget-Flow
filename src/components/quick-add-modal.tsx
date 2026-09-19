import { useState, useMemo } from 'react';
import { useVoiceInput } from '@/hooks/use-voice';
import { parseVoiceInput, categorizeTransaction, extractAmount, extractMerchant } from '@/lib/ai';
import { useCategories, useExpenses, useSettings, useAchievements } from '@/hooks/use-data';
import { getCurrentMonth, getTodayISO } from '@/lib/format';
import type { ExpenseInput, Currency } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Mic, MicOff, Sparkles, Calendar, Tag, Wallet, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';

interface QuickAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export function QuickAddModal({ open, onOpenChange, onSaved }: QuickAddModalProps) {
  const { categories } = useCategories();
  const { addExpense, expenses } = useExpenses();
  const { settings, updateSetting } = useSettings();
  const { unlockAchievement } = useAchievements();
  const currency = (settings.currency as Currency) || 'INR';

  const voice = useVoiceInput();
  const [mode, setMode] = useState<'manual' | 'voice'>('manual');

  // Manual form state
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState('');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState(getTodayISO());
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card' | 'other'>('upi');

  const userHistory = useMemo(() =>
    expenses.map(e => ({ merchant: e.merchant, category: e.category })),
    [expenses]
  );

  const handleVoiceResult = () => {
    if (!voice.transcript) return;
    const parsed = parseVoiceInput(voice.transcript, categories, userHistory);
    if (parsed.amount) {
      setAmount(String(parsed.amount));
    }
    if (parsed.category) {
      setCategory(parsed.category);
    }
    if (parsed.merchant) {
      setMerchant(parsed.merchant);
    }
    if (parsed.date) {
      setDate(parsed.date);
    }
    setNotes(voice.transcript);
    setType('expense');
  };

  const handleManualCategoryGuess = (merchantName: string) => {
    if (!merchantName.trim() || category) return;
    const guessed = categorizeTransaction(merchantName, categories, userHistory);
    if (guessed && guessed !== 'Other') {
      setCategory(guessed);
    }
  };

  const handleSubmit = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!category) {
      toast.error('Please select a category');
      return;
    }

    const input: ExpenseInput = {
      amount: amt,
      type,
      category,
      merchant: merchant.trim() || undefined,
      date,
      notes: notes.trim() || undefined,
      payment_method: paymentMethod,
      source: mode === 'voice' ? 'voice' : 'manual',
    };

    const result = await addExpense(input);
    if (result) {
      toast.success(`${type === 'income' ? 'Income' : 'Expense'} of ₹${amt} added`);

      // Update streak
      const today = getTodayISO();
      const lastLogDate = settings.last_log_date;
      if (lastLogDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        const currentStreak = parseInt(settings.streak || '0');
        if (lastLogDate === yesterdayStr) {
          const newStreak = currentStreak + 1;
          await updateSetting('streak', String(newStreak));
          await updateSetting('last_log_date', today);
          if (newStreak === 7) {
            await unlockAchievement('7-Day Logger', 'Logged expenses for 7 consecutive days');
            toast.success('Achievement unlocked: 7-Day Logger!');
          }
          if (newStreak === 30) {
            await unlockAchievement('Budget Master', 'Logged expenses for 30 consecutive days');
          }
        } else {
          await updateSetting('streak', '1');
          await updateSetting('last_log_date', today);
        }
      }

      // Check month expense count for achievements
      const { month, year } = getCurrentMonth();
      const monthExpenseCount = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() + 1 === month && d.getFullYear() === year;
      }).length + 1;

      if (monthExpenseCount === 50) {
        await unlockAchievement('Active Tracker', 'Logged 50 expenses in a single month');
      }

      onSaved?.();
      resetForm();
      onOpenChange(false);
    } else {
      toast.error('Failed to add entry. Please try again.');
    }
  };

  const resetForm = () => {
    setAmount('');
    setMerchant('');
    setNotes('');
    setCategory('');
    setDate(getTodayISO());
    setType('expense');
    setPaymentMethod('upi');
    voice.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Add Transaction
          </DialogTitle>
          <DialogDescription>Log an expense or income quickly</DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6">
          <Tabs value={mode} onValueChange={(v) => setMode(v as 'manual' | 'voice')}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="manual" className="text-xs">Manual</TabsTrigger>
              <TabsTrigger value="voice" className="text-xs">
                <Mic className="h-3.5 w-3.5 mr-1" /> Voice
              </TabsTrigger>
            </TabsList>

            <TabsContent value="voice" className="space-y-3 mt-0">
              <div className="flex flex-col items-center gap-3 py-4 bg-muted/50 rounded-lg">
                <Button
                  size="lg"
                  variant={voice.isListening ? 'destructive' : 'default'}
                  className="rounded-full h-16 w-16 p-0"
                  disabled={!voice.isSupported}
                  onClick={() => voice.isListening ? voice.stopListening() : voice.startListening('en-IN')}
                >
                  {voice.isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </Button>
                <p className="text-sm text-muted-foreground text-center px-4">
                  {!voice.isSupported
                    ? 'Voice input is not supported in your browser'
                    : voice.isListening
                    ? 'Listening... Tap to stop'
                    : 'Tap to speak. Try: "Add ₹150 for lunch at canteen"'}
                </p>
                {(voice.transcript || voice.interimTranscript) && (
                  <div className="w-full px-4">
                    <div className="bg-background border rounded-lg p-3 text-sm">
                      <span className="text-muted-foreground text-xs block mb-1">Heard:</span>
                      {voice.transcript}
                      <span className="text-muted-foreground italic">{voice.interimTranscript}</span>
                    </div>
                    {voice.transcript && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2"
                        onClick={handleVoiceResult}
                      >
                        <Sparkles className="h-3.5 w-3.5 mr-1" />
                        Parse & Fill Form
                      </Button>
                    )}
                  </div>
                )}
                {voice.error && (
                  <p className="text-sm text-destructive px-4 text-center">{voice.error}</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="manual" className="space-y-3 mt-0">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={type === 'expense' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => setType('expense')}
                >
                  Expense
                </Button>
                <Button
                  variant={type === 'income' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setType('income')}
                >
                  Income
                </Button>
              </div>
            </TabsContent>

            {/* Shared form fields */}
            <div className="space-y-3 mt-3">
              <div>
                <Label htmlFor="amount" className="text-xs flex items-center gap-1">
                  <IndianRupee className="h-3 w-3" /> Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 text-lg font-semibold"
                  autoFocus
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-xs flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Category
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        <span className="mr-2">{cat.icon}</span>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="merchant" className="text-xs flex items-center gap-1">
                  <Wallet className="h-3 w-3" /> Merchant (optional)
                </Label>
                <Input
                  id="merchant"
                  placeholder="e.g., Zomato, Uber, Amazon"
                  value={merchant}
                  onChange={(e) => {
                    setMerchant(e.target.value);
                    handleManualCategoryGuess(e.target.value);
                  }}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="date" className="text-xs flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Payment</Label>
                  <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'cash' | 'upi' | 'card' | 'other')}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes" className="text-xs">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add a note..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 min-h-[60px] resize-none"
                />
              </div>

              <Button onClick={handleSubmit} className="w-full" size="lg">
                Add {type === 'income' ? 'Income' : 'Expense'}
              </Button>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
