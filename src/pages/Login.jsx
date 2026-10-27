import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Lock, Mail, ArrowRight, ShieldCheck, Fingerprint, 
  User, Phone, Sparkles, UserCheck, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [step, setStep] = useState(1); // 1: Form, 2: OTP
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
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

  const handleQuickFill = (name) => {
    setError(null);
    if (name === 'Ananya') {
      setEmail('ananyababuraj23@gmail.com');
      setPassword('Password@123');
    } else if (name === 'John') {
      setEmail('john@example.com');
      setPassword('Password@123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      setLoading(true);
      setError(null);
      try {
        const endpoint = mode === 'login' ? '/api/login' : '/api/signup';
        const bodyData = mode === 'login' 
          ? { email: email.trim(), password, portal: 'customer' }
          : { fullName: fullName.trim(), email: email.trim(), phone: phone.trim(), password, role: 'customer' };

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyData)
        });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Authentication failed');
        }
        
        // Save user & token to state until OTP step completes
        setAuthenticatedUser({ token: data.token, ...data.user });
        setStep(2);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      // Step 2: Complete login with real user profile
      if (authenticatedUser) {
        login(authenticatedUser.token, authenticatedUser);
      }
      navigate('/customer/dashboard', { replace: true });
    }
  };

  const handleBiometricMock = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email || 'ananyababuraj23@gmail.com', portal: 'customer' })
      });
      const data = await res.json();
      if (data.success && data.token) {
        login(data.token, data.user);
        navigate('/customer/dashboard', { replace: true });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-blue-200/50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-indigo-100/60 rounded-full blur-3xl"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        {/* Brand Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl shadow-xl flex items-center justify-center border bg-white border-slate-100 text-blue-600 shadow-blue-100">
            <Building2 size={36} />
          </div>
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          NexusBank
        </h2>
        <p className="mt-1 text-sm font-medium text-slate-600">
          Next-Generation Smart Personal Banking
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-100 shadow-slate-200/50 text-slate-800 relative overflow-hidden">
          {/* Top colored accent line */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-600"></div>

          {/* Card Header */}
          <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                <UserCheck size={12} />
                Customer Portal
              </span>
              <h3 className="text-xl font-bold mt-2 text-slate-900">
                {mode === 'signup' ? 'Open Customer Account' : 'Sign In to Your Account'}
              </h3>
            </div>

            {/* Quick Demo Fill Buttons */}
            {step === 1 && (
              <div className="flex flex-col gap-1 text-right">
                <button
                  type="button"
                  onClick={() => handleQuickFill('Ananya')}
                  className="text-xs text-blue-600 hover:text-blue-500 font-medium underline flex items-center gap-1 ml-auto"
                >
                  <Sparkles size={11} /> Fill Ananya
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('John')}
                  className="text-xs text-slate-500 hover:text-slate-700 font-medium underline flex items-center gap-1 ml-auto"
                >
                  Fill John
                </button>
              </div>
            )}
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {step === 1 ? (
              <div className="space-y-4">
                {error && (
                  <div className="p-4 text-sm rounded-xl border bg-rose-50 text-rose-700 border-rose-200 flex items-start gap-3">
                    <Shield size={18} className="shrink-0 mt-0.5 text-rose-500" />
                    <div className="flex-1">
                      <p className="font-semibold">Authentication Error</p>
                      <p className="mt-0.5 text-xs opacity-90">{error}</p>
                    </div>
                  </div>
                )}

                {/* Customer Sign Up Fields */}
                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Full Name
                      </label>
                      <div className="relative rounded-xl shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <User size={18} />
                        </div>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="block w-full pl-11 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="e.g. Ananya Baburaj"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Mobile Phone
                      </label>
                      <div className="relative rounded-xl shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Phone size={18} />
                        </div>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="block w-full pl-11 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
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
                      className="block w-full pl-11 pr-4 py-3 text-sm rounded-xl outline-none transition-all border bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="yourname@example.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    {mode === 'login' && (
                      <span className="text-xs text-slate-400 cursor-pointer hover:underline">
                        Forgot?
                      </span>
                    )}
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
                      className="block w-full pl-11 pr-4 py-3 text-sm rounded-xl outline-none transition-all border bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="••••••••••••"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* OTP Step */
              <div className="space-y-6 text-center py-2 animate-in fade-in duration-300">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
                    <ShieldCheck size={36} />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">
                    Two-Factor Authorization (2FA)
                  </h4>
                  <p className="text-xs mt-1.5 text-slate-500">
                    Enter the 6-digit verification code sent for{' '}
                    <strong className="text-blue-600">
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
                      className="w-11 h-13 text-center text-xl font-bold rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      placeholder="•"
                    />
                  ))}
                </div>

                <p className="text-xs text-slate-400">
                  Demo tip: Click "Verify Security Token & Enter" to proceed immediately.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 group bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 disabled:opacity-50"
              >
                {step === 1 ? (
                  loading ? (
                    'Verifying credentials...'
                  ) : mode === 'login' ? (
                    'Sign In to Customer Banking'
                  ) : (
                    'Register Customer Account'
                  )
                ) : (
                  'Verify Security Token & Enter'
                )}
                {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>

            {/* Toggle Modes or Biometric */}
            {step === 1 && (
              <div className="pt-2 space-y-4">
                <div className="text-center text-sm">
                  {mode === 'login' ? (
                    <p className="text-slate-500">
                      New customer?{' '}
                      <button
                        type="button"
                        onClick={() => { setMode('signup'); setError(null); }}
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        Create an account
                      </button>
                    </p>
                  ) : (
                    <p className="text-slate-500">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => { setMode('login'); setError(null); }}
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        Sign in
                      </button>
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <button
                    type="button"
                    onClick={handleBiometricMock}
                    className="flex items-center gap-1.5 hover:underline"
                  >
                    <Fingerprint size={16} />
                    Instant Biometric Access
                  </button>
                  <span className="flex items-center gap-1">
                    <Lock size={12} /> 256-bit SSL Security
                  </span>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
