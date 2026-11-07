import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building2, Lock, Mail, ShieldAlert, KeyRound, Eye, EyeOff } from 'lucide-react';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('admin@nagpurestate.com');
  const [password, setPassword] = useState('Nagpur@Admin2026!');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiClient.post('/auth/login', {
        email: email.trim(),
        password,
        twoFactorCode: twoFactorCode.trim() || undefined,
      });

      const { user, accessToken } = res.data.data;

      // Ensure user has administrative privileges
      const allowedRoles = ['SUPER_ADMIN', 'MODERATOR', 'CRM_MANAGER', 'CONTENT_EDITOR'];
      if (!allowedRoles.includes(user.role)) {
        setError(`Access restricted. Your account role (${user.role}) is not authorized for the admin console.`);
        setLoading(false);
        return;
      }

      setAuth(user, accessToken);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Authentication failed. Please verify credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="max-w-sm w-full space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center mx-auto shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Nagpur Real Estate
          </h1>
          <p className="text-xs text-slate-400">
            Admin Console
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-800 border border-slate-700/80 rounded-xl p-5 sm:p-6 shadow-xl space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nagpurestate.com"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-700/70 border border-slate-600 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-9 py-2 rounded-lg bg-slate-700/70 border border-slate-600 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                2FA Code <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="6-digit code"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-700/70 border border-slate-600 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 py-2 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-3 border-t border-slate-700 text-center space-y-1.5">
            <span className="text-[11px] text-slate-400 block font-medium">
              Demo Accounts:
            </span>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('admin@nagpurestate.com', 'Nagpur@Admin2026!')}
                className="py-1 px-2.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium border border-slate-600 transition-colors"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('moderator@nagpurestate.com', 'Nagpur@Mod2026!')}
                className="py-1 px-2.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium border border-slate-600 transition-colors"
              >
                Moderator
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-500">
          Nagpur Real Estate &middot; Internal Staff Access Only
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
