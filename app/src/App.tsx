// App.tsx

import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { FlowPage } from './pages/FlowPage';
import { IncomePage } from './pages/IncomePage';
import { ExpensesPage } from './pages/ExpensesPage';
import { InvestmentsPage } from './pages/InvestmentsPage';
import { TripsPage } from './pages/TripsPage';
import { SettingsPage } from './pages/SettingsPage';
import { useFinancialStore } from './store/financialStore';
import { Menu, Waves } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/': 'Fluxo de Caixa',
  '/income': 'Receitas',
  '/expenses': 'Despesas',
  '/investments': 'Investimentos',
  '/trips': 'Viagens',
  '/settings': 'Configurações',
};

function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || 'flume';

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-800 px-4 py-3 flex items-center gap-3">
      <button
        onClick={onMenuClick}
        className="p-2 rounded-xl hover:bg-white/10 transition-colors"
      >
        <Menu className="w-5 h-5 text-white" />
      </button>
      <div className="flex items-center gap-2">
        <div className="bg-gradient-to-br from-pink-500 to-blue-500 p-1.5 rounded-lg">
          <Waves className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-lg font-bold text-white">{pageTitle}</h1>
      </div>
    </header>
  );
}

function AppContent() {
  const { loadFromStorage, recalculateAllMonths, months } = useFinancialStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await loadFromStorage();

      // Se não há meses calculados, gerar inicialmente
      if (months.length === 0) {
        recalculateAllMonths();
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen relative">
      {/* Mobile Header */}
      <MobileHeader onMenuClick={() => setIsSidebarOpen(true)} />

      {/* Sidebar - fixed on left */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main content - scrollable */}
      <main className="pt-20 md:pt-6 pb-4 md:pb-6 px-4 md:pl-[calc(18rem+3rem)] md:pr-6 md:h-screen md:overflow-y-auto">
        <Routes>
          <Route path="/" element={<FlowPage />} />
          <Route path="/income" element={<IncomePage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/investments" element={<InvestmentsPage />} />
          <Route path="/trips" element={<TripsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router basename="/flume">
      <AppContent />
    </Router>
  );
}

export default App;
