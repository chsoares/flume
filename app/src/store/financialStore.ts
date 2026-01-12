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
  getSalaryForMonth,
} from '../utils/calculations';
import { getSampleData } from '../utils/sampleData';
import { githubSync } from '../services/githubSync';

type SyncStatus = 'idle' | 'saving' | 'saved' | 'error';

interface FinancialStore extends FinancialState {
  // Sync status
  syncStatus: SyncStatus;
  lastSyncError: string | null;

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

  // Year management
  saveYearEndBalances: (year: number) => void;
  createNewYear: () => void;

  // Recalculations
  recalculateAllMonths: () => void;

  // Persistence
  persist: () => void;
  loadFromStorage: () => void;
  loadFromGitHub: () => Promise<void>;
  resetStore: () => void;
  loadSampleData: () => void;
}

const createDefaultState = (): FinancialState => ({
  year: 2026,
  availableYears: [2026],
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
  yearEndBalances: {},
});

// Debounce timer para GitHub sync
let githubSyncTimeout: ReturnType<typeof setTimeout> | null = null;
const GITHUB_SYNC_DEBOUNCE_MS = 2000; // 2 segundos

export const useFinancialStore = create<FinancialStore>((set, get) => ({
  ...createDefaultState(),
  syncStatus: 'idle' as SyncStatus,
  lastSyncError: null,

  persist: () => {
    const state = get();
    const { persist, loadFromStorage, loadFromGitHub, resetStore, recalculateAllMonths, syncStatus, lastSyncError, ...stateToSave } = state;

    // Sempre salvar no localStorage imediatamente (backup local)
    saveToLocalStorage(stateToSave);

    // Se autenticado com GitHub, sincronizar com debounce
    if (githubSync.isAuthenticated()) {
      // Limpar timer anterior se existir
      if (githubSyncTimeout) {
        clearTimeout(githubSyncTimeout);
      }

      // Marcar como "saving" (aguardando debounce)
      set({ syncStatus: 'saving', lastSyncError: null });

      // Criar novo timer para debounce
      githubSyncTimeout = setTimeout(async () => {
        try {
          await githubSync.save(stateToSave);
          set({ syncStatus: 'saved', lastSyncError: null });

          // Limpar status "saved" após 2 segundos
          setTimeout(() => {
            if (get().syncStatus === 'saved') {
              set({ syncStatus: 'idle' });
            }
          }, 2000);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          console.error('Erro ao sincronizar com GitHub:', error);
          set({ syncStatus: 'error', lastSyncError: errorMessage });
        }
      }, GITHUB_SYNC_DEBOUNCE_MS);
    }
  },

  loadFromStorage: async () => {
    // Se autenticado com GitHub, tentar carregar de lá primeiro
    if (githubSync.isAuthenticated()) {
      try {
        const githubData = await githubSync.load();
        if (githubData) {
          // Garantir que availableYears existe (para compatibilidade com dados antigos)
          if (!githubData.availableYears) {
            githubData.availableYears = [githubData.year];
          }
          set(githubData);
          // Também salvar no localStorage como backup
          saveToLocalStorage(githubData);
          return;
        }
      } catch (error) {
        console.error('Erro ao carregar do GitHub, usando localStorage:', error);
      }
    }

    // Fallback para localStorage
    const loaded = loadFromLocalStorage();
    if (loaded) {
      // Garantir que availableYears existe (para compatibilidade com dados antigos)
      if (!loaded.availableYears) {
        loaded.availableYears = [loaded.year];
      }
      set(loaded);
    }
  },

  loadFromGitHub: async () => {
    if (!githubSync.isAuthenticated()) {
      throw new Error('Não autenticado com GitHub');
    }

    try {
      const githubData = await githubSync.load();
      if (githubData) {
        // Garantir que availableYears existe
        if (!githubData.availableYears) {
          githubData.availableYears = [githubData.year];
        }
        set(githubData);
        // Recalcular os meses
        get().recalculateAllMonths();
        // Salvar no localStorage como backup
        const { persist, loadFromStorage, loadFromGitHub, resetStore, recalculateAllMonths, syncStatus, lastSyncError, ...stateToSave } = get();
        saveToLocalStorage(stateToSave);
      }
    } catch (error) {
      console.error('Erro ao carregar do GitHub:', error);
      throw error;
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

  createNewYear: () => {
    const state = get();
    const newYear = state.year + 1;

    // Verificar se dezembro está finalizado
    const decemberMonth = state.months.find((m) => m.month === `${state.year}-12`);
    if (!decemberMonth || decemberMonth.status !== 'finalized') {
      console.warn('Dezembro não está finalizado. Não é possível criar um novo ano.');
      return;
    }

    // Salvar saldos de fim de ano antes de criar novo ano
    get().saveYearEndBalances(state.year);

    // Consolidar aumentos do ano anterior no salário base
    const consolidatedSalary = getSalaryForMonth(`${state.year}-12`, state.config.salary);

    // Consolidar aumentos de despesas fixas do ano anterior
    const consolidatedFixedExpenses = state.config.fixedExpenses.map((expense) => {
      const sortedIncreases = [...expense.increases].sort((a, b) => a.month.localeCompare(b.month));

      let currentValue = expense.value;
      for (const increase of sortedIncreases) {
        if (increase.month <= `${state.year}-12`) {
          currentValue = increase.value;
        }
      }

      // Manter apenas aumentos futuros
      const futureIncreases = expense.increases.filter(inc => inc.month > `${state.year}-12`);

      return {
        ...expense,
        value: currentValue,
        increases: futureIncreases,
      };
    });

    // Filtrar receitas/despesas extraordinárias e viagens para o novo ano
    const newYearPrefix = `${newYear}-`;
    const filteredExtraordinaryIncome = state.config.extraordinaryIncome.filter(
      income => income.month.startsWith(newYearPrefix)
    );

    // Para despesas extraordinárias, manter as que ainda têm parcelas no novo ano
    const filteredExtraordinaryExpenses = state.config.extraordinaryExpenses.filter(expense => {
      const [startYear, startMonth] = expense.startMonth.split('-').map(Number);
      const endDate = new Date(startYear, startMonth - 1 + expense.installments, 0);
      const yearStart = new Date(newYear, 0, 1);

      return endDate >= yearStart;
    });

    set({
      year: newYear,
      availableYears: [...state.availableYears, newYear],
      config: {
        ...state.config,
        salary: {
          baseValue: consolidatedSalary,
          increases: state.config.salary.increases.filter(inc => inc.month > `${state.year}-12`),
        },
        fixedExpenses: consolidatedFixedExpenses,
        extraordinaryIncome: filteredExtraordinaryIncome,
        extraordinaryExpenses: filteredExtraordinaryExpenses,
      },
    });

    get().recalculateAllMonths();
    get().persist();
  },

  saveYearEndBalances: (year) => {
    const state = get();
    const decemberMonth = state.months.find((m) => m.month === `${year}-12`);

    if (!decemberMonth) return;

    const balances: { [investmentId: string]: number } = {};

    Object.entries(decemberMonth.investments).forEach(([id, invData]) => {
      // Usar realData se disponível, senão usar dados projetados
      const finalBalance = decemberMonth.realData?.investments[id]?.finalBalance ?? invData.finalBalance;
      balances[id] = finalBalance;
    });

    set((state) => ({
      yearEndBalances: {
        ...state.yearEndBalances,
        [year]: balances,
      },
    }));
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

    // Buscar saldos do ano anterior
    const previousYearBalances = state.yearEndBalances[state.year - 1];

    const newMonths = generateMonthsForYear(state.year, state.config, previousYearBalances);

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
