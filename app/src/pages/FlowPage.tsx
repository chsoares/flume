// pages/FlowPage.tsx

import { useState } from 'react';
import { useFinancialStore } from '../store/financialStore';
import type { MonthData } from '../types';
import { FlowTable } from '../components/flow/FlowTable';
import { MonthDetailModal } from '../components/flow/MonthDetailModal';
import { formatCurrency } from '../utils/formatters';
import { TrendingUp, Wallet, PiggyBank, Landmark, ChevronDown, ChevronUp } from 'lucide-react';

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

  // Helper para calcular receita de um mês (usa realData se finalizado)
  const getMonthIncome = (m: MonthData): number => {
    if (m.status === 'finalized' && m.realData) {
      const extraSum = m.realData.income.extraordinary.reduce((s, e) => s + e.value, 0);
      return m.realData.income.salary + extraSum;
    }
    return m.income.salary + m.income.extraordinary;
  };

  // Helper para calcular despesas de um mês (usa realData se finalizado)
  const getMonthExpenses = (m: MonthData): number => {
    if (m.status === 'finalized' && m.realData) {
      const fixedSum = m.realData.expenses.fixed.reduce((s, e) => s + e.value, 0);
      const extraSum = m.realData.expenses.extraordinary.reduce((s, e) => s + e.value, 0);
      const tripsSum = m.realData.expenses.trips.reduce(
        (s, t) => s + t.items.reduce((ts, item) => ts + item.value, 0),
        0
      );
      return fixedSum + m.realData.expenses.daily + extraSum + tripsSum;
    }
    return m.expenses.fixed + m.expenses.daily + m.expenses.extraordinary + m.expenses.trips;
  };

  // Calculate summary cards
  const totalIncome = months.reduce((sum, m) => sum + getMonthIncome(m), 0);
  const totalExpenses = months.reduce((sum, m) => sum + getMonthExpenses(m), 0);
  const yearlyBalance = totalIncome - totalExpenses;

  // Saldo atual (último mês finalizado ou saldos iniciais)
  const lastFinalizedMonth = months.filter(m => m.status === 'finalized').slice(-1)[0];
  const currentBalance = lastFinalizedMonth?.realData?.investments
    ? Object.values(lastFinalizedMonth.realData.investments).reduce((sum, inv) => sum + inv.finalBalance, 0)
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

  const summaryCards = [
    {
      title: 'Saldo Atual',
      value: currentBalance,
      icon: Landmark,
      textColor: 'text-blue-500',
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-cyan-500',
    },
    {
      title: 'Crescimento Anual',
      value: yearlyBalance,
      icon: TrendingUp,
      textColor: yearlyBalance >= 0 ? 'text-emerald-500' : 'text-rose-500',
      gradientFrom: yearlyBalance >= 0 ? 'from-emerald-500' : 'from-pink-500',
      gradientTo: yearlyBalance >= 0 ? 'to-teal-500' : 'to-rose-500',
    },
    {
      title: 'Rendimentos',
      value: totalYield,
      icon: PiggyBank,
      textColor: totalYield >= 0 ? 'text-emerald-500' : 'text-rose-500',
      gradientFrom: totalYield >= 0 ? 'from-emerald-500' : 'from-pink-500',
      gradientTo: totalYield >= 0 ? 'to-cyan-500' : 'to-rose-500',
    },
    {
      title: 'Saldo Final',
      value: finalBalance,
      icon: Wallet,
      textColor: 'text-violet-500',
      gradientFrom: 'from-violet-500',
      gradientTo: 'to-indigo-500',
    },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-3rem)] gap-4">
      {/* Toggle Overview Button (mobile only) */}
      <button
        onClick={() => setShowOverview(!showOverview)}
        className="md:hidden w-full flex items-center justify-between px-5 py-4
                 card text-slate-700 font-medium shrink-0"
      >
        <span>{showOverview ? 'Esconder Resumo' : 'Mostrar Resumo'}</span>
        {showOverview ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {/* Summary Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 ${showOverview ? 'block' : 'hidden md:grid'}`}>
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="group card card-hover p-5 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-500">{card.title}</h3>
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradientFrom} ${card.gradientTo} rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-200`} />
                  <div className={`relative p-2.5 rounded-xl bg-gradient-to-br ${card.gradientFrom} ${card.gradientTo} group-hover:scale-105 transition-transform duration-200`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
              <p className={`text-2xl md:text-3xl font-bold ${card.textColor} tracking-tight tabular-nums`}>
                {formatCurrency(card.value)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Flow Table - fills remaining space */}
      <div className="flex-1 min-h-0">
        <FlowTable months={months} onMonthClick={handleMonthClick} />
      </div>

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
