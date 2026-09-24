import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import SmartCard from './pages/SmartCard';
import AiAssistant from './pages/AiAssistant';
import SplitPayment from './pages/SplitPayment';
import PaymentRules from './pages/PaymentRules';
import FamilyMode from './pages/FamilyMode';
import Database from './pages/Database';
import Transactions from './pages/Transactions';
import Login from './pages/Login';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import Transfer from './pages/Transfer';

// Placeholder Pages
const Accounts = () => <div className="p-8 text-xl font-bold">Accounts Page (WIP)</div>;
const Bills = () => <div className="p-8 text-xl font-bold">Bills & EMI (WIP)</div>;
const Settings = () => <div className="p-8 text-xl font-bold">Settings (WIP)</div>;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="deposit" element={<Deposit />} />
          <Route path="withdraw" element={<Withdraw />} />
          <Route path="transfer" element={<Transfer />} />
          <Route path="smart-card" element={<SmartCard />} />
          <Route path="ai-assistant" element={<AiAssistant />} />
          <Route path="split-payment" element={<SplitPayment />} />
          <Route path="rules" element={<PaymentRules />} />
          <Route path="family" element={<FamilyMode />} />
          <Route path="bills" element={<Bills />} />
          <Route path="database" element={<Database />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
