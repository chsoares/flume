// pages/TripsPage.tsx

import { TripDashboard } from '../components/trips/TripDashboard';
import { TripsList } from '../components/trips/TripsList';

export function TripsPage() {
  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up" style={{ animationDelay: '0s' }}>
        <TripDashboard />
      </div>
      <div className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <TripsList />
      </div>
    </div>
  );
}
