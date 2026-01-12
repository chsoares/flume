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
} from 'lucide-react';
import { useFinancialStore } from '../../store/financialStore';
import { formatCurrency } from '../../utils/formatters';

export function Sidebar() {
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
    <aside className="w-64 bg-slate-800 text-white min-h-screen p-6 flex flex-col">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Waves className="w-6 h-6" />
          flume
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
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
  );
}
