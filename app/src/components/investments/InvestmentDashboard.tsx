// components/investments/InvestmentDashboard.tsx

import { useFinancialStore } from '../../store/financialStore';
import { formatCurrency } from '../../utils/formatters';
import { TrendingUp, PiggyBank } from 'lucide-react';

export function InvestmentDashboard() {
  const { config, months } = useFinancialStore();

  // Get first and last month
  const firstMonth = months[0];
  const lastMonth = months[months.length - 1];

  if (!firstMonth || !lastMonth) {
    return (
      <div className="card p-6">
        <p className="text-slate-400 text-center italic">Nenhum dado disponível</p>
      </div>
    );
  }

  // Calculate totals for each investment
  const investmentStats = config.investments.map((investment) => {
    // Saldo inicial do ano é o previousBalance de janeiro (que já vem do ano anterior)
    const yearInitialBalance = firstMonth.investments[investment.id]?.previousBalance || investment.initialBalance;

    // Saldo atual é o saldo do último mês finalizado, ou o saldo inicial do ano
    const lastFinalizedMonth = months.filter(m => m.status === 'finalized').slice(-1)[0];
    const currentBalance = lastFinalizedMonth?.realData?.investments[investment.id]?.finalBalance
      ?? lastFinalizedMonth?.investments[investment.id]?.finalBalance
      ?? yearInitialBalance;

    const projectedBalance = lastMonth.investments[investment.id]?.finalBalance || 0;

    // Rendimento apenas de meses finalizados
    const totalYield = months.reduce((sum, month) => {
      if (month.status === 'finalized' && month.realData?.investments[investment.id]?.yield) {
        return sum + month.realData.investments[investment.id].yield!;
      }
      return sum;
    }, 0);

    return {
      ...investment,
      yearInitialBalance,
      currentBalance,
      projectedBalance,
      totalYield,
    };
  });

  return (
    <div className="card p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100">
        <div className="icon-badge bg-gradient-to-br from-violet-500 to-indigo-500">
          <PiggyBank className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg md:text-xl font-bold text-slate-700">
          Dashboard de Investimentos
        </h3>
      </div>

      {/* Investment Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {investmentStats.map((inv) => {
          // Crescimento anual: projetado final - inicial do ano
          const growth = inv.projectedBalance - inv.yearInitialBalance;
          const growthPercent =
            inv.yearInitialBalance > 0 ? (growth / inv.yearInitialBalance) * 100 : 0;

          return (
            <div
              key={inv.id}
              className="card-subtle p-4 hover:shadow-md transition-shadow"
            >
              <h4 className="font-bold text-slate-700 mb-3">{inv.name}</h4>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Inicial (ano):</span>
                  <span className="font-medium text-slate-700 tabular-nums">{formatCurrency(inv.yearInitialBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Atual:</span>
                  <span className="font-medium text-slate-700 tabular-nums">{formatCurrency(inv.currentBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Projetado:</span>
                  <span className="font-medium text-violet-500 tabular-nums">
                    {formatCurrency(inv.projectedBalance)}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rendimento:</span>
                    <span className="font-medium text-emerald-500 tabular-nums">
                      {formatCurrency(inv.totalYield)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Crescimento:
                    </span>
                    <span className="font-bold text-emerald-600 tabular-nums">
                      {formatCurrency(growth)} ({growthPercent.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {config.investments.length === 0 && (
        <p className="text-center text-slate-400 py-8 italic">
          Nenhum investimento cadastrado
        </p>
      )}
    </div>
  );
}
