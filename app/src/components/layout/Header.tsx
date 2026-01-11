// components/layout/Header.tsx

import { useLocation } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useFinancialStore } from '../../store/financialStore';

const pageTitles: Record<string, string> = {
  '/': 'Fluxo de Caixa',
  '/income': 'Receitas',
  '/expenses': 'Despesas',
  '/investments': 'Investimentos',
  '/trips': 'Viagens',
};

export function Header() {
  const location = useLocation();
  const { year, setYear, recalculateAllMonths } = useFinancialStore();

  const currentYear = new Date().getFullYear();
  const startYear = Math.max(2026, currentYear - 2);
  const years = Array.from({ length: 5 }, (_, i) => startYear + i);

  const pageTitle = pageTitles[location.pathname] || 'flume';

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Breadcrumb */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{pageTitle}</h2>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Year Selector */}
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Recalculate Button */}
          <button
            onClick={recalculateAllMonths}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            title="Recalcular todos os meses"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Recalcular</span>
          </button>
        </div>
      </div>
    </header>
  );
}
