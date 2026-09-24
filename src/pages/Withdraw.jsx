import React, { useState } from 'react';
import { ArrowUpFromLine, CheckCircle2, AlertCircle } from 'lucide-react';
import { mockUser } from '../data/mockData';

export default function Withdraw() {
  const [account, setAccount] = useState(mockUser.accounts[0].id);
  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const selectedAcc = mockUser.accounts.find(a => a.id === account);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Number(amount) > selectedAcc.balance) {
      setError('Insufficient balance');
      return;
    }
    setError('');
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setAmount('');
    }, 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shadow-sm">
          <ArrowUpFromLine size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Withdraw Funds</h1>
          <p className="text-slate-500">Withdraw money from your accounts.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        {success ? (
          <div className="text-center py-12 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Withdrawal Successful!</h2>
            <p className="text-slate-500">Please collect your cash from the dispenser.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Account</label>
              <div className="grid gap-3">
                {mockUser.accounts.map(acc => (
                  <label key={acc.id} className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors ${account === acc.id ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="account" value={acc.id} checked={account === acc.id} onChange={(e) => setAccount(e.target.value)} className="text-amber-600 focus:ring-amber-500" />
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
                onChange={(e) => { setAmount(e.target.value); setError(''); }}
                className={`w-full text-2xl font-bold text-slate-900 px-4 py-4 border rounded-xl focus:ring-2 outline-none ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' : 'border-slate-300 focus:ring-amber-500 focus:border-amber-500'}`}
                placeholder="0.00"
              />
              {error && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><AlertCircle size={14} /> {error}</p>}
            </div>

            <button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-4 rounded-xl shadow-md transition-colors">
              Confirm Withdrawal
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
