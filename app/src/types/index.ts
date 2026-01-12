// types/index.ts

export type MonthStatus = 'projected' | 'ongoing' | 'finalized';

export interface ScheduledIncrease {
  month: string; // format: 'YYYY-MM'
  value: number;
}

export interface SalaryConfig {
  baseValue: number;
  increases: ScheduledIncrease[];
}

export interface ExtraordinaryIncome {
  id: string;
  month: string; // format: 'YYYY-MM'
  description: string;
  value: number;
}

export interface FixedExpense {
  id: string;
  name: string;
  value: number;
  increases: ScheduledIncrease[];
}

export interface ExtraordinaryExpense {
  id: string;
  description: string;
  startMonth: string; // format: 'YYYY-MM'
  installments: number;
  installmentValue: number;
}

export interface Investment {
  id: string;
  name: string;
  minValueTarget: number | null; // valor mínimo antes de alocar em outros (null = sem mínimo)
  allocationPercent: number; // % de alocação após atingir mínimos
  initialBalance: number;
  withdrawalPriority: number; // prioridade para resgate (menor = maior prioridade)
}

export interface TripExpense {
  id: string;
  month: string; // format: 'YYYY-MM'
  description: string;
  installments: number;
  installmentValue: number;
}

export interface Trip {
  id: string;
  name: string;
  startDate: string; // format: 'YYYY-MM-DD'
  endDate: string; // format: 'YYYY-MM-DD'
  dailyBudget: number;
  preExpenses: TripExpense[]; // passagens, hotel, etc
}

export interface InvestmentMonthData {
  previousBalance: number;
  deposit: number;
  yield: number;
  finalBalance: number;
}

export interface MonthData {
  month: string; // format: 'YYYY-MM'
  status: MonthStatus;
  income: {
    salary: number;
    extraordinary: number;
  };
  expenses: {
    fixed: number;
    daily: number;
    extraordinary: number;
    trips: number;
  };
  investments: {
    [investmentId: string]: InvestmentMonthData;
  };
  // Valores reais (quando status = 'finalized')
  // Quando um mês é concretizado, TODOS os valores são congelados aqui
  // e não são mais afetados por mudanças nas configurações
  realData?: {
    income: {
      salary: number;
      extraordinary: { id: string; description: string; value: number }[];
    };
    expenses: {
      fixed: { id: string; name: string; value: number }[];
      daily: number;
      extraordinary: { id: string; description: string; value: number }[];
      trips: {
        id: string;
        name: string;
        items: { description: string; value: number }[];
      }[];
    };
    investments: {
      [investmentId: string]: {
        deposit: number; // Movimentações (aporte ou resgate)
        finalBalance: number; // Saldo final
        yield?: number; // Rendimento calculado: finalBalance - previousBalance - deposit
      };
    };
  };
}

export interface FinancialState {
  year: number;
  config: {
    salary: SalaryConfig;
    extraordinaryIncome: ExtraordinaryIncome[];
    fixedExpenses: FixedExpense[];
    dailyExpensesEstimate: number;
    extraordinaryExpenses: ExtraordinaryExpense[];
    investments: Investment[];
    trips: Trip[];
  };
  months: MonthData[];
}
