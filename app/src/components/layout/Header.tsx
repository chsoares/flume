// components/layout/Header.tsx

import { useLocation } from 'react-router-dom';
import { RefreshCw, Plus, Cloud, CloudOff, Loader2, CheckCircle2 } from 'lucide-react';
import { useFinancialStore } from '../../store/financialStore';
import { githubSync } from '../../services/githubSync';

const pageTitles: Record<string, string> = {
  '/': 'Fluxo de Caixa',
  '/income': 'Receitas',
  '/expenses': 'Despesas',
  '/investments': 'Investimentos',
  '/trips': 'Viagens',
};

export function Header() {
  const location = useLocation();
  const { year, setYear, recalculateAllMonths, months, availableYears, createNewYear, syncStatus, lastSyncError } = useFinancialStore();
  const isAuthenticated = githubSync.isAuthenticated();

  const pageTitle = pageTitles[location.pathname] || 'flume';

  // Verificar se todos os meses do ano atual estão concretizados
  const allMonthsFinalized = months.length === 12 && months.every((m) => m.status === 'finalized');
  const canCreateNewYear = allMonthsFinalized;

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Breadcrumb */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{pageTitle}</h2>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Year Selector */}
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="h-10 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Add Year Button */}
          <button
            onClick={() => canCreateNewYear && createNewYear()}
            disabled={!canCreateNewYear}
            className={`h-10 px-3 rounded-lg transition-colors flex items-center justify-center ${
              canCreateNewYear
                ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
                : 'bg-red-600 cursor-not-allowed opacity-75'
            }`}
            title={
              canCreateNewYear
                ? `Criar ano ${year + 1}`
                : 'Concretize todos os meses do ano corrente antes de criar um novo ano'
            }
          >
            <Plus className="w-5 h-5 text-white" />
          </button>

          {/* Sync Status Indicator */}
          {isAuthenticated && (
            <div className="h-10 flex items-center gap-2 px-3 text-sm text-slate-600">
              {syncStatus === 'saving' && (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span>Salvando...</span>
                </>
              )}
              {syncStatus === 'saved' && (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">Salvo</span>
                </>
              )}
              {syncStatus === 'error' && (
                <>
                  <CloudOff className="w-4 h-4 text-red-500" />
                  <span className="text-red-600" title={lastSyncError || 'Erro ao sincronizar'}>
                    Erro
                  </span>
                </>
              )}
              {syncStatus === 'idle' && (
                <>
                  <Cloud className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Sincronizado</span>
                </>
              )}
            </div>
          )}

          {/* Recalculate Button */}
          <button
            onClick={recalculateAllMonths}
            className="h-10 flex items-center gap-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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
