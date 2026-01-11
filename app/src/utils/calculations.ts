// utils/calculations.ts

import { differenceInDays, addMonths, format } from 'date-fns';
import type {
  FinancialState,
  MonthData,
  SalaryConfig,
  FixedExpense,
  ExtraordinaryExpense,
  Trip,
  Investment,
} from '../types';

/**
 * Obtém o salário para um mês específico, considerando aumentos programados
 */
export function getSalaryForMonth(monthStr: string, salaryConfig: SalaryConfig): number {
  const sortedIncreases = [...salaryConfig.increases].sort((a, b) => a.month.localeCompare(b.month));

  let currentSalary = salaryConfig.baseValue;

  for (const increase of sortedIncreases) {
    if (increase.month <= monthStr) {
      currentSalary = increase.value;
    } else {
      break;
    }
  }

  return currentSalary;
}

/**
 * Obtém o total de despesas fixas para um mês específico
 */
export function getFixedExpensesForMonth(
  monthStr: string,
  fixedExpenses: FixedExpense[]
): number {
  let total = 0;

  for (const expense of fixedExpenses) {
    const sortedIncreases = [...expense.increases].sort((a, b) => a.month.localeCompare(b.month));

    let currentValue = expense.value;

    for (const increase of sortedIncreases) {
      if (increase.month <= monthStr) {
        currentValue = increase.value;
      } else {
        break;
      }
    }

    total += currentValue;
  }

  return total;
}

/**
 * Verifica se um mês está dentro do range de uma despesa extraordinária
 */
function isMonthInExtraordinaryExpenseRange(
  monthStr: string,
  expense: ExtraordinaryExpense
): boolean {
  const [startYear, startMonth] = expense.startMonth.split('-').map(Number);
  const [year, month] = monthStr.split('-').map(Number);

  const startDate = new Date(startYear, startMonth - 1, 1);
  const endDate = addMonths(startDate, expense.installments - 1);
  const currentDate = new Date(year, month - 1, 1);

  return currentDate >= startDate && currentDate <= endDate;
}

/**
 * Calcula o total de despesas extraordinárias para um mês
 */
function getExtraordinaryExpensesForMonth(
  monthStr: string,
  extraordinaryExpenses: ExtraordinaryExpense[]
): number {
  let total = 0;

  for (const expense of extraordinaryExpenses) {
    if (isMonthInExtraordinaryExpenseRange(monthStr, expense)) {
      total += expense.installmentValue;
    }
  }

  return total;
}

/**
 * Calcula despesas de viagens para um mês específico
 */
function getTripExpensesForMonth(monthStr: string, trips: Trip[]): number {
  let total = 0;

  for (const trip of trips) {
    // Pré-gastos (passagens, hotel, etc)
    for (const preExpense of trip.preExpenses) {
      if (isMonthInExtraordinaryExpenseRange(monthStr, {
        id: preExpense.id,
        description: preExpense.description,
        startMonth: preExpense.month,
        installments: preExpense.installments,
        installmentValue: preExpense.installmentValue,
      })) {
        total += preExpense.installmentValue;
      }
    }

    // Gastos durante a viagem (orçamento diário proporcional aos dias no mês)
    const [year, month] = monthStr.split('-').map(Number);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);

    const tripStart = new Date(trip.startDate);
    const tripEnd = new Date(trip.endDate);

    // Verifica se a viagem ocorre neste mês
    if (tripStart <= monthEnd && tripEnd >= monthStart) {
      // Calcula os dias da viagem que caem dentro deste mês
      const effectiveStart = tripStart > monthStart ? tripStart : monthStart;
      const effectiveEnd = tripEnd < monthEnd ? tripEnd : monthEnd;
      const daysInThisMonth = differenceInDays(effectiveEnd, effectiveStart) + 1;

      total += daysInThisMonth * trip.dailyBudget;
    }
  }

  return total;
}

/**
 * Calcula receitas extraordinárias para um mês
 */
