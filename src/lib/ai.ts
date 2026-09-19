import type { Category } from '@/types';

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Food & Dining': [
    'food', 'lunch', 'dinner', 'breakfast', 'canteen', 'restaurant', 'zomato', 'swiggy',
    'pizza', 'burger', 'tea', 'coffee', 'snack', 'meal', 'eat', 'dine', 'tiffin',
    'biryani', 'dosa', 'idli', 'samosa', 'chaat', 'paratha', 'thali', 'khana',
    'khaana', 'khana', 'roti', 'naan', 'curry', 'cafe', 'barista', 'starbucks',
    'mcdonalds', 'kfc', 'dominos', 'subway', 'haldiram', 'bikaner', 'paneer',
  ],
  'Transport': [
    'uber', 'ola', 'auto', 'rickshaw', 'metro', 'bus', 'train', 'cab', 'taxi',
    'fuel', 'petrol', 'diesel', 'bike', 'scooter', 'rickshaw', 'travel',
    'irctc', 'redbus', 'makemytrip', 'transport', 'ride', 'rapido', 'nammayatri',
    'yellowauto', 'autowala', 'fare', 'ticket', 'pass', 'parking',
  ],
  'Shopping': [
    'amazon', 'flipkart', 'myntra', 'ajio', 'clothes', 'shirt', 'shoes',
    'shopping', 'mall', 'store', 'purchase', 'buy', 'fashion', 'wear',
    'pant', 'jeans', 'tshirt', 'kurta', 'saree', 'dress', 'accessories',
    'watch', 'bag', 'wallet', 'sunglasses', 'zara', 'h&m', 'store',
  ],
  'Education': [
    'book', 'course', 'tuition', 'school', 'college', 'university', 'fee',
    'exam', 'study', 'library', 'stationery', 'notebook', 'pen', 'pencil',
    'udemy', 'coursera', 'byjus', 'unacademy', 'education', 'class', 'lecture',
    'textbook', 'guide', 'reference', 'certificate', 'enrollment', 'admission',
  ],
  'Entertainment': [
    'netflix', 'spotify', 'prime', 'hotstar', 'movie', 'cinema', 'pvr',
    'inox', 'theatre', 'theater', 'game', 'gaming', 'steam', 'concert',
    'show', 'ott', 'subscription', 'youtube', 'music', 'disney', 'sonyliv',
    'zee5', 'jiosaavn', 'gaana', 'bookmyshow', 'tickets',
  ],
  'Medical': [
    'medical', 'medicine', 'doctor', 'hospital', 'pharmacy', 'clinic',
    'health', 'tablet', 'syrup', 'injection', 'checkup', 'consultation',
    'lab', 'test', 'blood', 'prescription', 'apollo', 'medplus', '1mg',
    'pharmeasy', 'netmeds', 'dental', 'eye', 'physio', 'therapy',
  ],
  'Festivals & Gifting': [
    'gift', 'festival', 'diwali', 'holi', 'eid', 'christmas', 'raksha',
    'rakhi', 'puja', 'decoration', 'crackers', 'sweets', 'mithai', 'present',
    'birthday', 'anniversary', 'card', 'flowers', 'bouquet', 'laddoo', 'kaju',
  ],
  'House Help': [
    'maid', 'servant', 'cleaning', 'cook', 'cookware', 'laundry', 'wash',
    'iron', 'dhobi', 'sweeper', 'househelp', 'helper', 'babysitter', 'nanny',
    'gardener', 'plumber', 'electrician', 'carpenter', 'repair',
  ],
  'Personal Care': [
    'haircut', 'salon', 'spa', 'gym', 'fitness', 'beauty', 'cosmetics',
    'shampoo', 'soap', 'lotion', 'cream', 'deodorant', 'perfume', 'nails',
    'beard', 'shave', 'barber', 'beauty parlour', 'facial', 'massage',
    'waxing', 'manicure', 'pedicure', 'nykaa', 'mamaearth',
  ],
  'Bills & Utilities': [
    'electricity', 'water', 'gas', 'internet', 'wifi', 'phone', 'mobile',
    'recharge', 'bill', 'rent', 'broadband', 'airtel', 'jio', 'vi', 'bsnl',
    'electric', 'utility', 'maintenance', 'society', 'dth', 'tata sky',
    'insurance', 'premium', 'emi', 'loan',
  ],
  'Groceries': [
    'grocery', 'groceries', 'supermarket', 'vegetables', 'fruits', 'milk',
    'bread', 'eggs', 'rice', 'flour', 'atta', 'oil', 'sugar', 'salt',
    'onion', 'potato', 'tomato', 'kirana', 'dmart', 'bigbasket', 'zepto',
    'blinkit', 'instamart', 'reliance', 'spencer', 'more store',
  ],
  'Other': [],
};

