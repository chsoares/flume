// components/shared/MonthPicker.tsx

interface MonthPickerProps {
  value: string; // 'YYYY-MM'
  onChange: (value: string) => void;
  label?: string;
  minDate?: string;
  maxDate?: string;
  className?: string;
}

const MONTHS = [
  { value: '01', label: 'Jan' },
  { value: '02', label: 'Fev' },
  { value: '03', label: 'Mar' },
  { value: '04', label: 'Abr' },
  { value: '05', label: 'Mai' },
  { value: '06', label: 'Jun' },
  { value: '07', label: 'Jul' },
  { value: '08', label: 'Ago' },
  { value: '09', label: 'Set' },
  { value: '10', label: 'Out' },
  { value: '11', label: 'Nov' },
  { value: '12', label: 'Dez' },
];

export function MonthPicker({
  value,
  onChange,
  label,
  minDate,
  maxDate,
  className = '',
}: MonthPickerProps) {
  const currentYear = new Date().getFullYear();
  const startYear = 2026;
  const years = Array.from({ length: 10 }, (_, i) => startYear + i);

  const [year, month] = value ? value.split('-') : ['', ''];

  function handleMonthChange(newMonth: string) {
    if (year) {
      onChange(`${year}-${newMonth}`);
    }
  }

  function handleYearChange(newYear: string) {
    const selectedMonth = month || '01';
    onChange(`${newYear}-${selectedMonth}`);
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-slate-600 mb-1">
          {label}
        </label>
      )}
      <div className="flex gap-2">
        <select
          value={month}
          onChange={(e) => handleMonthChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="">Mês</option>
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => handleYearChange(e.target.value)}
          className="w-24 px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="">Ano</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
