import React, { useState } from 'react';
import { X, Phone, Lock, UserCheck, ShieldCheck, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';

const AuthModal = ({ isOpen, onClose }) => {
  const { setAuth } = useAuthStore();

  const [activeTab, setActiveTab] = useState('otp'); // 'otp' | 'admin'
  const [step, setStep] = useState('request'); // 'request' | 'verify'

  // OTP Form State
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('USER');
  const [otp, setOtp] = useState('');
  const [devOtpCode, setDevOtpCode] = useState(null);

  // Admin Form State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [admin2FA, setAdmin2FA] = useState('');

  // Status & error messages
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setStep('request');
    setError('');
    setInfoMessage('');
    setDevOtpCode(null);
    setOtp('');
  };

  // 1. Request Phone OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/auth/otp/request', {
        phone: cleanPhone,
        name: name || undefined,
      });

      setInfoMessage(res.data.message);
      if (res.data.data?.devOtp) {
        setDevOtpCode(res.data.data.devOtp);
      }
      setStep('verify');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify Phone OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const res = await apiClient.post('/auth/otp/verify', {
        phone: cleanPhone,
        otp,
        name: name || undefined,
        role,
      });

      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      onClose();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Admin / Staff Email & Password Login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');

    setLoading(true);
    try {
      const res = await apiClient.post('/auth/login', {
        email: adminEmail,
        password: adminPassword,
        twoFactorCode: admin2FA || undefined,
      });

      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      onClose();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 relative">
        {/* Close Button */}
        <button
          onClick={() => {
            resetForm();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={() => {
              setActiveTab('otp');
              resetForm();
            }}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-colors ${
              activeTab === 'otp'
                ? 'border-brand-orange text-brand-orange bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Buyer / Owner / Agent OTP
          </button>
          <button
            onClick={() => {
              setActiveTab('admin');
              resetForm();
            }}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-colors ${
              activeTab === 'admin'
                ? 'border-brand-teal text-brand-teal bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Staff Portal Login
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {infoMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
              {infoMessage}
            </div>
          )}

          {/* Dev OTP Helper Banner */}
          {devOtpCode && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center justify-between">
              <div>
                <strong className="block font-bold">Development Mode Active:</strong>
                <span>Use OTP code: <strong className="text-sm font-mono text-brand-navy">{devOtpCode}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => setOtp(devOtpCode)}
                className="bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold px-2 py-1 rounded text-[11px]"
              >
                Auto Fill
              </button>
            </div>
          )}

          {/* TAB 1: PHONE NUMBER & OTP AUTH */}
          {activeTab === 'otp' && (
            <div>
              {step === 'request' ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-black text-brand-navy">Login or Register</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Enter your mobile number to receive a secure OTP code
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Full Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Deshmukh"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Mobile Number
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-600 text-xs font-bold">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full px-4 py-2.5 rounded-r-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      I want to use Nagpur Estate as
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Buyer / Tenant', value: 'USER' },
                        { label: 'Owner', value: 'OWNER' },
                        { label: 'Agent', value: 'AGENT' },
                      ].map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setRole(item.value)}
                          className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                            role === item.value
                              ? 'border-brand-orange bg-orange-50 text-brand-orange shadow-sm'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
                  >
                    <span>{loading ? 'Sending OTP...' : 'Send OTP'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-[11px] text-center text-slate-400">
                    By proceeding, you agree to Nagpur Real Estate’s Terms & Privacy Policy.
                  </p>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-black text-brand-navy">Verify OTP Code</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Enter the 6-digit code sent to <strong>+91 {phone}</strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => setStep('request')}
                      className="text-xs text-brand-orange font-bold hover:underline mt-1"
                    >
                      Change Number
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="• • • • • •"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full text-center text-2xl tracking-[0.5em] font-mono py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-teal hover:bg-brand-teal-light text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={loading}
                      className="text-xs font-semibold text-slate-600 hover:text-brand-orange"
                    >
                      Didn't receive code? Resend OTP
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: STAFF / ADMIN PASSWORD LOGIN */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-black text-brand-navy">Staff Portal Access</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Restricted to Super Admins, Moderators, and CRM Managers
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Staff Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="admin@nagpurestate.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-teal text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-teal text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  2FA Authenticator Code (If Enabled)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="6-digit TOTP code"
                  value={admin2FA}
                  onChange={(e) => setAdmin2FA(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-teal text-sm font-mono text-center tracking-widest"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-teal hover:bg-brand-teal-light text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{loading ? 'Authenticating...' : 'Sign In as Staff'}</span>
              </button>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-500">
                Default Demo Credentials: <br />
                Email: <code className="text-slate-800 font-bold">admin@nagpurestate.com</code><br />
                Password: <code className="text-slate-800 font-bold">Nagpur@Admin2026!</code>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
