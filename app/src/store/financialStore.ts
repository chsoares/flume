// store/financialStore.ts

import { create } from 'zustand';
import type {
  FinancialState,
  MonthData,
  SalaryConfig,
  ExtraordinaryIncome,
  FixedExpense,
  ExtraordinaryExpense,
  Investment,
  Trip,
  MonthStatus,
} from '../types';
import { saveToLocalStorage, loadFromLocalStorage } from '../utils/persistence';
import {
  generateMonthsForYear,
  getTripDetailsForMonth,
  getExtraordinaryExpenseDetailsForMonth,
  getExtraordinaryIncomeDetailsForMonth,
} from '../utils/calculations';
import { getSampleData } from '../utils/sampleData';

interface FinancialStore extends FinancialState {
  // Actions
  setYear: (year: number) => void;

  // Salary
  updateSalary: (salary: SalaryConfig) => void;

  // Extraordinary Income
  addExtraordinaryIncome: (income: ExtraordinaryIncome) => void;
  updateExtraordinaryIncome: (id: string, income: Partial<ExtraordinaryIncome>) => void;
  removeExtraordinaryIncome: (id: string) => void;

  // Fixed Expenses
  addFixedExpense: (expense: FixedExpense) => void;
  updateFixedExpense: (id: string, expense: Partial<FixedExpense>) => void;
  removeFixedExpense: (id: string) => void;

  // Daily Expenses
  updateDailyExpensesEstimate: (value: number) => void;

  // Extraordinary Expenses
  addExtraordinaryExpense: (expense: ExtraordinaryExpense) => void;
  updateExtraordinaryExpense: (id: string, expense: Partial<ExtraordinaryExpense>) => void;
  removeExtraordinaryExpense: (id: string) => void;

  // Investments
  addInvestment: (investment: Investment) => void;
  updateInvestment: (id: string, investment: Partial<Investment>) => void;
  removeInvestment: (id: string) => void;

  // Trips
  addTrip: (trip: Trip) => void;
  updateTrip: (id: string, trip: Partial<Trip>) => void;
  removeTrip: (id: string) => void;

  // Months
  finalizeMonth: (monthStr: string) => void;
  revertMonth: (monthStr: string) => void;
  updateMonthRealData: (monthStr: string, realData: MonthData['realData']) => void;

  // Recalculations
  recalculateAllMonths: () => void;

  // Persistence
  persist: () => void;
  loadFromStorage: () => void;
  resetStore: () => void;
  loadSampleData: () => void;
}

const createDefaultState = (): FinancialState => ({
  year: new Date().getFullYear(),
  config: {
    salary: {
      baseValue: 0,
      increases: [],
    },
    extraordinaryIncome: [],
    fixedExpenses: [],
    dailyExpensesEstimate: 0,
    extraordinaryExpenses: [],
    investments: [],
    trips: [],
  },
  months: [],
});

