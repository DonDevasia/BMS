import React from 'react';
import { ArrowUpRight, ArrowDownRight, Filter, Search } from 'lucide-react';
import { mockTransactions } from '../data/mockData';

export default function Transactions() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transaction History</h1>
          <p className="text-slate-500">View and filter all your recent transactions.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4 font-semibold">Transaction ID</th>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold">Merchant / Details</th>
              <th className="px-6 py-4 font-semibold">Category</th>
              <th className="px-6 py-4 font-semibold">Account</th>
              <th className="px-6 py-4 font-semibold text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {mockTransactions.map((txn) => (
              <tr key={txn.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-slate-500 text-xs">{txn.id}</td>
                <td className="px-6 py-4 text-slate-600">{new Date(txn.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    txn.type === 'Credit' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {txn.type === 'Credit' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                  </div>
                  {txn.merchant}
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                    {txn.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{txn.account}</td>
                <td className={`px-6 py-4 text-right font-bold ${txn.type === 'Credit' ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {txn.type === 'Credit' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
