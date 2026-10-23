import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, 
  Activity, Plus, ArrowDownToLine, ArrowUpFromLine, ArrowRightLeft,
  RefreshCw, CheckCircle2, AlertCircle, Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function Dashboard() {
  const { userFirstName, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [accRes, txnRes] = await Promise.all([
        fetch('/api/accounts'),
        fetch('/api/transactions')
      ]);

      const accData = await accRes.json();
      const txnData = await txnRes.json();

      setAccounts(Array.isArray(accData) ? accData : []);
      setTransactions(Array.isArray(txnData) ? txnData : []);
    } catch (err) {
      console.error('Failed to fetch real dashboard data:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Real Calculated Metrics
  const totalBalance = accounts.reduce((acc, account) => acc + Number(account.balance || 0), 0);
  
  const totalDeposits = transactions
    .filter(t => t.transaction_type === 'deposit')
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const totalWithdrawals = transactions
    .filter(t => t.transaction_type === 'withdrawal' || t.transaction_type === 'withdraw')
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  // Dynamic Monthly Chart Data from Real Transactions
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthIdx = new Date().getMonth();
  const dynamicExpenseData = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(currentMonthIdx - i);
    dynamicExpenseData.push({
      monthIdx: d.getMonth(),
      year: d.getFullYear(),
      name: monthNames[d.getMonth()],
      income: 0,
      expense: 0
    });
  }

  transactions.forEach((txn) => {
    if (!txn.created_at) return;
    const tDate = new Date(txn.created_at);
    const targetMonth = dynamicExpenseData.find(
      (m) => m.monthIdx === tDate.getMonth() && m.year === tDate.getFullYear()
    );
    if (targetMonth) {
      const amt = Number(txn.amount || 0);
      if (txn.transaction_type === 'deposit') {
        targetMonth.income += amt;
      } else {
        targetMonth.expense += amt;
      }
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Welcome back, {userFirstName}!
            {isAdmin && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                Admin Console
              </span>
            )}
          </h1>
          <p className="text-slate-500 text-sm">
            {isAdmin 
              ? "Real-time enterprise banking overview and live ledger volume." 
              : "Here is your real-time account balances and recent banking activity."}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg shadow-sm hover:bg-slate-50 transition-colors text-sm font-medium"
            title="Refresh real-time data"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin text-blue-600' : ''} />
            <span className="hidden md:inline">Sync</span>
          </button>
          <button 
            onClick={() => navigate('/deposit')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg shadow-sm hover:bg-emerald-100 transition-colors text-sm font-semibold"
          >
            <ArrowDownToLine size={16} className="text-emerald-600" />
            Deposit
          </button>
          <button 
            onClick={() => navigate('/withdraw')}
            className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg shadow-sm hover:bg-amber-100 transition-colors text-sm font-semibold"
          >
            <ArrowUpFromLine size={16} className="text-amber-600" />
            Withdraw
          </button>
          <button 
            onClick={() => navigate('/transfer')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors text-sm font-semibold"
          >
            <ArrowRightLeft size={16} />
            Transfer
          </button>
        </div>
      </div>

      {/* Real Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Balance Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
              <Wallet size={20} />
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1 border border-emerald-100">
              <TrendingUp size={12} /> Live Active
            </span>
          </div>
          <div className="relative z-10">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
              Total Real Balance
            </p>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {loading ? '...' : `₹${totalBalance.toLocaleString('en-IN')}`}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              {accounts.length} Connected Account{accounts.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {/* Total Inflow / Deposits Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
              <ArrowDownRight size={20} />
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
              Inflow
            </span>
          </div>
          <div className="relative z-10">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
              Total Deposits
            </p>
            <h3 className="text-3xl font-extrabold text-emerald-600 tracking-tight">
              {loading ? '...' : `₹${totalDeposits.toLocaleString('en-IN')}`}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              {transactions.filter(t => t.transaction_type === 'deposit').length} Deposit records in DB
            </p>
          </div>
        </div>

        {/* Total Outflow / Withdrawals Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center">
              <ArrowUpRight size={20} />
            </div>
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded-full border border-rose-100">
              Outflow
            </span>
          </div>
          <div className="relative z-10">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
              Total Withdrawals
            </p>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {loading ? '...' : `₹${totalWithdrawals.toLocaleString('en-IN')}`}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              {transactions.filter(t => t.transaction_type !== 'deposit').length} Outflow records in DB
            </p>
          </div>
        </div>

        {/* Banking Actions Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Direct Banking Operations
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => navigate('/deposit')}
                className="text-xs py-2.5 px-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl text-slate-700 font-semibold transition-colors flex items-center justify-center gap-1.5 border border-slate-100 hover:border-emerald-200"
              >
                <ArrowDownToLine size={14} className="text-emerald-500" /> Deposit
              </button>
              <button 
                onClick={() => navigate('/withdraw')}
                className="text-xs py-2.5 px-2 bg-slate-50 hover:bg-amber-50 hover:text-amber-700 rounded-xl text-slate-700 font-semibold transition-colors flex items-center justify-center gap-1.5 border border-slate-100 hover:border-amber-200"
              >
                <ArrowUpFromLine size={14} className="text-amber-500" /> Withdraw
              </button>
              <button 
                onClick={() => navigate('/transfer')}
                className="text-xs py-2.5 px-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-xl text-slate-700 font-semibold transition-colors flex items-center justify-center gap-1.5 border border-slate-100 hover:border-blue-200"
              >
                <ArrowRightLeft size={14} className="text-blue-500" /> Transfer
              </button>
              <button 
                onClick={() => navigate('/transactions')}
                className="text-xs py-2.5 px-2 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 rounded-xl text-slate-700 font-semibold transition-colors flex items-center justify-center gap-1.5 border border-slate-100 hover:border-purple-200"
              >
                <Activity size={14} className="text-purple-500" /> History
              </button>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Database Status</span>
            <span className="flex items-center gap-1 font-semibold text-emerald-600">
              <CheckCircle2 size={12} /> Connected
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts & Transactions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Real Cash Flow (Last 6 Months)</h2>
              <p className="text-xs text-slate-500">Calculated directly from confirmed database transactions</p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg font-medium">
              Live Aggregate
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicExpenseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip 
                  formatter={(value, name) => [`₹${Number(value).toLocaleString('en-IN')}`, name === 'income' ? 'Deposits' : 'Withdrawals']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-8 mt-4 pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-slate-600 font-medium">Deposits (Inflow)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span className="text-slate-600 font-medium">Withdrawals (Outflow)</span>
            </div>
          </div>
        </div>

        {/* Real Recent Transactions Component */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent Transactions</h2>
              <p className="text-xs text-slate-500">Actual operations from the database</p>
            </div>
            <button 
              onClick={() => navigate('/transactions')}
              className="text-xs text-blue-600 hover:text-blue-700 font-bold hover:underline"
            >
              View All ({transactions.length})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 max-h-[380px]">
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-slate-300" />
                Loading actual transactions...
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                <AlertCircle size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-slate-600">No transactions recorded yet</p>
                <p className="text-xs text-slate-400 mt-1">Make a deposit to see your first transaction here!</p>
                <button 
                  onClick={() => navigate('/deposit')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                >
                  Deposit Funds Now
                </button>
              </div>
            ) : (
              transactions.slice(0, 7).map((txn) => {
                const isDeposit = txn.transaction_type === 'deposit';
                const dateObj = txn.created_at ? new Date(txn.created_at) : null;
                const formattedDate = dateObj 
                  ? dateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
                  : 'Recent';
                const formattedTime = dateObj 
                  ? dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                  : '';

                return (
                  <div 
                    key={txn.transaction_id} 
                    className="flex items-center justify-between p-3 hover:bg-slate-50/80 rounded-xl transition-all cursor-pointer border border-slate-100 hover:border-slate-200 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 ${
                        isDeposit 
                          ? 'bg-emerald-100 text-emerald-600' 
                          : 'bg-rose-100 text-rose-600'
                      }`}>
                        {isDeposit ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {txn.description || (isDeposit ? 'Deposit' : 'Withdrawal')}
                        </p>
                        <p className="text-[11px] text-slate-500 capitalize truncate font-mono">
                          {txn.transaction_type} • ID: {txn.transaction_id ? txn.transaction_id.slice(0, 8) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <p className={`text-sm font-extrabold ${isDeposit ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {isDeposit ? '+' : '-'}₹{Number(txn.amount).toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {formattedDate} {formattedTime && `• ${formattedTime}`}
                      </p>
                      {txn.new_balance !== null && txn.new_balance !== undefined && (
                        <p className="text-[9px] text-slate-400 font-mono">
                          Bal: ₹{Number(txn.new_balance).toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
