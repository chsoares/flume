// App.tsx

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { FlowPage } from './pages/FlowPage';
import { IncomePage } from './pages/IncomePage';
import { ExpensesPage } from './pages/ExpensesPage';
import { InvestmentsPage } from './pages/InvestmentsPage';
import { TripsPage } from './pages/TripsPage';
import { SettingsPage } from './pages/SettingsPage';
import { useFinancialStore } from './store/financialStore';

function App() {
  const { loadFromStorage, recalculateAllMonths, months } = useFinancialStore();

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
      <div className="flex h-screen bg-slate-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto bg-slate-50 p-8">
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
      </div>
    </Router>
  );
}

export default App;
