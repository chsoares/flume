// pages/InvestmentsPage.tsx

import { InvestmentDashboard } from '../components/investments/InvestmentDashboard';
import { InvestmentsList } from '../components/investments/InvestmentsList';

export function InvestmentsPage() {
  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up" style={{ animationDelay: '0s' }}>
        <InvestmentDashboard />
      </div>
      <div className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <InvestmentsList />
      </div>
    </div>
  );
}
