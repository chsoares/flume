// pages/TripsPage.tsx

import { TripDashboard } from '../components/trips/TripDashboard';
import { TripsList } from '../components/trips/TripsList';

export function TripsPage() {
  return (
    <div className="space-y-6">
      <TripDashboard />
      <TripsList />
    </div>
  );
}