function getExtraordinaryIncomeForMonth(
  monthStr: string,
  config: FinancialState['config']
): number {
  return config.extraordinaryIncome
    .filter(income => income.month === monthStr)
    .reduce((sum, income) => sum + income.value, 0);
}

/**
 * Distribui aportes/resgates nos investimentos seguindo a estratégia definida
 */
function distributeInvestments(
  available: number,
  investments: Investment[],
  previousInvestments: MonthData['investments'] | null
): MonthData['investments'] {
  const result: MonthData['investments'] = {};

  // Inicializar investimentos com saldos anteriores
  for (const investment of investments) {
    const previousBalance = previousInvestments?.[investment.id]?.finalBalance ?? investment.initialBalance;
    result[investment.id] = {
      previousBalance,
      deposit: 0,
      yield: 0,
      finalBalance: previousBalance,
    };
  }

  // Se available é NEGATIVO, precisamos fazer RESGATES
  if (available < 0) {
    let remainingToWithdraw = Math.abs(available);

    // Ordenar investimentos por prioridade de resgate (menor número = maior prioridade)
    const sortedByPriority = [...investments].sort((a, b) => a.withdrawalPriority - b.withdrawalPriority);

    for (const investment of sortedByPriority) {
      if (remainingToWithdraw <= 0) break;

      const currentBalance = result[investment.id].previousBalance;
      const canWithdraw = Math.min(currentBalance, remainingToWithdraw);

      if (canWithdraw > 0) {
        result[investment.id].deposit = -canWithdraw; // Negativo = resgate
        remainingToWithdraw -= canWithdraw;
      }
    }
  }
  // Se available é POSITIVO, fazemos APORTES
  else if (available > 0) {
    let remainingAvailable = available;

    // Fase 1: Aportar nos investimentos que não atingiram o mínimo
    for (const investment of investments) {
      if (investment.minValueTarget !== null && remainingAvailable > 0) {
        const currentBalance = result[investment.id].previousBalance;

        if (currentBalance < investment.minValueTarget) {
          const needed = investment.minValueTarget - currentBalance;
          const toDeposit = Math.min(remainingAvailable, needed);
          result[investment.id].deposit = toDeposit;
          remainingAvailable -= toDeposit;
        }
      }
    }

    // Fase 2: Distribuir o restante proporcionalmente pela alocação
    if (remainingAvailable > 0) {
      for (const investment of investments) {
        const depositAmount = remainingAvailable * (investment.allocationPercent / 100);
        result[investment.id].deposit += depositAmount;
      }
    }
  }

  // Saldos finais (rendimentos serão calculados pós-concretização)
  for (const investment of investments) {
    const data = result[investment.id];
    data.yield = 0; // Rendimento será calculado apenas após concretização
    data.finalBalance = data.previousBalance + data.deposit;
  }

  return result;
}

/**
 * Calcula o total de aportes realizados (sem considerar rendimentos)
 */
function getTotalDeposits(investments: MonthData['investments']): number {
  return Object.values(investments).reduce((sum, inv) => sum + inv.deposit, 0);
}

/**
 * Calcula os dados projetados de um mês
 */
export function calculateProjectedMonth(
  monthStr: string,
  config: FinancialState['config'],
  previousMonthInvestments: MonthData['investments'] | null
): MonthData {
  // 1. Calcular receitas
  const salary = getSalaryForMonth(monthStr, config.salary);
  const extraordinary = getExtraordinaryIncomeForMonth(monthStr, config);
  const totalIncome = salary + extraordinary;

  // 2. Calcular despesas
  const fixedExpenses = getFixedExpensesForMonth(monthStr, config.fixedExpenses);
  const dailyExpenses = config.dailyExpensesEstimate; // Usar estimativa configurada
  const extraordinaryExpenses = getExtraordinaryExpensesForMonth(monthStr, config.extraordinaryExpenses);
  const tripExpenses = getTripExpensesForMonth(monthStr, config.trips);

  // 3. Calcular disponível para investimentos
  const availableForInvestments = totalIncome - fixedExpenses - dailyExpenses - extraordinaryExpenses - tripExpenses;

  // 4. Distribuir investimentos
  const investments = distributeInvestments(
    availableForInvestments,
    config.investments,
    previousMonthInvestments
  );

  return {
    month: monthStr,
    status: 'projected',
    income: {
      salary,
      extraordinary,
    },
    expenses: {
      fixed: fixedExpenses,
      daily: dailyExpenses,
      extraordinary: extraordinaryExpenses,
      trips: tripExpenses,
    },
    investments,
  };
}

