// components/trips/TripForm.tsx

import { useState, useEffect } from 'react';
import { useFinancialStore } from '../../store/financialStore';
import { CurrencyInput } from '../shared/CurrencyInput';
import { MonthPicker } from '../shared/MonthPicker';
import { Plus, Trash2, Save, Edit, X } from 'lucide-react';
import { generateUUID, formatCurrency } from '../../utils/formatters';
import type { Trip, TripExpense } from '../../types';

interface TripFormProps {
  trip: Trip | null;
  onClose: () => void;
}

export function TripForm({ trip, onClose }: TripFormProps) {
  const { addTrip, updateTrip } = useFinancialStore();

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dailyBudget, setDailyBudget] = useState(0);
  const [preExpenses, setPreExpenses] = useState<TripExpense[]>([]);

  // New expense form
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newExpenseMonth, setNewExpenseMonth] = useState('');
  const [newExpenseDescription, setNewExpenseDescription] = useState('');
  const [newExpenseInstallments, setNewExpenseInstallments] = useState(1);
  const [newExpenseValue, setNewExpenseValue] = useState(0);

  // Edit expense form
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editExpenseMonth, setEditExpenseMonth] = useState('');
  const [editExpenseDescription, setEditExpenseDescription] = useState('');
  const [editExpenseInstallments, setEditExpenseInstallments] = useState(1);
  const [editExpenseValue, setEditExpenseValue] = useState(0);

  useEffect(() => {
    if (trip) {
      setName(trip.name);
      setStartDate(trip.startDate);
      setEndDate(trip.endDate);
      setDailyBudget(trip.dailyBudget);
      setPreExpenses(trip.preExpenses);
    } else {
      setName('');
      setStartDate('');
      setEndDate('');
      setDailyBudget(0);
      setPreExpenses([]);
    }
  }, [trip]);

  function handleAddExpense() {
    if (!newExpenseMonth || !newExpenseDescription || newExpenseInstallments <= 0 || newExpenseValue <= 0) {
      alert('Preencha todos os campos');
      return;
    }

    setPreExpenses([
      ...preExpenses,
      {
        id: generateUUID(),
        month: newExpenseMonth,
        description: newExpenseDescription,
        installments: newExpenseInstallments,
        installmentValue: newExpenseValue,
      },
    ]);

    setNewExpenseMonth('');
    setNewExpenseDescription('');
    setNewExpenseInstallments(1);
    setNewExpenseValue(0);
    setIsAddingExpense(false);
  }

  function handleCancelExpense() {
    setNewExpenseMonth('');
    setNewExpenseDescription('');
    setNewExpenseInstallments(1);
    setNewExpenseValue(0);
    setIsAddingExpense(false);
  }

  function handleStartEditExpense(expense: TripExpense) {
    setEditingExpenseId(expense.id);
    setEditExpenseMonth(expense.month);
    setEditExpenseDescription(expense.description);
    setEditExpenseInstallments(expense.installments);
    setEditExpenseValue(expense.installmentValue);
  }

  function handleSaveEditExpense() {
    if (!editingExpenseId) return;

    setPreExpenses(
      preExpenses.map((exp) =>
        exp.id === editingExpenseId
          ? {
              ...exp,
              month: editExpenseMonth,
              description: editExpenseDescription,
              installments: editExpenseInstallments,
              installmentValue: editExpenseValue,
            }
          : exp
      )
    );

    setEditingExpenseId(null);
  }

  function handleCancelEditExpense() {
    setEditingExpenseId(null);
  }

  function handleRemovePreExpense(id: string) {
    setPreExpenses(preExpenses.filter((exp) => exp.id !== id));
  }

  function handleSave() {
    if (!name || !startDate || !endDate) {
      alert('Preencha nome e datas');
      return;
    }

    const tripData: Trip = {
      id: trip?.id || generateUUID(),
      name,
      startDate,
      endDate,
      dailyBudget,
      preExpenses,
    };

    if (trip) {
      updateTrip(trip.id, tripData);
    } else {
      addTrip(tripData);
    }

    onClose();
  }

  const sortedExpenses = [...preExpenses].sort((a, b) => a.month.localeCompare(b.month));

  return (
    <div className="mb-6 card-subtle p-4">
      <div className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Nome da Viagem
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field w-full h-10 px-3"
              placeholder="Ex: Londres"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Data Início
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field w-full h-10 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Data Fim
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field w-full h-10 px-3"
            />
          </div>
          <CurrencyInput
            label="Orçamento Diário"
            value={dailyBudget}
            onChange={setDailyBudget}
          />
        </div>

        {/* Expenses Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-slate-600">Gastos</h4>
            <button
              onClick={() => setIsAddingExpense(!isAddingExpense)}
              className="btn-accent w-8 h-8"
              title="Adicionar gasto"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Expenses List */}
          {sortedExpenses.length > 0 || isAddingExpense ? (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/50">
                    <th className="w-28 px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Mês</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição</th>
                    <th className="w-24 px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Parcelas</th>
                    <th className="w-32 px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Valor Parcela</th>
                    <th className="w-32 px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                    <th className="w-28 px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isAddingExpense && (
                    <tr className="bg-blue-50/50">
                      <td className="px-4 py-3">
                        <MonthPicker
                          value={newExpenseMonth}
                          onChange={setNewExpenseMonth}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={newExpenseDescription}
                          onChange={(e) => setNewExpenseDescription(e.target.value)}
                          className="input-field w-full h-10 px-3 text-sm"
                          placeholder="Descrição"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="1"
                          value={newExpenseInstallments}
                          onChange={(e) => setNewExpenseInstallments(parseInt(e.target.value) || 1)}
                          className="input-field w-full h-10 px-3 text-sm text-center"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <CurrencyInput
                          value={newExpenseValue}
                          onChange={setNewExpenseValue}
                          compact
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-blue-500 tabular-nums">
                        {formatCurrency(newExpenseInstallments * newExpenseValue)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={handleAddExpense}
                            className="btn-accent w-9 h-9"
                            title="Confirmar"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelExpense}
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
                        {editingExpenseId === expense.id ? (
                          <>
                            <td className="px-4 py-3">
                              <MonthPicker
                                value={editExpenseMonth}
                                onChange={setEditExpenseMonth}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={editExpenseDescription}
                                onChange={(e) => setEditExpenseDescription(e.target.value)}
                                className="input-field w-full h-10 px-3 text-sm"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min="1"
                                value={editExpenseInstallments}
                                onChange={(e) => setEditExpenseInstallments(parseInt(e.target.value) || 1)}
                                className="input-field w-full h-10 px-3 text-sm text-center"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <CurrencyInput
                                value={editExpenseValue}
                                onChange={setEditExpenseValue}
                                compact
                              />
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-blue-500 tabular-nums">
                              {formatCurrency(editExpenseInstallments * editExpenseValue)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1 justify-end">
                                <button
                                  onClick={handleSaveEditExpense}
                                  className="btn-action text-emerald-600"
                                  title="Salvar"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={handleCancelEditExpense}
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
                            <td className="px-4 py-3 text-slate-600">{expense.month}</td>
                            <td className="px-4 py-3 font-medium text-slate-700">{expense.description}</td>
                            <td className="px-4 py-3 text-center text-slate-600">{expense.installments}x</td>
                            <td className="px-4 py-3 text-right font-medium text-orange-500 tabular-nums">
                              {formatCurrency(expense.installmentValue)}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-blue-500 tabular-nums">
                              {formatCurrency(total)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1 justify-end">
                                <button
                                  onClick={() => handleStartEditExpense(expense)}
                                  className="btn-action text-blue-500"
                                  title="Editar"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRemovePreExpense(expense.id)}
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
            <p className="text-sm text-slate-400 italic text-center py-4 mb-4">
              Nenhum gasto adicionado
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="btn-accent w-10 h-10"
            title="Salvar Viagem"
          >
            <Save className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="btn-action"
            title="Cancelar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
