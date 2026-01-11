// components/trips/TripDashboard.tsx

import { useFinancialStore } from '../../store/financialStore';
import { formatCurrency } from '../../utils/formatters';
import { Calendar, MapPin } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function TripDashboard() {
  const { config } = useFinancialStore();

  function calculateTripTotal(trip: any): number {
    const days = differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1;
    const dailyExpenses = days * trip.dailyBudget;

    const preExpensesTotal = trip.preExpenses.reduce(
      (sum: number, exp: any) => sum + exp.installments * exp.installmentValue,
      0
    );

    return dailyExpenses + preExpensesTotal;
  }

  function formatDate(dateStr: string): string {
    return format(new Date(dateStr), 'dd/MM/yyyy', { locale: ptBR });
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-slate-800 mb-6 border-b pb-3">
        Dashboard de Viagens
      </h3>

      {config.trips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {config.trips.map((trip) => {
            const days = differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1;
            const total = calculateTripTotal(trip);
            const preExpensesTotal = trip.preExpenses.reduce(
              (sum: number, exp: any) => sum + exp.installments * exp.installmentValue,
              0
            );
            const dailyTotal = days * trip.dailyBudget;

            return (
              <div
                key={trip.id}
                className="border border-blue-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-blue-800 text-lg mb-1">{trip.name}</h4>
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-slate-600 mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>{days} dias</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Orçamento diário:</span>
                    <span className="font-medium text-slate-700">{formatCurrency(trip.dailyBudget)}/dia</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Diária total:</span>
                    <span className="font-medium text-slate-700">{formatCurrency(dailyTotal)}</span>
                  </div>
                  {preExpensesTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Gastos:</span>
                      <span className="font-medium text-slate-700">{formatCurrency(preExpensesTotal)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t flex justify-between">
                    <span className="text-slate-700">Total:</span>
                    <span className="font-bold text-blue-600">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-slate-500 py-8 italic">
          Nenhuma viagem planejada
        </p>
      )}
    </div>
  );
}
