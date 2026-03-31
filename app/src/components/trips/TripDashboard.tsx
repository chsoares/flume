// components/trips/TripDashboard.tsx

import { useFinancialStore } from '../../store/financialStore';
import { formatCurrency } from '../../utils/formatters';
import { Calendar, Plane, CheckCircle2, Clock } from 'lucide-react';
import { differenceInDays, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Trip, MonthData } from '../../types';

interface TripRealData {
  dailyTotal: number;
  dailyPerDay: number;
}

/**
 * Determina os meses que a viagem abrange (onde há gastos diários).
 */
function getTripMonths(trip: Trip): string[] {
  const months: string[] = [];
  const tripStart = parseISO(trip.startDate);
  const tripEnd = parseISO(trip.endDate);

  let current = new Date(tripStart.getFullYear(), tripStart.getMonth(), 1);
  const endMonth = new Date(tripEnd.getFullYear(), tripEnd.getMonth(), 1);

  while (current <= endMonth) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    months.push(`${y}-${m}`);
    current.setMonth(current.getMonth() + 1);
  }

  return months;
}

/**
 * Verifica se todos os meses da viagem estão finalizados e extrai os valores reais.
 */
function getTripRealData(
  trip: Trip,
  months: MonthData[]
): TripRealData | null {
  const tripMonths = getTripMonths(trip);
  const days = differenceInDays(parseISO(trip.endDate), parseISO(trip.startDate)) + 1;

  let totalDailyReal = 0;
  let allFinalized = true;

  for (const monthStr of tripMonths) {
    const monthData = months.find((m) => m.month === monthStr);
    if (!monthData || monthData.status !== 'finalized' || !monthData.realData) {
      allFinalized = false;
      break;
    }

    const tripReal = monthData.realData.expenses.trips.find((t) => t.id === trip.id);
    if (!tripReal) continue;

    // Somar apenas itens de orçamento diário (não "Gastos" que são preExpenses)
    for (const item of tripReal.items) {
      if (item.description !== 'Gastos') {
        totalDailyReal += item.value;
      }
    }
  }

  if (!allFinalized) return null;

  return {
    dailyTotal: totalDailyReal,
    dailyPerDay: days > 0 ? totalDailyReal / days : 0,
  };
}

export function TripDashboard() {
  const { config, year, months } = useFinancialStore();

  // Filtrar apenas viagens do ano corrente
  const currentYearTrips = config.trips.filter((trip) => {
    const tripStartYear = parseISO(trip.startDate).getFullYear();
    const tripEndYear = parseISO(trip.endDate).getFullYear();
    return tripStartYear === year || tripEndYear === year;
  });

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
            const preExpensesTotal = trip.preExpenses.reduce(
              (sum: number, exp) => sum + exp.installments * exp.installmentValue,
              0
            );

            // Valores planejados
            const plannedDailyTotal = days * trip.dailyBudget;
            const plannedTotal = plannedDailyTotal + preExpensesTotal;

            // Valores reais (null se viagem ainda não concluída)
            const realData = getTripRealData(trip, months);
            const isFinalized = realData !== null;

            // Valores a exibir
            const displayDailyPerDay = isFinalized ? realData.dailyPerDay : trip.dailyBudget;
            const displayDailyTotal = isFinalized ? realData.dailyTotal : plannedDailyTotal;
            const displayTotal = isFinalized
              ? preExpensesTotal + realData.dailyTotal
              : plannedTotal;

            // Deltas
            const dailyDelta = isFinalized ? realData.dailyTotal - plannedDailyTotal : 0;
            const totalDelta = isFinalized ? displayTotal - plannedTotal : 0;

            return (
              <div
                key={trip.id}
                className="card-subtle p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-700">{trip.name}</h4>
                  {isFinalized ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-lg text-xs font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      Realizado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-lg text-xs font-medium">
                      <Clock className="w-3 h-3" />
                      Planejado
                    </span>
                  )}
                </div>

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
                    <span className="text-slate-500">
                      {isFinalized ? 'Média diária:' : 'Orçamento diário:'}
                    </span>
                    <span className="font-medium text-slate-700 tabular-nums">
                      {formatCurrency(displayDailyPerDay)}/dia
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-500">
                      {isFinalized ? 'Gastos diários:' : 'Diária total:'}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-slate-700 tabular-nums">
                        {formatCurrency(displayDailyTotal)}
                      </span>
                      {isFinalized && dailyDelta !== 0 && (
                        <span
                          className={`text-xs tabular-nums ${
                            dailyDelta > 0 ? 'text-rose-500' : 'text-emerald-500'
                          }`}
                        >
                          {dailyDelta > 0 ? '+' : ''}
                          {formatCurrency(dailyDelta)}
                        </span>
                      )}
                    </div>
                  </div>
                  {preExpensesTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Gastos:</span>
                      <span className="font-medium text-slate-700 tabular-nums">{formatCurrency(preExpensesTotal)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="text-slate-600 font-medium">Total:</span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-blue-500 tabular-nums">
                        {formatCurrency(displayTotal)}
                      </span>
                      {isFinalized && totalDelta !== 0 && (
                        <span
                          className={`text-xs tabular-nums ${
                            totalDelta > 0 ? 'text-rose-500' : 'text-emerald-500'
                          }`}
                        >
                          {totalDelta > 0 ? '+' : ''}
                          {formatCurrency(totalDelta)}
                        </span>
                      )}
                    </div>
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
