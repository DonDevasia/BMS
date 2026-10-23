import React, { useState, useEffect } from 'react';
import { ArrowUpFromLine, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Withdraw() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [account, setAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/accounts')
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setAccounts(list);
        if (list.length > 0) setAccount(list[0].account_id);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const selectedAcc = accounts.find(a => a.account_id === account);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAcc) {
      setError('Please select an account');
      return;
    }
    if (Number(amount) > Number(selectedAcc.balance)) {
      setError(`Insufficient balance. Current balance is ₹${Number(selectedAcc.balance).toLocaleString('en-IN')}`);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: account,
          amount: parseFloat(amount),
          description: 'Cash Withdrawal (ATM)'
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to process withdrawal');

      setSuccess(true);
      // Update local balance
      setAccounts(accounts.map(acc => 
        acc.account_id === account ? { ...acc, balance: data.new_balance } : acc
      ));

      setTimeout(() => {
        setSuccess(false);
        setAmount('');
      }, 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shadow-sm">
          <ArrowUpFromLine size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Withdraw Funds</h1>
          <p className="text-slate-500">Real-time debits from your bank accounts.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-amber-500" />
            Loading real accounts...
          </div>
        ) : success ? (
          <div className="text-center py-12 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Withdrawal Successful!</h2>
            <p className="text-slate-500 mb-6">
              ₹{Number(amount).toLocaleString('en-IN')} has been debited. Please collect your cash from the dispenser.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Source Account</label>
              {accounts.length === 0 ? (
                <div className="p-4 border rounded-xl bg-slate-50 text-sm text-slate-500">
                  No accounts found in database.
                </div>
              ) : (
                <div className="grid gap-3">
                  {accounts.map(acc => (
                    <label 
                      key={acc.account_id} 
                      className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors ${
                        account === acc.account_id ? 'border-amber-500 bg-amber-50/60' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name="account" 
                          value={acc.account_id} 
                          checked={account === acc.account_id} 
                          onChange={(e) => setAccount(e.target.value)} 
                          className="text-amber-600 focus:ring-amber-500" 
                        />
                        <div>
                          <p className="font-semibold text-slate-900 capitalize">{acc.account_type} Account</p>
                          <p className="text-xs text-slate-500 font-mono">No: {acc.account_number}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">₹{Number(acc.balance).toLocaleString('en-IN')}</p>
                        <p className="text-xs text-slate-500">Available Balance</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Withdrawal Amount (₹)</label>
              <input 
                type="number" 
                required
                min="1"
                step="any"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(''); }}
                className={`w-full text-2xl font-bold text-slate-900 px-4 py-4 border rounded-xl focus:ring-2 outline-none ${
                  error ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' : 'border-slate-300 focus:ring-amber-500 focus:border-amber-500'
                }`}
                placeholder="0.00"
              />
              {error && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle size={14} /> {error}
                </p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={submitting || accounts.length === 0}
              className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-medium py-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? 'Processing Transaction with Bank...' : 'Confirm Withdrawal'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
