// components/expenses/ExtraordinaryExpensesList.tsx

import { useState } from 'react';
import { useFinancialStore } from '../../store/financialStore';
import { MonthPicker } from '../shared/MonthPicker';
import { CurrencyInput } from '../shared/CurrencyInput';
import { formatCurrency } from '../../utils/formatters';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { generateUUID } from '../../utils/formatters';

export function ExtraordinaryExpensesList() {
  const { config, addExtraordinaryExpense, updateExtraordinaryExpense, removeExtraordinaryExpense } = useFinancialStore();

  const [isAdding, setIsAdding] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [newStartMonth, setNewStartMonth] = useState('');
  const [newInstallments, setNewInstallments] = useState(1);
  const [newInstallmentValue, setNewInstallmentValue] = useState(0);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editStartMonth, setEditStartMonth] = useState('');
  const [editInstallments, setEditInstallments] = useState(1);
  const [editInstallmentValue, setEditInstallmentValue] = useState(0);

  function handleAdd() {
    if (!newDescription || !newStartMonth || newInstallments <= 0 || newInstallmentValue <= 0) {
      alert('Preencha todos os campos');
      return;
    }

    addExtraordinaryExpense({
      id: generateUUID(),
      description: newDescription,
      startMonth: newStartMonth,
      installments: newInstallments,
      installmentValue: newInstallmentValue,
    });

    setNewDescription('');
    setNewStartMonth('');
    setNewInstallments(1);
    setNewInstallmentValue(0);
    setIsAdding(false);
  }

  function handleCancel() {
    setNewDescription('');
    setNewStartMonth('');
    setNewInstallments(1);
    setNewInstallmentValue(0);
    setIsAdding(false);
  }

  function handleStartEdit(expense: any) {
    setEditingId(expense.id);
    setEditDescription(expense.description);
    setEditStartMonth(expense.startMonth);
    setEditInstallments(expense.installments);
    setEditInstallmentValue(expense.installmentValue);
  }

  function handleSaveEdit() {
    if (!editingId) return;

    updateExtraordinaryExpense(editingId, {
      description: editDescription,
      startMonth: editStartMonth,
      installments: editInstallments,
      installmentValue: editInstallmentValue,
    });

    setEditingId(null);
  }

  function handleCancelEdit() {
    setEditingId(null);
  }

  const sortedExpenses = [...config.extraordinaryExpenses].sort((a, b) =>
    a.startMonth.localeCompare(b.startMonth)
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6 border-b pb-3">
        <h3 className="text-xl font-bold text-slate-800">Despesas Extraordinárias</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Despesa</span>
        </button>
      </div>

      {/* List */}
      {sortedExpenses.length > 0 || isAdding ? (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-center text-slate-600">Início</th>
                <th className="px-4 py-3 text-left text-slate-600">Descrição</th>
                <th className="px-4 py-3 text-center text-slate-600">Parcelas</th>
                <th className="px-4 py-3 text-right text-slate-600">Valor Parcela</th>
                <th className="px-4 py-3 text-right text-slate-600">Total</th>
                <th className="px-4 py-3 text-center text-slate-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isAdding && (
                <tr className="bg-red-50">
                  <td className="px-4 py-2">
                    <MonthPicker
                      value={newStartMonth}
                      onChange={setNewStartMonth}
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
                    <input
                      type="number"
                      min="1"
                      value={newInstallments}
                      onChange={(e) => setNewInstallments(parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-1 border rounded text-sm text-center"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <CurrencyInput
                      value={newInstallmentValue}
                      onChange={setNewInstallmentValue}
                      compact
                    />
                  </td>
                  <td className="px-4 py-2 text-right font-bold text-red-600">
                    {formatCurrency(newInstallments * newInstallmentValue)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex gap-1 justify-center">
                      <button
                        onClick={handleAdd}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
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
              {sortedExpenses.map((expense) => {
                const total = expense.installments * expense.installmentValue;
                return (
                  <tr key={expense.id} className="hover:bg-slate-50">
                    {editingId === expense.id ? (
                      <>
                        <td className="px-4 py-2">
                          <MonthPicker
                            value={editStartMonth}
                            onChange={setEditStartMonth}
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
                          <input
                            type="number"
                            min="1"
                            value={editInstallments}
                            onChange={(e) => setEditInstallments(parseInt(e.target.value) || 1)}
                            className="w-full px-2 py-1 border rounded text-sm text-center"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <CurrencyInput
                            value={editInstallmentValue}
                            onChange={setEditInstallmentValue}
                            compact
                          />
                        </td>
                        <td className="px-4 py-2 text-right font-bold text-red-600">
                          {formatCurrency(editInstallments * editInstallmentValue)}
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
                        <td className="px-4 py-2 text-center">{expense.startMonth}</td>
                        <td className="px-4 py-2 font-medium">{expense.description}</td>
                        <td className="px-4 py-2 text-center">{expense.installments}x</td>
                        <td className="px-4 py-2 text-right font-medium text-orange-600">
                          {formatCurrency(expense.installmentValue)}
                        </td>
                        <td className="px-4 py-2 text-right font-bold text-red-600">
                          {formatCurrency(total)}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <div className="flex gap-1 justify-center">
                            <button
                              onClick={() => handleStartEdit(expense)}
                              className="p-1 hover:bg-blue-100 rounded text-blue-600"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeExtraordinaryExpense(expense.id)}
                              className="p-1 hover:bg-red-100 rounded text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-slate-500 py-8 italic">
          Nenhuma despesa extraordinária cadastrada
        </p>
      )}
    </div>
  );
}
