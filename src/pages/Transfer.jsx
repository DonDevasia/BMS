import React, { useState } from 'react';
import { ArrowRightLeft, CheckCircle2, User } from 'lucide-react';
import { mockUser } from '../data/mockData';

export default function Transfer() {
  const [account, setAccount] = useState(mockUser.accounts[0].id);
  const [amount, setAmount] = useState('');
  const [receiver, setReceiver] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setAmount('');
      setReceiver('');
    }, 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
          <ArrowRightLeft size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fund Transfer</h1>
          <p className="text-slate-500">Send money instantly.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {success ? (
          <div className="text-center py-16 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Transfer Successful!</h2>
            <p className="text-slate-500">Your funds have been securely transferred.</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row">
            <div className="p-8 md:w-2/3">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">From Account</label>
                  <select 
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {mockUser.accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.type} Account - {acc.id} (₹{acc.balance.toLocaleString()})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">To Account Number / UPI</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-slate-400" />
                    </div>
                    <input 
                      type="text" 
                      required
                      value={receiver}
                      onChange={(e) => setReceiver(e.target.value)}
                      className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Enter receiver details"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Amount (₹)</label>
                  <input 
                    type="number" 
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full text-2xl font-bold text-slate-900 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="0.00"
                  />
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2">
                  Send Money <ArrowRightLeft size={18} />
                </button>
              </form>
            </div>
            <div className="bg-slate-50 p-8 md:w-1/3 border-t md:border-t-0 md:border-l border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4">Recent Payees</h3>
              <div className="space-y-4">
                {['Sarah Jenkins', 'TechMart Inc.', 'Electric Bill'].map((name, i) => (
                  <div key={i} className="flex items-center gap-3 cursor-pointer hover:bg-slate-100 p-2 -mx-2 rounded-lg transition-colors" onClick={() => setReceiver(name)}>
                    <div className="w-10 h-10 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center font-bold">
                      {name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{name}</p>
                      <p className="text-xs text-slate-500">Added {i+1} days ago</p>
                    </div>
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
