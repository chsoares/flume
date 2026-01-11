// components/trips/TripDashboard.tsx

import { useFinancialStore } from '../../store/financialStore';
import { formatCurrency } from '../../utils/formatters';
import { Calendar } from 'lucide-react';
import { differenceInDays, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function TripDashboard() {
  const { config } = useFinancialStore();

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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-slate-800 mb-6 border-b pb-3">
        Dashboard de Viagens
      </h3>

      {config.trips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {config.trips.map((trip) => {
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
                className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h4 className="font-bold text-slate-800 mb-3">{trip.name}</h4>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                    </span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs">
                      {days} dias
                    </span>
                  </div>
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
                    <span className="font-bold text-slate-800">{formatCurrency(total)}</span>
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
