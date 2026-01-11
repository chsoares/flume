// components/flow/MonthDetailModal.tsx

import { useState } from 'react';
import { Modal } from '../shared/Modal';
import type { MonthData } from '../../types';
import { formatCurrency, formatMonthFull } from '../../utils/formatters';
import { useFinancialStore } from '../../store/financialStore';
import { Edit, Save, CheckCircle, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { getTripDetailsForMonth, getExtraordinaryExpenseDetailsForMonth, getExtraordinaryIncomeDetailsForMonth } from '../../utils/calculations';
import { CurrencyInput } from '../shared/CurrencyInput';

interface MonthDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  month: MonthData | null;
}

export function MonthDetailModal({ isOpen, onClose, month }: MonthDetailModalProps) {
  const { config, finalizeMonth, updateMonthRealData } = useFinancialStore();
  const [isEditing, setIsEditing] = useState(false);

  // Receitas
  const [realSalary, setRealSalary] = useState(0);
  const [realExtras, setRealExtras] = useState(0);

  // Despesas cotidianas
  const [realDailyExpenses, setRealDailyExpenses] = useState(0);

  // Investimentos
  const [realInvestments, setRealInvestments] = useState<Record<string, { deposit: number; finalBalance: number }>>({});

  if (!month) return null;

  const isFinalized = month.status === 'finalized';

  // Dados de exibição
  const displayIncome = isFinalized && month.realData
    ? month.realData.income
    : month.income;

  // Calcular aportes totais
  const totalDeposits = isFinalized && month.realData?.investments
    ? Object.values(month.realData.investments).reduce((sum, inv) => sum + inv.deposit, 0)
    : Object.values(month.investments).reduce((sum, inv) => sum + inv.deposit, 0);

  // Calcular despesas cotidianas (CALCULADO)
  const totalIncome = displayIncome.salary + displayIncome.extraordinary;
  const otherExpenses = month.expenses.fixed + month.expenses.extraordinary + month.expenses.trips;
  const dailyExpenses = totalIncome - totalDeposits - otherExpenses;

  const totalExpenses = month.expenses.fixed + dailyExpenses + month.expenses.extraordinary + month.expenses.trips;

  function handleEdit() {
    if (!month) return;

    if (isEditing) {
      // Calcular yields para cada investimento
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
          extraordinary: realExtras,
        },
        expenses: {
          daily: realDailyExpenses,
        },
        investments: investmentsWithYield,
      });
      setIsEditing(false);
    } else {
      // Entrar em modo de edição
      setRealSalary(displayIncome.salary);
      setRealExtras(displayIncome.extraordinary);
      setRealDailyExpenses(dailyExpenses);

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
    onClose();
  }

  // Obter detalhes de viagens e despesas extraordinárias
  const tripDetails = getTripDetailsForMonth(month.month, config.trips);
  const extraordinaryDetails = getExtraordinaryExpenseDetailsForMonth(month.month, config.extraordinaryExpenses);
  const extraordinaryIncomeDetails = getExtraordinaryIncomeDetailsForMonth(month.month, config.extraordinaryIncome);

  // Calcular total de investimentos
  const totalInvestments = Object.entries(month.investments).reduce((sum, [id, invData]) => {
    const realInvData = month.realData?.investments[id];
    return sum + (realInvData?.finalBalance ?? invData.finalBalance);
  }, 0);

  // Calcular totais das subcategorias
  const totalExtraordinaryIncome = extraordinaryIncomeDetails.reduce((sum, income) => sum + income.value, 0);
  const totalFixedExpenses = config.fixedExpenses.reduce((sum, expense) => sum + expense.value, 0);
  const totalExtraordinaryExpenses = extraordinaryDetails.reduce((sum, expense) => sum + expense.installmentValue, 0);
  const totalTripsExpenses = tripDetails.reduce((sum, detail) => sum + detail.preExpenses + detail.dailyBudgetTotal, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={formatMonthFull(month.month)}
      size="lg"
      headerActions={
        <button
          onClick={handleEdit}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
        >
          {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          <span>{isEditing ? 'Salvar' : 'Editar'}</span>
        </button>
      }
    >
      <div className="space-y-6">

        {/* Receitas */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-green-700 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              RECEITAS
            </h3>
            <span className="text-xl font-bold text-green-700">
              {formatCurrency(totalIncome)}
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-base">
              <span className="text-green-700 font-medium">Salário</span>
              {isEditing ? (
                <div className="w-40">
                  <CurrencyInput
                    value={realSalary}
                    onChange={setRealSalary}
                  />
                </div>
              ) : (
                <span className="text-green-700">{formatCurrency(displayIncome.salary)}</span>
              )}
            </div>
            <div>
              <div className="flex justify-between mb-1 text-base">
                <p className="text-green-700 font-medium">Extraordinárias</p>
                <span className="text-green-700">{formatCurrency(totalExtraordinaryIncome)}</span>
              </div>
              <div className="text-sm">
                {extraordinaryIncomeDetails.length > 0 ? (
                  extraordinaryIncomeDetails.map((income) => (
                    <div key={income.id} className="flex justify-between ml-4">
                      <span className="text-slate-500">{income.description}</span>
                      <span>{formatCurrency(income.value)}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between ml-4">
                    <span className="text-slate-400 italic">Nenhuma receita extraordinária</span>
                    <span>{formatCurrency(0)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Despesas */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              DESPESAS
            </h3>
            <span className="text-xl font-bold text-red-700">
              {formatCurrency(totalExpenses)}
            </span>
          </div>
          <div className="space-y-3">
            {/* Fixas */}
            <div>
              <div className="flex justify-between mb-1 text-base">
                <p className="text-red-700 font-medium">Fixas</p>
                <span className="text-red-700">{formatCurrency(totalFixedExpenses)}</span>
              </div>
              <div className="text-sm">
                {config.fixedExpenses.length > 0 ? (
                  config.fixedExpenses.map((expense) => (
                    <div key={expense.id} className="flex justify-between ml-4">
                      <span className="text-slate-500">{expense.name}</span>
                      <span>{formatCurrency(expense.value)}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between ml-4">
                    <span className="text-slate-400 italic">Nenhuma despesa fixa</span>
                    <span>{formatCurrency(0)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Extraordinárias */}
            <div>
              <div className="flex justify-between mb-1 text-base">
                <p className="text-red-700 font-medium">Extraordinárias</p>
                <span className="text-red-700">{formatCurrency(totalExtraordinaryExpenses)}</span>
              </div>
              <div className="text-sm">
                {extraordinaryDetails.length > 0 ? (
                  extraordinaryDetails.map((expense) => (
                    <div key={expense.id} className="flex justify-between ml-4">
                      <span className="text-slate-500">{expense.description}</span>
                      <span>{formatCurrency(expense.installmentValue)}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between ml-4">
                    <span className="text-slate-400 italic">Nenhuma despesa extraordinária</span>
                    <span>{formatCurrency(0)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Viagens */}
            <div>
              <div className="flex justify-between mb-1 text-base">
                <p className="text-red-700 font-medium">Viagens</p>
                <span className="text-red-700">{formatCurrency(totalTripsExpenses)}</span>
              </div>
              <div className="text-sm">
                {tripDetails.length > 0 ? (
                  tripDetails.map((detail) => (
                    <div key={detail.trip.id} className="ml-4 space-y-1">
                      <p className="text-slate-700">{detail.trip.name}</p>
                      {detail.preExpenses > 0 && (
                        <div className="flex justify-between ml-4">
                          <span className="text-slate-500">Gastos</span>
                          <span>{formatCurrency(detail.preExpenses)}</span>
                        </div>
                      )}
                      {detail.dailyBudgetTotal > 0 && (
                        <div className="flex justify-between ml-4">
                          <span className="text-slate-500">Orçamento diário ({detail.dailyBudgetDays} dias)</span>
                          <span>{formatCurrency(detail.dailyBudgetTotal)}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between ml-4">
                    <span className="text-slate-400 italic">Nenhuma viagem</span>
                    <span>{formatCurrency(0)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Cotidianas (CALCULADO) */}
            <div className="flex justify-between items-center text-base">
              <span className="text-red-700 font-medium">Cotidianas</span>
              {isEditing ? (
                <div className="w-40">
                  <CurrencyInput
                    value={realDailyExpenses}
                    onChange={setRealDailyExpenses}
                  />
                </div>
              ) : (
                <span className="text-red-700">
                  {formatCurrency(Math.max(0, isFinalized ? month.realData?.expenses.daily ?? dailyExpenses : dailyExpenses))}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Investimentos */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-purple-700 flex items-center gap-2">
              <PiggyBank className="w-5 h-5" />
              INVESTIMENTOS
            </h3>
            <span className="text-xl font-bold text-purple-700">
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
                    <p className="text-purple-700 font-medium">{investment.name}</p>
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
                      <span className="text-purple-700">{formatCurrency(displayFinalBalance)}</span>
                    )}
                  </div>
                  <div className="space-y-1 text-sm ml-4">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Saldo Anterior</span>
                      <span>{formatCurrency(invData.previousBalance)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Movimentações</span>
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
                        <span className={displayDeposit >= 0 ? "text-purple-600" : "text-purple-400"}>
                          {formatCurrency(displayDeposit)}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Rendimento</span>
                      {isFinalized || isEditing ? (
                        <span className="text-blue-600 italic">
                          {formatCurrency(calculatedYield)}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">a calcular</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Finalize Button */}
        {month.status === 'projected' && (
          <button
            onClick={handleFinalize}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Concretizar Mês</span>
          </button>
        )}
      </div>
    </Modal>
  );
}
