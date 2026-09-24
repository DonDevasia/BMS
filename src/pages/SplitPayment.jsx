import React, { useState } from 'react';
import { SplitSquareHorizontal, CheckCircle2 } from 'lucide-react';

export default function SplitPayment() {
  const [total, setTotal] = useState(5000);
  const [debit, setDebit] = useState(3000);
  const [success, setSuccess] = useState(false);
  
  const credit = total - debit;
  const debitPercent = (debit / total) * 100;

  const handleSlider = (e) => {
    const val = Number(e.target.value);
    setDebit(val);
  };

  const handlePay = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Split Payment</h1>
        <p className="text-slate-500">Manually divide a single purchase between Debit and Credit.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="text-center mb-8">
          <p className="text-sm font-medium text-slate-500 mb-2">Purchase Amount</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl text-slate-400">₹</span>
            <input 
              type="number"
              value={total}
              onChange={(e) => {
                const newTotal = Number(e.target.value);
                setTotal(newTotal);
                setDebit(Math.min(debit, newTotal));
              }}
              className="text-4xl font-bold text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-blue-500 outline-none w-48 text-center pb-2"
            />
          </div>
        </div>

        <div className="space-y-12">
          {/* Visual Bar */}
          <div className="relative">
            <div className="h-4 bg-purple-200 rounded-full overflow-hidden flex w-full">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${debitPercent}%` }}
              ></div>
              <div 
                className="h-full bg-purple-500 transition-all duration-300"
                style={{ width: `${100 - debitPercent}%` }}
              ></div>
            </div>
            
            <input 
              type="range"
              min="0"
              max={total}
              step="100"
              value={debit}
              onChange={handleSlider}
              className="absolute top-0 left-0 w-full h-4 opacity-0 cursor-ew-resize"
            />
          </div>

          <div className="flex justify-between items-center px-4">
            <div className="text-center">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="font-semibold text-slate-700">Debit</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">₹{debit.toLocaleString()}</p>
            </div>
            
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
              <SplitSquareHorizontal className="text-slate-400" />
            </div>
            
            <div className="text-center">
              <div className="flex items-center gap-2 mb-2 justify-end">
                <span className="font-semibold text-slate-700">Credit</span>
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              </div>
              <p className="text-2xl font-bold text-slate-900">₹{credit.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="flex gap-4 pt-4 border-t border-slate-100">
            <button 
              onClick={() => setDebit(Math.floor(total / 2))}
              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
            >
              Split 50/50
            </button>
            <button 
              onClick={handlePay}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-md transition-colors"
            >
              {success ? (
                <span className="flex items-center justify-center gap-2"><CheckCircle2 size={20} /> Success!</span>
              ) : (
                `Pay ₹${total.toLocaleString()}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
