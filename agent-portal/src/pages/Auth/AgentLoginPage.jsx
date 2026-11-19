import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Building2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Compass,
  Shield,
  Eye,
  EyeOff,
  UserCheck,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const AgentLoginPage = () => {
  const navigate = useNavigate();
  const { token, user, login, isLoading, error } = useAuthStore();

  const [selectedRole, setSelectedRole] = useState(() => {
    return localStorage.getItem('partner_portal_last_role') || 'BUILDER';
  });
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  // If already authenticated as agent or builder, redirect to dashboard
  if (token && (user?.role === 'AGENT' || user?.role === 'BUILDER')) {
    return <Navigate to="/" replace />;
  }

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setLocalError('');
    try {
      localStorage.setItem('partner_portal_last_role', role);
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!identifier.trim() || !password.trim()) {
      setLocalError('Please enter your mobile number/email and password.');
      return;
    }

    const result = await login({
      identifier: identifier.trim(),
      password: password.trim(),
      role: selectedRole,
    });

    if (result.success) {
      navigate('/');
    } else {
      setLocalError(result.message || 'Login failed. Please verify your credentials.');
    }
  };

  const isBuilder = selectedRole === 'BUILDER';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Top Portal Switch Link */}
        <div className="flex items-center justify-between mb-4 px-1 text-xs text-slate-500">
          <span className="font-semibold text-slate-600">Partner Access Portal</span>
          <a
            href="http://localhost:5174/login"
            className="text-teal-700 hover:text-teal-900 font-semibold inline-flex items-center gap-1 transition"
          >
            <Shield size={12} />
            <span>Admin Console (:5174) &rarr;</span>
          </a>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-600 shadow-xs text-white mb-2.5">
            {isBuilder ? <Compass size={24} /> : <Building2 size={24} />}
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Nagpur Real Estate</h1>
          <p className="text-xs text-teal-800 font-bold uppercase tracking-wider mt-1">
            {isBuilder ? 'Township Builder & Developer Portal' : 'Certified Broker & Agent Portal'}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 sm:p-7">
          {/* Role Switcher Tabs */}
          <div className="mb-5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Select Your Partner Role
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => handleRoleChange('BUILDER')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition ${
                  isBuilder
                    ? 'bg-white text-teal-800 shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Compass size={14} className={isBuilder ? 'text-teal-600' : 'text-slate-400'} />
                <span>Builder / Developer</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('AGENT')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition ${
                  !isBuilder
                    ? 'bg-white text-teal-800 shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck size={14} className={!isBuilder ? 'text-teal-600' : 'text-slate-400'} />
                <span>Certified Agent</span>
              </button>
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900">
              {isBuilder ? 'Builder Partner Sign In' : 'Agent Partner Sign In'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isBuilder
                ? 'Login with your builder mobile number or email to manage township projects.'
                : 'Login with your certified agent mobile number or email to manage listings.'}
            </p>
          </div>

          {(localError || error) && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle size={15} className="mt-0.5 flex-shrink-0 text-rose-600" />
              <span className="font-medium leading-relaxed">{localError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBuilder ? 'Builder Registered Mobile or Email' : 'Agent Registered Mobile or Email'}
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={isBuilder ? 'e.g. 9322330456 or wakchaure@gmail.com' : 'e.g. 9822112233 or rajesh.sharma@nagpurestate.com'}
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
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white border border-slate-200 rounded-lg pl-3 pr-10 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-2xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating {isBuilder ? 'Builder' : 'Agent'}...</span>
              ) : (
                <>
                  <span>Sign In as {isBuilder ? 'Builder' : 'Agent'}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              {isBuilder ? 'Not onboarded as a developer yet?' : 'Not registered as a certified agent yet?'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Partner accounts are verified and credentials are set via the Operations Console by Admin.
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
