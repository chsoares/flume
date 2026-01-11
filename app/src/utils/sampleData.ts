// utils/sampleData.ts

import type { FinancialState } from '../types';
import { generateUUID } from './formatters';

export function getSampleData(): FinancialState {
  const year = 2026;

  return {
    year,
    config: {
      // Salário base: R$ 15.611,00 líquido (bruto: R$ 22.661,00)
      salary: {
        baseValue: 15611,
        increases: [
          {
            month: '2026-05', // Maio
            value: 17050, // Aumento de R$ 2000 bruto = ~R$ 1439 líquido (mesma taxa de desconto)
          },
        ],
      },

      // Receitas extraordinárias
      extraordinaryIncome: [
        {
          id: generateUUID(),
          month: '2026-02',
          description: 'Dinheiro dos Pais (Viagem Londres)',
          value: 15000,
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
          name: 'Tesouro Direto (VT)',
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
          name: 'Londres',
          startDate: '2026-02-01',
          endDate: '2026-02-15', // 15 dias
          dailyBudget: (50 + 30) * 7.2, // (50 GBP alimentação + 30 GBP lazer) × câmbio 7.2
          preExpenses: [], // Sem pré-gastos registrados no prototype
        },
        {
          id: generateUUID(),
          name: 'Tailândia',
          startDate: '2026-11-01',
          endDate: '2026-11-12', // 12 dias
          dailyBudget: 300,
          preExpenses: [
            {
              id: generateUUID(),
              month: '2026-01',
              description: 'Pacote Tailândia (20%)',
              installments: 1,
              installmentValue: 3390 * 0.2 * 5.8, // 20% de 3390 USD
            },
            {
              id: generateUUID(),
              month: '2026-05',
              description: 'Passagem Tailândia',
              installments: 1,
              installmentValue: 1500 * 5.8, // 1500 USD
            },
            {
              id: generateUUID(),
              month: '2026-08',
              description: 'Pacote Tailândia (30%)',
              installments: 1,
              installmentValue: 3390 * 0.3 * 5.8, // 30% de 3390 USD
            },
            {
              id: generateUUID(),
              month: '2026-09',
              description: 'Pacote Tailândia (20%)',
              installments: 1,
              installmentValue: 3390 * 0.2 * 5.8, // 20% de 3390 USD
            },
            {
              id: generateUUID(),
              month: '2026-10',
              description: 'Pacote Tailândia (30%)',
              installments: 1,
              installmentValue: 3390 * 0.3 * 5.8, // 30% de 3390 USD
            },
          ],
        },
      ],
    },
    months: [],
  };
}
