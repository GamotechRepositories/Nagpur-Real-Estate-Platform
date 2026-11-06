import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, Send, AlertCircle, Phone, User, Mail, IndianRupee } from 'lucide-react';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';

const LoanEnquiryPage = () => {
  const { user } = useAuthStore();
  const [applicantName, setApplicantName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [employmentType, setEmploymentType] = useState('SALARIED');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [loanAmountRequired, setLoanAmountRequired] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please provide a valid 10-digit Indian mobile number');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/tools/loan-request', {
        applicantName,
        phoneNumber: cleanPhone,
        email: email || undefined,
        employmentType,
        monthlyIncome: Number(monthlyIncome),
        loanAmountRequired: Number(loanAmountRequired),
      });

      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit loan request. Please check fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Institutional Mortgage & Financing Advisory | Nagpur Estates</title>
        <meta
          name="description"
          content="Apply for confidential mortgage pre-approval and preferential borrowing terms with Nagpur's leading institutional banking desks."
        />
      </Helmet>

      <div className="bg-ivory-light min-h-screen py-14">
        <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center border-b border-beige pb-6">
            <span className="text-[10px] font-semibold uppercase tracking-luxury text-gold border border-gold/40 px-3 py-1 bg-white mb-3 inline-block">
              Institutional Capital Desk
            </span>
            <h1 className="font-serif text-3xl text-navy font-normal tracking-tight">
              Mortgage Pre-Approval Advisory
            </h1>
            <p className="text-xs text-charcoal-muted mt-2 font-sans leading-relaxed">
              Confidential structuring with premier banking partners: HDFC Bank, ICICI Bank, SBI, and Axis Bank.
            </p>
          </div>

          <div className="bg-white p-8 sm:p-10 border border-beige shadow-subtle">
            {success ? (
              <div className="py-10 text-center space-y-4 bg-ivory border border-beige p-6">
                <div className="w-14 h-14 border border-gold text-gold flex items-center justify-center mx-auto bg-white">
                  <CheckCircle className="w-7 h-7 stroke-[1.5]" />
                </div>
                <h3 className="font-serif text-2xl text-navy">Application Received</h3>
                <p className="text-xs text-charcoal-muted max-w-sm mx-auto font-sans leading-relaxed">
                  A dedicated capital advisor will contact you on <strong className="text-navy">+91 {phoneNumber}</strong> within 24 hours with competitive underwriting proposals.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3.5 bg-red-50 border border-red-200 text-xs text-red-800 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1 font-medium">
                    Applicant Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rameshwar Deshmukh"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-beige bg-ivory-light text-navy text-xs focus:outline-none focus:border-gold transition-colors font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1 font-medium">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="9823000000"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-beige bg-ivory-light text-navy text-xs focus:outline-none focus:border-gold transition-colors font-sans font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1 font-medium">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-beige bg-ivory-light text-navy text-xs focus:outline-none focus:border-gold transition-colors font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1.5 font-medium">
                    Employment Category
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['SALARIED', 'SELF_EMPLOYED', 'BUSINESS'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setEmploymentType(type)}
                        className={`py-2 px-1 text-[11px] uppercase tracking-wider font-medium border transition-colors ${
                          employmentType === type
                            ? 'border-navy bg-navy text-white'
                            : 'border-beige bg-ivory-light text-charcoal-muted hover:border-gold'
                        }`}
                      >
                        {type.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1 font-medium">
                      Net Monthly Cashflow (₹)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 150000"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-beige bg-ivory-light text-navy text-xs focus:outline-none focus:border-gold transition-colors font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1 font-medium">
                      Required Capital (₹)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 6000000"
                      value={loanAmountRequired}
                      onChange={(e) => setLoanAmountRequired(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-beige bg-ivory-light text-navy text-xs focus:outline-none focus:border-gold transition-colors font-sans"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-navy hover:bg-navy-light text-white text-xs font-medium tracking-luxury uppercase py-3.5 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 mt-4"
                >
                  <Send className="w-3.5 h-3.5 text-gold" />
                  <span>{loading ? 'Submitting Application...' : 'Submit Pre-Approval Dossier'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoanEnquiryPage;
