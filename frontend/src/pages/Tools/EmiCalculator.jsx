import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Calculator, ArrowRight, IndianRupee, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmiCalculatorPage = () => {
  const [propertyPrice, setPropertyPrice] = useState(7500000); // 75 Lakhs
  const [downPayment, setDownPayment] = useState(1500000); // 15 Lakhs (20%)
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
        <title>Nagpur Home Loan & Mortgage EMI Calculator | Nagpur Estates</title>
        <meta
          name="description"
          content="Calculate monthly loan amortization, interest accrual, and principal schedules for luxury properties and plots in Nagpur."
        />
      </Helmet>

      <div className="bg-ivory-light min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto border-b border-beige pb-8">
            <span className="text-[10px] font-semibold uppercase tracking-luxury text-gold border border-gold/40 px-3 py-1 bg-white mb-3 inline-block">
              Capital Structuring
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-navy font-normal tracking-tight">
              Mortgage Capital & Amortization Calculator
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-2 font-sans leading-relaxed">
              Model your borrowing structure, evaluate principal reduction velocity, and calculate your monthly capital allocation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Inputs */}
            <div className="lg:col-span-6 bg-white p-8 border border-beige shadow-subtle space-y-6">
              <h2 className="font-serif text-xl text-navy font-normal mb-4">Capital Parameters</h2>

              {/* Property Price */}
              <div>
                <div className="flex justify-between items-center text-xs text-charcoal-muted uppercase tracking-luxury mb-2">
                  <span>Property Valuation</span>
                  <span className="font-semibold text-navy font-sans text-sm">
                    ₹ {(propertyPrice / 100000).toFixed(1)} Lakhs
                  </span>
                </div>
                <input
                  type="range"
                  min={1000000}
                  max={50000000}
                  step={100000}
                  value={propertyPrice}
                  onChange={(e) => setPropertyPrice(Number(e.target.value))}
                  className="w-full accent-gold cursor-pointer"
                />
              </div>

              {/* Down Payment */}
              <div>
                <div className="flex justify-between items-center text-xs text-charcoal-muted uppercase tracking-luxury mb-2">
                  <span>Down Payment (Equity)</span>
                  <span className="font-semibold text-navy font-sans text-sm">
                    ₹ {(downPayment / 100000).toFixed(1)} Lakhs ({Math.round((downPayment / propertyPrice) * 100)}%)
                  </span>
                </div>
                <input
                  type="range"
                  min={500000}
                  max={propertyPrice * 0.8}
                  step={50000}
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="w-full accent-gold cursor-pointer"
                />
              </div>

              {/* Interest Rate */}
              <div>
                <div className="flex justify-between items-center text-xs text-charcoal-muted uppercase tracking-luxury mb-2">
                  <span>Interest Rate</span>
                  <span className="font-semibold text-navy font-sans text-sm">
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
              </div>

              {/* Loan Tenure */}
              <div>
                <div className="flex justify-between items-center text-xs text-charcoal-muted uppercase tracking-luxury mb-2">
                  <span>Loan Duration</span>
                  <span className="font-semibold text-navy font-sans text-sm">
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
              </div>
            </div>

            {/* Right Summary */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-navy text-ivory p-8 border border-navy-light shadow-subtle space-y-6">
                <div>
                  <span className="text-[10px] uppercase tracking-luxury text-gold block mb-1">
                    Monthly Debt Service
                  </span>
                  <div className="font-serif text-4xl text-white font-normal">
                    ₹ {emi.toLocaleString('en-IN')}
                    <span className="text-xs font-sans text-ivory/60 ml-2">/ month</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 space-y-3.5 text-xs font-sans">
                  <div className="flex justify-between text-ivory/70">
                    <span>Principal Financed</span>
                    <strong className="text-white">₹ {loanAmount.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between text-ivory/70">
                    <span>Total Interest Liability</span>
                    <strong className="text-white">₹ {totalInterest.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between text-ivory/70 pt-2 border-t border-white/10">
                    <span>Total Aggregate Outflow</span>
                    <strong className="text-gold font-semibold text-sm">₹ {totalPayable.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <Link
                  to={`/tools/loan-enquiry?amount=${loanAmount}&tenure=${tenureYears}`}
                  className="block w-full text-center bg-gold hover:bg-gold-light text-navy text-xs font-medium tracking-luxury uppercase py-3.5 transition-colors"
                >
                  Initiate Pre-Approval Advisory
                </Link>
              </div>
            </div>
          </div>

          {/* Amortization Schedule Table */}
          {yearlyBreakdown.length > 0 && (
            <div className="bg-white p-8 border border-beige shadow-subtle">
              <h3 className="font-serif text-2xl text-navy font-normal mb-6">Annual Amortization Ledger</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left font-sans">
                  <thead>
                    <tr className="border-b border-beige text-charcoal-muted uppercase tracking-luxury text-[10px]">
                      <th className="py-3 px-4">Year</th>
                      <th className="py-3 px-4">Principal Repaid</th>
                      <th className="py-3 px-4">Interest Serviced</th>
                      <th className="py-3 px-4">Balance Capital</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-beige text-charcoal">
                    {yearlyBreakdown.map((row) => (
                      <tr key={row.year} className="hover:bg-ivory-light">
                        <td className="py-3 px-4 font-semibold text-navy">Year {row.year}</td>
                        <td className="py-3 px-4">₹ {row.principalPaid.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4">₹ {row.interestPaid.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 font-medium text-navy">₹ {row.balanceRemaining.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EmiCalculatorPage;
