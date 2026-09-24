import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, CreditCard, Wallet, 
  ArrowRightLeft, ArrowDownToLine, ArrowUpFromLine, 
  BrainCircuit, SplitSquareHorizontal, ShieldCheck, 
  Users, Receipt, Building2, UserCircle, Settings 
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Accounts', path: '/accounts', icon: Wallet },
  { name: 'Transactions', path: '/transactions', icon: ArrowRightLeft },
  { name: 'Deposit', path: '/deposit', icon: ArrowDownToLine },
  { name: 'Withdraw', path: '/withdraw', icon: ArrowUpFromLine },
  { name: 'Fund Transfer', path: '/transfer', icon: ArrowRightLeft },
  { name: 'Smart Hybrid Card', path: '/smart-card', icon: CreditCard },
  { name: 'AI Payment Assistant', path: '/ai-assistant', icon: BrainCircuit },
  { name: 'Split Payment', path: '/split-payment', icon: SplitSquareHorizontal },
  { name: 'Payment Rules', path: '/rules', icon: ShieldCheck },
  { name: 'Family Mode', path: '/family', icon: Users },
  { name: 'Bills & EMI', path: '/bills', icon: Receipt },
  { name: 'Database', path: '/database', icon: Building2 },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3 text-white font-bold text-xl border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
          <Building2 size={20} />
        </div>
        NexusBank
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <div className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Menu</div>
        <nav className="space-y-1 px-2">
          {navItems.slice(0, 6).map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600/10 text-blue-400 font-medium' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <item.icon size={18} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-6 mb-2">Smart Features</div>
        <nav className="space-y-1 px-2">
          {navItems.slice(6, 12).map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-purple-600/10 text-purple-400 font-medium' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <item.icon size={18} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-6 mb-2">Management</div>
        <nav className="space-y-1 px-2">
          {navItems.slice(12).map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-emerald-600/10 text-emerald-400 font-medium' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <item.icon size={18} />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800">
        <NavLink to="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
          <Settings size={18} />
          Settings
        </NavLink>
      </div>
    </div>
  );
}
