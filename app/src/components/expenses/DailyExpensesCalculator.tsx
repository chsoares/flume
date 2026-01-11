// components/expenses/DailyExpensesCalculator.tsx

import { useState } from 'react';
import { useFinancialStore } from '../../store/financialStore';
import { CurrencyInput } from '../shared/CurrencyInput';
import { formatCurrency } from '../../utils/formatters';
import { recalculateDailyExpenses } from '../../utils/calculations';
import { Calculator } from 'lucide-react';

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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-slate-800 mb-6 border-b pb-3">
        Despesas Cotidianas
      </h3>

      <div className="mb-6 flex gap-3 items-end">
        <CurrencyInput
          label="Valor Estimado Mensal"
          value={estimate}
          onChange={setEstimate}
          className="flex-1"
        />
        <button
          onClick={handleUpdate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
        >
          Atualizar
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-slate-700 font-medium mb-3">
          Recalcular baseado no histórico real:
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => handleRecalculate(3)}
            className="px-3 py-2 bg-white hover:bg-blue-100 border border-blue-300 rounded-lg text-sm transition-colors"
          >
            Últimos 3 meses
          </button>
          <button
            onClick={() => handleRecalculate(6)}
            className="px-3 py-2 bg-white hover:bg-blue-100 border border-blue-300 rounded-lg text-sm transition-colors"
          >
            6 meses
          </button>
          <button
            onClick={() => handleRecalculate(12)}
            className="px-3 py-2 bg-white hover:bg-blue-100 border border-blue-300 rounded-lg text-sm transition-colors"
          >
            12 meses
          </button>
          <button
            onClick={() => handleRecalculate('all')}
            className="px-3 py-2 bg-white hover:bg-blue-100 border border-blue-300 rounded-lg text-sm transition-colors"
          >
            Todo o histórico
          </button>
        </div>

        {calculatedAverage !== null && (
          <div className="bg-white rounded-lg p-3 border border-blue-300">
            <p className="text-sm text-green-700 font-medium">
              Média calculada: <span className="text-lg">{formatCurrency(calculatedAverage)}</span>
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
