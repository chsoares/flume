// components/layout/Sidebar.tsx

import { Link, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  PiggyBank,
  Plane,
  Waves,
  Settings,
  X,
  ChevronDown,
} from 'lucide-react';
import { useFinancialStore } from '../../store/financialStore';
import { formatCurrency } from '../../utils/formatters';
import type { MonthData } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/', label: 'Fluxo de Caixa', icon: TrendingUp },
  { path: '/income', label: 'Receitas', icon: DollarSign },
  { path: '/expenses', label: 'Despesas', icon: CreditCard },
  { path: '/investments', label: 'Investimentos', icon: PiggyBank },
  { path: '/trips', label: 'Viagens', icon: Plane },
  { path: '/settings', label: 'Configurações', icon: Settings },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { year, setYear, months, config, availableYears, createNewYear } = useFinancialStore();
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 0 });

  // Verificar se todos os meses do ano atual estão concretizados
  const allMonthsFinalized = months.length === 12 && months.every((m) => m.status === 'finalized');

  // Criar novo ano automaticamente quando todos os meses estiverem finalizados
  useEffect(() => {
    if (allMonthsFinalized && !availableYears.includes(year + 1)) {
      createNewYear();
    }
  }, [allMonthsFinalized, year, availableYears, createNewYear]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setYearDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calcular posição do indicador de seleção
  useEffect(() => {
    const updateIndicator = () => {
      if (navRef.current) {
        const activeIndex = navItems.findIndex(item => item.path === location.pathname);
        if (activeIndex !== -1) {
          const items = navRef.current.querySelectorAll('[data-nav-item]');
          const activeItem = items[activeIndex] as HTMLElement;
          if (activeItem) {
            setIndicatorStyle({
              top: activeItem.offsetTop,
              height: activeItem.offsetHeight,
            });
          }
        }
      }
    };

    // Pequeno delay para garantir que o DOM está pronto
    const timer = setTimeout(updateIndicator, 10);
    return () => clearTimeout(timer);
  }, [location.pathname]);

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

  // Calcular resumos
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

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - fixed */}
      <aside
        className={`
          fixed inset-y-4 left-4 md:top-6 md:bottom-6 md:left-6 z-50
          px-5 pb-6 pt-6
          w-72 sidebar flex flex-col overflow-y-auto
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo with Close Button */}
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 to-blue-500/30 rounded-xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-200" />
              <div className="relative bg-gradient-to-br from-pink-500 to-blue-500 p-2.5 rounded-xl group-hover:scale-105 transition-transform duration-200">
                <Waves className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              flume
            </h1>
          </Link>
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav ref={navRef} className="flex-1 space-y-1 relative">
          {/* Animated selection indicator */}
          <div
            className="absolute left-0 right-0 bg-gradient-to-r from-pink-500/20 to-blue-500/20 border border-white/10 rounded-xl transition-all duration-300 ease-out pointer-events-none"
            style={{
              top: indicatorStyle.top,
              height: indicatorStyle.height,
              opacity: indicatorStyle.height > 0 ? 1 : 0,
            }}
          />

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                data-nav-item
                className={`
                  relative flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-colors duration-150 ease-out
                  ${isActive
                    ? 'text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-pink-400' : ''}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Summary Cards */}
        <div className="space-y-3 pt-6 border-t border-white/10">
          {/* Year Selector */}
          <div className="flex items-center justify-between px-1 mb-4">
            <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Resumo</span>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold gradient-text hover:bg-white/5 transition-colors"
              >
                {year}
                <ChevronDown className={`w-4 h-4 text-pink-400 transition-transform ${yearDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {yearDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 bg-slate-800 border border-white/10 rounded-xl py-2 min-w-[100px] z-50 shadow-xl">
                  {availableYears.map((y) => (
                    <button
                      key={y}
                      onClick={() => {
                        setYear(y);
                        setYearDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-sm text-left transition-colors duration-150 ${
                        y === year
                          ? 'gradient-text font-semibold'
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Current Balance */}
          <div className="sidebar-card sidebar-card-hover p-4">
            <p className="text-xs font-medium text-white/40 mb-1.5">Saldo Atual</p>
            <p className="text-xl font-bold text-blue-400 tabular-nums">
              {formatCurrency(currentBalance)}
            </p>
          </div>

          {/* Yearly Balance */}
          <div className="sidebar-card sidebar-card-hover p-4">
            <p className="text-xs font-medium text-white/40 mb-1.5">Crescimento Anual</p>
            <p className={`text-xl font-bold tabular-nums ${yearlyBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(yearlyBalance)}
            </p>
          </div>

          {/* Final Balance */}
          <div className="sidebar-card sidebar-card-hover p-4">
            <p className="text-xs font-medium text-white/40 mb-1.5">Saldo Final</p>
            <p className="text-xl font-bold text-violet-400 tabular-nums">
              {formatCurrency(finalBalance)}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
