import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Plus, ArrowDownToLine, ArrowUpFromLine, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function Accounts() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/accounts')
      .then(res => res.json())
      .then(data => {
        setAccounts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const totalBalance = accounts.reduce((acc, a) => acc + Number(a.balance || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bank Accounts</h1>
          <p className="text-slate-500">Manage and monitor your active bank accounts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/deposit')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 text-sm font-semibold transition-colors"
          >
            <ArrowDownToLine size={16} /> Deposit Funds
          </button>
        </div>
      </div>

      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-indigo-300 font-semibold mb-1">Total Liquid Balance</p>
          <h2 className="text-4xl font-extrabold tracking-tight">₹{totalBalance.toLocaleString('en-IN')}</h2>
          <p className="text-xs text-slate-400 mt-2 font-mono">{accounts.length} Total Accounts Registered</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md text-xs font-semibold">
          <ShieldCheck size={16} className="text-emerald-400" />
          <span>FDIC / RBI Insured Banking</span>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <RefreshCw size={28} className="animate-spin mx-auto mb-3 text-blue-600" />
            Loading live accounts from database...
          </div>
        ) : accounts.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            No accounts found.
          </div>
        ) : (
          accounts.map(acc => (
            <div 
              key={acc.account_id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Wallet size={24} />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {acc.status || 'Active'}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 capitalize">{acc.account_type} Account</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">A/C No: {acc.account_number}</p>
                <div className="mt-6">
                  <p className="text-xs uppercase text-slate-400 font-semibold">Current Balance</p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-1">₹{Number(acc.balance).toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => navigate('/deposit')}
                  className="flex-1 py-2 text-xs font-semibold bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg text-slate-700 transition-colors flex items-center justify-center gap-1 border border-slate-200"
                >
                  <ArrowDownToLine size={14} /> Deposit
                </button>
                <button
                  onClick={() => navigate('/withdraw')}
                  className="flex-1 py-2 text-xs font-semibold bg-slate-50 hover:bg-amber-50 hover:text-amber-700 rounded-lg text-slate-700 transition-colors flex items-center justify-center gap-1 border border-slate-200"
                >
                  <ArrowUpFromLine size={14} /> Withdraw
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
