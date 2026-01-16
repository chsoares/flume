// components/income/SalaryConfig.tsx

import { useState } from 'react';
import { useFinancialStore } from '../../store/financialStore';
import { CurrencyInput } from '../shared/CurrencyInput';
import { MonthPicker } from '../shared/MonthPicker';
import { formatCurrency } from '../../utils/formatters';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';

export function SalaryConfig() {
  const { config, updateSalary } = useFinancialStore();
  const [baseValue, setBaseValue] = useState(config.salary.baseValue);
  const [isAddingIncrease, setIsAddingIncrease] = useState(false);
  const [newIncreaseMonth, setNewIncreaseMonth] = useState('');
  const [newIncreaseValue, setNewIncreaseValue] = useState(0);

  const [editingMonth, setEditingMonth] = useState<string | null>(null);
  const [editIncreaseValue, setEditIncreaseValue] = useState(0);

  function handleUpdateBase() {
    updateSalary({
      ...config.salary,
      baseValue,
    });
  }

  function handleAddIncrease() {
    if (!newIncreaseMonth || newIncreaseValue <= 0) {
      alert('Preencha o mês e o valor do aumento');
      return;
    }

    updateSalary({
      ...config.salary,
      increases: [
        ...config.salary.increases,
        { month: newIncreaseMonth, value: newIncreaseValue },
      ].sort((a, b) => a.month.localeCompare(b.month)),
    });

    setNewIncreaseMonth('');
    setNewIncreaseValue(0);
    setIsAddingIncrease(false);
  }

  function handleCancelIncrease() {
    setNewIncreaseMonth('');
    setNewIncreaseValue(0);
    setIsAddingIncrease(false);
  }

  function handleRemoveIncrease(month: string) {
    updateSalary({
      ...config.salary,
      increases: config.salary.increases.filter((inc) => inc.month !== month),
    });
  }

  function handleStartEdit(month: string, value: number) {
    setEditingMonth(month);
    setEditIncreaseValue(value);
  }

  function handleSaveEdit() {
    if (!editingMonth) return;

    updateSalary({
      ...config.salary,
      increases: config.salary.increases.map((inc) =>
        inc.month === editingMonth ? { ...inc, value: editIncreaseValue } : inc
      ),
    });

    setEditingMonth(null);
  }

  function handleCancelEdit() {
    setEditingMonth(null);
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
      <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-6 border-b pb-3">
        Salário Líquido Mensal
      </h3>

      {/* Base Salary */}
      <div className="mb-6 flex gap-3 items-end">
        <CurrencyInput
          label="Salário Base Líquido"
          value={baseValue}
          onChange={setBaseValue}
          className="flex-1"
        />
        <button
          onClick={handleUpdateBase}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          Atualizar
        </button>
      </div>

      {/* Scheduled Increases */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-slate-700">Aumentos Programados</h4>
          <button
            onClick={() => setIsAddingIncrease(!isAddingIncrease)}
            className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar</span>
          </button>
        </div>

        {config.salary.increases.length > 0 || isAddingIncrease ? (
          <div className="border rounded-lg overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[400px] text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-center text-slate-600">Mês</th>
                  <th className="px-4 py-3 text-right text-slate-600">Novo Valor</th>
                  <th className="px-4 py-3 text-center text-slate-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isAddingIncrease && (
                  <tr className="bg-green-50">
                    <td className="px-4 py-2">
                      <MonthPicker
                        value={newIncreaseMonth}
                        onChange={setNewIncreaseMonth}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <CurrencyInput
                        value={newIncreaseValue}
                        onChange={setNewIncreaseValue}
                        compact
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={handleAddIncrease}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                        >
                          Adicionar
                        </button>
                        <button
                          onClick={handleCancelIncrease}
                          className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs"
                        >
                          Cancelar
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
                {config.salary.increases.map((increase) => (
                  <tr key={increase.month} className="hover:bg-slate-50">
                    {editingMonth === increase.month ? (
                      <>
                        <td className="px-4 py-2 text-center">{increase.month}</td>
                        <td className="px-4 py-2">
                          <CurrencyInput
                            value={editIncreaseValue}
                            onChange={setEditIncreaseValue}
                            compact
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <div className="flex gap-1 justify-center">
                            <button
                              onClick={handleSaveEdit}
                              className="p-1 hover:bg-green-100 rounded text-green-600"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 hover:bg-slate-100 rounded text-slate-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-2 text-center">{increase.month}</td>
                        <td className="px-4 py-2 text-right font-bold text-green-600">
                          {formatCurrency(increase.value)}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <div className="flex gap-1 justify-center">
                            <button
                              onClick={() => handleStartEdit(increase.month, increase.value)}
                              className="p-1 hover:bg-blue-100 rounded text-blue-600"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveIncrease(increase.month)}
                              className="p-1 hover:bg-red-100 rounded text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-slate-500 py-4 italic text-sm">
            Nenhum aumento programado
          </p>
        )}
      </div>
    </div>
  );
}
