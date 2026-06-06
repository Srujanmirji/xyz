import React, { useState, useEffect } from 'react';

interface MortgageCalculatorProps {
  propertyPrice: number;
}

export const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({ propertyPrice }) => {
  const [price, setPrice] = useState(propertyPrice);
  const [downPayment, setDownPayment] = useState(propertyPrice * 0.2);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);

  // EMI State
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  // ROI State
  const [monthlyRent, setMonthlyRent] = useState(propertyPrice * 0.005);
  const [annualExpenses, setAnnualExpenses] = useState(propertyPrice * 0.01);
  const [capRate, setCapRate] = useState(0);

  useEffect(() => {
    setPrice(propertyPrice);
    setDownPayment(propertyPrice * 0.2);
    setMonthlyRent(propertyPrice * 0.005);
    setAnnualExpenses(propertyPrice * 0.01);
  }, [propertyPrice]);

  useEffect(() => {
    // Mortgage EMI Calculation
    const principal = price - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = loanTerm * 12;

    if (principal <= 0) {
      setMonthlyPayment(0);
      setTotalPayment(0);
      setTotalInterest(0);
      return;
    }

    if (monthlyRate === 0) {
      const payment = principal / totalMonths;
      setMonthlyPayment(payment);
      setTotalPayment(principal);
      setTotalInterest(0);
      return;
    }

    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);

    const total = emi * totalMonths;
    const interest = total - principal;

    setMonthlyPayment(emi);
    setTotalPayment(total);
    setTotalInterest(interest);
  }, [price, downPayment, interestRate, loanTerm]);

  useEffect(() => {
    // ROI Calculation
    const annualRent = monthlyRent * 12;
    const netOperatingIncome = annualRent - annualExpenses;
    const rate = (netOperatingIncome / price) * 100;
    setCapRate(isNaN(rate) || !isFinite(rate) ? 0 : rate);
  }, [price, monthlyRent, annualExpenses]);

  return (
    <div className="bg-surface-container-low p-stack-lg rounded-xl border border-outline-variant/30 shadow-sm transition-all duration-300">
      <h3 className="font-headline-md text-headline-md text-on-surface mb-stack-md flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">calculate</span>
        Financial Calculators
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mortgage / EMI Inputs */}
        <div className="space-y-4">
          <h4 className="font-bold text-on-surface text-lg border-b border-outline-variant/20 pb-2">
            Mortgage & EMI
          </h4>
          <div>
            <label className="block text-xs font-label-md text-on-surface-variant mb-1">
              Property Price (₹)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-label-md text-on-surface-variant mb-1">
                Down Payment (₹)
              </label>
              <input
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-label-md text-on-surface-variant mb-1">
                Interest Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-label-md text-on-surface-variant mb-1">
              Loan Term ({loanTerm} Years)
            </label>
            <input
              type="range"
              min="5"
              max="40"
              step="5"
              value={loanTerm}
              onChange={(e) => setLoanTerm(parseInt(e.target.value))}
              className="w-full h-1 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div className="bg-surface p-4 rounded-lg border border-outline-variant/20 flex flex-col gap-2 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-on-surface-variant">Monthly Payment</span>
              <span className="font-bold text-primary text-xl">
                ₹{monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-on-surface-variant border-t border-outline-variant/10 pt-2">
              <span>Total Interest</span>
              <span>₹{totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-on-surface-variant">
              <span>Total Cost</span>
              <span>₹{totalPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </div>

        {/* ROI / Cap Rate Inputs */}
        <div className="space-y-4">
          <h4 className="font-bold text-on-surface text-lg border-b border-outline-variant/20 pb-2">
            ROI & Cap Rate Estimator
          </h4>
          <div>
            <label className="block text-xs font-label-md text-on-surface-variant mb-1">
              Estimated Monthly Rent (₹)
            </label>
            <input
              type="number"
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(parseFloat(e.target.value) || 0)}
              className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-label-md text-on-surface-variant mb-1">
              Annual Operating Expenses (₹)
            </label>
            <input
              type="number"
              value={annualExpenses}
              onChange={(e) => setAnnualExpenses(parseFloat(e.target.value) || 0)}
              className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
            />
          </div>

          <div className="bg-surface p-4 rounded-lg border border-outline-variant/20 flex flex-col gap-2 mt-12">
            <div className="flex justify-between items-center">
              <span className="text-sm text-on-surface-variant">Estimated Cap Rate (ROI)</span>
              <span className="font-bold text-tertiary-container text-xl">
                {capRate.toFixed(2)}%
              </span>
            </div>
            <div className="text-[11px] text-on-surface-variant italic mt-2 border-t border-outline-variant/10 pt-2 leading-relaxed">
              * Cap Rate = (Annual Rental Income - Annual Operating Expenses) / Property Price.
              Standard real estate returns typically average between 4% and 8%.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
