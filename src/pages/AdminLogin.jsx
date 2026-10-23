import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, Mail, ArrowRight, ShieldCheck, 
  ShieldAlert, Sparkles, KeyRound, Terminal
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState(1); // 1: Form, 2: OTP
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const otpRefs = useRef([]);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5 && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && otpRefs.current[index - 1]) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handleQuickFill = () => {
    setError(null);
    setEmail('admin@nexusbank.com');
    setPassword('Admin@Nexus2026');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password, portal: 'admin' })
        });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Authentication failed');
        }
        
        // Ensure the account has administrator privileges
        if (data.user?.role !== 'admin') {
          throw new Error('Access Denied: This account lacks administrative clearance.');
        }

        setAuthenticatedUser(data.user);
        setStep(2);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      // Step 2: Complete admin sign-in
      if (authenticatedUser) {
        login(authenticatedUser);
      } else {
        login({ full_name: 'Nexus Admin', role: 'admin', email: 'admin@nexusbank.com' });
      }
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dark luxury security ambient backdrop */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-15%] w-[50%] h-[50%] bg-indigo-900/30 rounded-full blur-[130px]"></div>
        <div className="absolute bottom-[-20%] right-[-15%] w-[50%] h-[50%] bg-amber-500/10 rounded-full blur-[140px]"></div>
        <div className="absolute top-[40%] right-[25%] w-[30%] h-[30%] bg-blue-900/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        {/* Security Shield Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center border bg-slate-900 border-indigo-500/40 text-amber-400 shadow-indigo-950/60">
            <ShieldAlert size={36} />
          </div>
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
          NexusBank <span className="text-amber-400 text-lg font-mono">ADMIN</span>
        </h2>
        <p className="mt-1 text-sm font-medium text-indigo-300">
          Enterprise Core Banking — Administration Console
        </p>
      </div>

      {/* Admin Login Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        <div className="py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-800 bg-slate-900/95 text-slate-100 backdrop-blur-xl relative overflow-hidden shadow-black/70">
          {/* Top colored accent line */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 via-indigo-500 to-purple-600"></div>

          {/* Card Header */}
          <div className="mb-6 pb-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/10 text-amber-300 border border-amber-400/30">
                <KeyRound size={12} />
                Internal System Gate (/admin)
              </span>
              <h3 className="text-xl font-bold mt-2 text-white">
                Bank Staff & Administrator Sign In
              </h3>
            </div>

            {/* Quick Demo Admin Button */}
            {step === 1 && (
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium underline flex items-center gap-1 ml-auto"
                title="Fill demo admin credentials"
              >
                <Sparkles size={12} /> Demo Admin
              </button>
            )}
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {step === 1 ? (
              <div className="space-y-4">
                {error && (
                  <div className="p-4 text-sm rounded-xl border bg-rose-950/70 text-rose-300 border-rose-800 flex items-start gap-3">
                    <ShieldAlert size={18} className="shrink-0 mt-0.5 text-rose-500" />
                    <div className="flex-1">
                      <p className="font-semibold">Security Clearance Failed</p>
                      <p className="mt-0.5 text-xs opacity-90">{error}</p>
                    </div>
                  </div>
                )}

                {/* Admin Official Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Official Administrator Email
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 text-sm rounded-xl outline-none transition-all border bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="admin@nexusbank.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Master Key / Password
                    </label>
                    <span className="text-xs text-slate-500 cursor-pointer hover:underline">
                      Need Help?
                    </span>
                  </div>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 text-sm rounded-xl outline-none transition-all border bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="••••••••••••"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* OTP Step */
              <div className="space-y-6 text-center py-2 animate-in fade-in duration-300">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-indigo-900/40 text-amber-400 border border-amber-400/20">
                    <ShieldCheck size={36} />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">
                    Administrator Security Token (2FA)
                  </h4>
                  <p className="text-xs mt-1.5 text-slate-400">
                    Enter the authorized 6-digit cryptographic security code for{' '}
                    <strong className="text-amber-300">
                      {authenticatedUser?.full_name || email}
                    </strong>
                  </p>
                </div>

                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpRefs.current[index] = el)}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-11 h-13 text-center text-xl font-bold rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-all"
                      placeholder="•"
                    />
                  ))}
                </div>

                <p className="text-xs text-slate-400">
                  Demo tip: Click "Authorize & Access Terminal" to proceed.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 group bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white shadow-indigo-950/50 disabled:opacity-50"
              >
                {step === 1 ? (
                  loading ? (
                    'Verifying credentials...'
                  ) : (
                    'Sign In as Administrator'
                  )
                ) : (
                  'Authorize & Access Terminal'
                )}
                {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Terminal size={14} className="text-amber-400" />
                Audit Logs Active
              </span>
              <span className="flex items-center gap-1">
                <Lock size={12} /> Restricted Clearance
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
