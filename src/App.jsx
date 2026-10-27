import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import AdminLogin from './pages/AdminLogin';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import Transfer from './pages/Transfer';
import Accounts from './pages/Accounts';

// Placeholder Pages
const Bills = () => <div className="p-8 text-xl font-bold text-slate-800">Bills & EMI (WIP)</div>;
const Settings = () => <div className="p-8 text-xl font-bold text-slate-800">Settings (WIP)</div>;

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function AppRoutes() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Routes>
      {/* Customer Login strictly on /login (no admin tabs) */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <Login />
          )
        } 
      />

      {/* Admin Login strictly on /admin */}
      <Route 
        path="/admin" 
        element={
          isAuthenticated && isAdmin ? (
            <Navigate to="/" replace />
          ) : (
            <AdminLogin />
          )
        } 
      />

      {/* Main Authenticated Application Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
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
        <Route path="customer/dashboard" element={<Navigate to="/" replace />} />
        <Route path="admin/dashboard" element={<Navigate to="/" replace />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
