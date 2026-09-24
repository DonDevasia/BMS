import React, { useState, useRef } from 'react';
import { Building2, Lock, Mail, ArrowRight, ShieldCheck, Fingerprint } from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Login, 2: OTP
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="flex justify-center text-blue-600 mb-6">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-slate-100">
            <Building2 size={36} />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">NexusBank</h2>
        <p className="mt-2 text-sm text-slate-600">The future of smart banking</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {step === 1 ? (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Email address</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-lg py-3 border bg-slate-50 transition-colors"
                      placeholder="alex.johnson@example.com"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-lg py-3 border bg-slate-50 transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded" />
                    <label className="ml-2 block text-sm text-slate-900">Remember me</label>
                  </div>
                  <div className="text-sm">
                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500">Forgot password?</a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6 text-center">
                <div className="flex justify-center text-blue-600">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                    <ShieldCheck size={32} />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Two-Factor Authentication</h3>
                  <p className="text-sm text-slate-500 mt-2">Enter the 6-digit code sent to your registered mobile number ending in **67.</p>
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
                      className="w-12 h-14 text-center text-xl font-bold border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-slate-50 outline-none"
                      placeholder="•"
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors gap-2 items-center group"
              >
                {step === 1 ? 'Sign in securely' : 'Verify & Login'}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            {step === 1 && (
              <div className="mt-6 border-t border-slate-200 pt-6">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full flex justify-center py-3 px-4 border border-slate-300 rounded-xl shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors gap-2 items-center"
                >
                  <Fingerprint size={18} className="text-slate-400" />
                  Sign in with Biometrics
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
      
      <div className="mt-8 text-center text-xs text-slate-500 flex items-center justify-center gap-4 relative z-10">
        <span className="flex items-center gap-1"><Lock size={12} /> Secure 256-bit Encryption</span>
        <span>•</span>
        <span>Terms of Service</span>
        <span>•</span>
        <span>Privacy Policy</span>
      </div>
    </div>
  );
}
