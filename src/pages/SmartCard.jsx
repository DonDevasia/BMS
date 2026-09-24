import React, { useState } from 'react';
import { CreditCard, ShieldAlert, Settings, RefreshCw, Zap, Lock, Eye, EyeOff } from 'lucide-react';
import { mockUser } from '../data/mockData';

export default function SmartCard() {
  const card = mockUser.cards[0];
  const [showDetails, setShowDetails] = useState(false);
  const [emergencySwitch, setEmergencySwitch] = useState(card.emergencySwitch);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Smart Hybrid Card</h1>
        <p className="text-slate-500">One Card. Smart Decisions. Flexible Payments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Virtual Card Visualization */}
        <div className="space-y-6">
          <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-blue-900 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden h-64 flex flex-col justify-between transform transition-transform hover:-translate-y-2">
            {/* Hologram effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
            
            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-2">
                <CreditCard size={28} className="text-blue-400" />
                <span className="font-bold text-xl tracking-wider text-slate-200">NEXUS</span>
              </div>
              <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full border border-white/20 backdrop-blur-md">
                <Zap size={14} className="text-yellow-400" />
                <span className="text-xs font-semibold">HYBRID SMART</span>
              </div>
            </div>
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-yellow-400/80 rounded-md"></div>
                <Zap size={24} className="text-slate-400/50" />
              </div>
              
              <div className="font-mono text-2xl tracking-widest flex items-center justify-between">
                {showDetails ? (
                  <span>4532 8921 4829 1122</span>
                ) : (
                  <span>**** **** **** {card.number.slice(-4)}</span>
                )}
                <button 
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {showDetails ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              <div className="flex justify-between items-end font-mono text-sm uppercase">
                <div>
                  <p className="text-[10px] text-slate-400 mb-1">Cardholder</p>
                  <p>{card.cardholderName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-1">Expires</p>
                  <p>{card.expiry}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-1">CVV</p>
                  <p>{showDetails ? '842' : '***'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
            <Zap className="text-blue-600 shrink-0 mt-1" size={20} />
            <p className="text-sm text-blue-800">
              <span className="font-semibold">How it works:</span> The Smart Hybrid Card intelligently decides whether a transaction should use available debit funds or available credit based on user preferences, account balance, upcoming financial obligations, and eligibility.
            </p>
          </div>
        </div>

        {/* Card Controls & Limits */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-sm text-slate-500 font-medium mb-2">Available Debit</p>
              <h3 className="text-2xl font-bold text-slate-900">₹{card.debitBalance.toLocaleString()}</h3>
              <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-sm text-slate-500 font-medium mb-2">Available Credit</p>
              <h3 className="text-2xl font-bold text-slate-900">₹{card.availableCredit.toLocaleString()}</h3>
              <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full" style={{ width: '85%' }}></div>
              </div>
              <p className="text-xs text-slate-400 mt-2">Limit: ₹{card.creditLimit.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-semibold text-slate-800">Card Controls</h3>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Emergency Credit Switch</h4>
                    <p className="text-xs text-slate-500">Auto-switch to credit if debit balance is low</p>
                  </div>
                </div>
                <button 
                  onClick={() => setEmergencySwitch(!emergencySwitch)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emergencySwitch ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emergencySwitch ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center">
                    <Settings size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Set Payment Rules</h4>
                    <p className="text-xs text-slate-500">Configure auto-routing rules</p>
                  </div>
                </div>
                <ArrowRight className="text-slate-400" size={20} />
              </div>

              <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
                    <Lock size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Freeze Card</h4>
                    <p className="text-xs text-slate-500">Temporarily disable transactions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline fallback for missing icon
function ArrowRight({ size, className }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;
}
