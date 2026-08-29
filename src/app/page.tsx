'use client';

import React from 'react';
import Link from 'next/link';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard as CreditCardIcon,
  Landmark,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Receipt,
  Users,
  Activity,
  Zap,
  ArrowRight,
  PiggyBank,
  Percent
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import {
  formatCurrency,
  calculateTotalBalance,
  calculateMonthlySummary,
  calculateMonthlyCashflowTrend,
  calculateCreditCardSummary,
  calculateMonthlyEMICommitment,
  getCreditUtilizationStatus,
  calculateLoanSummary,
  calculateUserCircleTotals,
  calculateFinancialHealthScore,
  calculatePeriodSummary,
  calculatePeriodCashflowTrend,
  calculatePeriodComparison,
  filterTransactionsByPeriod,
  getDateRangeForPeriod,
  PERIOD_OPTIONS
} from '@/lib/calculations';
import PeriodSelector from '@/components/common/PeriodSelector';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function DashboardPage() {
  const {
    user,
    accounts,
    transactions,
    circles,
    circleExpenses,
    settlements,
    creditCards,
    emis,
    loans,
    budgets,
    reminders,
    selectedPeriod,
    setIsQuickAddOpen
  } = useData();

  const totalBalance = calculateTotalBalance(accounts);
  
  // Date period recalculations
  const periodSummary = calculatePeriodSummary(transactions, selectedPeriod);
  const { income, expenses, savings, savingsRate } = periodSummary;
  const comparison = calculatePeriodComparison(transactions, selectedPeriod);
  const filteredPeriodTxns = filterTransactionsByPeriod(transactions, selectedPeriod);
  const chartData = calculatePeriodCashflowTrend(transactions, selectedPeriod);
  const activePeriodOption = PERIOD_OPTIONS.find((p) => p.id === selectedPeriod) || PERIOD_OPTIONS[0];
  const dateRange = getDateRangeForPeriod(selectedPeriod);

  const ccSummary = calculateCreditCardSummary(creditCards);
  const { monthlyCommitment: emiMonthlyTotal } = calculateMonthlyEMICommitment(emis);
  const ccOutstanding = ccSummary.totalOutstanding;
  const { totalOutstandingPrincipal: loanOutstanding } = calculateLoanSummary(loans);
  const { totalReceive, totalPay } = calculateUserCircleTotals(user.id, circles, circleExpenses, settlements);
  const netCircleBalance = totalReceive - totalPay;

  // Financial Health Calculation based on active period cashflows
  const healthScore = calculateFinancialHealthScore(
    income,
    expenses,
    ccOutstanding + loanOutstanding,
    budgets,
    reminders.length
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. HERO COMMAND CENTER BANNER (Dark Navy Summary Panel) */}
      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-950 via-navy-900 to-slate-900 text-white shadow-xl border border-white/10 z-20">
        {/* Subtle Violet Accent Glow safely clipped */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 border border-white/15 text-brand-200">
            <Sparkles className="w-3.5 h-3.5 text-brand-300 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Command Center • Personal & Shared Wealth</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
            Welcome back, <span className="text-brand-300">{user.displayName}</span> 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium">
            Live real-time financial ledger, shared circle splits, & algorithmic wealth metrics.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3 self-start lg:self-center shrink-0">
          <PeriodSelector />

          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs active:scale-95 transition-all shadow-lg shadow-brand-500/25 flex items-center gap-2 cursor-pointer shrink-0 min-h-[44px]"
          >
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
            <span>Quick Add Entry</span>
          </button>
        </div>
      </div>

      {/* 2. FINANCIAL SUMMARY CARDS GRID (Wide desktop row, responsive stack on smaller screens) */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-500" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Portfolio Overview • <span className="text-brand-600 dark:text-brand-400">{activePeriodOption.label}</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-300/50 dark:border-white/10">
              {dateRange.formattedRange}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Encrypted</span>
            </span>
          </div>
        </div>
        
        {/* 5-Card Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Card 1: Total Net Balance */}
          <div className="glass-card p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Net Balance</span>
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300 flex items-center justify-center border border-brand-500/20 shadow-2xs group-hover:scale-105 transition-transform">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {formatCurrency(totalBalance)}
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                <span className="truncate">Across {accounts.length} active {accounts.length === 1 ? 'account' : 'accounts'}</span>
              </p>
            </div>
          </div>

          {/* Card 2: Period Inflows */}
          <div className="glass-card p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {activePeriodOption.id === 'all_time' ? 'Total Inflows' : `${activePeriodOption.label} Inflows`}
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 flex items-center justify-center border border-emerald-500/20 shadow-2xs group-hover:scale-105 transition-transform">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {formatCurrency(income)}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 text-xs">
                {comparison.hasPriorData && comparison.incomeDelta !== null ? (
                  <p className="font-bold flex items-center gap-1 text-xs">
                    <span className={comparison.incomeDelta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                      {comparison.incomeDelta >= 0 ? '+' : ''}{comparison.incomeDelta.toFixed(1)}%
                    </span>
                    <span className="text-slate-400 font-normal">vs {comparison.priorPeriodLabel}</span>
                  </p>
                ) : periodSummary.incomeCount > 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 font-medium truncate">
                    {periodSummary.incomeCount} credit {periodSummary.incomeCount === 1 ? 'entry' : 'entries'} in period
                  </p>
                ) : (
                  <p className="text-slate-400 dark:text-slate-500 font-medium italic">
                    No trend yet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Period Outflows */}
          <div className="glass-card p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {activePeriodOption.id === 'all_time' ? 'Total Outflows' : `${activePeriodOption.label} Outflows`}
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-300 flex items-center justify-center border border-rose-500/20 shadow-2xs group-hover:scale-105 transition-transform">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                {formatCurrency(expenses)}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 text-xs">
                {comparison.hasPriorData && comparison.expenseDelta !== null ? (
                  <p className="font-bold flex items-center gap-1 text-xs">
                    <span className={comparison.expenseDelta <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                      {comparison.expenseDelta <= 0 ? '' : '+'}{comparison.expenseDelta.toFixed(1)}%
                    </span>
                    <span className="text-slate-400 font-normal">vs {comparison.priorPeriodLabel}</span>
                  </p>
                ) : periodSummary.expenseCount > 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 font-medium truncate">
                    {periodSummary.expenseCount} debit {periodSummary.expenseCount === 1 ? 'entry' : 'entries'} in period
                  </p>
                ) : (
                  <p className="text-slate-400 dark:text-slate-500 font-medium italic">
                    No trend yet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Card 4: Savings Rate (NEW DEDICATED CARD) */}
          <div className="glass-card p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Savings Rate</span>
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-300 flex items-center justify-center border border-blue-500/20 shadow-2xs group-hover:scale-105 transition-transform">
                <PiggyBank className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className={`text-xl sm:text-2xl font-black tracking-tight ${
                income <= 0 ? 'text-slate-700 dark:text-slate-300' : savingsRate >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {income > 0 ? `${savingsRate.toFixed(1)}%` : '0%'}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 text-xs">
                {income <= 0 ? (
                  <p className="text-slate-400 dark:text-slate-500 font-medium italic truncate">
                    No trend yet • Zero income
                  </p>
                ) : comparison.hasPriorData && comparison.savingsRateDelta !== null ? (
                  <p className="font-bold flex items-center gap-1 text-xs">
                    <span className={comparison.savingsRateDelta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                      {comparison.savingsRateDelta >= 0 ? '+' : ''}{comparison.savingsRateDelta.toFixed(1)}% pts
                    </span>
                    <span className="text-slate-400 font-normal">vs {comparison.priorPeriodLabel}</span>
                  </p>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 font-medium truncate">
                    Retained {formatCurrency(savings)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Card 5: Circles Split Net */}
          <div className="glass-card p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Circles Split Net</span>
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-300 flex items-center justify-center border border-purple-500/20 shadow-2xs group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className={`text-xl sm:text-2xl font-black tracking-tight ${
                netCircleBalance > 0 ? 'text-emerald-600 dark:text-emerald-400' : netCircleBalance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'
              }`}>
                {netCircleBalance > 0 ? `+${formatCurrency(netCircleBalance)}` : formatCurrency(netCircleBalance)}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-600 dark:text-emerald-400 truncate">
                  +{formatCurrency(totalReceive)}
                </span>
                <span className="text-rose-600 dark:text-rose-400 truncate">
                  -{formatCurrency(totalPay)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Row: Credit Card & Loan Outstanding */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="glass-card p-5 sm:p-6 rounded-2xl flex items-center justify-between shadow-xl group">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 group-hover:scale-105 transition-transform">
                <CreditCardIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Credit Cards & EMIs</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{formatCurrency(ccOutstanding)}</p>
                  <span className="text-xs font-bold text-slate-400">({ccSummary.overallUtilization}% used)</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Available: <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(ccSummary.totalAvailable)}</strong> · EMI: <strong>{formatCurrency(emiMonthlyTotal)}/mo</strong>
                </p>
              </div>
            </div>
            <Link href="/credit-cards" className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-xs text-purple-600 dark:text-purple-300 font-black flex items-center gap-1 border border-purple-500/20 transition-colors shrink-0">
              <span>View Cards</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="glass-card p-5 sm:p-6 rounded-2xl flex items-center justify-between shadow-xl group">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20 group-hover:scale-105 transition-transform">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Loan Outstanding Principal</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{formatCurrency(loanOutstanding)}</p>
              </div>
            </div>
            <Link href="/loans" className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-xs text-blue-600 dark:text-blue-300 font-black flex items-center gap-1 border border-blue-500/20 transition-colors">
              <span>View Loans</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. CASHFLOW DYNAMICS & FINANCIAL HEALTH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expense Chart */}
        <div className="lg:col-span-2 glass-card p-6 sm:p-7 rounded-2xl flex flex-col justify-between shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight">
                Income vs Outflow • <span className="text-brand-600 dark:text-brand-400">{activePeriodOption.label}</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">Cashflow dynamics & savings trajectory for {activePeriodOption.label.toLowerCase()}</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" /> Income
              </span>
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-xl border border-rose-500/20">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" /> Expense
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.12)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '16px',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 12px 36px rgba(0,0,0,0.45)',
                    padding: '12px 16px'
                  }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                />
                <Bar dataKey="Income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={36} />
                <Bar dataKey="Expense" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Health Score Widget */}
        <div className="glass-card p-6 sm:p-7 rounded-2xl flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-brand-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight">Financial Health</h3>
              <ShieldCheck className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Automated cashflow & safety evaluation</p>

            <div className="mt-6 flex flex-col items-center justify-center text-center">
              <div className="relative w-28 h-28 flex items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/25 border border-white/20">
                <span className="text-3xl font-black tracking-tight">{healthScore.score}</span>
                <span className="text-xs absolute bottom-3 text-brand-200 font-bold">/ 100</span>
              </div>
              <span className="mt-3 px-3.5 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                {healthScore.rating} Score
              </span>
            </div>

            {/* Key Insights List */}
            <div className="mt-6 space-y-2">
              {healthScore.insights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="text-brand-500 mt-0.5 font-bold">•</span>
                  <span className="leading-tight font-medium">{insight}</span>
                </div>
              ))}
            </div>
          </div>
          
          <p className="text-xs text-slate-400 font-semibold italic text-center mt-4 relative z-10">
            Client-Side Encrypted Evaluation.
          </p>
        </div>
      </div>

      {/* 4. RECENT TRANSACTIONS & UPCOMING PAYMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions List */}
        <div className="lg:col-span-2 glass-card p-6 sm:p-7 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight">
                Recent Ledger Activity • <span className="text-brand-600 dark:text-brand-400">{activePeriodOption.label}</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Showing entries for {activePeriodOption.label.toLowerCase()} ({filteredPeriodTxns.length} records)
              </p>
            </div>
            <Link href="/transactions" className="px-3 py-1.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-xs font-black text-brand-600 dark:text-brand-400 border border-brand-500/20 flex items-center gap-1 transition-colors">
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="divide-y divide-slate-200/50 dark:divide-white/5">
            {filteredPeriodTxns.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-1">
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No transactions in this period</p>
                <p className="text-xs text-slate-400">Switch to 'All time' or add a new entry for this date range.</p>
              </div>
            ) : (
              filteredPeriodTxns.slice(0, 5).map((t) => (
                <div key={t.id} className="py-3.5 flex items-center justify-between gap-4 glass-interactive rounded-xl px-3 -mx-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 shadow-2xs ${
                        t.type === 'income'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
                          : t.type === 'transfer'
                          ? 'bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-500/25'
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25'
                      }`}
                    >
                      {t.type === 'income' ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{t.description}</p>
                      <p className="text-xs text-slate-400 font-medium">
                        {t.category} • {t.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-black text-sm ${
                        t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : t.type === 'transfer' ? 'text-brand-600 dark:text-brand-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {t.type === 'income' ? '+' : t.type === 'transfer' ? '' : '-'}{formatCurrency(t.amount)}
                    </span>
                    <p className="text-xs text-slate-400 capitalize font-medium">{t.paymentMethod || 'Direct'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Payments & Reminders */}
        <div className="glass-card p-6 sm:p-7 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight">Upcoming Dues</h3>
              <p className="text-xs text-slate-400 font-medium">Bills & commitments</p>
            </div>
            <Link href="/reminders" className="text-xs font-black text-brand-600 dark:text-brand-400 hover:underline">
              Manage Dues
            </Link>
          </div>

          <div className="space-y-3">
            {reminders.slice(0, 4).map((rem) => (
              <div
                key={rem.id}
                className="p-3.5 rounded-xl glass-subtle flex items-center justify-between glass-interactive"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[130px]">{rem.title}</p>
                    <p className="text-xs text-slate-400 font-medium">Due {rem.dueDate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {formatCurrency(rem.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