const MERCHANT_CATEGORY_MAP: Record<string, string> = {
  'zomato': 'Food & Dining',
  'swiggy': 'Food & Dining',
  'uber': 'Transport',
  'ola': 'Transport',
  'rapido': 'Transport',
  'amazon': 'Shopping',
  'flipkart': 'Shopping',
  'myntra': 'Shopping',
  'netflix': 'Entertainment',
  'spotify': 'Entertainment',
  'zepto': 'Groceries',
  'blinkit': 'Groceries',
  'instamart': 'Groceries',
  'bigbasket': 'Groceries',
  'dmart': 'Groceries',
  'nykaa': 'Personal Care',
  'apollo': 'Medical',
  '1mg': 'Medical',
  'pharmeasy': 'Medical',
  'jio': 'Bills & Utilities',
  'airtel': 'Bills & Utilities',
};

export function categorizeTransaction(
  text: string,
  categories: Category[],
  userHistory?: { merchant: string | null; category: string }[]
): string {
  if (!text || text.trim().length === 0) return 'Other';
  const lowerText = text.toLowerCase();

  if (userHistory && userHistory.length > 0) {
    const merchantMatch = extractMerchant(text);
    if (merchantMatch) {
      const lowerMerchant = merchantMatch.toLowerCase();
      const merchantKey = Object.keys(MERCHANT_CATEGORY_MAP).find(
        k => lowerMerchant.includes(k)
      );
      if (merchantKey) {
        return MERCHANT_CATEGORY_MAP[merchantKey];
      }

      const historicalMatch = userHistory.find(
        h => h.merchant && h.merchant.toLowerCase() === lowerMerchant
      );
      if (historicalMatch) {
        return historicalMatch.category;
      }
    }
  }

  for (const [categoryName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (categoryName === 'Other') continue;
    const categoryExists = categories.some(c => c.name === categoryName);
    if (!categoryExists) continue;

    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(lowerText)) {
        return categoryName;
      }
    }
  }

  return 'Other';
}

export function extractAmount(text: string): number | null {
  const patterns = [
    /(?:rs\.?|₹|inr|rupees?)\s*(\d+(?:,\d+)*(?:\.\d+)?)/i,
    /(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:rs\.?|₹|inr|rupees?)/i,
    /\b(\d+(?:,\d+)*(?:\.\d+)?)\b/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (amount > 0) return amount;
    }
  }

  const words: Record<string, number> = {
    'hundred': 100, 'thousand': 1000, 'lakh': 100000, 'crore': 10000000,
  };
  const lowerText = text.toLowerCase();
  for (const [word, value] of Object.entries(words)) {
    if (lowerText.includes(word)) {
      const numMatch = lowerText.match(/(\d+(?:\.\d+)?)/);
      if (numMatch) {
        const num = parseFloat(numMatch[1]);
        return num * value;
      }
    }
  }

  return null;
}

