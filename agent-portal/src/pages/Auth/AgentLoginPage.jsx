import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Building2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const AgentLoginPage = () => {
  const navigate = useNavigate();
  const { token, user, login, isLoading, error } = useAuthStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  // If already authenticated as agent, redirect to dashboard
  if (token && user?.role === 'AGENT') {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!identifier.trim() || !password.trim()) {
      setLocalError('Please enter your mobile number/email and password.');
      return;
    }

    const result = await login({ identifier: identifier.trim(), password: password.trim() });
    if (result.success) {
      navigate('/');
    } else {
      setLocalError(result.message || 'Login failed. Please verify your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-600 shadow-2xs text-white mb-3">
            <Building2 size={24} />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Nagpur Real Estate</h1>
          </div>
          <p className="text-xs text-teal-800 font-semibold uppercase tracking-wider mt-1">
            Certified Broker & Partner Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 sm:p-7">
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">Partner Sign In</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your registered mobile number or email and password.
            </p>
          </div>

          {(localError || error) && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle size={15} className="mt-0.5 flex-shrink-0 text-rose-600" />
              <span>{localError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registered Mobile Number or Email
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 9823001234 or agent@example.com"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-1 py-2.5 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-2xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating Partner...</span>
              ) : (
                <>
                  <span>Sign In to Agent Portal</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Not registered as a certified agent yet?
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Agent accounts are onboarded via the Operations Console by Admin.
            </p>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="mt-5 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck size={14} className="text-teal-600" />
          <span>MahaRERA Compliant Real Estate Partner Platform</span>
        </div>
      </div>
    </div>
  );
};
