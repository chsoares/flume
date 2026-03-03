// App.tsx

import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { FlowPage } from './pages/FlowPage';
import { IncomePage } from './pages/IncomePage';
import { ExpensesPage } from './pages/ExpensesPage';
import { InvestmentsPage } from './pages/InvestmentsPage';
import { TripsPage } from './pages/TripsPage';
import { SettingsPage } from './pages/SettingsPage';
import { useFinancialStore } from './store/financialStore';
import { Menu } from 'lucide-react';

function App() {
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
    <Router basename="/flume">
      <div className="min-h-screen relative">
        {/* Mobile menu button */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden fixed top-4 left-4 z-40 p-3 bg-slate-800 rounded-xl shadow-lg"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>

        {/* Sidebar - fixed on left */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main content - scrollable */}
        <main className="pt-16 md:pt-6 pb-4 md:pb-6 px-4 md:pl-[calc(18rem+3rem)] md:pr-6 md:h-screen md:overflow-y-auto">
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
    </Router>
  );
}

export default App;
