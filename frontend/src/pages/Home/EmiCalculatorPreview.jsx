import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, ArrowRight, IndianRupee, PieChart } from 'lucide-react';

const EmiCalculatorPreview = () => {
  const [loanAmount, setLoanAmount] = useState(5000000); // 50 Lakhs
  const [interestRate, setInterestRate] = useState(8.5); // 8.5%
  const [tenureYears, setTenureYears] = useState(20); // 20 years

  const { emi, totalInterest, totalPayable } = useMemo(() => {
    const p = Number(loanAmount);
    const r = Number(interestRate) / 12 / 100;
    const n = Number(tenureYears) * 12;

    if (!p || !r || !n) return { emi: 0, totalInterest: 0, totalPayable: 0 };

    const factor = Math.pow(1 + r, n);
    const calculatedEmi = Math.round((p * r * factor) / (factor - 1));
    const calculatedTotalPayable = calculatedEmi * n;
    const calculatedTotalInterest = calculatedTotalPayable - p;

    return {
      emi: calculatedEmi,
      totalInterest: calculatedTotalInterest,
      totalPayable: calculatedTotalPayable,
    };
  }, [loanAmount, interestRate, tenureYears]);

  return (
    <section className="py-16 bg-gradient-to-br from-slate-900 via-brand-navy to-brand-teal text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Info Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-orange-400 bg-white/10 px-3 py-1 rounded-full border border-white/10">
              <Calculator className="w-3.5 h-3.5" />
              <span>Smart Mortgage Planning</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Nagpur Home Loan EMI Calculator
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Estimate your monthly financial outflow before buying your dream flat or plot in Nagpur. Compare bank rates and apply directly for instant loan pre-approval.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Link
                to="/tools/emi-calculator"
                className="inline-flex items-center justify-center space-x-2 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold px-5 py-3 rounded-xl shadow-lg transition-all"
              >
                <span>Full Amortization Schedule</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/tools/loan-enquiry"
                className="inline-flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-5 py-3 rounded-xl border border-white/20 transition-all"
              >
                <span>Apply for Home Loan</span>
              </Link>
            </div>
          </div>

          {/* Right Interactive Calculator Card */}
          <div className="lg:col-span-7 bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Sliders */}
              <div className="space-y-6">
                {/* Loan Amount Slider */}
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-1.5">
                    <span>Loan Amount</span>
                    <span className="text-sm font-black text-brand-navy">
                      ₹ {(loanAmount / 100000).toFixed(1)} Lakhs
                    </span>
                  </div>
                  <input
                    type="range"
                    min={500000}
                    max={20000000}
                    step={100000}
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full accent-brand-orange cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>₹ 5 Lakhs</span>
                    <span>₹ 2 Crores</span>
                  </div>
                </div>

                {/* Interest Rate Slider */}
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-1.5">
                    <span>Interest Rate</span>
                    <span className="text-sm font-black text-brand-navy">
                      {interestRate}% p.a.
                    </span>
                  </div>
                  <input
                    type="range"
                    min={6.5}
                    max={14.0}
                    step={0.1}
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full accent-brand-teal cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>6.5%</span>
                    <span>14.0%</span>
                  </div>
                </div>

                {/* Loan Tenure Slider */}
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-1.5">
                    <span>Loan Tenure</span>
                    <span className="text-sm font-black text-brand-navy">
                      {tenureYears} Years
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={30}
                    step={1}
                    value={tenureYears}
                    onChange={(e) => setTenureYears(Number(e.target.value))}
                    className="w-full accent-brand-navy cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>5 Yrs</span>
                    <span>30 Yrs</span>
                  </div>
                </div>
              </div>

              {/* Output Display Card */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 text-center space-y-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Monthly Loan EMI
                  </span>
                  <div className="text-3xl font-black text-brand-orange mt-1">
                    ₹ {emi.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[11px] text-slate-400">per month</span>
                </div>

                <div className="pt-4 border-t border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Principal Amount:</span>
                    <strong className="text-slate-900">₹ {loanAmount.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Total Interest:</span>
                    <strong className="text-slate-900">₹ {totalInterest.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-200">
                    <span>Total Payable:</span>
                    <span>₹ {totalPayable.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmiCalculatorPreview;

