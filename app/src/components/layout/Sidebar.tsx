// components/layout/Sidebar.tsx

import { Link, useLocation } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  PiggyBank,
  Plane,
  Waves,
  Settings,
  X,
} from 'lucide-react';
import { useFinancialStore } from '../../store/financialStore';
import { formatCurrency } from '../../utils/formatters';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { year, months, config } = useFinancialStore();

  const navItems = [
    { path: '/', label: 'Fluxo de Caixa', icon: TrendingUp },
    { path: '/income', label: 'Receitas', icon: DollarSign },
    { path: '/expenses', label: 'Despesas', icon: CreditCard },
    { path: '/investments', label: 'Investimentos', icon: PiggyBank },
    { path: '/trips', label: 'Viagens', icon: Plane },
    { path: '/settings', label: 'Configurações', icon: Settings },
  ];

  // Calcular resumos
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

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          px-6 pb-6 pt-[calc(env(safe-area-inset-top)+1.5rem)]
          w-full md:w-64 bg-slate-800 text-white min-h-screen p-6 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo with Close Button */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Waves className="w-6 h-6" />
            flume
          </h1>
          <button
            onClick={onClose}
            className="md:hidden p-1 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 mb-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Summary Cards */}
      <div className="space-y-4 mb-6">
        <div className="bg-slate-700 rounded-lg p-4">
          <p className="text-slate-400 text-xs mb-1">Ano</p>
          <p className="text-xl font-bold">{year}</p>
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <p className="text-slate-400 text-xs mb-1">Saldo Atual</p>
          <p className="text-lg font-bold text-blue-400">{formatCurrency(currentBalance)}</p>
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <p className="text-slate-400 text-xs mb-1">Saldo Anual</p>
          <p className={`text-lg font-bold ${yearlyBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(yearlyBalance)}
          </p>
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <p className="text-slate-400 text-xs mb-1">Saldo Final</p>
          <p className="text-lg font-bold text-purple-400">{formatCurrency(finalBalance)}</p>
        </div>
      </div>
      </aside>
    </>
  );
}
