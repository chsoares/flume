// components/trips/TripsList.tsx

import { useState } from 'react';
import { useFinancialStore } from '../../store/financialStore';
import { formatCurrency } from '../../utils/formatters';
import { Plus, Trash2, Calendar, DollarSign, Edit } from 'lucide-react';
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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6 border-b pb-3">
        <h3 className="text-xl font-bold text-slate-800">Viagens Planejadas</h3>
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
        <div className="space-y-4">
          {config.trips.map((trip) => {
            const days = differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1;
            const total = calculateTripTotal(trip);

            return (
              <div
                key={trip.id}
                className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50"
              >
                {/* Trip Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-bold text-blue-600">{trip.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {trip.startDate} até {trip.endDate}
                      </span>
                      <span className="text-slate-400">({days} dias)</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
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
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Orçamento Diário:</span>
                    <span className="font-medium">{formatCurrency(trip.dailyBudget)}/dia</span>
                  </div>

                  {trip.preExpenses.length > 0 && (
                    <div>
                      <p className="text-slate-600 font-medium mb-1">Gastos:</p>
                      {trip.preExpenses.map((exp) => (
                        <div key={exp.id} className="flex justify-between ml-4">
                          <span className="text-slate-500">
                            • {exp.description} ({exp.month})
                          </span>
                          <span className="font-medium">
                            {exp.installments}x {formatCurrency(exp.installmentValue)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between pt-2 border-t font-bold">
                    <span className="text-slate-700">Total Estimado:</span>
                    <span className="text-blue-600">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-slate-500 py-8 italic">
          Nenhuma viagem planejada
        </p>
      )}
    </div>
  );
}
