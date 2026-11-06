import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Building, CheckCircle, Send, AlertCircle, Phone, User, Mail, IndianRupee } from 'lucide-react';
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
      setError('Please provide a valid 10-digit mobile number');
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
        <title>Apply for Home Loan in Nagpur — Low Interest Rates</title>
        <meta name="description" content="Apply for instant home loan pre-approval with Nagpur's leading partner banks (SBI, HDFC, ICICI, Axis Bank)." />
      </Helmet>

      <div className="bg-slate-50 min-h-screen py-12">
        <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-teal">
              Banking Partnerships
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-navy mt-1">
              Apply for Home Loan Assistance
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Get lowest interest rates with zero processing charges from our banking advisors in Nagpur
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card">
            {success ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Application Submitted!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Our banking specialist will contact you on <strong>+91 {phoneNumber}</strong> within 24 hours with interest rate quotes from SBI, HDFC, and ICICI Bank.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Applicant Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Employment Type
                  </label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                  >
                    <option value="SALARIED">Salaried Employee</option>
                    <option value="SELF_EMPLOYED_BUSINESS">Self-Employed (Business)</option>
                    <option value="SELF_EMPLOYED_PROFESSIONAL">Self-Employed (Doctor/CA/Lawyer)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Monthly Income (₹)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 85000"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Loan Required (₹)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 4500000"
                      value={loanAmountRequired}
                      onChange={(e) => setLoanAmountRequired(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 mt-4"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Submitting...' : 'Request Loan Consultation'}</span>
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

