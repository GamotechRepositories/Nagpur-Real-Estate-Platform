import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle, ArrowRight, Lock, Phone, UserCheck } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/80 backdrop-blur-sm">
      <div className="bg-white max-w-md w-full border border-beige shadow-card relative">
        {/* Close Button */}
        <button
          onClick={() => {
            resetForm();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-charcoal-muted hover:text-navy transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header Tabs */}
        <div className="flex border-b border-beige bg-ivory">
          <button
            onClick={() => {
              setActiveTab('otp');
              resetForm();
            }}
            className={`flex-1 py-4 text-xs font-semibold uppercase tracking-luxury text-center border-b-2 transition-colors ${
              activeTab === 'otp'
                ? 'border-gold text-navy bg-white'
                : 'border-transparent text-charcoal-muted hover:text-navy'
            }`}
          >
            Client / Broker OTP
          </button>
          <button
            onClick={() => {
              setActiveTab('admin');
              resetForm();
            }}
            className={`flex-1 py-4 text-xs font-semibold uppercase tracking-luxury text-center border-b-2 transition-colors ${
              activeTab === 'admin'
                ? 'border-gold text-navy bg-white'
                : 'border-transparent text-charcoal-muted hover:text-navy'
            }`}
          >
            Staff Portal
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8">
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-xs text-red-800 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {infoMessage && (
            <div className="mb-5 p-3.5 bg-ivory border border-gold/40 text-xs text-navy flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-gold shrink-0 mt-0.5" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Dev OTP Helper Banner */}
          {devOtpCode && (
            <div className="mb-5 p-3 bg-ivory border border-gold text-xs text-navy flex items-center justify-between">
              <div>
                <strong className="block font-serif text-gold text-xs uppercase tracking-luxury">Development Code:</strong>
                <span>One-Time Passcode: <strong className="text-sm font-mono font-bold text-navy">{devOtpCode}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => setOtp(devOtpCode)}
                className="bg-navy hover:bg-navy-light text-white text-[10px] uppercase tracking-luxury font-medium px-3 py-1.5 transition-colors"
              >
                Auto Fill
              </button>
            </div>
          )}

          {/* TAB 1: PHONE NUMBER & OTP AUTH */}
          {activeTab === 'otp' && (
            <div>
              {step === 'request' ? (
                <form onSubmit={handleRequestOtp} className="space-y-5">
                  <div className="text-center mb-6">
                    <h3 className="font-serif text-2xl text-navy font-normal">Private Access</h3>
                    <p className="text-xs text-charcoal-muted mt-1 font-sans">
                      Enter your mobile number for secure instant authentication
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1.5 font-medium">
                      Full Legal Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Vikramaditya Deshmukh"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-beige bg-ivory-light text-navy text-xs focus:outline-none focus:border-gold transition-colors font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1.5 font-medium">
                      Mobile Number
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3.5 border border-r-0 border-beige bg-ivory text-charcoal text-xs font-semibold">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full px-3.5 py-2.5 border border-beige bg-ivory-light text-navy text-xs focus:outline-none focus:border-gold transition-colors font-sans font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1.5 font-medium">
                      Portal Profile Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Investor / Buyer', value: 'USER' },
                        { label: 'Asset Owner', value: 'OWNER' },
                        { label: 'Licensed Broker', value: 'AGENT' },
                      ].map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setRole(item.value)}
                          className={`py-2 px-1 text-[11px] uppercase tracking-wider font-medium border transition-colors ${
                            role === item.value
                              ? 'border-navy bg-navy text-white'
                              : 'border-beige bg-white text-charcoal-muted hover:border-gold'
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
                    className="w-full bg-navy hover:bg-navy-light text-white text-xs font-medium tracking-luxury uppercase py-3.5 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <span>{loading ? 'Transmitting OTP...' : 'Request Authentication Code'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gold" />
                  </button>

                  <p className="text-[10px] text-center text-charcoal-muted font-sans leading-relaxed">
                    By authenticating, you affirm compliance with Nagpur Estates governance protocols.
                  </p>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="text-center mb-6">
                    <h3 className="font-serif text-2xl text-navy font-normal">Verify Security Code</h3>
                    <p className="text-xs text-charcoal-muted mt-1 font-sans">
                      Enter the 6-digit passcode dispatched to <strong className="text-navy">+91 {phone}</strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => setStep('request')}
                      className="text-xs text-gold font-medium hover:underline mt-1.5 uppercase tracking-wider block mx-auto"
                    >
                      Change Contact Number
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
                      className="w-full text-center text-2xl tracking-[0.5em] font-mono py-3 border border-beige bg-ivory-light text-navy focus:outline-none focus:border-gold transition-colors"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gold hover:bg-gold-light text-navy text-xs font-medium tracking-luxury uppercase py-3.5 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{loading ? 'Validating...' : 'Authorize Session'}</span>
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={loading}
                      className="text-xs text-charcoal-muted hover:text-navy transition-colors font-sans"
                    >
                      Did not receive code? Resend SMS
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: STAFF / ADMIN PASSWORD LOGIN */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-5">
              <div className="text-center mb-6">
                <h3 className="font-serif text-2xl text-navy font-normal">Staff Administration</h3>
                <p className="text-xs text-charcoal-muted mt-1 font-sans">
                  Restricted portal for verified moderators and administrators
                </p>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1.5 font-medium">
                  Staff Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@nagpurestate.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-beige bg-ivory-light text-navy text-xs focus:outline-none focus:border-gold transition-colors font-sans"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1.5 font-medium">
                  Master Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-beige bg-ivory-light text-navy text-xs focus:outline-none focus:border-gold transition-colors font-sans"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1.5 font-medium">
                  Two-Factor Authentication Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="6-digit authenticator code"
                  value={admin2FA}
                  onChange={(e) => setAdmin2FA(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-beige bg-ivory-light text-navy text-xs focus:outline-none focus:border-gold transition-colors font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-navy hover:bg-navy-light text-white text-xs font-medium tracking-luxury uppercase py-3.5 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5 text-gold" />
                <span>{loading ? 'Authenticating...' : 'Access Command Center'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
