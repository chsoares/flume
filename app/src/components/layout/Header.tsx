// components/layout/Header.tsx

import { useLocation } from 'react-router-dom';
import { RefreshCw, Plus, Cloud, CloudOff, Loader2, CheckCircle2, Menu, ChevronDown } from 'lucide-react';
import { useFinancialStore } from '../../store/financialStore';
import { githubSync } from '../../services/githubSync';

const pageTitles: Record<string, string> = {
  '/': 'Fluxo de Caixa',
  '/income': 'Receitas',
  '/expenses': 'Despesas',
  '/investments': 'Investimentos',
  '/trips': 'Viagens',
  '/settings': 'Configurações',
};

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation();
  const { year, setYear, recalculateAllMonths, months, availableYears, createNewYear, syncStatus, lastSyncError } = useFinancialStore();
  const isAuthenticated = githubSync.isAuthenticated();

  const pageTitle = pageTitles[location.pathname] || 'flume';
  const isSettingsPage = location.pathname === '/settings';

  // Verificar se todos os meses do ano atual estão concretizados
  const allMonthsFinalized = months.length === 12 && months.every((m) => m.status === 'finalized');
  const canCreateNewYear = allMonthsFinalized;

  return (
    <header className="fixed top-4 right-4 left-4 md:left-[calc(18rem+3rem)] md:right-6 md:top-6 glass z-30 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile Menu Button + Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2.5 btn-glass rounded-xl"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {pageTitle}
            </h2>
          </div>
        </div>

        {/* Controls */}
        {!isSettingsPage && (
          <div className="flex items-center gap-2 md:gap-3">
            {/* Sync Status Indicator */}
            {isAuthenticated && (
              <div className="h-10 flex items-center gap-2 px-3 text-sm">
                {syncStatus === 'saving' && (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
                    <span className="hidden md:inline text-white/60">Salvando...</span>
                  </>
                )}
                {syncStatus === 'saved' && (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="hidden md:inline text-emerald-400">Salvo</span>
                  </>
                )}
                {syncStatus === 'error' && (
                  <>
                    <CloudOff className="w-4 h-4 text-rose-400" />
                    <span className="hidden md:inline text-rose-400" title={lastSyncError || 'Erro ao sincronizar'}>
                      Erro
                    </span>
                  </>
                )}
                {syncStatus === 'idle' && (
                  <>
                    <Cloud className="w-4 h-4 text-white/40" />
                    <span className="hidden md:inline text-white/40">Sincronizado</span>
                  </>
                )}
              </div>
            )}

            {/* Year Selector */}
            <div className="relative">
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="select-glass h-10 pl-4 pr-10 py-2 text-sm md:text-base appearance-none font-semibold"
              >
                {availableYears.map((y) => (
                  <option key={y} value={y} style={{ background: '#1e1b4b' }}>
                    {y}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
            </div>

            {/* Add Year Button */}
            <button
              onClick={() => canCreateNewYear && createNewYear()}
              disabled={!canCreateNewYear}
              className={`h-10 w-10 rounded-xl transition-all duration-200 flex items-center justify-center ${
                canCreateNewYear
                  ? 'btn-glass hover:bg-emerald-500/20 hover:border-emerald-500/50 text-emerald-400'
                  : 'glass-subtle text-white/30 cursor-not-allowed'
              }`}
              title={
                canCreateNewYear
                  ? `Criar ano ${year + 1}`
                  : 'Concretize todos os meses do ano corrente antes de criar um novo ano'
              }
            >
              <Plus className="w-5 h-5" />
            </button>

            {/* Recalculate Button */}
            <button
              onClick={recalculateAllMonths}
              className="btn-primary h-10 flex items-center gap-2 px-4 md:px-5"
              title="Recalcular todos os meses"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden md:inline">Recalcular</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
