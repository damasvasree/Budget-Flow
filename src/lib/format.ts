import type { Currency } from '@/types';

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
};

export function formatCurrency(amount: number, currency: Currency = 'INR'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '₹';
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
  return `${symbol}${formatted}`;
}

export function formatCurrencyWithSign(amount: number, currency: Currency = 'INR'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '₹';
  const sign = amount < 0 ? '-' : '';
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
  return `${sign}${symbol}${formatted}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatShortDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

export function getMonthName(month: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[month - 1] || '';
}

export function getMonthYearKey(month: number, year: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function getCurrentMonth(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

export function getDayOfMonth(): number {
  return new Date().getDate();
}

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}