/**
 * Gera todos os meses de um ano
 */
export function generateMonthsForYear(
  year: number,
  config: FinancialState['config']
): MonthData[] {
  const months: MonthData[] = [];
  let previousInvestments: MonthData['investments'] | null = null;

  for (let month = 1; month <= 12; month++) {
    const monthStr = format(new Date(year, month - 1, 1), 'yyyy-MM');
    const monthData = calculateProjectedMonth(monthStr, config, previousInvestments);
    months.push(monthData);
    previousInvestments = monthData.investments;
  }

  return months;
}

/**
 * Recalcula a estimativa de despesas cotidianas baseada no histórico real
 */
export function recalculateDailyExpenses(
  months: MonthData[],
  period: 'all' | 3 | 6 | 12
): number {
  const finalizedMonths = months.filter(m => m.status === 'finalized' && m.realData);

  let monthsToConsider = finalizedMonths;

  if (period !== 'all' && finalizedMonths.length > period) {
    monthsToConsider = finalizedMonths.slice(-period);
  }

  if (monthsToConsider.length === 0) {
    return 0;
  }

  const sum = monthsToConsider.reduce((acc, m) => acc + (m.realData?.expenses.daily ?? 0), 0);
  return sum / monthsToConsider.length;
}

/**
 * Obtém detalhes de viagens para um mês específico
 */
export function getTripDetailsForMonth(monthStr: string, trips: Trip[]): Array<{
  trip: Trip;
  preExpenses: number;
  dailyBudgetDays: number;
  dailyBudgetTotal: number;
}> {
  const details = [];

  for (const trip of trips) {
    let preExpenses = 0;
    let dailyBudgetDays = 0;
    let dailyBudgetTotal = 0;

    // Calcular pré-gastos
    for (const preExpense of trip.preExpenses) {
      if (isMonthInExtraordinaryExpenseRange(monthStr, {
        id: preExpense.id,
        description: preExpense.description,
        startMonth: preExpense.month,
        installments: preExpense.installments,
        installmentValue: preExpense.installmentValue,
      })) {
        preExpenses += preExpense.installmentValue;
      }
    }

    // Calcular orçamento diário
    const [year, month] = monthStr.split('-').map(Number);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);

    const tripStart = new Date(trip.startDate);
    const tripEnd = new Date(trip.endDate);

    if (tripStart <= monthEnd && tripEnd >= monthStart) {
      const effectiveStart = tripStart > monthStart ? tripStart : monthStart;
      const effectiveEnd = tripEnd < monthEnd ? tripEnd : monthEnd;
      dailyBudgetDays = differenceInDays(effectiveEnd, effectiveStart) + 1;
      dailyBudgetTotal = dailyBudgetDays * trip.dailyBudget;
    }

    // Adicionar apenas se houver alguma despesa neste mês
    if (preExpenses > 0 || dailyBudgetTotal > 0) {
      details.push({ trip, preExpenses, dailyBudgetDays, dailyBudgetTotal });
    }
  }

  return details;
}

/**
 * Obtém detalhes de despesas extraordinárias para um mês específico
 */
export function getExtraordinaryExpenseDetailsForMonth(
  monthStr: string,
  extraordinaryExpenses: ExtraordinaryExpense[]
): ExtraordinaryExpense[] {
  return extraordinaryExpenses.filter(expense =>
    isMonthInExtraordinaryExpenseRange(monthStr, expense)
  );
}
