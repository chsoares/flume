// pages/IncomePage.tsx

import { SalaryConfig } from '../components/income/SalaryConfig';
import { ExtraordinaryIncomeList } from '../components/income/ExtraordinaryIncomeList';

export function IncomePage() {
  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up" style={{ animationDelay: '0s' }}>
        <SalaryConfig />
      </div>
      <div className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <ExtraordinaryIncomeList />
      </div>
    </div>
  );
}
