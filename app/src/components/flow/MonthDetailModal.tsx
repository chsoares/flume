// components/flow/MonthDetailModal.tsx

import { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import type { MonthData } from '../../types';
import { formatCurrency, formatMonthFull } from '../../utils/formatters';
import { useFinancialStore } from '../../store/financialStore';
import { Edit, Save, CheckCircle, DollarSign, CreditCard, PiggyBank, Undo2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTripDetailsForMonth, getExtraordinaryExpenseDetailsForMonth, getExtraordinaryIncomeDetailsForMonth } from '../../utils/calculations';
import { CurrencyInput } from '../shared/CurrencyInput';

interface MonthDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  month: MonthData | null;
  onNavigate?: (direction: 'prev' | 'next') => void;
}

export function MonthDetailModal({ isOpen, onClose, month: monthProp, onNavigate }: MonthDetailModalProps) {
  const { config, months, finalizeMonth, revertMonth, updateMonthRealData } = useFinancialStore();
  const [isEditing, setIsEditing] = useState(false);

  // Buscar o mês atualizado do store para refletir mudanças em tempo real
  const month = monthProp ? months.find(m => m.month === monthProp.month) || monthProp : null;

  // Receitas
  const [realSalary, setRealSalary] = useState(0);
  const [realExtraordinaryIncome, setRealExtraordinaryIncome] = useState<{ id: string; description: string; value: number }[]>([]);

  // Despesas
  const [realFixedExpenses, setRealFixedExpenses] = useState<{ id: string; name: string; value: number }[]>([]);
  const [realDailyExpenses, setRealDailyExpenses] = useState(0);
  const [realExtraordinaryExpenses, setRealExtraordinaryExpenses] = useState<{ id: string; description: string; value: number }[]>([]);
  const [realTrips, setRealTrips] = useState<{ id: string; name: string; items: { description: string; value: number }[] }[]>([]);

  // Investimentos
  const [realInvestments, setRealInvestments] = useState<Record<string, { deposit: number; finalBalance: number }>>({});

  // Keyboard shortcuts for navigation
  useEffect(() => {
    if (!isOpen || !onNavigate) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onNavigate('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNavigate('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onNavigate]);

  // Calcular despesas cotidianas automaticamente quando em modo de edição
  useEffect(() => {
    if (!isEditing) return;

    const totalIncome = realSalary + realExtraordinaryIncome.reduce((sum, inc) => sum + inc.value, 0);
    const totalFixed = realFixedExpenses.reduce((sum, exp) => sum + exp.value, 0);
    const totalExtraordinary = realExtraordinaryExpenses.reduce((sum, exp) => sum + exp.value, 0);
    const totalTrips = realTrips.reduce((sum, trip) => sum + trip.items.reduce((s, item) => s + item.value, 0), 0);
    const totalInvestmentDeposits = Object.values(realInvestments).reduce((sum, inv) => sum + inv.deposit, 0);

    const calculatedDaily = totalIncome - totalFixed - totalExtraordinary - totalTrips - totalInvestmentDeposits;
    setRealDailyExpenses(calculatedDaily);
  }, [isEditing, realSalary, realExtraordinaryIncome, realFixedExpenses, realExtraordinaryExpenses, realTrips, realInvestments]);

  if (!month) return null;

  const isFinalized = month.status === 'finalized';

  // Dados de exibição - usar realData quando disponível
  const displayIncomeSalary = isFinalized && month.realData
    ? month.realData.income.salary
    : month.income.salary;

  // Obter detalhes para exibição (usar realData se disponível)
  const displayExtraordinaryIncome = isFinalized && month.realData
    ? month.realData.income.extraordinary
    : getExtraordinaryIncomeDetailsForMonth(month.month, config.extraordinaryIncome).map(income => ({
        id: income.id,
        description: income.description,
        value: income.value,
      }));

  const displayFixedExpenses = isFinalized && month.realData
    ? month.realData.expenses.fixed
    : config.fixedExpenses.map(expense => ({
        id: expense.id,
        name: expense.name,
        value: expense.value,
      }));

  const displayExtraordinaryExpenses = isFinalized && month.realData
    ? month.realData.expenses.extraordinary
    : getExtraordinaryExpenseDetailsForMonth(month.month, config.extraordinaryExpenses).map(expense => ({
        id: expense.id,
        description: expense.description,
        value: expense.installmentValue,
      }));

  const displayTrips = isFinalized && month.realData
    ? month.realData.expenses.trips
    : getTripDetailsForMonth(month.month, config.trips).map(detail => {
        const items = [];
        if (detail.preExpenses > 0) {
          items.push({ description: 'Gastos', value: detail.preExpenses });
        }
        if (detail.dailyBudgetTotal > 0) {
          items.push({
            description: `Orçamento diário (${detail.dailyBudgetDays} dias)`,
            value: detail.dailyBudgetTotal,
          });
        }
        return {
          id: detail.trip.id,
          name: detail.trip.name,
          items,
        };
      });

  const displayDailyExpenses = isFinalized && month.realData
    ? month.realData.expenses.daily
    : month.expenses.daily;

  // Calcular totais
  const totalExtraordinaryIncome = displayExtraordinaryIncome.reduce((sum, income) => sum + income.value, 0);
  const totalIncome = displayIncomeSalary + totalExtraordinaryIncome;

  const totalFixedExpenses = displayFixedExpenses.reduce((sum, expense) => sum + expense.value, 0);
  const totalExtraordinaryExpenses = displayExtraordinaryExpenses.reduce((sum, expense) => sum + expense.value, 0);
  const totalTripsExpenses = displayTrips.reduce((sum, trip) =>
    sum + trip.items.reduce((s, item) => s + item.value, 0), 0);

  const totalExpenses = totalFixedExpenses + displayDailyExpenses + totalExtraordinaryExpenses + totalTripsExpenses;

  function handleEdit() {
    if (!month) return;

    if (isEditing) {
      // Salvar dados editados
      const investmentsWithYield = Object.fromEntries(
        Object.entries(realInvestments).map(([id, data]) => {
          const inv = month.investments[id];
          const calculatedYield = data.finalBalance - inv.previousBalance - data.deposit;
          return [
            id,
            {
              deposit: data.deposit,
              finalBalance: data.finalBalance,
              yield: calculatedYield
            },
          ];
        })
      );

      updateMonthRealData(month.month, {
        income: {
          salary: realSalary,
          extraordinary: realExtraordinaryIncome,
        },
        expenses: {
          fixed: realFixedExpenses,
          daily: realDailyExpenses,
          extraordinary: realExtraordinaryExpenses,
          trips: realTrips,
        },
        investments: investmentsWithYield,
      });
      setIsEditing(false);
    } else {
      // Entrar em modo de edição - inicializar estados
      if (month.realData) {
        // Se já tem realData, usar esses valores
        setRealSalary(month.realData.income.salary);
        setRealExtraordinaryIncome(month.realData.income.extraordinary);
        setRealFixedExpenses(month.realData.expenses.fixed);
        setRealDailyExpenses(month.realData.expenses.daily);
        setRealExtraordinaryExpenses(month.realData.expenses.extraordinary);
        setRealTrips(month.realData.expenses.trips);
      } else {
        // Se não tem realData, usar valores projetados
        setRealSalary(month.income.salary);

        const extraordinaryIncomeDetails = getExtraordinaryIncomeDetailsForMonth(
          month.month,
          config.extraordinaryIncome
        );
        setRealExtraordinaryIncome(extraordinaryIncomeDetails.map(income => ({
          id: income.id,
          description: income.description,
          value: income.value,
        })));

        const fixedExpensesDetails = config.fixedExpenses.map(expense => ({
          id: expense.id,
          name: expense.name,
          value: expense.value,
        }));
        setRealFixedExpenses(fixedExpensesDetails);

        setRealDailyExpenses(month.expenses.daily);

        const extraordinaryExpenseDetails = getExtraordinaryExpenseDetailsForMonth(
          month.month,
          config.extraordinaryExpenses
        );
        setRealExtraordinaryExpenses(extraordinaryExpenseDetails.map(expense => ({
          id: expense.id,
          description: expense.description,
          value: expense.installmentValue,
        })));

        const tripDetails = getTripDetailsForMonth(month.month, config.trips);
        setRealTrips(tripDetails.map(detail => {
          const items = [];
          if (detail.preExpenses > 0) {
            items.push({ description: 'Gastos', value: detail.preExpenses });
          }
          if (detail.dailyBudgetTotal > 0) {
            items.push({
              description: `Orçamento diário (${detail.dailyBudgetDays} dias)`,
              value: detail.dailyBudgetTotal,
            });
          }
          return {
            id: detail.trip.id,
            name: detail.trip.name,
            items,
          };
        }));
      }

      const invData: Record<string, { deposit: number; finalBalance: number }> = {};
      Object.entries(month.investments).forEach(([id, inv]) => {
        invData[id] = {
          deposit: month.realData?.investments[id]?.deposit ?? inv.deposit,
          finalBalance: month.realData?.investments[id]?.finalBalance ?? inv.finalBalance,
        };
      });
      setRealInvestments(invData);
      setIsEditing(true);
    }
  }

  function handleFinalize() {
    if (!month) return;
    finalizeMonth(month.month);
  }

  function handleRevert() {
    if (!month) return;
    if (window.confirm('Tem certeza que deseja reverter este mês para o estado previsto? Todos os dados editados serão perdidos.')) {
      revertMonth(month.month);
      setIsEditing(false);
    }
  }

  // Calcular total de movimentações de investimentos
  const totalInvestments = Object.entries(month.investments).reduce((sum, [id, invData]) => {
    const realInvData = month.realData?.investments[id];
    return sum + (realInvData?.deposit ?? invData.deposit);
  }, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          {onNavigate && (
            <button
              onClick={() => onNavigate('prev')}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Mês anterior (←)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <span className="gradient-text font-bold">{formatMonthFull(month.month)}</span>
          {onNavigate && (
            <button
              onClick={() => onNavigate('next')}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Próximo mês (→)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      }
      size="lg"
      headerActions={
        <div className="flex items-center gap-2">
          {!isFinalized ? (
            <button
              onClick={handleFinalize}
              className="btn-accent w-10 h-10"
              title="Concretizar"
            >
              <CheckCircle className="w-5 h-5" />
            </button>
          ) : (
            <>
              <button
                onClick={handleRevert}
                className="btn-secondary w-10 h-10"
                title="Reverter"
              >
                <Undo2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleEdit}
                className="btn-primary w-10 h-10"
                title={isEditing ? 'Salvar' : 'Editar'}
              >
                {isEditing ? <Save className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
              </button>
            </>
          )}
        </div>
      }
    >
      <div className="space-y-6">

        {/* Receitas */}
        <div className="card-subtle p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-emerald-500 flex items-center gap-3">
              <div className="icon-badge bg-gradient-to-br from-emerald-500 to-teal-500">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <span className="hidden md:inline">RECEITAS</span>
            </h3>
            <span className="text-xl font-bold text-emerald-500 tabular-nums">
              {formatCurrency(totalIncome)}
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-base">
              <span className="text-slate-600 font-medium">Salário</span>
              {isEditing ? (
                <div className="w-40">
                  <CurrencyInput
                    value={realSalary}
                    onChange={setRealSalary}
                  />
                </div>
              ) : (
                <span className="text-slate-700 tabular-nums">{formatCurrency(displayIncomeSalary)}</span>
              )}
            </div>
            <div>
              <div className="flex justify-between mb-1 text-base">
                <p className="text-slate-600 font-medium">Extraordinárias</p>
                <span className="text-slate-700 tabular-nums">{formatCurrency(totalExtraordinaryIncome)}</span>
              </div>
              {displayExtraordinaryIncome.length > 0 && (
                <div className="text-sm space-y-1">
                  {isEditing ? (
                    realExtraordinaryIncome.map((income, index) => (
                      <div key={income.id} className="flex justify-between ml-4 items-center">
                        <span className="text-slate-500">{income.description}</span>
                        <div className="w-32">
                          <CurrencyInput
                            value={income.value}
                            onChange={(value) => {
                              const updated = [...realExtraordinaryIncome];
                              updated[index] = { ...income, value };
                              setRealExtraordinaryIncome(updated);
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    displayExtraordinaryIncome.map((income) => (
                      <div key={income.id} className="flex justify-between ml-4">
                        <span className="text-slate-500">{income.description}</span>
                        <span className="text-slate-500 tabular-nums">{formatCurrency(income.value)}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Despesas */}
        <div className="card-subtle p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-rose-500 flex items-center gap-3">
              <div className="icon-badge bg-gradient-to-br from-pink-500 to-rose-500">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="hidden md:inline">DESPESAS</span>
            </h3>
            <span className="text-xl font-bold text-rose-500 tabular-nums">
              {formatCurrency(totalExpenses)}
            </span>
          </div>
          <div className="space-y-3">
            {/* Fixas */}
            <div>
              <div className="flex justify-between mb-1 text-base">
                <p className="text-slate-600 font-medium">Fixas</p>
                <span className="text-slate-700 tabular-nums">{formatCurrency(totalFixedExpenses)}</span>
              </div>
              {displayFixedExpenses.length > 0 && (
                <div className="text-sm space-y-1">
                  {isEditing ? (
                    realFixedExpenses.map((expense, index) => (
                      <div key={expense.id} className="flex justify-between ml-4 items-center">
                        <span className="text-slate-500">{expense.name}</span>
                        <div className="w-32">
                          <CurrencyInput
                            value={expense.value}
                            onChange={(value) => {
                              const updated = [...realFixedExpenses];
                              updated[index] = { ...expense, value };
                              setRealFixedExpenses(updated);
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    displayFixedExpenses.map((expense) => (
                      <div key={expense.id} className="flex justify-between ml-4">
                        <span className="text-slate-500">{expense.name}</span>
                        <span className="text-slate-500 tabular-nums">{formatCurrency(expense.value)}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Extraordinárias */}
            <div>
              <div className="flex justify-between mb-1 text-base">
                <p className="text-slate-600 font-medium">Extraordinárias</p>
                <span className="text-slate-700 tabular-nums">{formatCurrency(totalExtraordinaryExpenses)}</span>
              </div>
              {displayExtraordinaryExpenses.length > 0 && (
                <div className="text-sm space-y-1">
                  {isEditing ? (
                    realExtraordinaryExpenses.map((expense, index) => (
                      <div key={expense.id} className="flex justify-between ml-4 items-center">
                        <span className="text-slate-500">{expense.description}</span>
                        <div className="w-32">
                          <CurrencyInput
                            value={expense.value}
                            onChange={(value) => {
                              const updated = [...realExtraordinaryExpenses];
                              updated[index] = { ...expense, value };
                              setRealExtraordinaryExpenses(updated);
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    displayExtraordinaryExpenses.map((expense) => (
                      <div key={expense.id} className="flex justify-between ml-4">
                        <span className="text-slate-500">{expense.description}</span>
                        <span className="text-slate-500 tabular-nums">{formatCurrency(expense.value)}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Viagens */}
            <div>
              <div className="flex justify-between mb-1 text-base">
                <p className="text-slate-600 font-medium">Viagens</p>
                <span className="text-slate-700 tabular-nums">{formatCurrency(totalTripsExpenses)}</span>
              </div>
              {displayTrips.length > 0 && (
                <div className="text-sm">
                  {isEditing ? (
                    realTrips.map((trip, tripIndex) => (
                      <div key={trip.id} className="ml-4 space-y-1">
                        <p className="text-slate-500">{trip.name}</p>
                        {trip.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex justify-between ml-4 items-center">
                            <span className="text-slate-500">{item.description}</span>
                            <div className="w-32">
                              <CurrencyInput
                                value={item.value}
                                onChange={(value) => {
                                  const updated = [...realTrips];
                                  const updatedItems = [...updated[tripIndex].items];
                                  updatedItems[itemIndex] = { ...item, value };
                                  updated[tripIndex] = { ...trip, items: updatedItems };
                                  setRealTrips(updated);
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ))
                  ) : (
                    displayTrips.map((trip) => (
                      <div key={trip.id} className="ml-4 space-y-1">
                        <p className="text-slate-500">{trip.name}</p>
                        {trip.items.map((item, index) => (
                          <div key={index} className="flex justify-between ml-4">
                            <span className="text-slate-500">{item.description}</span>
                            <span className="text-slate-500 tabular-nums">{formatCurrency(item.value)}</span>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Cotidianas (Calculado Automaticamente) */}
            <div className="flex justify-between items-center text-base">
              <span className="text-slate-600 font-medium">Cotidianas</span>
              {isEditing ? (
                <div className="w-40">
                  <CurrencyInput
                    value={realDailyExpenses}
                    onChange={() => {}} // Não permite mudanças
                    disabled={true}
                  />
                </div>
              ) : (
                <span className="text-slate-700 tabular-nums">
                  {formatCurrency(displayDailyExpenses)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Investimentos */}
        <div className="card-subtle p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-violet-500 flex items-center gap-3">
              <div className="icon-badge bg-gradient-to-br from-violet-500 to-indigo-500">
                <PiggyBank className="w-5 h-5 text-white" />
              </div>
              <span className="hidden md:inline">INVESTIMENTOS</span>
            </h3>
            <span className="text-xl font-bold text-violet-500 tabular-nums">
              {formatCurrency(totalInvestments)}
            </span>
          </div>
          <div className="space-y-3">
            {Object.entries(month.investments).map(([investmentId, invData]) => {
              const investment = config.investments.find((inv) => inv.id === investmentId);
              if (!investment) return null;

              const realInvData = month.realData?.investments[investmentId];
              const displayDeposit = realInvData?.deposit ?? invData.deposit;
              const displayFinalBalance = realInvData?.finalBalance ?? invData.finalBalance;
              const calculatedYield = isEditing
                ? (realInvestments[investmentId]?.finalBalance ?? displayFinalBalance) -
                  invData.previousBalance -
                  (realInvestments[investmentId]?.deposit ?? displayDeposit)
                : realInvData?.yield ?? invData.yield;

              return (
                <div key={investmentId}>
                  <div className="flex justify-between items-center mb-1 text-base">
                    <p className="text-slate-600 font-medium">{investment.name}</p>
                    {isEditing ? (
                      <div className="w-40">
                        <CurrencyInput
                          value={realInvestments[investmentId]?.deposit ?? displayDeposit}
                          onChange={(value) =>
                            setRealInvestments({
                              ...realInvestments,
                              [investmentId]: {
                                ...realInvestments[investmentId],
                                deposit: value,
                              },
                            })
                          }
                          allowNegative={true}
                        />
                      </div>
                    ) : (
                      <span className={`tabular-nums ${displayDeposit >= 0 ? 'text-slate-700' : 'text-slate-500'}`}>
                        {formatCurrency(displayDeposit)}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-sm ml-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Saldo Anterior</span>
                      {isEditing ? (
                        <div className="w-40">
                          <CurrencyInput
                            value={invData.previousBalance}
                            onChange={() => {}} // Não permite mudanças
                            disabled={true}
                          />
                        </div>
                      ) : (
                        <span className="text-slate-500 tabular-nums">{formatCurrency(invData.previousBalance)}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Rendimento</span>
                      {isEditing ? (
                        <div className="w-40">
                          <CurrencyInput
                            value={calculatedYield}
                            onChange={() => {}} // Não permite mudanças
                            disabled={true}
                          />
                        </div>
                      ) : isFinalized ? (
                        <span className="text-slate-500 tabular-nums">
                          {formatCurrency(calculatedYield)}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">a calcular</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Saldo Final</span>
                      {isEditing ? (
                        <div className="w-40">
                          <CurrencyInput
                            value={realInvestments[investmentId]?.finalBalance ?? displayFinalBalance}
                            onChange={(value) =>
                              setRealInvestments({
                                ...realInvestments,
                                [investmentId]: {
                                  ...realInvestments[investmentId],
                                  finalBalance: value,
                                },
                              })
                            }
                          />
                        </div>
                      ) : (
                        <span className="text-slate-500 tabular-nums">{formatCurrency(displayFinalBalance)}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </Modal>
  );
}