export function extractMerchant(text: string): string | null {
  const stopWords = new Set([
    'add', 'spent', 'spend', 'paid', 'pay', 'for', 'at', 'on', 'to', 'from',
    'bought', 'purchase', 'bought', 'got', 'the', 'a', 'an', 'yesterday',
    'today', 'tomorrow', 'rs', 'inr', 'rupees', 'lunch', 'dinner', 'breakfast',
    'and', 'of', 'in', 'near', 'by', 'via', 'using', 'cash', 'upi', 'card',
  ]);

  const atMatch = text.match(/\bat\s+(.+?)(?:\s+(?:yesterday|today|tomorrow|via|using|for|on|$))/i);
  if (atMatch) {
    const merchant = atMatch[1].trim();
    if (merchant.length > 1) return capitalizeWords(merchant);
  }

  const forMatch = text.match(/\bfor\s+(.+?)(?:\s+(?:at|yesterday|today|tomorrow|via|using|on|$))/i);
  if (forMatch) {
    const words = forMatch[1].trim().split(/\s+/);
    const filtered = words.filter(w => !stopWords.has(w.toLowerCase()));
    if (filtered.length > 0) {
      const merchant = filtered.join(' ');
      if (merchant.length > 1) return capitalizeWords(merchant);
    }
  }

  return null;
}

function capitalizeWords(s: string): string {
  return s.split(' ').map(w =>
    w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  ).join(' ');
}

export function parseVoiceInput(
  text: string,
  categories: Category[],
  userHistory?: { merchant: string | null; category: string }[]
): {
  amount: number | null;
  category: string;
  merchant: string | null;
  date: string;
  notes: string;
} {
  const amount = extractAmount(text);
  const category = categorizeTransaction(text, categories, userHistory);
  const merchant = extractMerchant(text);
  const date = parseDate(text);
  const notes = text;

  return { amount, category, merchant, date, notes };
}

function parseDate(text: string): string {
  const today = new Date();
  const lowerText = text.toLowerCase();

  if (lowerText.includes('yesterday')) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }

  if (lowerText.includes('day before yesterday')) {
    const d = new Date(today);
    d.setDate(d.getDate() - 2);
    return d.toISOString().split('T')[0];
  }

  if (lowerText.includes('today')) {
    return today.toISOString().split('T')[0];
  }

  const daysAgoMatch = lowerText.match(/(\d+)\s*days?\s*ago/);
  if (daysAgoMatch) {
    const days = parseInt(daysAgoMatch[1]);
    const d = new Date(today);
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  }

  const lastWeekMatch = lowerText.match(/last\s+week/);
  if (lastWeekMatch) {
    const d = new Date(today);
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  }

  const weekdayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (let i = 0; i < weekdayNames.length; i++) {
    if (lowerText.includes(`last ${weekdayNames[i]}`)) {
      const todayDay = today.getDay();
      let diff = todayDay - i;
      if (diff <= 0) diff += 7;
      const d = new Date(today);
      d.setDate(d.getDate() - diff);
      return d.toISOString().split('T')[0];
    }
  }

  return today.toISOString().split('T')[0];
}

