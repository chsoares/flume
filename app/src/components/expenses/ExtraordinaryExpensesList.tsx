// components/expenses/ExtraordinaryExpensesList.tsx

import { useState } from 'react';
import { useFinancialStore } from '../../store/financialStore';
import { MonthPicker } from '../shared/MonthPicker';
import { CurrencyInput } from '../shared/CurrencyInput';
import { formatCurrency } from '../../utils/formatters';
import { Plus, Trash2, Edit, Save, X, Zap } from 'lucide-react';
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
    <div className="card p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-3 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-3">
          <div className="icon-badge bg-gradient-to-br from-pink-500 to-rose-500">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-slate-700">Despesas Extraordinárias</h3>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="btn-danger w-9 h-9"
          title="Nova Despesa"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* List */}
      {sortedExpenses.length > 0 || isAdding ? (
        <div className="card-subtle rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/50">
                <th className="w-28 px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Início</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição</th>
                <th className="w-24 px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Parcelas</th>
                <th className="w-32 px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Valor Parcela</th>
                <th className="w-32 px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="w-28 px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isAdding && (
                <tr className="bg-rose-50/50">
                  <td className="px-4 py-3">
                    <MonthPicker
                      value={newStartMonth}
                      onChange={setNewStartMonth}
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
                    <input
                      type="number"
                      min="1"
                      value={newInstallments}
                      onChange={(e) => setNewInstallments(parseInt(e.target.value) || 1)}
                      className="input-field w-full h-10 px-3 text-sm text-center"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <CurrencyInput
                      value={newInstallmentValue}
                      onChange={setNewInstallmentValue}
                      compact
                    />
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-rose-500 tabular-nums">
                    {formatCurrency(newInstallments * newInstallmentValue)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={handleAdd}
                        className="btn-danger w-9 h-9"
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
              {sortedExpenses.map((expense) => {
                const total = expense.installments * expense.installmentValue;
                return (
                  <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                    {editingId === expense.id ? (
                      <>
                        <td className="px-4 py-3">
                          <MonthPicker
                            value={editStartMonth}
                            onChange={setEditStartMonth}
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
                          <input
                            type="number"
                            min="1"
                            value={editInstallments}
                            onChange={(e) => setEditInstallments(parseInt(e.target.value) || 1)}
                            className="input-field w-full h-10 px-3 text-sm text-center"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <CurrencyInput
                            value={editInstallmentValue}
                            onChange={setEditInstallmentValue}
                            compact
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-rose-500 tabular-nums">
                          {formatCurrency(editInstallments * editInstallmentValue)}
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
                        <td className="px-4 py-3 text-slate-600">{expense.startMonth}</td>
                        <td className="px-4 py-3 font-medium text-slate-700">{expense.description}</td>
                        <td className="px-4 py-3 text-center text-slate-600">{expense.installments}x</td>
                        <td className="px-4 py-3 text-right font-medium text-orange-500 tabular-nums">
                          {formatCurrency(expense.installmentValue)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-rose-500 tabular-nums">
                          {formatCurrency(total)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => handleStartEdit(expense)}
                              className="btn-action text-blue-500"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeExtraordinaryExpense(expense.id)}
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
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-slate-400 py-8 italic">
          Nenhuma despesa extraordinária cadastrada
        </p>
      )}
    </div>
  );
}
