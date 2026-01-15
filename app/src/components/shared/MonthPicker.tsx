// components/shared/MonthPicker.tsx

interface MonthPickerProps {
  value: string; // 'YYYY-MM'
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

const MONTHS = [
  { value: '01', label: '01' },
  { value: '02', label: '02' },
  { value: '03', label: '03' },
  { value: '04', label: '04' },
  { value: '05', label: '05' },
  { value: '06', label: '06' },
  { value: '07', label: '07' },
  { value: '08', label: '08' },
  { value: '09', label: '09' },
  { value: '10', label: '10' },
  { value: '11', label: '11' },
  { value: '12', label: '12' },
];

export function MonthPicker({
  value,
  onChange,
  label,
  className = '',
}: MonthPickerProps) {
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
      <div className="flex gap-1 items-center">
        <select
          value={year}
          onChange={(e) => handleYearChange(e.target.value)}
          className="px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
        >
          <option value="">Ano</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <span className="text-slate-400">-</span>
        <select
          value={month}
          onChange={(e) => handleMonthChange(e.target.value)}
          className="px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
        >
          <option value="">Mês</option>
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
