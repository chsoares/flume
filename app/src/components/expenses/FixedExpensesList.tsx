// components/expenses/FixedExpensesList.tsx

import { useState } from 'react';
import { useFinancialStore } from '../../store/financialStore';
import { formatCurrency, generateUUID } from '../../utils/formatters';
import { Plus, Trash2, TrendingUp, ChevronDown, ChevronUp, Edit, Save, X } from 'lucide-react';
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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6 border-b pb-3">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Despesas Fixas Mensais</h3>
          <p className="text-sm text-slate-500 mt-1">
            Total: <span className="font-bold text-red-600">{formatCurrency(totalFixed)}</span>
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Despesa</span>
        </button>
      </div>

      {/* List */}
      {config.fixedExpenses.length > 0 || isAdding ? (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-slate-600">Nome</th>
                <th className="px-4 py-3 text-right text-slate-600">Valor Mensal</th>
                <th className="px-4 py-3 text-center text-slate-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isAdding && (
                <tr className="bg-red-50">
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-2 py-1 border rounded text-sm"
                      placeholder="Nome da despesa"
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
              {config.fixedExpenses.map((expense) => (
                <>
                  <tr key={expense.id} className="hover:bg-slate-50">
                    {editingId === expense.id ? (
                      <>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
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
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            {expense.increases.length > 0 && (
                              <button
                                onClick={() => toggleExpanded(expense.id)}
                                className="p-1 hover:bg-slate-200 rounded"
                              >
                                {expandedExpenseId === expense.id ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </button>
                            )}
                            <div>
                              <p className="font-medium">{expense.name}</p>
                              {expense.increases.length > 0 && (
                                <p className="text-xs text-blue-600 mt-1">
                                  <TrendingUp className="w-3 h-3 inline mr-1" />
                                  {expense.increases.length} aumento(s) programado(s)
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right font-bold text-red-600">
                          {formatCurrency(expense.value)}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <div className="flex gap-1 justify-center">
                            {expense.increases.length === 0 && (
                              <button
                                onClick={() => setIsAddingIncrease(expense.id)}
                                className="p-1 hover:bg-blue-100 rounded text-blue-600"
                                title="Adicionar aumento programado"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleStartEdit(expense)}
                              className="p-1 hover:bg-blue-100 rounded text-blue-600"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeFixedExpense(expense.id)}
                              className="p-1 hover:bg-red-100 rounded text-red-600"
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
                            <h5 className="text-sm font-semibold text-slate-700">Aumentos Programados</h5>
                            {expense.increases.length > 0 && (
                              <button
                                onClick={() => setIsAddingIncrease(expense.id)}
                                className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Adicionar</span>
                              </button>
                            )}
                          </div>
                          {expense.increases.length > 0 || isAddingIncrease === expense.id ? (
                            <div className="border rounded overflow-hidden">
                              <table className="w-full text-xs">
                                <thead className="bg-slate-100">
                                  <tr>
                                    <th className="px-3 py-2 text-center text-slate-600">Mês</th>
                                    <th className="px-3 py-2 text-right text-slate-600">Novo Valor</th>
                                    <th className="px-3 py-2 text-center text-slate-600">Ações</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y bg-white">
                                  {isAddingIncrease === expense.id && (
                                    <tr className="bg-blue-50">
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
                                      <td className="px-3 py-2 text-center">
                                        <div className="flex gap-1 justify-center">
                                          <button
                                            onClick={() => handleAddIncrease(expense.id)}
                                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                                          >
                                            Adicionar
                                          </button>
                                          <button
                                            onClick={handleCancelIncrease}
                                            className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs"
                                          >
                                            Cancelar
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                  {expense.increases.map((increase) => (
                                    <tr key={increase.month} className="hover:bg-slate-50">
                                      <td className="px-3 py-2 text-center">{increase.month}</td>
                                      <td className="px-3 py-2 text-right font-medium text-blue-600">
                                        {formatCurrency(increase.value)}
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        <button
                                          onClick={() => handleRemoveIncrease(expense.id, increase.month)}
                                          className="p-1 hover:bg-red-100 rounded text-red-600"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 italic text-center py-2">
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
        <p className="text-center text-slate-500 py-8 italic">
          Nenhuma despesa fixa cadastrada
        </p>
      )}
    </div>
  );
}
