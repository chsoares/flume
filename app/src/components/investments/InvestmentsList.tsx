// components/investments/InvestmentsList.tsx

import { useState } from 'react';
import { useFinancialStore } from '../../store/financialStore';
import { formatCurrency } from '../../utils/formatters';
import { CurrencyInput } from '../shared/CurrencyInput';
import { Plus, Trash2, AlertTriangle, CheckCircle, Edit, Save, X, Settings } from 'lucide-react';
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
    <div className="card p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-3 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-3">
          <div className="icon-badge bg-gradient-to-br from-violet-500 to-indigo-500">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-slate-700">Configuração de Investimentos</h3>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="btn-purple w-9 h-9"
          title="Novo Investimento"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Allocation Warning */}
      <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 ${
        allocationValid
          ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
          : 'bg-amber-50 border border-amber-200 text-amber-700'
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
        <div className="card-subtle rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/50">
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nome</th>
                <th className="w-32 px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Meta Mínima</th>
                <th className="w-24 px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Alocação</th>
                <th className="w-32 px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Saldo Inicial</th>
                <th className="w-28 px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Prior. Resgate</th>
                <th className="w-28 px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isAdding && (
                <tr className="bg-violet-50/50">
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="input-field w-full h-10 px-3 text-sm"
                      placeholder="Nome"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={newMinTarget || ''}
                      onChange={(e) => setNewMinTarget(e.target.value ? parseFloat(e.target.value) : null)}
                      className="input-field w-full h-10 px-3 text-sm text-right"
                      placeholder="Opcional"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newAllocation}
                      onChange={(e) => setNewAllocation(parseFloat(e.target.value) || 0)}
                      className="input-field w-full h-10 px-3 text-sm text-center"
                      placeholder="%"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <CurrencyInput
                      value={newInitialBalance}
                      onChange={setNewInitialBalance}
                      compact
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="1"
                      value={newWithdrawalPriority}
                      onChange={(e) => setNewWithdrawalPriority(parseInt(e.target.value) || 1)}
                      className="input-field w-full h-10 px-3 text-sm text-center"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={handleAdd}
                        className="btn-purple w-9 h-9"
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
              {config.investments.map((investment) => (
                <tr key={investment.id} className="hover:bg-slate-50 transition-colors">
                  {editingId === investment.id ? (
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
                        <input
                          type="number"
                          value={editMinTarget || ''}
                          onChange={(e) => setEditMinTarget(e.target.value ? parseFloat(e.target.value) : null)}
                          className="input-field w-full h-10 px-3 text-sm text-right"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={editAllocation}
                          onChange={(e) => setEditAllocation(parseFloat(e.target.value) || 0)}
                          className="input-field w-full h-10 px-3 text-sm text-center"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <CurrencyInput
                          value={editInitialBalance}
                          onChange={setEditInitialBalance}
                          compact
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="1"
                          value={editWithdrawalPriority}
                          onChange={(e) => setEditWithdrawalPriority(parseInt(e.target.value) || 1)}
                          className="input-field w-full h-10 px-3 text-sm text-center"
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
                      <td className="px-4 py-3 font-medium text-slate-700">{investment.name}</td>
                      <td className="px-4 py-3 text-right text-slate-600 tabular-nums">
                        {investment.minValueTarget
                          ? formatCurrency(investment.minValueTarget)
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-blue-500">
                        {investment.allocationPercent}%
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-emerald-500 tabular-nums">
                        {formatCurrency(investment.initialBalance)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-lg text-xs font-medium">
                          {investment.withdrawalPriority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() => handleStartEdit(investment)}
                            className="btn-action text-blue-500"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeInvestment(investment.id)}
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
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-slate-400 py-8 italic">
          Nenhum investimento cadastrado
        </p>
      )}
    </div>
  );
}
