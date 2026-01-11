// pages/ExpensesPage.tsx

import { FixedExpensesList } from '../components/expenses/FixedExpensesList';
import { DailyExpensesCalculator } from '../components/expenses/DailyExpensesCalculator';
import { ExtraordinaryExpensesList } from '../components/expenses/ExtraordinaryExpensesList';

export function ExpensesPage() {
  return (
    <div className="space-y-6">
      <DailyExpensesCalculator />
      <FixedExpensesList />
      <ExtraordinaryExpensesList />
    </div>
  );
}
