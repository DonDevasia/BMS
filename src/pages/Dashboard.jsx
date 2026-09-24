import React from 'react';
import { ArrowUpRight, ArrowDownRight, CreditCard, Wallet, TrendingUp, Activity, Plus } from 'lucide-react';
import { mockUser, mockTransactions } from '../data/mockData';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

const expenseData = [
  { name: 'Jan', expense: 4000, income: 24000 },
  { name: 'Feb', expense: 3000, income: 13980 },
  { name: 'Mar', expense: 2000, income: 9800 },
  { name: 'Apr', expense: 2780, income: 39080 },
  { name: 'May', expense: 1890, income: 48000 },
  { name: 'Jun', expense: 2390, income: 38000 },
];

export default function Dashboard() {
  const totalBalance = mockUser.accounts.reduce((acc, account) => acc + account.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {mockUser.name.split(' ')[0]}!</h1>
          <p className="text-slate-500">Here's what's happening with your finances today.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 transition-colors font-medium">
            <ArrowDownRight size={18} className="text-emerald-500" />
            Receive
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors font-medium">
            <ArrowUpRight size={18} />
            Send Money
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
              <Wallet size={20} />
            </div>
            <span className="text-sm font-medium text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
              <TrendingUp size={14} /> +2.4%
            </span>
          </div>
          <div className="relative z-10">
            <p className="text-sm text-slate-500 font-medium mb-1">Total Balance</p>
            <h3 className="text-3xl font-bold text-slate-900">₹{totalBalance.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl shadow-md text-white flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-white/10 text-white rounded-lg flex items-center justify-center">
              <CreditCard size={20} />
            </div>
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
              Smart Hybrid
            </span>
          </div>
          <div className="relative z-10 flex justify-between items-end">
            <div>
              <p className="text-sm text-slate-300 font-medium mb-1">Available Credit</p>
              <h3 className="text-3xl font-bold">₹{mockUser.cards[0].availableCredit.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
              <Activity size={20} />
            </div>
            <span className="text-sm font-medium text-rose-500 bg-rose-50 px-2 py-1 rounded-full flex items-center gap-1">
              <ArrowDownRight size={14} /> -1.2%
            </span>
          </div>
          <div className="relative z-10">
            <p className="text-sm text-slate-500 font-medium mb-1">Monthly Spending</p>
            <h3 className="text-3xl font-bold text-slate-900">₹14,060</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="text-xs py-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 rounded text-slate-600 font-medium transition-colors">Pay Bills</button>
              <button className="text-xs py-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 rounded text-slate-600 font-medium transition-colors">Scan QR</button>
              <button className="text-xs py-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 rounded text-slate-600 font-medium transition-colors">Split Bill</button>
              <button className="text-xs py-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 rounded text-slate-600 font-medium transition-colors flex items-center justify-center gap-1">
                <Plus size={12} /> More
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Income & Expenses</h2>
            <select className="text-sm border-slate-200 rounded-lg bg-slate-50 text-slate-600 focus:ring-blue-500">
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={expenseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Recent Transactions</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {mockTransactions.slice(0, 5).map((txn) => (
              <div key={txn.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    txn.type === 'Credit' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {txn.type === 'Credit' ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{txn.merchant}</p>
                    <p className="text-xs text-slate-500">{txn.category} • {txn.account}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${txn.type === 'Credit' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {txn.type === 'Credit' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400">{new Date(txn.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
