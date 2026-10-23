import React, { useState, useEffect } from 'react';
import { ArrowDownToLine, CheckCircle2, Building2 } from 'lucide-react';

export default function Deposit() {
  const [accounts, setAccounts] = useState([]);
  const [account, setAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/accounts')
      .then(res => res.json())
      .then(data => {
        setAccounts(data);
        if (data.length > 0) setAccount(data[0].account_id);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: account,
          amount: parseFloat(amount),
          description: 'Cash Deposit'
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to deposit');
      
      setSuccess(true);
      // Update local balance
      setAccounts(accounts.map(acc => 
        acc.account_id === account ? { ...acc, balance: data.new_balance } : acc
      ));
      
      setTimeout(() => {
        setSuccess(false);
        setAmount('');
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
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
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading accounts...</div>
        ) : success ? (
          <div className="text-center py-12 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Deposit Successful!</h2>
            <p className="text-slate-500">The funds have been credited to your account.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-xl">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Account</label>
              <div className="grid gap-3">
                {accounts.map(acc => (
                  <label key={acc.account_id} className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors ${account === acc.account_id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="account" value={acc.account_id} checked={account === acc.account_id} onChange={(e) => setAccount(e.target.value)} className="text-emerald-600 focus:ring-emerald-500" />
                      <div>
                        <p className="font-semibold text-slate-900 capitalize">{acc.account_type} Account</p>
                        <p className="text-xs text-slate-500 font-mono">{acc.account_number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">₹{Number(acc.balance).toLocaleString()}</p>
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
                min="1"
                step="0.01"
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

            <button type="submit" disabled={submitting} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium py-4 rounded-xl shadow-md transition-colors">
              {submitting ? 'Processing...' : 'Confirm Deposit'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
