// hooks/useAutoSave.ts

import { useEffect, useRef } from 'react';
import { useFinancialStore } from '../store/financialStore';

/**
 * Hook que garante auto-save automático do estado
 * Nota: Como o store Zustand já chama persist() em cada action,
 * este hook é principalmente para garantir que qualquer mudança
 * não capturada seja salva.
 */
export function useAutoSave() {
  const store = useFinancialStore();
  const prevStateRef = useRef(store);

  useEffect(() => {
    // Comparar se houve mudança
    if (prevStateRef.current !== store) {
      store.persist();
      prevStateRef.current = store;
    }
  }, [store]);
}
