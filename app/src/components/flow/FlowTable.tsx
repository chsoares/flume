// components/flow/FlowTable.tsx

import type { MonthData } from '../../types';
import { formatCurrency, formatMonth } from '../../utils/formatters';

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
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Mês
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Receitas
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Despesas
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Movimentações
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Saldo Final
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {months.map((month) => {
              const totalIncome = month.income.salary + month.income.extraordinary;
              const totalExpenses =
                month.expenses.fixed +
                month.expenses.daily +
                month.expenses.extraordinary +
                month.expenses.trips;
              const totalDeposits = Object.values(month.investments).reduce(
                (sum, inv) => sum + inv.deposit,
                0
              );
              const finalBalance = Object.values(month.investments).reduce(
                (sum, inv) => sum + inv.finalBalance,
                0
              );

              return (
                <tr
                  key={month.month}
                  onClick={() => onMonthClick(month)}
                  className={getRowClassName(month.status)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium">{formatMonth(month.month)}</span>
                    {month.status === 'ongoing' && (
                      <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Atual
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-green-600 font-medium">
                    {formatCurrency(totalIncome)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-red-600 font-medium">
                    {formatCurrency(totalExpenses)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right font-medium ${
                    totalDeposits >= 0 ? 'text-purple-600' : 'text-purple-400'
                  }`}>
                    {formatCurrency(totalDeposits)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-bold">
                    {formatCurrency(finalBalance)}
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
