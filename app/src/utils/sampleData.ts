// utils/sampleData.ts

import type { FinancialState } from '../types';
import { generateUUID } from './formatters';

export function getSampleData(): FinancialState {
  const year = 2026;

  return {
    year,
    config: {
      // Salário base: R$ 8.500,00 líquido
      salary: {
        baseValue: 8500,
        increases: [
          {
            month: '2026-07', // Julho
            value: 9200, // Aumento de ~R$ 700
          },
        ],
      },

      // Receitas extraordinárias
      extraordinaryIncome: [
        {
          id: generateUUID(),
          month: '2026-12',
          description: 'Bônus de Final de Ano',
          value: 5000,
        },
      ],

      // Despesas fixas
      fixedExpenses: [
        {
          id: generateUUID(),
          name: 'Cartão de Crédito',
          value: 6000,
          increases: [],
        },
        {
          id: generateUUID(),
          name: 'Plano de Saúde',
          value: 800,
          increases: [],
        },
        {
          id: generateUUID(),
          name: 'Condomínio',
          value: 600,
          increases: [],
        },
      ],

      // Estimativa de despesas cotidianas
      dailyExpensesEstimate: 1500,

      // Despesas extraordinárias (parcelas)
      extraordinaryExpenses: [
        {
          id: generateUUID(),
          description: 'Parcela Fixa 1', // até abril
          startMonth: '2026-01',
          installments: 4,
          installmentValue: 4000,
        },
        {
          id: generateUUID(),
          description: 'Parcela Fixa 2', // o ano todo
          startMonth: '2026-01',
          installments: 12,
          installmentValue: 3200,
        },
      ],

      // Investimentos
      investments: [
        {
          id: generateUUID(),
          name: 'CDB',
          minValueTarget: 30000, // Meta: R$ 30k
          allocationPercent: 20, // 20% após atingir meta
          initialBalance: 2000,
          withdrawalPriority: 1, // Primeiro a ser resgatado
        },
        {
          id: generateUUID(),
          name: 'Tesouro Direto',
          minValueTarget: null, // Sem meta mínima
          allocationPercent: 80, // 80% após CDB atingir meta
          initialBalance: 55000,
          withdrawalPriority: 2, // Segundo a ser resgatado
        },
      ],

      // Viagens
      trips: [
        {
          id: generateUUID(),
          name: 'Buenos Aires',
          startDate: '2026-03-15',
          endDate: '2026-03-22', // 7 dias
          dailyBudget: 400, // R$ 400/dia (alimentação + passeios)
          preExpenses: [
            {
              id: generateUUID(),
              month: '2026-02',
              description: 'Passagem Aérea Buenos Aires',
              installments: 1,
              installmentValue: 1800,
            },
            {
              id: generateUUID(),
              month: '2026-02',
              description: 'Hotel Buenos Aires',
              installments: 1,
              installmentValue: 2100,
            },
          ],
        },
        {
          id: generateUUID(),
          name: 'Nordeste',
          startDate: '2026-07-10',
          endDate: '2026-07-20', // 10 dias
          dailyBudget: 350, // R$ 350/dia
          preExpenses: [
            {
              id: generateUUID(),
              month: '2026-05',
              description: 'Passagem Aérea Nordeste',
              installments: 1,
              installmentValue: 1200,
            },
            {
              id: generateUUID(),
              month: '2026-06',
              description: 'Resort Nordeste (entrada)',
              installments: 1,
              installmentValue: 2500,
            },
          ],
        },
      ],
    },
    months: [],
    availableYears: [year],
    yearEndBalances: {},
  };
}
