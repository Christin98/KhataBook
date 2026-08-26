'use client';

import React, { useState } from 'react';
import {
  Landmark,
  Plus,
  Calendar,
  Percent,
  TrendingDown,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  Building
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { formatCurrency, calculateLoanSummary } from '@/lib/calculations';
import { LoanType } from '@/lib/types';

export default function LoansPage() {
  const { loans, addLoan, user } = useData();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [loanName, setLoanName] = useState('');
  const [lender, setLender] = useState('');
  const [loanType, setLoanType] = useState<LoanType>('personal');
  const [principal, setPrincipal] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [tenureMonths, setTenureMonths] = useState('24');
  const [emiAmount, setEmiAmount] = useState('');

  const { totalOriginalPrincipal, totalOutstandingPrincipal, totalMonthlyEMI } = calculateLoanSummary(loans);

  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const prinNum = parseFloat(principal);
    const emiNum = parseFloat(emiAmount);
    const rateNum = parseFloat(interestRate) || 10.5;
    const tenureNum = parseInt(tenureMonths, 10);
    if (!loanName.trim() || isNaN(prinNum) || isNaN(emiNum)) return;

    addLoan({
      userId: user.id,
      loanName,
      lender: lender || 'Bank',
      loanType,
      principal: prinNum,
      interestRate: rateNum,
      tenureMonths: tenureNum,
      emiAmount: emiNum,
      paidMonths: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2028-12-31',
      paymentDayOfMonth: 10,
      outstandingPrincipal: prinNum
    });

    setIsAddModalOpen(false);
    setLoanName('');
    setPrincipal('');
    setEmiAmount('');
    setLender('');
    setInterestRate('');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20 mb-2">
            <Landmark className="w-3.5 h-3.5" />
            <span>Borrowing & Mortgages</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Loans & Long-Term EMIs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Monitor Home, Vehicle, Education, and Personal loans with amortization payoff meters.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 flex items-center gap-2 active:scale-95 transition-all self-start sm:self-center border border-white/20 glass-shimmer cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Loan</span>
        </button>
      </div>

      {/* Loan Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card glass-interactive p-5 sm:p-6 rounded-3xl shadow-xl">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Original Total Borrowed</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{formatCurrency(totalOriginalPrincipal)}</p>
        </div>
        <div className="glass-card glass-interactive p-5 sm:p-6 rounded-3xl shadow-xl border-rose-500/20">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Outstanding Principal</span>
          <p className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-1 tracking-tight">{formatCurrency(totalOutstandingPrincipal)}</p>
        </div>
        <div className="glass-card glass-interactive p-5 sm:p-6 rounded-3xl shadow-xl border-brand-500/20">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Combined Monthly EMI Commitments</span>
          <p className="text-2xl sm:text-3xl font-black text-brand-600 dark:text-brand-400 mt-1 tracking-tight">{formatCurrency(totalMonthlyEMI)}</p>
        </div>
      </div>

      {/* Loans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loans.map((loan) => {
          const progressPct = Math.round((loan.paidMonths / loan.tenureMonths) * 100);

          return (
            <div
              key={loan.id}
              className="glass-card glass-interactive p-6 sm:p-7 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold border border-blue-500/30 shadow-inner">
                    <Landmark className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900 dark:text-white leading-snug">{loan.loanName}</h3>
                    <p className="text-xs text-slate-400 font-medium">
                      {loan.lender} • <span className="capitalize font-bold text-brand-600 dark:text-brand-400">{loan.loanType}</span>
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 font-black text-xs border border-blue-500/30">
                  {loan.interestRate}% p.a.
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400 font-semibold">
                  <span>
                    Tenure: {loan.paidMonths} of {loan.tenureMonths} Months Paid
                  </span>
                  <span className="font-black text-brand-600 dark:text-brand-400">{progressPct}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-200/60 dark:bg-slate-800/80 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200/50 dark:border-white/5 text-center text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Principal</span>
                  <p className="font-black text-slate-900 dark:text-white mt-0.5">{formatCurrency(loan.principal)}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Monthly EMI</span>
                  <p className="font-black text-brand-600 dark:text-brand-400 mt-0.5">{formatCurrency(loan.emiAmount)}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Due Day</span>
                  <p className="font-black text-slate-900 dark:text-white mt-0.5">Day {loan.paymentDayOfMonth}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Loan Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-md glass-panel bg-white/95 dark:bg-slate-900/95 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 border border-white/40 dark:border-white/10 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-white/10">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Add New Loan</h3>
              <span className="text-xs text-brand-600 dark:text-brand-400 font-bold">Mortgage & EMI</span>
            </div>

            <form onSubmit={handleCreateLoan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Loan Title</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Home Loan, Car Loan"
                  value={loanName}
                  onChange={(e) => setLoanName(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Lender / Bank</label>
                  <input
                    type="text"
                    placeholder="e.g. SBI, HDFC"
                    value={lender}
                    onChange={(e) => setLender(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Loan Type</label>
                  <select
                    value={loanType}
                    onChange={(e) => setLoanType(e.target.value as LoanType)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="personal">Personal Loan</option>
                    <option value="home">Home Loan</option>
                    <option value="vehicle">Vehicle Loan</option>
                    <option value="education">Education Loan</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Principal (₹)</label>
                  <input
                    type="number"
                    placeholder="500000"
                    value={principal}
                    onChange={(e) => setPrincipal(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-sm font-black text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Monthly EMI (₹)</label>
                  <input
                    type="number"
                    placeholder="12500"
                    value={emiAmount}
                    onChange={(e) => setEmiAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-sm font-black text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Interest Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="8.5"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Tenure (Months)</label>
                  <input
                    type="number"
                    placeholder="36"
                    value={tenureMonths}
                    onChange={(e) => setTenureMonths(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-white/10 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-black shadow-lg shadow-brand-500/25 border border-white/20 cursor-pointer hover:from-brand-500 hover:to-indigo-500 active:scale-95 transition-all"
                >
                  Save Loan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
