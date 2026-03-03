// pages/ExpensesPage.tsx

import { FixedExpensesList } from '../components/expenses/FixedExpensesList';
import { DailyExpensesCalculator } from '../components/expenses/DailyExpensesCalculator';
import { ExtraordinaryExpensesList } from '../components/expenses/ExtraordinaryExpensesList';

export function ExpensesPage() {
  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up" style={{ animationDelay: '0s' }}>
        <DailyExpensesCalculator />
      </div>
      <div className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <FixedExpensesList />
      </div>
      <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <ExtraordinaryExpensesList />
      </div>
    </div>
  );
}