export function generateInsights(
  expenses: { amount: number; type: string; category: string; date: string; merchant: string | null; notes?: string | null }[],
  budgets: { category: string; limit_amount: number }[],
  currency = 'INR'
): { type: 'alert' | 'prediction' | 'suggestion' | 'positive'; message: string; icon: string }[] {
  const insights: { type: 'alert' | 'prediction' | 'suggestion' | 'positive'; message: string; icon: string }[] = [];
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const currentMonthExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear && e.type === 'expense';
  });

  const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBudget = budgets.reduce((sum, b) => sum + b.limit_amount, 0);

  if (totalBudget > 0) {
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const expectedSpendByNow = (totalBudget / daysInMonth) * dayOfMonth;
    const projectedSpend = (totalSpent / dayOfMonth) * daysInMonth;

    if (projectedSpend > totalBudget * 1.1) {
      const overshoot = Math.round(projectedSpend - totalBudget);
      insights.push({
        type: 'alert',
        message: `At your current pace, you'll overshoot your total budget by ${formatInsightCurrency(overshoot, currency)} this month. Consider slowing down on discretionary spending.`,
        icon: 'trending-up',
      });
    } else if (projectedSpend < totalBudget * 0.85 && dayOfMonth > 10) {
      const savings = Math.round(totalBudget - projectedSpend);
      insights.push({
        type: 'positive',
        message: `Great job! You're on track to save ${formatInsightCurrency(savings, currency)} this month. Keep it up!`,
        icon: 'trending-down',
      });
    }

    if (totalSpent > expectedSpendByNow * 1.2 && dayOfMonth > 5) {
      insights.push({
        type: 'prediction',
        message: `You've spent ${Math.round((totalSpent / expectedSpendByNow - 1) * 100)}% more than the proportional budget for this point in the month.`,
        icon: 'zap',
      });
    }
  }

  const categoryTotals: Record<string, number> = {};
  currentMonthExpenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  for (const budget of budgets) {
    if (budget.limit_amount <= 0) continue;
    const spent = categoryTotals[budget.category] || 0;
    const pct = (spent / budget.limit_amount) * 100;

    if (pct > 100) {
      insights.push({
        type: 'alert',
        message: `You've exceeded your ${budget.category} budget by ${formatInsightCurrency(spent - budget.limit_amount, currency)}.`,
        icon: 'alert-circle',
      });
    } else if (pct > 80) {
      insights.push({
        type: 'prediction',
        message: `You've used ${Math.round(pct)}% of your ${budget.category} budget. Only ${formatInsightCurrency(budget.limit_amount - spent, currency)} left for the rest of the month.`,
        icon: 'clock',
      });
    }
  }

  const merchantTotals: Record<string, number> = {};
  currentMonthExpenses.forEach(e => {
    if (e.merchant) {
      merchantTotals[e.merchant] = (merchantTotals[e.merchant] || 0) + e.amount;
    }
  });

  const topMerchant = Object.entries(merchantTotals).sort((a, b) => b[1] - a[1])[0];
  if (topMerchant && topMerchant[1] > totalSpent * 0.2 && topMerchant[1] > 1000) {
    insights.push({
      type: 'suggestion',
      message: `You've spent ${formatInsightCurrency(topMerchant[1], currency)} at ${topMerchant[0]} this month — that's ${Math.round((topMerchant[1] / totalSpent) * 100)}% of your total spending. Consider reducing frequency to save.`,
      icon: 'lightbulb',
    });
  }

  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  const lastMonthExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() + 1 === lastMonth && d.getFullYear() === lastMonthYear && e.type === 'expense';
  });

  if (lastMonthExpenses.length > 0 && currentMonthExpenses.length > 5) {
    const lastMonthTotal = lastMonthExpenses.reduce((s, e) => s + e.amount, 0);
    const lastMonthCategoryTotals: Record<string, number> = {};
    lastMonthExpenses.forEach(e => {
      lastMonthCategoryTotals[e.category] = (lastMonthCategoryTotals[e.category] || 0) + e.amount;
    });

    for (const [cat, currentAmt] of Object.entries(categoryTotals)) {
      const lastAmt = lastMonthCategoryTotals[cat] || 0;
      if (lastAmt > 500 && currentAmt > lastAmt * 1.3) {
        const pctIncrease = Math.round((currentAmt / lastAmt - 1) * 100);
        insights.push({
          type: 'prediction',
          message: `You've spent ${pctIncrease}% more on ${cat} compared to last month (${formatInsightCurrency(currentAmt, currency)} vs ${formatInsightCurrency(lastAmt, currency)}).`,
          icon: 'bar-chart-3',
        });
        break;
      }
    }
  }

  const subscriptionKeywords = ['netflix', 'spotify', 'prime', 'hotstar', 'disney', 'gym'];
  const subscriptions = currentMonthExpenses.filter(e =>
    subscriptionKeywords.some(kw => e.merchant?.toLowerCase().includes(kw) || e.notes?.toLowerCase().includes(kw))
  );
  if (subscriptions.length >= 2) {
    const total = subscriptions.reduce((s, e) => s + e.amount, 0);
    insights.push({
      type: 'suggestion',
      message: `You have ${subscriptions.length} subscription payments totaling ${formatInsightCurrency(total, currency)} this month. Review if you actively use all of them — cancelling one could save ${formatInsightCurrency(Math.round(total / subscriptions.length), currency)}/month.`,
      icon: 'scissors',
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: 'positive',
      message: `You've spent ${formatInsightCurrency(totalSpent, currency)} this month. Add budgets to get personalized insights and spending alerts.`,
      icon: 'sparkles',
    });
  }

  return insights;
}

function formatInsightCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€' };
  const symbol = symbols[currency] || '₹';
  return `${symbol}${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount)}`;
}
