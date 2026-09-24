import React from 'react';
import { Search, Bell, HelpCircle, User } from 'lucide-react';
import { mockUser } from '../../data/mockData';

export default function TopNav() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2 w-96">
        <Search size={18} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Search transactions, accounts, or help..." 
          className="bg-transparent border-none outline-none ml-2 w-full text-sm text-slate-700 placeholder-slate-400"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <HelpCircle size={20} />
        </button>
        <div className="h-8 w-px bg-slate-200 mx-2"></div>
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="text-right hidden md:block">
            <div className="text-sm font-semibold text-slate-800">{mockUser.name}</div>
            <div className="text-xs text-slate-500">Premium Member</div>
          </div>
          <img src={mockUser.avatar} alt="Profile" className="w-10 h-10 rounded-full border-2 border-blue-100" />
        </div>
      </div>
    </header>
  );
}
