// components/trips/TripDashboard.tsx

import { useFinancialStore } from '../../store/financialStore';
import { formatCurrency } from '../../utils/formatters';
import { Calendar, Plane } from 'lucide-react';
import { differenceInDays, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function TripDashboard() {
  const { config, year } = useFinancialStore();

  // Filtrar apenas viagens do ano corrente
  const currentYearTrips = config.trips.filter((trip) => {
    const tripStartYear = parseISO(trip.startDate).getFullYear();
    const tripEndYear = parseISO(trip.endDate).getFullYear();
    return tripStartYear === year || tripEndYear === year;
  });

  function calculateTripTotal(trip: any): number {
    const days = differenceInDays(parseISO(trip.endDate), parseISO(trip.startDate)) + 1;
    const dailyExpenses = days * trip.dailyBudget;

    const preExpensesTotal = trip.preExpenses.reduce(
      (sum: number, exp: any) => sum + exp.installments * exp.installmentValue,
      0
    );

    return dailyExpenses + preExpensesTotal;
  }

  function formatDate(dateStr: string): string {
    return format(parseISO(dateStr), 'dd/MM/yyyy', { locale: ptBR });
  }

  return (
    <div className="card p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100">
        <div className="icon-badge bg-gradient-to-br from-blue-500 to-cyan-500">
          <Plane className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg md:text-xl font-bold text-slate-700">
          Dashboard de Viagens
        </h3>
      </div>

      {currentYearTrips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentYearTrips.map((trip) => {
            const days = differenceInDays(parseISO(trip.endDate), parseISO(trip.startDate)) + 1;
            const total = calculateTripTotal(trip);
            const preExpensesTotal = trip.preExpenses.reduce(
              (sum: number, exp: any) => sum + exp.installments * exp.installmentValue,
              0
            );
            const dailyTotal = days * trip.dailyBudget;

            return (
              <div
                key={trip.id}
                className="card-subtle p-4 hover:shadow-md transition-shadow"
              >
                <h4 className="font-bold text-slate-700 mb-3">{trip.name}</h4>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                    </span>
                    <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-lg text-xs font-medium">
                      {days} dias
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Orçamento diário:</span>
                    <span className="font-medium text-slate-700 tabular-nums">{formatCurrency(trip.dailyBudget)}/dia</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Diária total:</span>
                    <span className="font-medium text-slate-700 tabular-nums">{formatCurrency(dailyTotal)}</span>
                  </div>
                  {preExpensesTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Gastos:</span>
                      <span className="font-medium text-slate-700 tabular-nums">{formatCurrency(preExpensesTotal)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200 flex justify-between">
                    <span className="text-slate-600 font-medium">Total:</span>
                    <span className="font-bold text-blue-500 tabular-nums">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-slate-400 py-8 italic">
          Nenhuma viagem planejada
        </p>
      )}
    </div>
  );
}
