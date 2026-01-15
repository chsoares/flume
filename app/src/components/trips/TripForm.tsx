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
    console.log('TripForm useEffect triggered, trip:', trip);
    if (trip) {
      console.log('Setting trip data:', trip);
      setName(trip.name);
      setStartDate(trip.startDate);
      setEndDate(trip.endDate);
      setDailyBudget(trip.dailyBudget);
      setPreExpenses(trip.preExpenses);
    } else {
      console.log('Resetting form (no trip)');
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
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
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
              className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
              onChange={(e) => {
                console.log('Start date changed:', e.target.value);
                setStartDate(e.target.value);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Data Fim
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                console.log('End date changed:', e.target.value);
                setEndDate(e.target.value);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
            <h4 className="font-semibold text-slate-700">Gastos</h4>
            <button
              onClick={() => setIsAddingExpense(!isAddingExpense)}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar</span>
            </button>
          </div>

          {/* Expenses List */}
          {sortedExpenses.length > 0 || isAddingExpense ? (
            <div className="border rounded-lg overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-center text-slate-600">Mês</th>
                    <th className="px-4 py-3 text-left text-slate-600">Descrição</th>
                    <th className="px-4 py-3 text-center text-slate-600">Parcelas</th>
                    <th className="px-4 py-3 text-right text-slate-600">Valor Parcela</th>
                    <th className="px-4 py-3 text-right text-slate-600">Total</th>
                    <th className="px-4 py-3 text-center text-slate-600">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {isAddingExpense && (
                    <tr className="bg-blue-50">
                      <td className="px-4 py-2">
                        <MonthPicker
                          value={newExpenseMonth}
                          onChange={setNewExpenseMonth}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={newExpenseDescription}
                          onChange={(e) => setNewExpenseDescription(e.target.value)}
                          className="w-full px-2 py-1 border rounded text-sm"
                          placeholder="Descrição"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min="1"
                          value={newExpenseInstallments}
                          onChange={(e) => setNewExpenseInstallments(parseInt(e.target.value) || 1)}
                          className="w-full px-2 py-1 border rounded text-sm text-center"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <CurrencyInput
                          value={newExpenseValue}
                          onChange={setNewExpenseValue}
                          compact
                        />
                      </td>
                      <td className="px-4 py-2 text-right font-bold text-blue-600">
                        {formatCurrency(newExpenseInstallments * newExpenseValue)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={handleAddExpense}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                          >
                            Adicionar
                          </button>
                          <button
                            onClick={handleCancelExpense}
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
                        {editingExpenseId === expense.id ? (
                          <>
                            <td className="px-4 py-2">
                              <MonthPicker
                                value={editExpenseMonth}
                                onChange={setEditExpenseMonth}
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                value={editExpenseDescription}
                                onChange={(e) => setEditExpenseDescription(e.target.value)}
                                className="w-full px-2 py-1 border rounded text-sm"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                min="1"
                                value={editExpenseInstallments}
                                onChange={(e) => setEditExpenseInstallments(parseInt(e.target.value) || 1)}
                                className="w-full px-2 py-1 border rounded text-sm text-center"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <CurrencyInput
                                value={editExpenseValue}
                                onChange={setEditExpenseValue}
                                compact
                              />
                            </td>
                            <td className="px-4 py-2 text-right font-bold text-blue-600">
                              {formatCurrency(editExpenseInstallments * editExpenseValue)}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <div className="flex gap-1 justify-center">
                                <button
                                  onClick={handleSaveEditExpense}
                                  className="p-1 hover:bg-green-100 rounded text-green-600"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={handleCancelEditExpense}
                                  className="p-1 hover:bg-slate-100 rounded text-slate-600"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-2 text-center">{expense.month}</td>
                            <td className="px-4 py-2 font-medium">{expense.description}</td>
                            <td className="px-4 py-2 text-center">{expense.installments}x</td>
                            <td className="px-4 py-2 text-right font-medium text-orange-600">
                              {formatCurrency(expense.installmentValue)}
                            </td>
                            <td className="px-4 py-2 text-right font-bold text-blue-600">
                              {formatCurrency(total)}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <div className="flex gap-1 justify-center">
                                <button
                                  onClick={() => handleStartEditExpense(expense)}
                                  className="p-1 hover:bg-blue-100 rounded text-blue-600"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRemovePreExpense(expense.id)}
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
            <p className="text-sm text-slate-500 italic text-center py-4 mb-4">
              Nenhum gasto adicionado
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Viagem</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
