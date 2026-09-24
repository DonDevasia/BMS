import React, { useState } from 'react';
import { Plus, Settings2, Trash2, Edit2, ShieldAlert } from 'lucide-react';
import { mockRules } from '../data/mockData';

export default function PaymentRules() {
  const [rules, setRules] = useState(mockRules);

  const toggleRule = (id) => {
    setRules(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payment Rules</h1>
          <p className="text-slate-500">Automate your payments with custom IF/THEN routing rules.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2">
          <Plus size={18} /> Add New Rule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {rules.map((rule, idx) => (
            <div key={rule.id} className={`bg-white p-5 rounded-2xl border ${rule.active ? 'border-blue-200 shadow-sm' : 'border-slate-200 opacity-75'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">
                    {idx + 1}
                  </div>
                  <h3 className="font-semibold text-slate-900">Rule #{rule.id}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <button className="text-slate-400 hover:text-blue-600 transition-colors"><Edit2 size={16}/></button>
                  <button className="text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                  <div className="w-px h-4 bg-slate-200"></div>
                  <button 
                    onClick={() => toggleRule(rule.id)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${rule.active ? 'bg-blue-600' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${rule.active ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex-1 w-full">
                  <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">IF</span>
                  <p className="font-medium text-slate-800">{rule.condition}</p>
                </div>
                <div className="text-slate-400 hidden md:block">→</div>
                <div className="flex-1 w-full">
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">THEN</span>
                  <p className={`font-medium ${rule.action.includes('Credit') ? 'text-purple-700' : 'text-blue-700'}`}>{rule.action}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100">
            <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
              <Settings2 size={20} /> Example Rules
            </h3>
            <ul className="space-y-3 mt-4">
              <li className="text-sm text-indigo-800 bg-white/60 p-3 rounded-lg">
                <strong>IF</strong> amount &gt; ₹2,000 <br/><strong>THEN</strong> Use Credit
              </li>
              <li className="text-sm text-indigo-800 bg-white/60 p-3 rounded-lg">
                <strong>IF</strong> category = Grocery <br/><strong>THEN</strong> Use Debit
              </li>
              <li className="text-sm text-indigo-800 bg-white/60 p-3 rounded-lg">
                <strong>IF</strong> debit balance &lt; ₹5,000 <br/><strong>THEN</strong> Ask AI Assistant
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
