import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Calculator, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmiCalculatorPage = () => {
  const [propertyPrice, setPropertyPrice] = useState(10000000); // 1 Cr
  const [downPayment, setDownPayment] = useState(2000000); // 20 Lakhs
  const [interestRate, setInterestRate] = useState(8.5); // 8.5%
  const [tenureYears, setTenureYears] = useState(20); // 20 years

  const loanAmount = Math.max(0, propertyPrice - downPayment);

  const { emi, totalInterest, totalPayable } = useMemo(() => {
    const p = loanAmount;
    const r = interestRate / 12 / 100;
    const n = tenureYears * 12;

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
    <>
      <Helmet>
        <title>Home Loan EMI Calculator | Nagpur Realty</title>
        <meta
          name="description"
          content="Calculate your monthly home loan EMI, total interest, and loan amortization for properties in Nagpur."
        />
      </Helmet>

      <div className="bg-[#F7F4ED] min-h-screen py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header matching Screen 12 */}
          <div className="space-y-1.5 border-b border-[#E9E4DA] pb-6 text-center sm:text-left">
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#172C3B]">
              Home Loan EMI Calculator
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Plan your home financing with accurate monthly EMI and total interest estimates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column: 4 Inputs matching Screen 12 */}
            <div className="md:col-span-7 bg-white rounded-2xl border border-[#E9E4DA] p-6 shadow-sm space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Property Price (₹)
                  </label>
                  <input
                    type="number"
                    value={propertyPrice}
                    onChange={(e) => setPropertyPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65]"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    ₹ {(propertyPrice / 100000).toFixed(0)} Lakhs
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Down Payment (₹)
                  </label>
                  <input
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65]"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    ₹ {(downPayment / 100000).toFixed(0)} Lakhs ({propertyPrice > 0 ? Math.round((downPayment / propertyPrice) * 100) : 0}%)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65]"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Avg. bank home loan rate
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Loan Tenure (Years)
                  </label>
                  <input
                    type="number"
                    value={tenureYears}
                    onChange={(e) => setTenureYears(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65]"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    {tenureYears * 12} Months
                  </span>
                </div>
              </div>

              {/* Slider for quick adjustments */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Adjust Property Price: ₹ {(propertyPrice / 100000).toFixed(1)} Lakhs
                </label>
                <input
                  type="range"
                  min="2000000"
                  max="50000000"
                  step="500000"
                  value={propertyPrice}
                  onChange={(e) => setPropertyPrice(Number(e.target.value))}
                  className="w-full accent-[#B89A65] cursor-pointer"
                />
              </div>
            </div>

            {/* Right Column: Result Card matching Screen 12 */}
            <div className="md:col-span-5 bg-white rounded-2xl border border-[#E9E4DA] p-6 shadow-sm space-y-5 text-[#252525]">
              <div className="bg-[#F7F4ED] rounded-xl p-5 border border-[#B89A65]/30 text-center space-y-1">
                <span className="text-xs text-gray-500 font-medium">Monthly EMI</span>
                <div className="text-3xl sm:text-4xl font-bold text-[#172C3B]">
                  ₹ {emi.toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] text-[#B89A65] font-semibold">per month</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Principal Loan Amount</span>
                  <span className="font-bold text-[#172C3B]">₹ {loanAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Total Interest Payable</span>
                  <span className="font-bold text-[#172C3B]">₹ {totalInterest.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Total Amount Payable</span>
                  <span className="font-bold text-[#172C3B]">₹ {totalPayable.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <Link
                to="/tools/loan-enquiry"
                className="w-full block text-center py-3 bg-[#B89A65] hover:bg-[#A38753] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
              >
                Apply for Pre-Approved Loan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmiCalculatorPage;
