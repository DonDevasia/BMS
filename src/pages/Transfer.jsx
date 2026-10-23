import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, CheckCircle2, User, RefreshCw, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Transfer() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [account, setAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [receiver, setReceiver] = useState('');
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
      setError('Please select a source account');
      return;
    }
    if (Number(amount) > Number(selectedAcc.balance)) {
      setError(`Insufficient balance. Current balance is ₹${Number(selectedAcc.balance).toLocaleString('en-IN')}`);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAccountId: account,
          toAccountId: receiver.trim(),
          amount: parseFloat(amount),
          description: `Transfer to ${receiver.trim()}`
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process transfer');

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setAmount('');
        setReceiver('');
      }, 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
          <ArrowRightLeft size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fund Transfer</h1>
          <p className="text-slate-500">Send money instantly across bank accounts.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-blue-600" />
            Loading real accounts...
          </div>
        ) : success ? (
          <div className="text-center py-16 px-6 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Transfer Successful!</h2>
            <p className="text-slate-500 mb-6">
              ₹{Number(amount).toLocaleString('en-IN')} has been securely transferred to {receiver}.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row">
            <div className="p-8 md:w-2/3">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm flex items-start gap-2">
                    <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">From Source Account</label>
                  <select 
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                  >
                    {accounts.map(acc => (
                      <option key={acc.account_id} value={acc.account_id}>
                        {acc.account_type.toUpperCase()} ({acc.account_number}) — Available: ₹{Number(acc.balance).toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">To Account Number / Payee</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User size={18} />
                    </div>
                    <input 
                      type="text" 
                      required
                      value={receiver}
                      onChange={(e) => { setReceiver(e.target.value); setError(''); }}
                      className="w-full pl-11 p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      placeholder="e.g. 1000200030004000 or Account UUID"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Transfer Amount (₹)</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    step="any"
                    value={amount}
                    onChange={(e) => { setAmount(e.target.value); setError(''); }}
                    className="w-full text-2xl font-bold text-slate-900 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="0.00"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={submitting || accounts.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? 'Initiating Inter-Account Transfer...' : (
                    <>Send Money Instantly <ArrowRightLeft size={18} /></>
                  )}
                </button>
              </form>
            </div>

            <div className="bg-slate-50 p-8 md:w-1/3 border-t md:border-t-0 md:border-l border-slate-200">
              <h3 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wider">
                Quick Select Account
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Click any registered account to populate the destination:
              </p>
              <div className="space-y-3">
                {accounts.map((acc) => (
                  <div 
                    key={acc.account_id} 
                    className="flex flex-col p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-300 cursor-pointer transition-all shadow-2xs"
                    onClick={() => setReceiver(acc.account_number)}
                  >
                    <p className="text-xs font-mono font-bold text-blue-600">{acc.account_number}</p>
                    <p className="text-[11px] text-slate-500 capitalize">{acc.account_type} Account</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
