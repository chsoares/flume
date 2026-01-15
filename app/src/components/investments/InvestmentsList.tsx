// components/investments/InvestmentsList.tsx

import { useState } from 'react';
import { useFinancialStore } from '../../store/financialStore';
import { formatCurrency } from '../../utils/formatters';
import { CurrencyInput } from '../shared/CurrencyInput';
import { Plus, Trash2, AlertTriangle, CheckCircle, Edit, Save, X } from 'lucide-react';
import { generateUUID } from '../../utils/formatters';

export function InvestmentsList() {
  const { config, addInvestment, removeInvestment, updateInvestment } = useFinancialStore();

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newMinTarget, setNewMinTarget] = useState<number | null>(null);
  const [newAllocation, setNewAllocation] = useState(0);
  const [newInitialBalance, setNewInitialBalance] = useState(0);
  const [newWithdrawalPriority, setNewWithdrawalPriority] = useState(1);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editMinTarget, setEditMinTarget] = useState<number | null>(null);
  const [editAllocation, setEditAllocation] = useState(0);
  const [editInitialBalance, setEditInitialBalance] = useState(0);
  const [editWithdrawalPriority, setEditWithdrawalPriority] = useState(1);

  function handleAdd() {
    if (!newName || newAllocation <= 0) {
      alert('Preencha nome e alocação');
      return;
    }

    addInvestment({
      id: generateUUID(),
      name: newName,
      minValueTarget: newMinTarget,
      allocationPercent: newAllocation,
      initialBalance: newInitialBalance,
      withdrawalPriority: newWithdrawalPriority,
    });

    setNewName('');
    setNewMinTarget(null);
    setNewAllocation(0);
    setNewInitialBalance(0);
    setNewWithdrawalPriority(1);
    setIsAdding(false);
  }

  function handleCancel() {
    setNewName('');
    setNewMinTarget(null);
    setNewAllocation(0);
    setNewInitialBalance(0);
    setNewWithdrawalPriority(1);
    setIsAdding(false);
  }

  function handleStartEdit(investment: any) {
    setEditingId(investment.id);
    setEditName(investment.name);
    setEditMinTarget(investment.minValueTarget);
    setEditAllocation(investment.allocationPercent);
    setEditInitialBalance(investment.initialBalance);
    setEditWithdrawalPriority(investment.withdrawalPriority);
  }

  function handleSaveEdit() {
    if (!editingId) return;

    updateInvestment(editingId, {
      name: editName,
      minValueTarget: editMinTarget,
      allocationPercent: editAllocation,
      initialBalance: editInitialBalance,
      withdrawalPriority: editWithdrawalPriority,
    });

    setEditingId(null);
  }

  function handleCancelEdit() {
    setEditingId(null);
  }

  const totalAllocation = config.investments.reduce(
    (sum, inv) => sum + inv.allocationPercent,
    0
  );
  const allocationValid = Math.abs(totalAllocation - 100) < 0.01;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6 border-b pb-3">
        <h3 className="text-xl font-bold text-slate-800">Configuração de Investimentos</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Investimento</span>
        </button>
      </div>

      {/* Allocation Warning */}
      <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
        allocationValid
          ? 'bg-green-50 border border-green-200 text-green-700'
          : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
      }`}>
        {allocationValid ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <AlertTriangle className="w-5 h-5" />
        )}
        <span className="font-medium">
          Soma de alocação: {totalAllocation.toFixed(1)}%
          {allocationValid ? ' ✓' : ' (deve ser 100%)'}
        </span>
      </div>

      {/* List */}
      {config.investments.length > 0 || isAdding ? (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-slate-600">Nome</th>
                <th className="px-4 py-3 text-right text-slate-600">Meta Mínima</th>
                <th className="px-4 py-3 text-center text-slate-600">Alocação</th>
                <th className="px-4 py-3 text-right text-slate-600">Saldo Inicial</th>
                <th className="px-4 py-3 text-center text-slate-600">Prior. Resgate</th>
                <th className="px-4 py-3 text-center text-slate-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isAdding && (
                <tr className="bg-purple-50">
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-2 py-1 border rounded text-sm"
                      placeholder="Nome"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={newMinTarget || ''}
                      onChange={(e) => setNewMinTarget(e.target.value ? parseFloat(e.target.value) : null)}
                      className="w-full px-2 py-1 border rounded text-sm text-right"
                      placeholder="Opcional"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newAllocation}
                      onChange={(e) => setNewAllocation(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border rounded text-sm text-center"
                      placeholder="%"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <CurrencyInput
                      value={newInitialBalance}
                      onChange={setNewInitialBalance}
                      compact
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min="1"
                      value={newWithdrawalPriority}
                      onChange={(e) => setNewWithdrawalPriority(parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-1 border rounded text-sm text-center"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex gap-1 justify-center">
                      <button
                        onClick={handleAdd}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs"
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
              {config.investments.map((investment) => (
                <tr key={investment.id} className="hover:bg-slate-50">
                  {editingId === investment.id ? (
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
                        <input
                          type="number"
                          value={editMinTarget || ''}
                          onChange={(e) => setEditMinTarget(e.target.value ? parseFloat(e.target.value) : null)}
                          className="w-full px-2 py-1 border rounded text-sm text-right"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={editAllocation}
                          onChange={(e) => setEditAllocation(parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border rounded text-sm text-center"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <CurrencyInput
                          value={editInitialBalance}
                          onChange={setEditInitialBalance}
                          compact
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min="1"
                          value={editWithdrawalPriority}
                          onChange={(e) => setEditWithdrawalPriority(parseInt(e.target.value) || 1)}
                          className="w-full px-2 py-1 border rounded text-sm text-center"
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
                      <td className="px-4 py-2 font-medium">{investment.name}</td>
                      <td className="px-4 py-2 text-right">
                        {investment.minValueTarget
                          ? formatCurrency(investment.minValueTarget)
                          : '-'}
                      </td>
                      <td className="px-4 py-2 text-center font-medium text-blue-600">
                        {investment.allocationPercent}%
                      </td>
                      <td className="px-4 py-2 text-right font-medium text-green-600">
                        {formatCurrency(investment.initialBalance)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">
                          {investment.withdrawalPriority}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={() => handleStartEdit(investment)}
                            className="p-1 hover:bg-blue-100 rounded text-blue-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeInvestment(investment.id)}
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
          Nenhum investimento cadastrado
        </p>
      )}
    </div>
  );
}
