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
  ArrowRight
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
  calculateFinancialHealthScore
} from '@/lib/calculations';
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
    setIsQuickAddOpen
  } = useData();

  const currentMonthStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const totalBalance = calculateTotalBalance(accounts);
  const { income, expenses, savings, savingsRate } = calculateMonthlySummary(transactions, currentMonthStr);
  const ccSummary = calculateCreditCardSummary(creditCards);
  const { monthlyCommitment: emiMonthlyTotal } = calculateMonthlyEMICommitment(emis);
  const ccOutstanding = ccSummary.totalOutstanding;
  const { totalOutstandingPrincipal: loanOutstanding } = calculateLoanSummary(loans);
  const { totalReceive, totalPay } = calculateUserCircleTotals(user.id, circles, circleExpenses, settlements);

  // Financial Health Calculation
  const healthScore = calculateFinancialHealthScore(
    income,
    expenses,
    ccOutstanding + loanOutstanding,
    budgets,
    reminders.length
  );

  // Dynamic Chart data calculated from actual transactions
  const chartData = calculateMonthlyCashflowTrend(transactions, 4);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. HERO COMMAND CENTER BANNER */}
      <div className="relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-950/80 via-slate-900/80 to-indigo-950/80 text-white shadow-2xl border border-white/15 backdrop-blur-2xl">
        {/* Glow Spheres Inside Banner */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md border border-white/20 text-brand-200 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-brand-300 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Command Center • Personal & Shared Wealth</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
            Welcome back, <span className="bg-gradient-to-r from-brand-300 via-indigo-200 to-white bg-clip-text text-transparent">{user.displayName}</span> 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300/90 max-w-xl font-medium">
            Live real-time financial ledger, shared circle splits, & algorithmic wealth metrics.
          </p>
        </div>

        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="relative z-10 self-start sm:self-center px-6 py-3.5 rounded-2xl bg-white text-slate-950 font-black text-xs hover:bg-brand-50 active:scale-95 transition-all shadow-xl shadow-black/30 flex items-center gap-2.5 border border-white/50 glass-shimmer cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4 text-brand-600 animate-pulse" />
          <span>Quick Add Expense</span>
        </button>
      </div>

      {/* 2. FINANCIAL SUMMARY CARDS GRID */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-500" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Real-time Portfolio Overview
            </h2>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Encrypted Ledger</span>
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Net Balance */}
          <div className="glass-card glass-interactive p-5 sm:p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Net Balance</span>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-500/25 to-indigo-500/25 text-brand-600 dark:text-brand-300 flex items-center justify-center border border-brand-500/30 shadow-inner group-hover:scale-110 transition-transform">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {formatCurrency(totalBalance)}
              </div>
              <p className="text-[11px] font-medium text-slate-400 mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                <span>Across {accounts.length} liquid accounts</span>
              </p>
            </div>
          </div>

          {/* Card 2: Monthly Income */}
          <div className="glass-card glass-interactive p-5 sm:p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Monthly Inflows</span>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500/25 to-teal-500/25 text-emerald-600 dark:text-emerald-300 flex items-center justify-center border border-emerald-500/30 shadow-inner group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {formatCurrency(income)}
              </div>
              <p className="text-[11px] text-emerald-600/90 dark:text-emerald-400/90 font-bold mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Salary, dividends & credits</span>
              </p>
            </div>
          </div>

          {/* Card 3: Monthly Outflow */}
          <div className="glass-card glass-interactive p-5 sm:p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Monthly Outflow</span>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500/25 to-pink-500/25 text-rose-600 dark:text-rose-300 flex items-center justify-center border border-rose-500/30 shadow-inner group-hover:scale-110 transition-transform">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                {formatCurrency(expenses)}
              </div>
              <p className="text-[11px] font-bold text-slate-400 mt-1 flex items-center gap-1.5">
                <span>Savings rate:</span>
                <span className="text-brand-600 dark:text-brand-400 font-extrabold px-1.5 py-0.5 rounded-md bg-brand-500/10 border border-brand-500/20">{savingsRate}%</span>
              </p>
            </div>
          </div>

          {/* Card 4: Circles Split Net */}
          <div className="glass-card glass-interactive p-5 sm:p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Circles Split Net</span>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-500/25 to-indigo-500/25 text-purple-600 dark:text-purple-300 flex items-center justify-center border border-purple-500/30 shadow-inner group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">To Receive:</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">{formatCurrency(totalReceive)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">To Pay:</span>
                <span className="font-extrabold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20">{formatCurrency(totalPay)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Row: Credit Card & Loan Outstanding */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="glass-card glass-interactive p-5 sm:p-6 rounded-3xl flex items-center justify-between shadow-xl group">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-purple-600/25 to-indigo-600/25 text-purple-500 dark:text-purple-300 border border-purple-500/30 shadow-inner group-hover:scale-105 transition-transform">
                <CreditCardIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Credit Cards & EMIs</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{formatCurrency(ccOutstanding)}</p>
                  <span className="text-[11px] font-bold text-slate-400">({ccSummary.overallUtilization}% used)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Available: <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(ccSummary.totalAvailable)}</strong> · EMI: <strong>{formatCurrency(emiMonthlyTotal)}/mo</strong>
                </p>
              </div>
            </div>
            <Link href="/credit-cards" className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-xs text-purple-600 dark:text-purple-300 font-black flex items-center gap-1 border border-purple-500/20 transition-colors shrink-0">
              <span>View Cards</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="glass-card glass-interactive p-5 sm:p-6 rounded-3xl flex items-center justify-between shadow-xl group">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-blue-600/25 to-teal-600/25 text-blue-500 dark:text-blue-300 border border-blue-500/30 shadow-inner group-hover:scale-105 transition-transform">
                <Landmark className="w-6 h-6" />
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

      {/* 3. MONTHLY CASHFLOW DYNAMICS & FINANCIAL HEALTH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Income vs Expense Chart */}
        <div className="lg:col-span-2 glass-card p-6 sm:p-7 rounded-3xl flex flex-col justify-between shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight">Monthly Income vs Outflow</h3>
              <p className="text-xs text-slate-400 font-medium">Cashflow dynamics & monthly savings trajectory</p>
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
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 12px 36px rgba(0,0,0,0.45)',
                    padding: '12px 16px'
                  }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                />
                <Bar dataKey="Income" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={36} />
                <Bar dataKey="Expense" fill="#f43f5e" radius={[8, 8, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Health Score Widget */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-brand-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight">Financial Health</h3>
              <ShieldCheck className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Automated cashflow & safety score</p>

            <div className="mt-6 flex flex-col items-center justify-center text-center">
              <div className="relative w-28 h-28 flex items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-brand-500/30 border border-white/30">
                <span className="text-3xl font-black tracking-tight">{healthScore.score}</span>
                <span className="text-[11px] absolute bottom-3 text-brand-200 font-bold">/ 100</span>
              </div>
              <span className="mt-3 px-3.5 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
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
          
          <p className="text-[10px] text-slate-400 font-semibold italic text-center mt-4 relative z-10">
            Client-Side Encrypted Evaluation.
          </p>
        </div>
      </div>

      {/* 4. RECENT TRANSACTIONS & UPCOMING PAYMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions List */}
        <div className="lg:col-span-2 glass-card p-6 sm:p-7 rounded-3xl space-y-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight">Recent Ledger Activity</h3>
              <p className="text-xs text-slate-400 font-medium">Real-time ledger updates</p>
            </div>
            <Link href="/transactions" className="px-3 py-1.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-xs font-black text-brand-600 dark:text-brand-400 border border-brand-500/20 flex items-center gap-1 transition-colors">
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="divide-y divide-slate-200/50 dark:divide-white/5">
            {transactions.slice(0, 5).map((t) => (
              <div key={t.id} className="py-3.5 flex items-center justify-between gap-4 glass-interactive rounded-2xl px-3 -mx-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0 shadow-inner ${
                      t.type === 'income'
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : t.type === 'transfer'
                        ? 'bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/30'
                        : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
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
                  <p className="text-[11px] text-slate-400 capitalize font-medium">{t.paymentMethod || 'Direct'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Payments & Reminders */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl space-y-4 shadow-2xl">
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
                className="p-3.5 rounded-2xl glass-subtle flex items-center justify-between glass-interactive"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[130px]">{rem.title}</p>
                    <p className="text-[11px] text-slate-400 font-medium">Due {rem.dueDate}</p>
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
