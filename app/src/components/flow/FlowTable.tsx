// components/flow/FlowTable.tsx

import type { MonthData } from '../../types';
import { formatCurrency, formatCurrencyCompact, formatMonth, formatMonthShort } from '../../utils/formatters';
import { Calendar, DollarSign, CreditCard, PiggyBank, Wallet } from 'lucide-react';

interface FlowTableProps {
  months: MonthData[];
  onMonthClick: (month: MonthData) => void;
}

export function FlowTable({ months, onMonthClick }: FlowTableProps) {
  const isProjected = (status: MonthData['status']) => status === 'projected';

  return (
    <div className="card-content overflow-hidden h-full flex flex-col animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <table className="w-full h-full flex flex-col">
        {/* Header */}
        <thead className="shrink-0 bg-slate-100/50 border-b border-slate-200">
          <tr className="flex w-full">
            <th className="flex-none w-12 md:w-36 px-2 md:px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="hidden md:inline">Mês</span>
              </span>
            </th>
            <th className="flex-1 px-2 md:px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span className="inline-flex items-center justify-end gap-2">
                <DollarSign className="w-4 h-4" />
                <span className="hidden md:inline">Receitas</span>
              </span>
            </th>
            <th className="flex-1 px-2 md:px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span className="inline-flex items-center justify-end gap-2">
                <CreditCard className="w-4 h-4" />
                <span className="hidden md:inline">Despesas</span>
              </span>
            </th>
            <th className="flex-1 px-2 md:px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span className="inline-flex items-center justify-end gap-2">
                <PiggyBank className="w-4 h-4" />
                <span className="hidden md:inline">Movimentações</span>
              </span>
            </th>
            <th className="flex-1 px-2 md:px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span className="inline-flex items-center justify-end gap-2">
                <Wallet className="w-4 h-4" />
                <span className="hidden md:inline">Saldo</span>
              </span>
            </th>
          </tr>
        </thead>

        {/* Rows */}
        <tbody className="flex-1 flex flex-col min-h-0">
          {months.map((month) => {
            const isFinalized = month.status === 'finalized' && month.realData;
            const isOngoing = month.status === 'ongoing';
            const projected = isProjected(month.status);

            // Receitas: usa realData se finalizado
            const totalIncome = isFinalized
              ? month.realData!.income.salary +
                month.realData!.income.extraordinary.reduce((s, e) => s + e.value, 0)
              : month.income.salary + month.income.extraordinary;

            // Despesas: usa realData se finalizado
            const totalExpenses = isFinalized
              ? month.realData!.expenses.fixed.reduce((s, e) => s + e.value, 0) +
                month.realData!.expenses.daily +
                month.realData!.expenses.extraordinary.reduce((s, e) => s + e.value, 0) +
                month.realData!.expenses.trips.reduce(
                  (s, t) => s + t.items.reduce((ts, item) => ts + item.value, 0),
                  0
                )
              : month.expenses.fixed +
                month.expenses.daily +
                month.expenses.extraordinary +
                month.expenses.trips;

            // Movimentações: usa realData se finalizado
            const totalDeposits = isFinalized
              ? Object.values(month.realData!.investments).reduce(
                  (sum, inv) => sum + inv.deposit,
                  0
                )
              : Object.values(month.investments).reduce(
                  (sum, inv) => sum + inv.deposit,
                  0
                );

            // Saldo final: usa realData se finalizado (considera rendimentos)
            const finalBalance = isFinalized
              ? Object.values(month.realData!.investments).reduce(
                  (sum, inv) => sum + inv.finalBalance,
                  0
                )
              : Object.values(month.investments).reduce(
                  (sum, inv) => sum + inv.finalBalance,
                  0
                );

            // Classes base para a linha
            const rowBase = 'cursor-pointer transition-colors duration-150 ease-out';
            const rowClass = isOngoing
              ? `${rowBase} hover:bg-amber-50 bg-amber-50/50`
              : `${rowBase} hover:bg-slate-50`;

            // Opacidade para valores previstos
            const valueOpacity = projected ? 'opacity-60' : '';

            // Cor das movimentações baseada no valor
            const depositsColor = totalDeposits >= 0 ? 'text-emerald-500' : 'text-rose-500';

            return (
              <tr
                key={month.month}
                onClick={() => onMonthClick(month)}
                className={`flex w-full items-center flex-1 border-b border-slate-100 last:border-b-0 ${rowClass}`}
              >
                <td className="flex-none w-12 md:w-36 px-2 md:px-6 whitespace-nowrap text-left">
                  <div className="flex items-center gap-1 md:gap-2">
                    {isOngoing && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                    <span className={`font-semibold text-sm md:text-base ${projected ? 'text-slate-400 italic' : 'text-slate-700'}`}>
                      <span className="md:hidden">{formatMonthShort(month.month)}</span>
                      <span className="hidden md:inline">{formatMonth(month.month)}</span>
                    </span>
                    {isOngoing && (
                      <span className="hidden md:inline-flex px-2 py-0.5 text-xs bg-amber-100 text-amber-600 rounded-full font-semibold">
                        Atual
                      </span>
                    )}
                  </div>
                </td>
                <td className={`flex-1 px-2 md:px-6 whitespace-nowrap tabular-nums text-sm md:text-base font-semibold text-emerald-500 text-right ${valueOpacity}`}>
                  <span className="md:hidden">{formatCurrencyCompact(totalIncome)}</span>
                  <span className="hidden md:inline">{formatCurrency(totalIncome)}</span>
                </td>
                <td className={`flex-1 px-2 md:px-6 whitespace-nowrap tabular-nums text-sm md:text-base font-semibold text-rose-500 text-right ${valueOpacity}`}>
                  <span className="md:hidden">{formatCurrencyCompact(totalExpenses)}</span>
                  <span className="hidden md:inline">{formatCurrency(totalExpenses)}</span>
                </td>
                <td className={`flex-1 px-2 md:px-6 whitespace-nowrap tabular-nums text-sm md:text-base font-semibold ${depositsColor} text-right ${valueOpacity}`}>
                  <span className="md:hidden">{formatCurrencyCompact(totalDeposits)}</span>
                  <span className="hidden md:inline">{formatCurrency(totalDeposits)}</span>
                </td>
                <td className={`flex-1 px-2 md:px-6 whitespace-nowrap tabular-nums text-sm md:text-base font-bold text-slate-700 text-right ${valueOpacity}`}>
                  <span className="md:hidden">{formatCurrencyCompact(finalBalance)}</span>
                  <span className="hidden md:inline">{formatCurrency(finalBalance)}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
