import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
   LayoutDashboard, Wallet, ArrowDownToLine, ArrowUpFromLine, 
   ArrowRightLeft, History, FileText, Bell, User, LogOut,
   Building2, ChevronDown, ChevronRight, CreditCard, BrainCircuit,
   SplitSquareHorizontal, ShieldCheck, Users
 } from 'lucide-react';
 import { useAuth } from '../../context/AuthContext';

const customerNavItems = [
  { name: 'My Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
  { name: 'My Account', path: '/customer/account', icon: Wallet },
  { name: 'Deposit', path: '/customer/deposit', icon: ArrowDownToLine },
  { name: 'Withdraw', path: '/customer/withdraw', icon: ArrowUpFromLine },
  { name: 'Transfer Funds', path: '/customer/transfer', icon: ArrowRightLeft },
  { name: 'Transaction History', path: '/customer/transactions', icon: History },
  { name: 'Bank Statements', path: '/customer/statements', icon: FileText },
  { name: 'Notifications', path: '/customer/notifications', icon: Bell, hasBadge: true },
  { name: 'My Profile', path: '/customer/profile', icon: User },
];

const smartNavItems = [
  { name: 'Smart Hybrid Card', path: '/customer/smart-card', icon: CreditCard },
  { name: 'AI Payment Assistant', path: '/customer/ai-assistant', icon: BrainCircuit },
  { name: 'Split Payment', path: '/customer/split-payment', icon: SplitSquareHorizontal },
  { name: 'Payment Rules', path: '/customer/rules', icon: ShieldCheck },
  { name: 'Family Mode', path: '/customer/family', icon: Users },
];

export default function CustomerSidebar() {
  const { userName, userEmail, userAvatar, logout, authFetch } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [smartOpen, setSmartOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      try {
        const res = await authFetch('/api/customer/notifications');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && isMounted) {
            setUnreadCount(data.filter(n => !n.is_read).length);
          }
        }
      } catch (err) {
        // Silently handle
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [authFetch]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3 text-white font-bold text-xl">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600 shadow-md shadow-blue-900/50">
            <Building2 size={20} />
          </div>
          NexusBank
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30">
          Customer
        </span>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <div className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Banking Services
        </div>
        <nav className="space-y-1 px-2">
          {customerNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600/20 text-blue-400 font-semibold border-l-2 border-blue-500' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} />
                <span>{item.name}</span>
              </div>
              {item.hasBadge && unreadCount > 0 && (
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Smart Banking Features Collapsible */}
        <div className="mt-5 pt-3 border-t border-slate-800/80 px-2">
          <button
            onClick={() => setSmartOpen(!smartOpen)}
            className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200 transition-colors"
          >
            <span>Smart Features</span>
            {smartOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          
          {smartOpen && (
            <nav className="mt-1 space-y-1">
              {smartNavItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive 
                        ? 'bg-purple-600/20 text-purple-400 font-semibold' 
                        : 'hover:bg-slate-800 hover:text-white text-slate-400'
                    }`
                  }
                >
                  <item.icon size={16} />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          )}
        </div>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <NavLink 
          to="/customer/profile" 
          className="flex items-center gap-3 px-2 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-800/80 transition-colors group"
        >
          <img src={userAvatar} alt={userName} className="w-8 h-8 rounded-full border border-blue-500/40" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate group-hover:text-blue-300">{userName}</p>
            <p className="text-[10px] text-slate-400 truncate">{userEmail || 'Personal Banking'}</p>
          </div>
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 transition-colors text-xs font-semibold"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
