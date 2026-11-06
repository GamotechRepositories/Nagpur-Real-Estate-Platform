import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Calculator, ArrowRight, IndianRupee, PieChart, ShieldCheck, CheckCircle } from 'lucide-react';
import apiClient from '../../api/client';

const EmiCalculatorPage = () => {
  const [propertyPrice, setPropertyPrice] = useState(6000000); // 60 Lakhs
  const [downPayment, setDownPayment] = useState(1200000); // 12 Lakhs (20%)
  const [interestRate, setInterestRate] = useState(8.5); // 8.5%
  const [tenureYears, setTenureYears] = useState(20); // 20 years

  const loanAmount = Math.max(0, propertyPrice - downPayment);

  const { emi, totalInterest, totalPayable, yearlyBreakdown } = useMemo(() => {
    const p = loanAmount;
    const r = interestRate / 12 / 100;
    const n = tenureYears * 12;

    if (!p || !r || !n) return { emi: 0, totalInterest: 0, totalPayable: 0, yearlyBreakdown: [] };

    const factor = Math.pow(1 + r, n);
    const calculatedEmi = Math.round((p * r * factor) / (factor - 1));
    const calculatedTotalPayable = calculatedEmi * n;
    const calculatedTotalInterest = calculatedTotalPayable - p;

    // Generate yearly breakdown
    const schedule = [];
    let balance = p;
    for (let y = 1; y <= tenureYears; y++) {
      let yearlyInt = 0;
      let yearlyPrin = 0;
      for (let m = 1; m <= 12; m++) {
        if (balance <= 0) break;
        const intForMonth = balance * r;
        const prinForMonth = calculatedEmi - intForMonth;
        yearlyInt += intForMonth;
        yearlyPrin += prinForMonth;
        balance -= prinForMonth;
      }
      schedule.push({
        year: y,
        principalPaid: Math.round(yearlyPrin),
        interestPaid: Math.round(yearlyInt),
        balanceRemaining: Math.max(0, Math.round(balance)),
      });
    }

    return {
      emi: calculatedEmi,
      totalInterest: calculatedTotalInterest,
      totalPayable: calculatedTotalPayable,
      yearlyBreakdown: schedule,
    };
  }, [loanAmount, interestRate, tenureYears]);

  return (
    <>
      <Helmet>
        <title>Nagpur Home Loan EMI Calculator — Monthly Mortgage Calculator</title>
        <meta
          name="description"
          content="Calculate your home loan monthly EMI, total interest, and full amortization schedule for buying residential property in Nagpur, Maharashtra."
        />
      </Helmet>

      <div className="bg-slate-50 min-h-screen py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
              Mortgage Tools
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-brand-navy mt-1">
              Home Loan EMI Calculator
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Plan your home purchase in Nagpur with accurate bank interest rates and monthly breakdown
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Input Sliders (Span 7) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6">
              {/* Property Price */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                  <span>Property Price</span>
                  <span className="text-base font-black text-brand-navy">
                    ₹ {(propertyPrice / 100000).toFixed(1)} Lakhs
                  </span>
                </div>
                <input
                  type="range"
                  min={1000000}
                  max={30000000}
                  step={100000}
                  value={propertyPrice}
                  onChange={(e) => setPropertyPrice(Number(e.target.value))}
                  className="w-full accent-brand-orange cursor-pointer"
                />
              </div>

              {/* Down Payment */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                  <span>Down Payment ({Math.round((downPayment / propertyPrice) * 100)}%)</span>
                  <span className="text-base font-black text-brand-navy">
                    ₹ {(downPayment / 100000).toFixed(1)} Lakhs
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={propertyPrice * 0.8}
                  step={50000}
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="w-full accent-brand-teal cursor-pointer"
                />
              </div>

              {/* Interest Rate */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                  <span>Annual Interest Rate</span>
                  <span className="text-base font-black text-brand-navy">{interestRate}%</span>
                </div>
                <input
                  type="range"
                  min={6.5}
                  max={14.0}
                  step={0.1}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full accent-brand-orange cursor-pointer"
                />
              </div>

              {/* Tenure */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                  <span>Loan Tenure</span>
                  <span className="text-base font-black text-brand-navy">{tenureYears} Years</span>
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
              </div>
            </div>

            {/* Results Output (Span 5) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-brand-navy to-brand-teal text-white rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
              <div>
                <span className="text-xs uppercase font-bold text-orange-300">
                  Monthly Repayment
                </span>
                <div className="text-4xl font-black text-white mt-1">
                  ₹ {emi.toLocaleString('en-IN')}
                </div>
                <span className="text-xs text-slate-300">Monthly EMI for {tenureYears} years</span>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-3 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Loan Amount:</span>
                  <strong className="text-white">₹ {loanAmount.toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Total Interest:</span>
                  <strong className="text-white">₹ {totalInterest.toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-white/10">
                  <span>Total Payable:</span>
                  <span>₹ {totalPayable.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-4">
                <a
                  href="/tools/loan-enquiry"
                  className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center space-x-2"
                >
                  <span>Apply for Loan Pre-Approval</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Yearly Amortization Schedule Table */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card">
            <h2 className="text-lg font-black text-brand-navy mb-4">
              Yearly Loan Amortization Schedule
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Year</th>
                    <th className="py-3 px-4">Principal Paid (A)</th>
                    <th className="py-3 px-4">Interest Paid (B)</th>
                    <th className="py-3 px-4">Total Payment (A+B)</th>
                    <th className="py-3 px-4">Remaining Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {yearlyBreakdown.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-bold text-slate-900">Year {row.year}</td>
                      <td className="py-2.5 px-4 text-slate-700">₹ {row.principalPaid.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-4 text-brand-orange font-semibold">₹ {row.interestPaid.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-4 text-slate-900 font-bold">₹ {(row.principalPaid + row.interestPaid).toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-4 text-slate-500">₹ {row.balanceRemaining.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmiCalculatorPage;

