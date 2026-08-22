'use client';

import React, { useState } from 'react';
import {
  Landmark,
  Plus,
  Calendar,
  Percent,
  TrendingDown,
  CheckCircle2
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
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Landmark className="w-8 h-8 text-brand-600" />
            <span>Loans & Mortgages</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track Personal, Home, Vehicle & Education loans with principal reduction progress.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-600/30 flex items-center gap-2 active:scale-95 transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Loan</span>
        </button>
      </div>

      {/* Loan Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-xs font-medium text-slate-500">Original Total Borrowed</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{formatCurrency(totalOriginalPrincipal)}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-xs font-medium text-slate-500">Total Outstanding Principal</span>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">{formatCurrency(totalOutstandingPrincipal)}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-xs font-medium text-slate-500">Combined Monthly EMI Commitments</span>
          <p className="text-2xl font-extrabold text-brand-600 mt-1">{formatCurrency(totalMonthlyEMI)}</p>
        </div>
      </div>

      {/* Loans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loans.map((loan) => {
          const paidPct = Math.round((loan.paidMonths / loan.tenureMonths) * 100);

          return (
            <div key={loan.id} className="glass-panel p-6 rounded-3xl space-y-6 card-hover">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                    {loan.loanType} Loan
                  </span>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-1">{loan.loanName}</h3>
                  <p className="text-xs text-slate-500">{loan.lender} • {loan.interestRate}% p.a. Interest</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Monthly EMI</span>
                  <p className="text-lg font-extrabold text-brand-600">{formatCurrency(loan.emiAmount)}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>
                    Paid {loan.paidMonths} of {loan.tenureMonths} Months
                  </span>
                  <span className="font-bold text-emerald-600">{paidPct}% Repaid</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${paidPct}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400">Original Principal</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{formatCurrency(loan.principal)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Outstanding Principal</span>
                  <p className="font-extrabold text-rose-600">{formatCurrency(loan.outstandingPrincipal)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Loan Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl z-10 border space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Loan</h3>

            <form onSubmit={handleCreateLoan} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Loan Name</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Home Loan, SBI Car Loan"
                  value={loanName}
                  onChange={(e) => setLoanName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Lender</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Bank"
                    value={lender}
                    onChange={(e) => setLender(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Loan Type</label>
                  <select
                    value={loanType}
                    onChange={(e) => setLoanType(e.target.value as LoanType)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium"
                  >
                    <option value="personal">Personal Loan</option>
                    <option value="home">Home Loan</option>
                    <option value="vehicle">Vehicle Loan</option>
                    <option value="education">Education Loan</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Principal Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="200000"
                    value={principal}
                    onChange={(e) => setPrincipal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Monthly EMI (₹)</label>
                  <input
                    type="number"
                    placeholder="9415"
                    value={emiAmount}
                    onChange={(e) => setEmiAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Interest Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="11.5"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Tenure (Months)</label>
                  <input
                    type="number"
                    placeholder="24"
                    value={tenureMonths}
                    onChange={(e) => setTenureMonths(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2.5 rounded-xl border text-xs font-bold">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-md">
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
