import React, { useState } from 'react';
import { ArrowDownToLine, CheckCircle2, Building2 } from 'lucide-react';
import { mockUser } from '../data/mockData';

export default function Deposit() {
  const [account, setAccount] = useState(mockUser.accounts[0].id);
  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setAmount('');
    }, 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
          <ArrowDownToLine size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Deposit Funds</h1>
          <p className="text-slate-500">Add money to your accounts.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        {success ? (
          <div className="text-center py-12 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Deposit Successful!</h2>
            <p className="text-slate-500">The funds have been credited to your account.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Account</label>
              <div className="grid gap-3">
                {mockUser.accounts.map(acc => (
                  <label key={acc.id} className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors ${account === acc.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="account" value={acc.id} checked={account === acc.id} onChange={(e) => setAccount(e.target.value)} className="text-emerald-600 focus:ring-emerald-500" />
                      <div>
                        <p className="font-semibold text-slate-900">{acc.type} Account</p>
                        <p className="text-xs text-slate-500 font-mono">{acc.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">₹{acc.balance.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">Available</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Amount (₹)</label>
              <input 
                type="number" 
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-2xl font-bold text-slate-900 px-4 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                placeholder="0.00"
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-xl flex gap-3 text-sm text-slate-600">
              <Building2 className="shrink-0" size={18} />
              <p>Deposits are instantly credited to your selected account.</p>
            </div>

            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-4 rounded-xl shadow-md transition-colors">
              Confirm Deposit
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