export const useFinancialStore = create<FinancialStore>((set, get) => ({
  ...createDefaultState(),

  persist: () => {
    const state = get();
    const { persist, loadFromStorage, resetStore, recalculateAllMonths, ...stateToSave } = state;
    saveToLocalStorage(stateToSave);
  },

  loadFromStorage: () => {
    const loaded = loadFromLocalStorage();
    if (loaded) {
      set(loaded);
    }
  },

  resetStore: () => {
    set(createDefaultState());
    get().persist();
  },

  loadSampleData: () => {
    const sampleData = getSampleData();
    set(sampleData);
    get().recalculateAllMonths();
    get().persist();
  },

  setYear: (year) => {
    set({ year });
    get().recalculateAllMonths();
    get().persist();
  },

  updateSalary: (salary) => {
    set((state) => ({
      config: { ...state.config, salary },
    }));
    get().recalculateAllMonths();
    get().persist();
  },

  addExtraordinaryIncome: (income) => {
    set((state) => ({
      config: {
        ...state.config,
        extraordinaryIncome: [...state.config.extraordinaryIncome, income],
      },
    }));
    get().recalculateAllMonths();
    get().persist();
  },

  updateExtraordinaryIncome: (id, incomeUpdate) => {
    set((state) => ({
      config: {
        ...state.config,
        extraordinaryIncome: state.config.extraordinaryIncome.map((item) =>
          item.id === id ? { ...item, ...incomeUpdate } : item
        ),
      },
    }));
    get().recalculateAllMonths();
    get().persist();
  },

  removeExtraordinaryIncome: (id) => {
    set((state) => ({
      config: {
        ...state.config,
        extraordinaryIncome: state.config.extraordinaryIncome.filter((item) => item.id !== id),
      },
    }));
    get().recalculateAllMonths();
    get().persist();
  },

  addFixedExpense: (expense) => {
    set((state) => ({
      config: {
        ...state.config,
        fixedExpenses: [...state.config.fixedExpenses, expense],
      },
    }));
    get().recalculateAllMonths();
    get().persist();
  },

  updateFixedExpense: (id, expenseUpdate) => {
    set((state) => ({
      config: {
        ...state.config,
        fixedExpenses: state.config.fixedExpenses.map((item) =>
          item.id === id ? { ...item, ...expenseUpdate } : item
        ),
      },
    }));
    get().recalculateAllMonths();
    get().persist();
  },

  removeFixedExpense: (id) => {
    set((state) => ({
      config: {
        ...state.config,
        fixedExpenses: state.config.fixedExpenses.filter((item) => item.id !== id),
      },
    }));
    get().recalculateAllMonths();
    get().persist();
  },

  updateDailyExpensesEstimate: (value) => {
    set((state) => ({
      config: { ...state.config, dailyExpensesEstimate: value },
    }));
    get().recalculateAllMonths();
    get().persist();
  },

  addExtraordinaryExpense: (expense) => {
    set((state) => ({
      config: {
        ...state.config,
        extraordinaryExpenses: [...state.config.extraordinaryExpenses, expense],
      },
    }));
    get().recalculateAllMonths();
    get().persist();
  },

  updateExtraordinaryExpense: (id, expenseUpdate) => {
    set((state) => ({
      config: {
        ...state.config,
        extraordinaryExpenses: state.config.extraordinaryExpenses.map((item) =>
          item.id === id ? { ...item, ...expenseUpdate } : item
        ),
      },
    }));
    get().recalculateAllMonths();
    get().persist();
  },

  removeExtraordinaryExpense: (id) => {
    set((state) => ({
      config: {
        ...state.config,
        extraordinaryExpenses: state.config.extraordinaryExpenses.filter((item) => item.id !== id),
      },
    }));
    get().recalculateAllMonths();
    get().persist();
  },

  addInvestment: (investment) => {
    set((state) => ({
      config: {
        ...state.config,
        investments: [...state.config.investments, investment],
      },
    }));
    get().recalculateAllMonths();
    get().persist();
  },

  updateInvestment: (id, investmentUpdate) => {
    set((state) => ({
      config: {
        ...state.config,
        investments: state.config.investments.map((item) =>
          item.id === id ? { ...item, ...investmentUpdate } : item
        ),
      },
    }));
    get().recalculateAllMonths();
    get().persist();
  },

  removeInvestment: (id) => {
    set((state) => ({
      config: {
        ...state.config,
        investments: state.config.investments.filter((item) => item.id !== id),
      },
    }));
    get().recalculateAllMonths();
    get().persist();
  },

  addTrip: (trip) => {
    set((state) => ({
      config: {
        ...state.config,
        trips: [...state.config.trips, trip],
      },
    }));
    get().recalculateAllMonths();
    get().persist();
  },

  updateTrip: (id, tripUpdate) => {
    set((state) => ({
      config: {
        ...state.config,
        trips: state.config.trips.map((item) =>
          item.id === id ? { ...item, ...tripUpdate } : item
        ),
      },
    }));
    get().recalculateAllMonths();
    get().persist();
  },

  removeTrip: (id) => {
    set((state) => ({
      config: {
        ...state.config,
        trips: state.config.trips.filter((item) => item.id !== id),
      },
    }));
    get().recalculateAllMonths();
    get().persist();
  },

  finalizeMonth: (monthStr) => {
    const state = get();
    const month = state.months.find((m) => m.month === monthStr);
    if (!month) return;

    // Capturar receitas extraordinárias
    const extraordinaryIncomeDetails = getExtraordinaryIncomeDetailsForMonth(
      monthStr,
      state.config.extraordinaryIncome
    );

    // Capturar despesas fixas
    const fixedExpensesDetails = state.config.fixedExpenses.map((expense) => ({
      id: expense.id,
      name: expense.name,
      value: expense.value,
    }));

    // Capturar despesas extraordinárias
    const extraordinaryExpenseDetails = getExtraordinaryExpenseDetailsForMonth(
      monthStr,
      state.config.extraordinaryExpenses
    ).map((expense) => ({
      id: expense.id,
      description: expense.description,
      value: expense.installmentValue,
    }));

    // Capturar despesas de viagens
    const tripDetails = getTripDetailsForMonth(monthStr, state.config.trips).map((detail) => {
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

    set((state) => ({
      months: state.months.map((m) =>
        m.month === monthStr
          ? {
              ...m,
              status: 'finalized' as MonthStatus,
              realData: {
                income: {
                  salary: m.income.salary,
                  extraordinary: extraordinaryIncomeDetails.map((income) => ({
                    id: income.id,
                    description: income.description,
                    value: income.value,
                  })),
                },
                expenses: {
                  fixed: fixedExpensesDetails,
                  daily: m.expenses.daily,
                  extraordinary: extraordinaryExpenseDetails,
                  trips: tripDetails,
                },
                investments: Object.fromEntries(
                  Object.entries(m.investments).map(([id, inv]) => {
                    const calculatedYield = inv.finalBalance - inv.previousBalance - inv.deposit;
                    return [
                      id,
                      {
                        deposit: inv.deposit,
                        finalBalance: inv.finalBalance,
                        yield: calculatedYield,
                      },
                    ];
                  })
                ),
              },
            }
          : m
      ),
    }));
    get().persist();
  },

  revertMonth: (monthStr) => {
    set((state) => ({
      months: state.months.map((m) =>
        m.month === monthStr
          ? {
              ...m,
              status: 'projected' as MonthStatus,
              realData: undefined,
            }
          : m
      ),
    }));
    get().recalculateAllMonths();
    get().persist();
  },

  updateMonthRealData: (monthStr, realData) => {
    set((state) => ({
      months: state.months.map((m) =>
        m.month === monthStr ? { ...m, realData } : m
      ),
    }));
    get().persist();
  },

  recalculateAllMonths: () => {
    const state = get();
    const newMonths = generateMonthsForYear(state.year, state.config);

    // Preservar realData dos meses já finalizados
    const preservedMonths = newMonths.map((newMonth) => {
      const oldMonth = state.months.find((m) => m.month === newMonth.month);
      if (oldMonth && oldMonth.status === 'finalized' && oldMonth.realData) {
        return {
          ...newMonth,
          status: 'finalized' as MonthStatus,
          realData: oldMonth.realData,
        };
      }
      return newMonth;
    });

    set({ months: preservedMonths });
  },
}));
