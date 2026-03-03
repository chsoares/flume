// components/income/ExtraordinaryIncomeList.tsx

import { useState } from 'react';
import { useFinancialStore } from '../../store/financialStore';
import { MonthPicker } from '../shared/MonthPicker';
import { CurrencyInput } from '../shared/CurrencyInput';
import { formatCurrency } from '../../utils/formatters';
import { Plus, Trash2, Edit, Save, X, Sparkles } from 'lucide-react';
import { generateUUID } from '../../utils/formatters';

export function ExtraordinaryIncomeList() {
  const { config, addExtraordinaryIncome, updateExtraordinaryIncome, removeExtraordinaryIncome } =
    useFinancialStore();

  const [isAdding, setIsAdding] = useState(false);
  const [newMonth, setNewMonth] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newValue, setNewValue] = useState(0);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMonth, setEditMonth] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editValue, setEditValue] = useState(0);

  function handleAdd() {
    if (!newMonth || !newDescription || newValue <= 0) {
      alert('Preencha todos os campos');
      return;
    }

    addExtraordinaryIncome({
      id: generateUUID(),
      month: newMonth,
      description: newDescription,
      value: newValue,
    });

    setNewMonth('');
    setNewDescription('');
    setNewValue(0);
    setIsAdding(false);
  }

  function handleCancel() {
    setNewMonth('');
    setNewDescription('');
    setNewValue(0);
    setIsAdding(false);
  }

  function handleStartEdit(income: any) {
    setEditingId(income.id);
    setEditMonth(income.month);
    setEditDescription(income.description);
    setEditValue(income.value);
  }

  function handleSaveEdit() {
    if (!editingId) return;

    updateExtraordinaryIncome(editingId, {
      month: editMonth,
      description: editDescription,
      value: editValue,
    });

    setEditingId(null);
  }

  function handleCancelEdit() {
    setEditingId(null);
  }

  const sortedIncomes = [...config.extraordinaryIncome].sort((a, b) =>
    a.month.localeCompare(b.month)
  );

  return (
    <div className="card p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-3 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-3">
          <div className="icon-badge bg-gradient-to-br from-emerald-500 to-teal-500">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-slate-700">Receitas Extraordinárias</h3>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="btn-success w-9 h-9"
          title="Nova Receita"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* List */}
      {sortedIncomes.length > 0 || isAdding ? (
        <div className="card-subtle rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[500px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/50">
                <th className="w-32 px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Mês</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição</th>
                <th className="w-36 px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Valor</th>
                <th className="w-28 px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isAdding && (
                <tr className="bg-emerald-50/50">
                  <td className="px-4 py-3">
                    <MonthPicker
                      value={newMonth}
                      onChange={setNewMonth}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="input-field w-full h-10 px-3 text-sm"
                      placeholder="Descrição"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <CurrencyInput
                      value={newValue}
                      onChange={setNewValue}
                      compact
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={handleAdd}
                        className="btn-success w-9 h-9"
                        title="Confirmar"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="btn-action"
                        title="Cancelar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              {sortedIncomes.map((income) => (
                <tr key={income.id} className="hover:bg-slate-50 transition-colors">
                  {editingId === income.id ? (
                    <>
                      <td className="px-4 py-3">
                        <MonthPicker
                          value={editMonth}
                          onChange={setEditMonth}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="input-field w-full h-10 px-3 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <CurrencyInput
                          value={editValue}
                          onChange={setEditValue}
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
                      <td className="px-4 py-3 text-slate-600">{income.month}</td>
                      <td className="px-4 py-3 font-medium text-slate-700">{income.description}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-500 tabular-nums">
                        {formatCurrency(income.value)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() => handleStartEdit(income)}
                            className="btn-action text-blue-500"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeExtraordinaryIncome(income.id)}
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
        <p className="text-center text-slate-400 py-8 italic">
          Nenhuma receita extraordinária cadastrada
        </p>
      )}
    </div>
  );
}
