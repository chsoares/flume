// components/flow/FlowTable.tsx

import type { MonthData } from '../../types';
import { formatCurrency, formatCurrencyCompact, formatMonth, formatMonthShort } from '../../utils/formatters';
import { Calendar, DollarSign, CreditCard, PiggyBank, Wallet } from 'lucide-react';

interface FlowTableProps {
  months: MonthData[];
  onMonthClick: (month: MonthData) => void;
}

export function FlowTable({ months, onMonthClick }: FlowTableProps) {
  function getRowClassName(status: MonthData['status']): string {
    const base = 'cursor-pointer hover:bg-slate-100 transition-colors';

    switch (status) {
      case 'projected':
        return `${base} text-gray-400 italic`;
      case 'ongoing':
        return `${base} text-blue-600 font-medium border-l-4 border-blue-500`;
      case 'finalized':
        return `${base} text-slate-900 font-semibold`;
      default:
        return base;
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-2 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <span className="md:hidden flex items-center justify-start" title="Mês">
                  <Calendar className="w-4 h-4" />
                </span>
                <span className="hidden md:inline">Mês</span>
              </th>
              <th className="px-2 md:px-6 py-3 md:py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <span className="md:hidden flex items-center justify-end" title="Receitas">
                  <DollarSign className="w-4 h-4" />
                </span>
                <span className="hidden md:inline">Receitas</span>
              </th>
              <th className="px-2 md:px-6 py-3 md:py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <span className="md:hidden flex items-center justify-end" title="Despesas">
                  <CreditCard className="w-4 h-4" />
                </span>
                <span className="hidden md:inline">Despesas</span>
              </th>
              <th className="px-2 md:px-6 py-3 md:py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <span className="md:hidden flex items-center justify-end" title="Movimentações">
                  <PiggyBank className="w-4 h-4" />
                </span>
                <span className="hidden md:inline">Movimentações</span>
              </th>
              <th className="px-2 md:px-6 py-3 md:py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <span className="md:hidden flex items-center justify-end" title="Saldo Final">
                  <Wallet className="w-4 h-4" />
                </span>
                <span className="hidden md:inline">Saldo Final</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {months.map((month) => {
              const isFinalized = month.status === 'finalized' && month.realData;

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

              return (
                <tr
                  key={month.month}
                  onClick={() => onMonthClick(month)}
                  className={getRowClassName(month.status)}
                >
                  <td className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap">
                    <span className="font-medium text-sm md:text-base">
                      <span className="md:hidden">{formatMonthShort(month.month)}</span>
                      <span className="hidden md:inline">{formatMonth(month.month)}</span>
                    </span>
                    {month.status === 'ongoing' && (
                      <span className="ml-1 md:ml-2 px-1.5 md:px-2 py-0.5 md:py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        <span className="md:hidden">●</span>
                        <span className="hidden md:inline">Atual</span>
                      </span>
                    )}
                  </td>
                  <td className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap text-right text-green-600 font-medium text-sm md:text-base">
                    <span className="md:hidden">{formatCurrencyCompact(totalIncome)}</span>
                    <span className="hidden md:inline">{formatCurrency(totalIncome)}</span>
                  </td>
                  <td className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap text-right text-red-600 font-medium text-sm md:text-base">
                    <span className="md:hidden">{formatCurrencyCompact(totalExpenses)}</span>
                    <span className="hidden md:inline">{formatCurrency(totalExpenses)}</span>
                  </td>
                  <td className={`px-2 md:px-6 py-2 md:py-4 whitespace-nowrap text-right font-medium text-sm md:text-base ${
                    totalDeposits >= 0 ? 'text-purple-600' : 'text-purple-400'
                  }`}>
                    <span className="md:hidden">{formatCurrencyCompact(totalDeposits)}</span>
                    <span className="hidden md:inline">{formatCurrency(totalDeposits)}</span>
                  </td>
                  <td className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap text-right font-bold text-sm md:text-base">
                    <span className="md:hidden">{formatCurrencyCompact(finalBalance)}</span>
                    <span className="hidden md:inline">{formatCurrency(finalBalance)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
