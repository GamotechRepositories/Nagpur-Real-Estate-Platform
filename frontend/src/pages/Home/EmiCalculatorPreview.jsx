import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, ArrowRight, IndianRupee } from 'lucide-react';

const EmiCalculatorPreview = () => {
  const [loanAmount, setLoanAmount] = useState(6000000); // 60 Lakhs
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

  const formatLakhsCrores = (val) => {
    if (val >= 10000000) {
      return `₹ ${(val / 10000000).toFixed(2)} Cr`;
    }
    return `₹ ${(val / 100000).toFixed(1)} L`;
  };

  return (
    <section className="py-24 bg-navy text-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Editorial Description */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center space-x-2 text-[10px] font-semibold uppercase tracking-luxury text-gold border border-gold/40 px-3 py-1 bg-navy-dark">
              <Calculator className="w-3.5 h-3.5" />
              <span>Mortgage Financial Advisory</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight text-white">
              Nagpur Real Estate Capital & EMI Planning
            </h2>

            <p className="text-xs sm:text-sm text-ivory/70 leading-relaxed font-sans pr-4">
              Carefully evaluate your monthly outflow before acquisition. Our advisory desk connects with leading private and nationalized banking institutions in Nagpur to structure bespoke mortgage solutions at competitive terms.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <Link
                to="/tools/emi-calculator"
                className="inline-flex items-center justify-center space-x-2 bg-gold hover:bg-gold-light text-navy text-xs font-medium tracking-luxury uppercase px-6 py-3.5 transition-colors shadow-subtle"
              >
                <span>Full Amortization Schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/tools/loan-enquiry"
                className="inline-flex items-center justify-center space-x-2 border border-white/20 hover:border-gold text-ivory hover:text-gold text-xs font-medium tracking-luxury uppercase px-6 py-3.5 transition-colors"
              >
                <span>Apply For Advisory</span>
              </Link>
            </div>
          </div>

          {/* Right Interactive Calculator Card */}
          <div className="lg:col-span-7 bg-ivory text-charcoal p-8 sm:p-10 border border-beige shadow-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              {/* Sliders */}
              <div className="space-y-6">
                {/* Loan Amount */}
                <div>
                  <div className="flex justify-between items-center text-xs text-charcoal-muted uppercase tracking-luxury mb-2">
                    <span>Borrowing Capital</span>
                    <span className="text-sm font-semibold text-navy font-sans">
                      {formatLakhsCrores(loanAmount)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={500000}
                    max={30000000}
                    step={100000}
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full accent-gold cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-charcoal-muted mt-1.5 font-sans">
                    <span>₹ 5 Lakhs</span>
                    <span>₹ 3 Crores</span>
                  </div>
                </div>

                {/* Interest Rate */}
                <div>
                  <div className="flex justify-between items-center text-xs text-charcoal-muted uppercase tracking-luxury mb-2">
                    <span>Interest Rate</span>
                    <span className="text-sm font-semibold text-navy font-sans">
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
                    className="w-full accent-gold cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-charcoal-muted mt-1.5 font-sans">
                    <span>6.5%</span>
                    <span>14.0%</span>
                  </div>
                </div>

                {/* Tenure */}
                <div>
                  <div className="flex justify-between items-center text-xs text-charcoal-muted uppercase tracking-luxury mb-2">
                    <span>Loan Duration</span>
                    <span className="text-sm font-semibold text-navy font-sans">
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
                    className="w-full accent-gold cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-charcoal-muted mt-1.5 font-sans">
                    <span>5 Years</span>
                    <span>30 Years</span>
                  </div>
                </div>
              </div>

              {/* Output Summary Card */}
              <div className="bg-white border border-beige p-6 space-y-6">
                <div>
                  <span className="text-[10px] uppercase tracking-luxury text-charcoal-muted block mb-1">
                    Estimated Monthly Outflow
                  </span>
                  <div className="font-serif text-3xl sm:text-4xl text-navy font-normal">
                    ₹ {emi.toLocaleString('en-IN')}
                    <span className="text-xs font-sans text-charcoal-muted ml-1.5">/ mo</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-beige text-xs">
                  <div className="flex justify-between items-center text-charcoal-muted">
                    <span>Principal Amount</span>
                    <span className="font-semibold text-navy">
                      ₹ {loanAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-charcoal-muted">
                    <span>Total Interest Payable</span>
                    <span className="font-semibold text-navy">
                      ₹ {totalInterest.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-beige font-semibold text-navy">
                    <span>Total Sum Payable</span>
                    <span>₹ {totalPayable.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <Link
                  to={`/tools/loan-enquiry?amount=${loanAmount}&tenure=${tenureYears}`}
                  className="block w-full text-center bg-navy hover:bg-navy-light text-white text-xs font-medium tracking-luxury uppercase py-3 transition-colors"
                >
                  Request Pre-Approval
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmiCalculatorPreview;
