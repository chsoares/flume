// utils/persistence.ts

import type { FinancialState } from '../types';

const STORAGE_KEY = 'flumen-financial-data';

export function saveToLocalStorage(state: FinancialState): void {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function loadFromLocalStorage(): FinancialState | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (serialized === null) {
      return null;
    }
    return JSON.parse(serialized);
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
}

export function exportToJSON(state: FinancialState): string {
  return JSON.stringify(state, null, 2);
}

export function importFromJSON(json: string): FinancialState {
  return JSON.parse(json);
}

export function clearLocalStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}
