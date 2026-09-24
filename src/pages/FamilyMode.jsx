import React, { useState } from 'react';
import { Users, Shield, Clock, AlertTriangle, Check, X, Bell } from 'lucide-react';
import { mockFamily } from '../data/mockData';

export default function FamilyMode() {
  const [family, setFamily] = useState(mockFamily);
  const [showNotification, setShowNotification] = useState(false);

  const simulatePurchase = () => {
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 8000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="text-blue-600" /> Family Mode
          </h1>
          <p className="text-slate-500">Manage spending limits and approvals for your family members.</p>
        </div>
        <button onClick={simulatePurchase} className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
          Simulate Child Purchase
        </button>
      </div>

      {showNotification && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-4 animate-in slide-in-from-top-4 duration-300 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
          <div className="bg-white p-2 rounded-full text-amber-500 shadow-sm shrink-0">
            <Bell size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-amber-900">Parent Approval Required</h3>
            <p className="text-sm text-amber-800 mt-1">
              <strong>Alex (Child)</strong> is trying to purchase <strong>"Steam Games"</strong> for ₹1,200.<br/>
              This transaction is in a restricted category: <em>Gaming</em>.
            </p>
            <div className="flex gap-3 mt-3">
              <button onClick={() => setShowNotification(false)} className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1">
                <Check size={16} /> Approve
              </button>
              <button onClick={() => setShowNotification(false)} className="px-4 py-1.5 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors flex items-center gap-1">
                <X size={16} /> Reject
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {family.map(member => (
          <div key={member.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{member.name}</h2>
                  <p className="text-sm text-slate-500">{member.relation} • Age {member.age}</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-800 font-medium text-sm bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                Edit Settings
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Clock size={18} className="text-slate-400" /> Spending Limits
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500">Monthly Debit</span>
                      <span className="font-medium text-slate-900">₹{member.limits.debit.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full"><div className="w-1/3 h-full bg-blue-500 rounded-full"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500">Monthly Credit</span>
                      <span className="font-medium text-slate-900">₹{member.limits.credit.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full"><div className="w-0 h-full bg-purple-500 rounded-full"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500">Daily Limit</span>
                      <span className="font-medium text-slate-900">₹{member.limits.daily.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Shield size={18} className="text-emerald-500" /> Allowed Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {member.allowed.map(cat => (
                    <span key={cat} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-sm rounded-full border border-emerald-100">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-rose-500" /> Restricted Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {member.restricted.map(cat => (
                    <span key={cat} className="px-3 py-1 bg-rose-50 text-rose-700 text-sm rounded-full border border-rose-100">
                      {cat}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">Transactions in restricted categories require parent approval.</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
