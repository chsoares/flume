// pages/InvestmentsPage.tsx

import { InvestmentDashboard } from '../components/investments/InvestmentDashboard';
import { InvestmentsList } from '../components/investments/InvestmentsList';

export function InvestmentsPage() {
  return (
    <div className="space-y-6">
      <InvestmentDashboard />
      <InvestmentsList />
    </div>
  );
}
