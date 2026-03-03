// components/income/SalaryConfig.tsx

import { useState } from 'react';
import { useFinancialStore } from '../../store/financialStore';
import { CurrencyInput } from '../shared/CurrencyInput';
import { MonthPicker } from '../shared/MonthPicker';
import { formatCurrency } from '../../utils/formatters';
import { Plus, Trash2, Edit, Save, X, DollarSign, RefreshCw } from 'lucide-react';

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
    <div className="card p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100">
        <div className="icon-badge bg-gradient-to-br from-emerald-500 to-teal-500">
          <DollarSign className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg md:text-xl font-bold text-slate-700">
          Salário Líquido Mensal
        </h3>
      </div>

      {/* Base Salary */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:items-end">
        <CurrencyInput
          label="Salário Base Líquido"
          value={baseValue}
          onChange={setBaseValue}
          className="flex-1"
        />
        <button
          onClick={handleUpdateBase}
          className="btn-success w-10 h-10"
          title="Atualizar"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Scheduled Increases */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-slate-600">Aumentos Programados</h4>
          <button
            onClick={() => setIsAddingIncrease(!isAddingIncrease)}
            className="btn-success w-9 h-9"
            title="Adicionar"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {config.salary.increases.length > 0 || isAddingIncrease ? (
          <div className="card-subtle rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[400px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/50">
                  <th className="w-32 px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Mês</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Novo Valor</th>
                  <th className="w-28 px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isAddingIncrease && (
                  <tr className="bg-emerald-50/50">
                    <td className="px-4 py-3">
                      <MonthPicker
                        value={newIncreaseMonth}
                        onChange={setNewIncreaseMonth}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <CurrencyInput
                        value={newIncreaseValue}
                        onChange={setNewIncreaseValue}
                        compact
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={handleAddIncrease}
                          className="btn-success w-9 h-9"
                          title="Confirmar"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelIncrease}
                          className="btn-action"
                          title="Cancelar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
                {config.salary.increases.map((increase) => (
                  <tr key={increase.month} className="hover:bg-slate-50 transition-colors">
                    {editingMonth === increase.month ? (
                      <>
                        <td className="px-4 py-3 text-slate-600">{increase.month}</td>
                        <td className="px-4 py-3">
                          <CurrencyInput
                            value={editIncreaseValue}
                            onChange={setEditIncreaseValue}
                            compact
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={handleSaveEdit}
                              className="btn-action text-emerald-600"
                              title="Salvar"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="btn-action"
                              title="Cancelar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-slate-600">{increase.month}</td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-500 tabular-nums">
                          {formatCurrency(increase.value)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => handleStartEdit(increase.month, increase.value)}
                              className="btn-action text-blue-500"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveIncrease(increase.month)}
                              className="btn-action text-rose-500"
                              title="Remover"
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
          <p className="text-center text-slate-400 py-6 italic text-sm">
            Nenhum aumento programado
          </p>
        )}
      </div>
    </div>
  );
}
