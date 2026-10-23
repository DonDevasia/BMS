import React, { useState } from 'react';
import { Database as DbIcon, Users, CreditCard, Building2, UserCircle, Table } from 'lucide-react';
import { mockUser, mockTransactions } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

export default function Database() {
  const { user, userName, userEmail, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState('customers');

  const tabs = [
    { id: 'customers', name: 'Customers', icon: Users },
    { id: 'accounts', name: 'Accounts', icon: Table },
    { id: 'cards', name: 'Banking Cards', icon: CreditCard },
    { id: 'branches', name: 'Branches', icon: Building2 },
    { id: 'employees', name: 'Employees', icon: UserCircle },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-slate-800 text-slate-100 rounded-xl flex items-center justify-center shadow-sm">
          <DbIcon size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Database Management</h1>
          <p className="text-slate-500">View normalized relational banking entities.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 overflow-x-auto custom-scrollbar bg-slate-50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap border-b-2 ${
                activeTab === tab.id 
                  ? 'border-blue-600 text-blue-600 bg-white' 
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <tab.icon size={16} />
              {tab.name}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-x-auto">
          {activeTab === 'customers' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <th className="pb-3 pr-4 font-semibold">Customer ID</th>
                  <th className="pb-3 pr-4 font-semibold">Name</th>
                  <th className="pb-3 pr-4 font-semibold">Email</th>
                  <th className="pb-3 pr-4 font-semibold">Registration Date</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 pr-4 font-mono text-slate-600">{user?.id ? user.id.slice(0, 8) + '...' : mockUser.id}</td>
                  <td className="py-4 pr-4 font-semibold text-slate-900">{userName || mockUser.name}</td>
                  <td className="py-4 pr-4 text-slate-600">{userEmail || mockUser.email}</td>
                  <td className="py-4 pr-4 text-slate-600">October 2026</td>
                  <td className="py-4">
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                      {userRole === 'admin' ? 'Active Admin' : 'Active Customer'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          )}

          {activeTab === 'accounts' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <th className="pb-3 pr-4 font-semibold">Account Number</th>
                  <th className="pb-3 pr-4 font-semibold">Customer ID</th>
                  <th className="pb-3 pr-4 font-semibold">Type</th>
                  <th className="pb-3 pr-4 font-semibold text-right">Balance</th>
                  <th className="pb-3 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {mockUser.accounts.map(acc => (
                  <tr key={acc.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 pr-4 font-mono text-blue-600">{acc.id}</td>
                    <td className="py-4 pr-4 font-mono text-slate-500">{mockUser.id}</td>
                    <td className="py-4 pr-4 font-medium text-slate-700">{acc.type}</td>
                    <td className="py-4 pr-4 text-right font-bold text-slate-900">₹{acc.balance.toLocaleString()}</td>
                    <td className="py-4 text-center">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">{acc.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'cards' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <th className="pb-3 pr-4 font-semibold">Card ID</th>
                  <th className="pb-3 pr-4 font-semibold">Customer ID</th>
                  <th className="pb-3 pr-4 font-semibold">Type</th>
                  <th className="pb-3 pr-4 font-semibold">Debit Limit</th>
                  <th className="pb-3 pr-4 font-semibold">Credit Limit</th>
                  <th className="pb-3 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {mockUser.cards.map(card => (
                  <tr key={card.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 pr-4 font-mono text-purple-600">{card.id}</td>
                    <td className="py-4 pr-4 font-mono text-slate-500">{mockUser.id}</td>
                    <td className="py-4 pr-4 font-medium text-slate-700">{card.type}</td>
                    <td className="py-4 pr-4">₹{card.debitBalance.toLocaleString()}</td>
                    <td className="py-4 pr-4">₹{card.creditLimit.toLocaleString()}</td>
                    <td className="py-4 text-center">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">{card.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {(activeTab === 'branches' || activeTab === 'employees') && (
            <div className="py-12 text-center text-slate-500 flex flex-col items-center">
              <Table size={48} className="text-slate-300 mb-4" />
              <p>Demo Data for {activeTab} not populated yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
