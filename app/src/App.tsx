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
import { useFinancialStore } from './store/financialStore';

function App() {
  const { loadFromStorage, recalculateAllMonths, months } = useFinancialStore();

  useEffect(() => {
    loadFromStorage();

    // Se não há meses calculados, gerar inicialmente
    if (months.length === 0) {
      recalculateAllMonths();
    }
  }, []);

  return (
    <Router>
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
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
