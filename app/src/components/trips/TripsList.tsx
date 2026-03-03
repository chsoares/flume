// components/trips/TripsList.tsx

import { useState } from 'react';
import { useFinancialStore } from '../../store/financialStore';
import { formatCurrency } from '../../utils/formatters';
import { Plus, Trash2, Edit, MapPin } from 'lucide-react';
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
    <div className="card p-4 md:p-6">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-3">
          <div className="icon-badge bg-gradient-to-br from-blue-500 to-cyan-500">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-slate-700">Viagens Planejadas</h3>
        </div>
        {!isAdding && (
          <button
            onClick={handleAddNew}
            className="btn-accent w-9 h-9"
            title="Nova Viagem"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Trip Form */}
      {isAdding && (
        <TripForm trip={editingTrip} onClose={handleCloseForm} />
      )}

      {/* Trips List */}
      {config.trips.length > 0 ? (
        <div className="card-subtle rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/50">
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Viagem</th>
                <th className="w-24 px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Dias</th>
                <th className="w-36 px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Orç. Diário</th>
                <th className="w-28 px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Gastos</th>
                <th className="w-28 px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="w-28 px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {config.trips.map((trip) => {
                const days = differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1;
                const total = calculateTripTotal(trip);
                const preExpensesTotal = trip.preExpenses.reduce(
                  (sum: number, exp: any) => sum + exp.installments * exp.installmentValue,
                  0
                );

                return (
                  <tr key={trip.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-700">{trip.name}</p>
                      <p className="text-xs text-slate-500">{trip.startDate} - {trip.endDate}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-slate-200 text-slate-600 px-2 py-1 rounded-lg text-xs font-medium">
                        {days} dias
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600 tabular-nums">
                      {formatCurrency(trip.dailyBudget)}/dia
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600 tabular-nums">
                      {preExpensesTotal > 0 ? formatCurrency(preExpensesTotal) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-blue-500 tabular-nums">
                      {formatCurrency(total)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => handleEdit(trip)}
                          className="btn-action text-blue-500"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeTrip(trip.id)}
                          className="btn-action text-rose-500"
                          title="Remover"
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
        <p className="text-center text-slate-400 py-8 italic">
          Nenhuma viagem planejada
        </p>
      )}
    </div>
  );
}
