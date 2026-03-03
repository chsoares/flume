// pages/SettingsPage.tsx

import { useState, useEffect } from 'react';
import { githubSync } from '../services/githubSync';
import { useFinancialStore } from '../store/financialStore';
import { Github, Check, X, AlertCircle, Download, Upload, RotateCcw, FileText } from 'lucide-react';
import { exportToJSON, importFromJSON, clearLocalStorage } from '../utils/persistence';

export function SettingsPage() {
  const [token, setToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const { loadFromGitHub, loadSampleData, resetStore, recalculateAllMonths } = useFinancialStore();

  useEffect(() => {
    setIsAuthenticated(githubSync.isAuthenticated());
  }, []);

  async function handleTestToken() {
    if (!token) return;

    setIsTesting(true);
    setTestResult(null);
    setErrorMessage('');

    try {
      const isValid = await githubSync.testToken(token);

      if (isValid) {
        setTestResult('success');
        setErrorMessage('');
      } else {
        setTestResult('error');
        setErrorMessage('Token inválido. Verifique se você gerou o token corretamente.');
      }
    } catch (error) {
      setTestResult('error');
      setErrorMessage('Erro ao validar token. Verifique sua conexão.');
    } finally {
      setIsTesting(false);
    }
  }

  async function handleSaveToken() {
    if (!token) return;

    try {
      githubSync.setToken(token);
      setIsAuthenticated(true);
      setToken('');
      setTestResult(null);

      // Tentar carregar dados do GitHub
      await loadFromGitHub();
    } catch (error) {
      console.error('Erro ao configurar token:', error);
      setErrorMessage('Erro ao configurar token.');
    }
  }

  function handleDisconnect() {
    if (window.confirm('Tem certeza que deseja desconectar do GitHub? Os dados continuarão salvos no Gist, mas não serão mais sincronizados automaticamente.')) {
      githubSync.clearToken();
      setIsAuthenticated(false);
      setTestResult(null);
      setErrorMessage('');
    }
  }

  function handleExport() {
    const state = useFinancialStore.getState();
    const { persist, loadFromStorage, loadFromGitHub, resetStore, recalculateAllMonths, syncStatus, lastSyncError, ...stateToExport } = state;
    const json = exportToJSON(stateToExport);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flume-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }

  function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = e.target?.result as string;
          const state = importFromJSON(json);
          useFinancialStore.setState(state);
          recalculateAllMonths();
          useFinancialStore.getState().persist();
          alert('Dados importados com sucesso!');
        } catch (error) {
          alert('Erro ao importar arquivo. Verifique o formato.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function handleReset() {
    if (confirm('Tem certeza que deseja resetar todos os dados? Esta ação não pode ser desfeita.')) {
      resetStore();
      clearLocalStorage();
      window.location.reload();
    }
  }

  function handleLoadSample() {
    if (confirm('Deseja carregar dados de exemplo? Isso substituirá os dados atuais.')) {
      loadSampleData();
      window.location.reload();
    }
  }

  return (
    <div className="space-y-6">
      {/* GitHub Sync Card */}
      <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '0s' }}>
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
          <div className="icon-badge bg-gradient-to-br from-slate-700 to-slate-800">
            <Github className="w-5 h-5 text-white" />
          </div>
          Sincronização com GitHub
        </h2>

        {!isAuthenticated ? (
          <div className="space-y-5">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <h3 className="font-semibold text-blue-600 mb-3">Como configurar:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600">
                <li>
                  Acesse{' '}
                  <a
                    href="https://github.com/settings/tokens/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline hover:text-blue-600 transition-colors"
                  >
                    GitHub Settings → Developer settings → Personal access tokens
                  </a>
                </li>
                <li>Clique em "Generate new token" (classic)</li>
                <li>Dê um nome como "Flume Sync"</li>
                <li>
                  Selecione apenas a permissão <span className="text-blue-600 font-medium">gist</span>
                </li>
                <li>Clique em "Generate token"</li>
                <li>Copie o token e cole abaixo</li>
              </ol>
            </div>

            {/* Token Input */}
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-slate-500 mb-2 block">Personal Access Token</span>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxx"
                  className="input-field w-full h-10 px-4"
                />
              </label>

              {testResult === 'success' && (
                <div className="flex items-center gap-2 text-emerald-600 text-sm p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <Check className="w-4 h-4" />
                  <span>Token válido! Clique em "Salvar e Conectar" para continuar.</span>
                </div>
              )}

              {testResult === 'error' && (
                <div className="flex items-center gap-2 text-rose-600 text-sm p-3 bg-rose-50 border border-rose-100 rounded-xl">
                  <X className="w-4 h-4" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleTestToken}
                  disabled={!token || isTesting}
                  className="px-5 py-2.5 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTesting ? 'Testando...' : 'Testar Token'}
                </button>

                <button
                  onClick={handleSaveToken}
                  disabled={!token || testResult !== 'success'}
                  className="px-5 py-2.5 btn-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Salvar e Conectar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Connected Status */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <Check className="w-5 h-5" />
                <span className="font-semibold">Conectado ao GitHub</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Seus dados estão sendo sincronizados automaticamente em um Gist privado.
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
              <div className="flex items-start gap-3 text-violet-600">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold mb-2">Sobre a sincronização:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-500">
                    <li>Os dados são salvos automaticamente após cada alteração</li>
                    <li>Você pode acessar de qualquer computador usando o mesmo token</li>
                    <li>O histórico completo fica disponível no GitHub Gist</li>
                    <li>Os dados são privados - apenas você tem acesso</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={handleDisconnect}
              className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200
                       hover:border-rose-300 rounded-xl transition-all duration-200 font-medium"
            >
              Desconectar
            </button>
          </div>
        )}
      </div>

      {/* Data Management Card */}
      <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <h2 className="text-xl font-bold text-slate-800 mb-6">Gerenciamento de Dados</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleLoadSample}
            className="flex items-center justify-center gap-2 px-4 py-3
                     btn-accent"
          >
            <FileText className="w-4 h-4" />
            <span>Carregar Exemplo</span>
          </button>

          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-4 py-3
                     btn-secondary"
          >
            <Download className="w-4 h-4" />
            <span>Exportar JSON</span>
          </button>

          <button
            onClick={handleImport}
            className="flex items-center justify-center gap-2 px-4 py-3
                     btn-secondary"
          >
            <Upload className="w-4 h-4" />
            <span>Importar JSON</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-2 px-4 py-3
                     bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200
                     hover:border-rose-300 rounded-xl transition-all duration-200 font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Resetar Dados</span>
          </button>
        </div>
      </div>
    </div>
  );
}
