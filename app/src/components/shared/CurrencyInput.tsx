// components/shared/CurrencyInput.tsx

import { useState, useEffect } from 'react';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowNegative?: boolean;
  compact?: boolean;
}

export function CurrencyInput({
  value,
  onChange,
  label,
  placeholder = 'R$ 0,00',
  disabled = false,
  className = '',
  allowNegative = false,
  compact = false,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    setDisplayValue(formatCurrencyForDisplay(value));
  }, [value]);

  function formatCurrencyForDisplay(num: number): string {
    const formatted = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(num));

    return num < 0 ? `-${formatted}` : formatted;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const inputValue = e.target.value;

    // Verifica se é negativo
    const isNegative = allowNegative && inputValue.includes('-');

    // Remove tudo exceto dígitos
    const numbers = inputValue.replace(/\D/g, '');

    // Converte para número (dividindo por 100 para considerar centavos)
    let numValue = parseFloat(numbers) / 100 || 0;

    // Aplica sinal negativo se necessário
    if (isNegative) {
      numValue = -numValue;
    }

    // Atualiza o valor formatado
    setDisplayValue(formatCurrencyForDisplay(numValue));

    // Chama o onChange com o valor numérico
    onChange(numValue);
  }

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <span className="absolute left-2 top-1 text-slate-400 text-sm">R$</span>
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-8 pr-2 py-1 border border-slate-300 rounded text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
        />
      </div>
    );
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-slate-600 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <span className="absolute left-3 top-2 text-slate-400">R$</span>
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}
