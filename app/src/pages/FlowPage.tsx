// pages/FlowPage.tsx

import { useState } from 'react';
import { useFinancialStore } from '../store/financialStore';
import type { MonthData } from '../types';
import { FlowTable } from '../components/flow/FlowTable';
import { MonthDetailModal } from '../components/flow/MonthDetailModal';
import { formatCurrency } from '../utils/formatters';
import { TrendingUp, Wallet, PiggyBank, Landmark } from 'lucide-react';

export function FlowPage() {
  const { months, config } = useFinancialStore();
  const [selectedMonth, setSelectedMonth] = useState<MonthData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showOverview, setShowOverview] = useState(false);

  function handleMonthClick(month: MonthData) {
    setSelectedMonth(month);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setSelectedMonth(null);
  }

  function handleNavigate(direction: 'prev' | 'next') {
    if (!selectedMonth) return;

    const currentIndex = months.findIndex((m) => m.month === selectedMonth.month);
    if (currentIndex === -1) return;

    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex >= 0 && newIndex < months.length) {
      setSelectedMonth(months[newIndex]);
    }
  }

  // Calculate summary cards
  const totalIncome = months.reduce(
    (sum, m) => sum + m.income.salary + m.income.extraordinary,
    0
  );
  const totalExpenses = months.reduce(
    (sum, m) =>
      sum + m.expenses.fixed + m.expenses.daily + m.expenses.extraordinary + m.expenses.trips,
    0
  );
  const yearlyBalance = totalIncome - totalExpenses;

  // Saldo atual (último mês finalizado ou saldos iniciais)
  const lastFinalizedMonth = months.filter(m => m.status === 'finalized').slice(-1)[0];
  const currentBalance = lastFinalizedMonth
    ? Object.values(lastFinalizedMonth.investments).reduce((sum, inv) => sum + inv.finalBalance, 0)
    : config.investments.reduce((sum, inv) => sum + inv.initialBalance, 0);

  // Saldo final (último mês do ano)
  const lastMonth = months[months.length - 1];
  const finalBalance = lastMonth
    ? Object.values(lastMonth.investments).reduce((sum, inv) => sum + inv.finalBalance, 0)
    : 0;

  const totalYield = months.reduce((sum, m) => {
    // Só somar yields de meses finalizados com realData
    if (m.status === 'finalized' && m.realData?.investments) {
      return sum + Object.values(m.realData.investments).reduce(
        (s, inv) => s + (inv.yield || 0),
        0
      );
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Toggle Overview Button (mobile only) */}
      <button
        onClick={() => setShowOverview(!showOverview)}
        className="md:hidden w-full flex items-center justify-between px-4 py-3 bg-white rounded-lg shadow-md text-slate-700 font-medium"
      >
        <span>{showOverview ? 'Esconder Resumo' : 'Mostrar Resumo'}</span>
        <TrendingUp className="w-5 h-5" />
      </button>

      {/* Summary Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 ${showOverview ? 'block' : 'hidden md:grid'}`}>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">Saldo Atual</h3>
            <Landmark className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {formatCurrency(currentBalance)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">Saldo Anual</h3>
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
          <p
            className={`text-3xl font-bold ${
              yearlyBalance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatCurrency(yearlyBalance)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">Saldo Final</h3>
            <Wallet className="w-6 h-6 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {formatCurrency(finalBalance)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">Rendimentos Totais</h3>
            <PiggyBank className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-emerald-600">
            {formatCurrency(totalYield)}
          </p>
        </div>
      </div>

      {/* Flow Table */}
      <FlowTable months={months} onMonthClick={handleMonthClick} />

      {/* Month Detail Modal */}
      <MonthDetailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        month={selectedMonth}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
