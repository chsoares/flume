// components/expenses/FixedExpensesList.tsx

import { useState } from 'react';
import { useFinancialStore } from '../../store/financialStore';
import { formatCurrency, generateUUID } from '../../utils/formatters';
import { Plus, Trash2, TrendingUp, ChevronDown, ChevronUp, Edit, Save, X, Receipt } from 'lucide-react';
import { MonthPicker } from '../shared/MonthPicker';
import { CurrencyInput } from '../shared/CurrencyInput';
import type { FixedExpense } from '../../types';

export function FixedExpensesList() {
  const { config, addFixedExpense, removeFixedExpense, updateFixedExpense } =
    useFinancialStore();

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editValue, setEditValue] = useState(0);
  const [expandedExpenseId, setExpandedExpenseId] = useState<string | null>(null);
  const [isAddingIncrease, setIsAddingIncrease] = useState<string | null>(null);
  const [newIncreaseMonth, setNewIncreaseMonth] = useState('');
  const [newIncreaseValue, setNewIncreaseValue] = useState(0);

  function handleAdd() {
    if (!newName || newValue <= 0) {
      alert('Preencha nome e valor');
      return;
    }

    addFixedExpense({
      id: generateUUID(),
      name: newName,
      value: newValue,
      increases: [],
    });

    setNewName('');
    setNewValue(0);
    setIsAdding(false);
  }

  function handleCancel() {
    setNewName('');
    setNewValue(0);
    setIsAdding(false);
  }

  function handleStartEdit(expense: FixedExpense) {
    setEditingId(expense.id);
    setEditName(expense.name);
    setEditValue(expense.value);
  }

  function handleSaveEdit() {
    if (!editingId) return;

    updateFixedExpense(editingId, {
      name: editName,
      value: editValue,
    });

    setEditingId(null);
  }

  function handleCancelEdit() {
    setEditingId(null);
  }

  function handleAddIncrease(expenseId: string) {
    if (!newIncreaseMonth || newIncreaseValue <= 0) {
      alert('Preencha o mês e o valor do aumento');
      return;
    }

    const expense = config.fixedExpenses.find((e) => e.id === expenseId);
    if (!expense) return;

    updateFixedExpense(expenseId, {
      ...expense,
      increases: [
        ...expense.increases,
        { month: newIncreaseMonth, value: newIncreaseValue },
      ].sort((a, b) => a.month.localeCompare(b.month)),
    });

    setNewIncreaseMonth('');
    setNewIncreaseValue(0);
    setIsAddingIncrease(null);
  }

  function handleCancelIncrease() {
    setNewIncreaseMonth('');
    setNewIncreaseValue(0);
    setIsAddingIncrease(null);
  }

  function handleRemoveIncrease(expenseId: string, month: string) {
    const expense = config.fixedExpenses.find((e) => e.id === expenseId);
    if (!expense) return;

    updateFixedExpense(expenseId, {
      ...expense,
      increases: expense.increases.filter((inc) => inc.month !== month),
    });
  }

  function toggleExpanded(expenseId: string) {
    setExpandedExpenseId(expandedExpenseId === expenseId ? null : expenseId);
  }

  const totalFixed = config.fixedExpenses.reduce((sum, exp) => sum + exp.value, 0);

  return (
    <div className="card p-4 md:p-6">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-3">
          <div className="icon-badge bg-gradient-to-br from-pink-500 to-rose-500">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-slate-700">Despesas Fixas Mensais</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Total: <span className="font-bold text-rose-500 tabular-nums">{formatCurrency(totalFixed)}</span>
            </p>
          </div>
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
      {config.fixedExpenses.length > 0 || isAdding ? (
        <div className="card-subtle rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[500px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/50">
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nome</th>
                <th className="w-40 px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Valor Mensal</th>
                <th className="w-36 px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isAdding && (
                <tr className="bg-rose-50/50">
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="input-field w-full h-10 px-3 text-sm"
                      placeholder="Nome da despesa"
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
              {config.fixedExpenses.map((expense) => (
                <>
                  <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                    {editingId === expense.id ? (
                      <>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
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
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {expense.increases.length > 0 && (
                              <button
                                onClick={() => toggleExpanded(expense.id)}
                                className="btn-action"
                              >
                                {expandedExpenseId === expense.id ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </button>
                            )}
                            <div>
                              <p className="font-medium text-slate-700">{expense.name}</p>
                              {expense.increases.length > 0 && (
                                <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  {expense.increases.length} aumento(s) programado(s)
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-rose-500 tabular-nums">
                          {formatCurrency(expense.value)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 justify-end">
                            {expense.increases.length === 0 && (
                              <button
                                onClick={() => setIsAddingIncrease(expense.id)}
                                className="btn-action text-blue-500"
                                title="Adicionar aumento programado"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleStartEdit(expense)}
                              className="btn-action text-blue-500"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeFixedExpense(expense.id)}
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
                  {(expandedExpenseId === expense.id || isAddingIncrease === expense.id) && (
                    <tr>
                      <td colSpan={3} className="px-4 py-3 bg-slate-50">
                        <div className="pl-8">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-sm font-semibold text-slate-600">Aumentos Programados</h5>
                            {expense.increases.length > 0 && (
                              <button
                                onClick={() => setIsAddingIncrease(expense.id)}
                                className="btn-accent w-7 h-7"
                                title="Adicionar aumento"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          {expense.increases.length > 0 || isAddingIncrease === expense.id ? (
                            <div className="card-subtle rounded-lg overflow-hidden overflow-x-auto">
                              <table className="w-full min-w-[300px] text-xs">
                                <thead>
                                  <tr className="border-b border-slate-200 bg-slate-100/50">
                                    <th className="w-32 px-3 py-2 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Mês</th>
                                    <th className="px-3 py-2 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Novo Valor</th>
                                    <th className="w-24 px-3 py-2 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                  {isAddingIncrease === expense.id && (
                                    <tr className="bg-blue-50/50">
                                      <td className="px-3 py-2">
                                        <MonthPicker
                                          value={newIncreaseMonth}
                                          onChange={setNewIncreaseMonth}
                                        />
                                      </td>
                                      <td className="px-3 py-2">
                                        <CurrencyInput
                                          value={newIncreaseValue}
                                          onChange={setNewIncreaseValue}
                                          compact
                                        />
                                      </td>
                                      <td className="px-3 py-2">
                                        <div className="flex gap-1 justify-end">
                                          <button
                                            onClick={() => handleAddIncrease(expense.id)}
                                            className="btn-accent w-7 h-7"
                                            title="Confirmar"
                                          >
                                            <Save className="w-3 h-3" />
                                          </button>
                                          <button
                                            onClick={handleCancelIncrease}
                                            className="btn-action w-7 h-7"
                                            title="Cancelar"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                  {expense.increases.map((increase) => (
                                    <tr key={increase.month} className="hover:bg-slate-50 transition-colors">
                                      <td className="px-3 py-2 text-slate-600">{increase.month}</td>
                                      <td className="px-3 py-2 text-right font-medium text-blue-500 tabular-nums">
                                        {formatCurrency(increase.value)}
                                      </td>
                                      <td className="px-3 py-2">
                                        <div className="flex justify-end">
                                          <button
                                            onClick={() => handleRemoveIncrease(expense.id, increase.month)}
                                            className="btn-action text-rose-500"
                                            title="Remover"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic text-center py-2">
                              Nenhum aumento programado
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-slate-400 py-8 italic">
          Nenhuma despesa fixa cadastrada
        </p>
      )}
    </div>
  );
}
