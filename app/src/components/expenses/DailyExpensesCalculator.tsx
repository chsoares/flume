// components/expenses/DailyExpensesCalculator.tsx

import { useState } from 'react';
import { useFinancialStore } from '../../store/financialStore';
import { CurrencyInput } from '../shared/CurrencyInput';
import { formatCurrency } from '../../utils/formatters';
import { recalculateDailyExpenses } from '../../utils/calculations';
import { ShoppingCart, RefreshCw } from 'lucide-react';

export function DailyExpensesCalculator() {
  const { config, months, updateDailyExpensesEstimate } = useFinancialStore();
  const [estimate, setEstimate] = useState(config.dailyExpensesEstimate);
  const [calculatedAverage, setCalculatedAverage] = useState<number | null>(null);
  const [monthsCount, setMonthsCount] = useState(0);

  function handleUpdate() {
    updateDailyExpensesEstimate(estimate);
  }

  function handleRecalculate(period: 'all' | 3 | 6 | 12) {
    const average = recalculateDailyExpenses(months, period);
    const finalizedMonths = months.filter((m) => m.status === 'finalized');

    let count = finalizedMonths.length;
    if (period !== 'all' && finalizedMonths.length > period) {
      count = period;
    }

    setCalculatedAverage(average);
    setMonthsCount(count);
    setEstimate(average);
  }

  return (
    <div className="card p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100">
        <div className="icon-badge bg-gradient-to-br from-pink-500 to-rose-500">
          <ShoppingCart className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg md:text-xl font-bold text-slate-700">
          Despesas Cotidianas
        </h3>
      </div>

      <div className="mb-6 flex gap-3 items-end">
        <CurrencyInput
          label="Valor Estimado Mensal"
          value={estimate}
          onChange={setEstimate}
          className="flex-1"
        />
        <button
          onClick={handleUpdate}
          className="btn-danger w-10 h-10 shrink-0"
          title="Atualizar"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="card-subtle p-4">
        <p className="text-sm text-slate-600 font-medium mb-3">
          Recalcular baseado no histórico real:
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => handleRecalculate(3)}
            className="btn-secondary px-3 py-2 text-sm"
          >
            Últimos 3 meses
          </button>
          <button
            onClick={() => handleRecalculate(6)}
            className="btn-secondary px-3 py-2 text-sm"
          >
            6 meses
          </button>
          <button
            onClick={() => handleRecalculate(12)}
            className="btn-secondary px-3 py-2 text-sm"
          >
            12 meses
          </button>
          <button
            onClick={() => handleRecalculate('all')}
            className="btn-secondary px-3 py-2 text-sm"
          >
            Todo o histórico
          </button>
        </div>

        {calculatedAverage !== null && (
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <p className="text-sm text-emerald-600 font-medium">
              Média calculada: <span className="text-lg font-bold tabular-nums">{formatCurrency(calculatedAverage)}</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Baseado em {monthsCount} mês(es) finalizados
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
