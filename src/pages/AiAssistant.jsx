import React, { useState } from 'react';
import { BrainCircuit, Check, X, AlertTriangle, Info, Zap } from 'lucide-react';
import { mockUser } from '../data/mockData';

export default function AiAssistant() {
  const [amount, setAmount] = useState('5000');
  const [merchant, setMerchant] = useState('Amazon');
  const [category, setCategory] = useState('Shopping');
  
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Mock Recommendation Logic
  const recDebit = 3000;
  const recCredit = 2000;

  const handleSimulate = (e) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setShowRecommendation(true);
      setPaymentSuccess(false);
    }, 1200);
  };

  const handleConfirm = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setPaymentSuccess(true);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center shadow-sm">
          <BrainCircuit size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Payment Assistant</h1>
          <p className="text-slate-500">Let AI intelligently optimize your payments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Payment Simulator */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800">Simulate Purchase</h2>
          </div>
          <form onSubmit={handleSimulate} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Merchant</label>
                <input 
                  type="text" 
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option>Shopping</option>
                  <option>Groceries</option>
                  <option>Travel</option>
                  <option>Entertainment</option>
                </select>
              </div>
            </div>
            <button 
              type="submit"
              disabled={processing}
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {processing ? (
                <RefreshCw className="animate-spin" size={20} />
              ) : (
                <><BrainCircuit size={20} /> Analyze Transaction</>
              )}
            </button>
          </form>
        </div>

        {/* AI Recommendation Box */}
        {showRecommendation && !paymentSuccess && (
          <div className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={20} className="text-yellow-300" />
                <h2 className="font-semibold">AI Recommendation</h2>
              </div>
              <span className="text-sm bg-white/20 px-2 py-1 rounded">Split Payment</span>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                <div>
                  <p className="text-sm text-slate-500">Total Amount</p>
                  <h3 className="text-2xl font-bold text-slate-900">₹{amount}</h3>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">{merchant}</p>
                  <p className="text-xs text-slate-400">{category}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="font-medium text-emerald-800">Debit Account</span>
                  </div>
                  <span className="font-bold text-emerald-700">₹{recDebit}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                    <span className="font-medium text-indigo-800">Credit Limit</span>
                  </div>
                  <span className="font-bold text-indigo-700">₹{recCredit}</span>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-xl flex gap-3 border border-amber-100">
                <Info className="text-amber-600 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-amber-800">
                  <span className="font-semibold block mb-1">Reasoning:</span>
                  Using ₹{recDebit} from your available balance while using ₹{recCredit} credit helps preserve sufficient funds for upcoming expenses (Electricity Bill next week).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors">
                  Change Manually
                </button>
                <button 
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={18} /> Confirm Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {paymentSuccess && (
          <div className="bg-white rounded-2xl shadow-md border border-emerald-100 overflow-hidden flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6">
              <Check size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
            <p className="text-slate-500 mb-6">Your transaction to {merchant} was processed intelligently.</p>
            <div className="w-full bg-slate-50 p-4 rounded-xl text-sm space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500">Debit Used:</span>
                <span className="font-semibold text-slate-900">₹{recDebit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Credit Used:</span>
                <span className="font-semibold text-slate-900">₹{recCredit}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                <span className="text-slate-500 font-medium">Total:</span>
                <span className="font-bold text-slate-900">₹{amount}</span>
              </div>
            </div>
            <button 
              onClick={() => { setPaymentSuccess(false); setShowRecommendation(false); }}
              className="px-6 py-2 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
