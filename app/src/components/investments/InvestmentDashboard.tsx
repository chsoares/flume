// components/investments/InvestmentDashboard.tsx

import { useFinancialStore } from '../../store/financialStore';
import { formatCurrency } from '../../utils/formatters';
import { TrendingUp } from 'lucide-react';

export function InvestmentDashboard() {
  const { config, months } = useFinancialStore();

  // Get first and last month
  const firstMonth = months[0];
  const lastMonth = months[months.length - 1];

  if (!firstMonth || !lastMonth) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-slate-500 text-center">Nenhum dado disponível</p>
      </div>
    );
  }

  // Calculate totals for each investment
  const investmentStats = config.investments.map((investment) => {
    const initialBalance = investment.initialBalance;
    const currentBalance = firstMonth.investments[investment.id]?.previousBalance || investment.initialBalance;
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
      initialBalance,
      currentBalance,
      projectedBalance,
      totalYield,
    };
  });



  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-slate-800 mb-6 border-b pb-3">
        Dashboard de Investimentos
      </h3>

      {/* Investment Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {investmentStats.map((inv) => {
          const growth = inv.projectedBalance - inv.currentBalance;
          const growthPercent =
            inv.currentBalance > 0 ? (growth / inv.currentBalance) * 100 : 0;

          return (
            <div
              key={inv.id}
              className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <h4 className="font-bold text-slate-800 mb-3">{inv.name}</h4>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Inicial:</span>
                  <span className="font-medium">{formatCurrency(inv.initialBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Atual:</span>
                  <span className="font-medium">{formatCurrency(inv.currentBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Projetado:</span>
                  <span className="font-medium text-purple-600">
                    {formatCurrency(inv.projectedBalance)}
                  </span>
                </div>

                <div className="pt-2 border-t space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Rendimento:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(inv.totalYield)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Crescimento:
                    </span>
                    <span className="font-bold text-green-700">
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
        <p className="text-center text-slate-500 py-8 italic">
          Nenhum investimento cadastrado
        </p>
      )}
    </div>
  );
}
