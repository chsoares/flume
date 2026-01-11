// utils/formatters.ts

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return format(date, 'MMM/yy', { locale: ptBR });
}

export function formatMonthFull(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return format(date, 'MMMM yyyy', { locale: ptBR });
}

export function parseMonthString(date: Date): string {
  return format(date, 'yyyy-MM');
}

export function generateUUID(): string {
  return crypto.randomUUID();
}
