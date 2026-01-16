// components/trips/TripsList.tsx

import { useState } from 'react';
import { useFinancialStore } from '../../store/financialStore';
import { formatCurrency } from '../../utils/formatters';
import { Plus, Trash2, Edit } from 'lucide-react';
import { TripForm } from './TripForm';
import { differenceInDays } from 'date-fns';
import type { Trip } from '../../types';

export function TripsList() {
  const { config, removeTrip } = useFinancialStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  function handleEdit(trip: Trip) {
    setEditingTrip(trip);
    setIsAdding(true);
  }

  function handleAddNew() {
    setEditingTrip(null);
    setIsAdding(true);
  }

  function handleCloseForm() {
    setIsAdding(false);
    setEditingTrip(null);
  }

  function calculateTripTotal(trip: Trip): number {
    const days = differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1;
    const dailyExpenses = days * trip.dailyBudget;

    const preExpensesTotal = trip.preExpenses.reduce(
      (sum, exp) => sum + exp.installments * exp.installmentValue,
      0
    );

    return dailyExpenses + preExpensesTotal;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 border-b pb-3 gap-3">
        <h3 className="text-lg md:text-xl font-bold text-slate-800">Viagens Planejadas</h3>
        {!isAdding && (
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Viagem</span>
          </button>
        )}
      </div>

      {/* Trip Form */}
      {isAdding && (
        <TripForm trip={editingTrip} onClose={handleCloseForm} />
      )}

      {/* Trips List */}
      {config.trips.length > 0 ? (
        <div className="border rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-slate-600">Viagem</th>
                <th className="px-4 py-3 text-center text-slate-600">Dias</th>
                <th className="px-4 py-3 text-right text-slate-600">Orçamento Diário</th>
                <th className="px-4 py-3 text-right text-slate-600">Gastos</th>
                <th className="px-4 py-3 text-right text-slate-600">Total</th>
                <th className="px-4 py-3 text-center text-slate-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {config.trips.map((trip) => {
                const days = differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1;
                const total = calculateTripTotal(trip);
                const preExpensesTotal = trip.preExpenses.reduce(
                  (sum: number, exp: any) => sum + exp.installments * exp.installmentValue,
                  0
                );

                return (
                  <tr key={trip.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2">
                      <p className="font-medium text-slate-800">{trip.name}</p>
                      <p className="text-xs text-slate-500">{trip.startDate} - {trip.endDate}</p>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs">
                        {days} dias
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      {formatCurrency(trip.dailyBudget)}/dia
                    </td>
                    <td className="px-4 py-2 text-right">
                      {preExpensesTotal > 0 ? formatCurrency(preExpensesTotal) : '-'}
                    </td>
                    <td className="px-4 py-2 text-right font-bold text-blue-600">
                      {formatCurrency(total)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => handleEdit(trip)}
                          className="p-1 hover:bg-blue-100 rounded text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeTrip(trip.id)}
                          className="p-1 hover:bg-red-100 rounded text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-slate-500 py-8 italic">
          Nenhuma viagem planejada
        </p>
      )}
    </div>
  );
}
