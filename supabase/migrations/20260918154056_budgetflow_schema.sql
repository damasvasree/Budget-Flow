/*
# BudgetFlow - Core Database Schema

1. New Tables
- `categories`: Predefined and custom spending categories (Food, Transport, Education, etc.)
  - id (uuid PK), name, icon (emoji), color (hex), budget_limit (numeric), is_default (bool), sort_order (int)
- `expenses`: Individual income/expense transactions
  - id (uuid PK), amount (numeric), type (text: 'income'|'expense'), category (text), merchant (text), date (date), notes (text), payment_method (text), source (text: 'manual'|'voice'), created_at
- `budgets`: Monthly budget limits per category
  - id (uuid PK), category (text), month (int), year (int), limit_amount (numeric)
- `achievements`: Unlocked badges for gamification
  - id (uuid PK), badge_name (text), description (text), unlocked_at (timestamp)
- `settings`: App-wide key-value settings (currency, streak, last_log_date, etc.)
  - id (uuid PK), key (text unique), value (text)

2. Seed Data
- 12 India-specific default categories with icons, colors, and suggested budget limits
- Default settings: currency=INR, streak=0

3. Security
- RLS enabled on all tables
- anon + authenticated CRUD (single-tenant, no-auth app — data is intentionally shared)
*/

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text NOT NULL DEFAULT '📝',
  color text NOT NULL DEFAULT '#64748b',
  budget_limit numeric NOT NULL DEFAULT 0,
  is_default boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount numeric NOT NULL,
  type text NOT NULL DEFAULT 'expense' CHECK (type IN ('income', 'expense')),
  category text NOT NULL,
  merchant text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  payment_method text NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'upi', 'card', 'other')),
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'voice')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  month int NOT NULL CHECK (month >= 1 AND month <= 12),
  year int NOT NULL,
  limit_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE (category, month, year)
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_name text NOT NULL UNIQUE,
  description text NOT NULL,
  unlocked_at timestamptz DEFAULT now()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Categories policies (anon + authenticated, single-tenant)
DROP POLICY IF EXISTS "anon_select_categories" ON categories;
CREATE POLICY "anon_select_categories" ON categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_categories" ON categories;
CREATE POLICY "anon_insert_categories" ON categories FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_categories" ON categories;
CREATE POLICY "anon_update_categories" ON categories FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_categories" ON categories;
CREATE POLICY "anon_delete_categories" ON categories FOR DELETE TO anon, authenticated USING (true);

-- Expenses policies
DROP POLICY IF EXISTS "anon_select_expenses" ON expenses;
CREATE POLICY "anon_select_expenses" ON expenses FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_expenses" ON expenses;
CREATE POLICY "anon_insert_expenses" ON expenses FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_expenses" ON expenses;
CREATE POLICY "anon_update_expenses" ON expenses FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_expenses" ON expenses;
CREATE POLICY "anon_delete_expenses" ON expenses FOR DELETE TO anon, authenticated USING (true);

-- Budgets policies
DROP POLICY IF EXISTS "anon_select_budgets" ON budgets;
CREATE POLICY "anon_select_budgets" ON budgets FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_budgets" ON budgets;
CREATE POLICY "anon_insert_budgets" ON budgets FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_budgets" ON budgets;
CREATE POLICY "anon_update_budgets" ON budgets FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_budgets" ON budgets;
CREATE POLICY "anon_delete_budgets" ON budgets FOR DELETE TO anon, authenticated USING (true);

-- Achievements policies
DROP POLICY IF EXISTS "anon_select_achievements" ON achievements;
CREATE POLICY "anon_select_achievements" ON achievements FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_achievements" ON achievements;
CREATE POLICY "anon_insert_achievements" ON achievements FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_achievements" ON achievements;
CREATE POLICY "anon_delete_achievements" ON achievements FOR DELETE TO anon, authenticated USING (true);

-- Settings policies
DROP POLICY IF EXISTS "anon_select_settings" ON settings;
CREATE POLICY "anon_select_settings" ON settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_settings" ON settings;
CREATE POLICY "anon_insert_settings" ON settings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_settings" ON settings;
CREATE POLICY "anon_update_settings" ON settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_settings" ON settings;
CREATE POLICY "anon_delete_settings" ON settings FOR DELETE TO anon, authenticated USING (true);

-- Seed default categories (India-specific)
INSERT INTO categories (name, icon, color, budget_limit, is_default, sort_order) VALUES
('Food & Dining', '🍽️', '#ef4444', 8000, true, 1),
('Transport', '🚗', '#3b82f6', 3000, true, 2),
('Shopping', '🛍️', '#ec4899', 5000, true, 3),
('Education', '📚', '#8b5cf6', 4000, true, 4),
('Entertainment', '🎬', '#f59e0b', 2000, true, 5),
('Medical', '⚕️', '#10b981', 2000, true, 6),
('Festivals & Gifting', '🎁', '#f97316', 2000, true, 7),
('House Help', '🧹', '#06b6d4', 3000, true, 8),
('Personal Care', '✨', '#a855f7', 1500, true, 9),
('Bills & Utilities', '💡', '#64748b', 5000, true, 10),
('Groceries', '🛒', '#22c55e', 6000, true, 11),
('Other', '📝', '#78716c', 2000, true, 12)
ON CONFLICT DO NOTHING;

-- Seed default settings
INSERT INTO settings (key, value) VALUES
('currency', 'INR'),
('streak', '0'),
('last_log_date', ''),
('onboarding_complete', 'false'),
('dark_mode', 'system')
ON CONFLICT DO NOTHING;
