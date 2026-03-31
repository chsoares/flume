// components/trips/TripDashboard.tsx

import { useFinancialStore } from '../../store/financialStore';
import { formatCurrency } from '../../utils/formatters';
import { Calendar, Plane, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { differenceInDays, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Trip, MonthData } from '../../types';

type TripStatus = 'planned' | 'partial' | 'finalized';

interface TripComputedData {
  status: TripStatus;
  dailyTotal: number;
  dailyPerDay: number;
  /** Valor planejado dos meses já finalizados (para calcular delta parcial) */
  plannedPortionOfFinalized: number;
  /** Valor real dos meses finalizados */
  realPortionOfFinalized: number;
}

/**
 * Calcula dias da viagem dentro de um mês específico.
 */
function getTripDaysInMonth(trip: Trip, monthStr: string): number {
  const [year, month] = monthStr.split('-').map(Number);
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);
  const tripStart = parseISO(trip.startDate);
  const tripEnd = parseISO(trip.endDate);

  if (tripStart > monthEnd || tripEnd < monthStart) return 0;

  const effectiveStart = tripStart > monthStart ? tripStart : monthStart;
  const effectiveEnd = tripEnd < monthEnd ? tripEnd : monthEnd;
  return differenceInDays(effectiveEnd, effectiveStart) + 1;
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
 * Calcula valores da viagem progressivamente:
 * - Meses finalizados usam valores reais
 * - Meses não finalizados usam estimativa (dailyBudget × dias)
 */
function getTripComputedData(
  trip: Trip,
  allMonths: MonthData[]
): TripComputedData {
  const tripMonths = getTripMonths(trip);
  const totalDays = differenceInDays(parseISO(trip.endDate), parseISO(trip.startDate)) + 1;

  let dailyTotal = 0;
  let plannedPortionOfFinalized = 0;
  let realPortionOfFinalized = 0;
  let finalizedCount = 0;

  for (const monthStr of tripMonths) {
    const monthData = allMonths.find((m) => m.month === monthStr);
    const daysInMonth = getTripDaysInMonth(trip, monthStr);
    const plannedForMonth = daysInMonth * trip.dailyBudget;

    if (monthData?.status === 'finalized' && monthData.realData) {
      finalizedCount++;
      plannedPortionOfFinalized += plannedForMonth;

      const tripReal = monthData.realData.expenses.trips.find((t) => t.id === trip.id);
      let realDailyForMonth = 0;
      if (tripReal) {
        for (const item of tripReal.items) {
          if (item.description !== 'Gastos') {
            realDailyForMonth += item.value;
          }
        }
      }

      realPortionOfFinalized += realDailyForMonth;
      dailyTotal += realDailyForMonth;
    } else {
      // Mês não finalizado: usar estimativa
      dailyTotal += plannedForMonth;
    }
  }

  let status: TripStatus = 'planned';
  if (finalizedCount > 0 && finalizedCount < tripMonths.length) {
    status = 'partial';
  } else if (finalizedCount === tripMonths.length) {
    status = 'finalized';
  }

  return {
    status,
    dailyTotal,
    dailyPerDay: totalDays > 0 ? dailyTotal / totalDays : 0,
    plannedPortionOfFinalized,
    realPortionOfFinalized,
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

            // Valores computados (mix de real + projetado)
            const computed = getTripComputedData(trip, months);
            const hasRealData = computed.status !== 'planned';

            // Valores a exibir
            const displayDailyPerDay = hasRealData ? computed.dailyPerDay : trip.dailyBudget;
            const displayDailyTotal = hasRealData ? computed.dailyTotal : plannedDailyTotal;
            const displayTotal = hasRealData
              ? preExpensesTotal + computed.dailyTotal
              : plannedTotal;

            // Deltas (compara apenas a porção finalizada vs seu planejado)
            const dailyDelta = hasRealData
              ? computed.realPortionOfFinalized - computed.plannedPortionOfFinalized
              : 0;
            const totalDelta = dailyDelta;

            return (
              <div
                key={trip.id}
                className="card-subtle p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-700">{trip.name}</h4>
                  {computed.status === 'finalized' ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-lg text-xs font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      Realizado
                    </span>
                  ) : computed.status === 'partial' ? (
                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg text-xs font-medium">
                      <Loader2 className="w-3 h-3" />
                      Parcial
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
                      {hasRealData ? 'Média diária:' : 'Orçamento diário:'}
                    </span>
                    <span className="font-medium text-slate-700 tabular-nums">
                      {formatCurrency(displayDailyPerDay)}/dia
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-500">
                      {hasRealData ? 'Gastos diários:' : 'Diária total:'}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-slate-700 tabular-nums">
                        {formatCurrency(displayDailyTotal)}
                      </span>
                      {hasRealData && dailyDelta !== 0 && (
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
                      {hasRealData && totalDelta !== 0 && (
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
