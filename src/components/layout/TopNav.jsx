import React from 'react';
import { Search, Bell, HelpCircle, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TopNav() {
  const { userName, isAdmin, userAvatar, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    const wasAdmin = isAdmin;
    logout();
    navigate(wasAdmin ? '/admin' : '/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2 w-96">
        <Search size={18} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Search transactions, accounts, or help..." 
          className="bg-transparent border-none outline-none ml-2 w-full text-sm text-slate-700 placeholder-slate-400"
        />
      </div>

      <div className="flex items-center gap-4">
        {isAdmin && (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <ShieldCheck size={14} className="text-indigo-600" />
            Admin Mode
          </span>
        )}

        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative" title="Notifications">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors" title="Help & Support">
          <HelpCircle size={20} />
        </button>
        
        <div className="h-8 w-px bg-slate-200 mx-1"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <div className="text-sm font-bold text-slate-800">{userName}</div>
            <div className="text-xs text-slate-500 capitalize">
              {isAdmin ? 'System Administrator' : 'Personal Banking'}
            </div>
          </div>
          <img 
            src={userAvatar} 
            alt={userName} 
            className="w-10 h-10 rounded-full border-2 border-blue-100 shadow-sm object-cover" 
          />

          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
            title="Log Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
