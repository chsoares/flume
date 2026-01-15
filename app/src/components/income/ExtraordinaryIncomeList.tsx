// components/income/ExtraordinaryIncomeList.tsx

import { useState } from 'react';
import { useFinancialStore } from '../../store/financialStore';
import { MonthPicker } from '../shared/MonthPicker';
import { CurrencyInput } from '../shared/CurrencyInput';
import { formatCurrency } from '../../utils/formatters';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6 border-b pb-3">
        <h3 className="text-xl font-bold text-slate-800">Receitas Extraordinárias</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Receita</span>
        </button>
      </div>

      {/* List */}
      {sortedIncomes.length > 0 || isAdding ? (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-center text-slate-600">Mês</th>
                <th className="px-4 py-3 text-left text-slate-600">Descrição</th>
                <th className="px-4 py-3 text-right text-slate-600">Valor</th>
                <th className="px-4 py-3 text-center text-slate-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isAdding && (
                <tr className="bg-green-50">
                  <td className="px-4 py-2">
                    <MonthPicker
                      value={newMonth}
                      onChange={setNewMonth}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="w-full px-2 py-1 border rounded text-sm"
                      placeholder="Descrição"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <CurrencyInput
                      value={newValue}
                      onChange={setNewValue}
                      compact
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex gap-1 justify-center">
                      <button
                        onClick={handleAdd}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                      >
                        Adicionar
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs"
                      >
                        Cancelar
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              {sortedIncomes.map((income) => (
                <tr key={income.id} className="hover:bg-slate-50">
                  {editingId === income.id ? (
                    <>
                      <td className="px-4 py-2">
                        <MonthPicker
                          value={editMonth}
                          onChange={setEditMonth}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full px-2 py-1 border rounded text-sm"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <CurrencyInput
                          value={editValue}
                          onChange={setEditValue}
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
                      <td className="px-4 py-2 text-center">{income.month}</td>
                      <td className="px-4 py-2 font-medium">{income.description}</td>
                      <td className="px-4 py-2 text-right font-bold text-green-600">
                        {formatCurrency(income.value)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={() => handleStartEdit(income)}
                            className="p-1 hover:bg-blue-100 rounded text-blue-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeExtraordinaryIncome(income.id)}
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
        <p className="text-center text-slate-500 py-8 italic">
          Nenhuma receita extraordinária cadastrada
        </p>
      )}
    </div>
  );
}
