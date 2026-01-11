// pages/IncomePage.tsx

import { SalaryConfig } from '../components/income/SalaryConfig';
import { ExtraordinaryIncomeList } from '../components/income/ExtraordinaryIncomeList';

export function IncomePage() {
  return (
    <div className="space-y-6">
      <SalaryConfig />
      <ExtraordinaryIncomeList />
    </div>
  );
}
