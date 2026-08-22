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
  Users
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import {
  formatCurrency,
  calculateTotalBalance,
  calculateMonthlySummary,
  calculateCreditCardSummary,
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
    loans,
    budgets,
    reminders,
    setIsQuickAddOpen
  } = useData();

  const currentMonthStr = '2026-08';
  const totalBalance = calculateTotalBalance(accounts);
  const { income, expenses, savings, savingsRate } = calculateMonthlySummary(transactions, currentMonthStr);
  const { totalOutstanding: ccOutstanding } = calculateCreditCardSummary(creditCards);
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

  // Chart data for monthly comparison
  const chartData = [
    { name: 'May', Income: 135000, Expense: 82000 },
    { name: 'Jun', Income: 140000, Expense: 89000 },
    { name: 'Jul', Income: 145000, Expense: 74000 },
    { name: 'Aug', Income: income, Expense: expenses }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-900 text-white shadow-xl shadow-brand-900/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 backdrop-blur border border-white/20 text-brand-200">
              Personal & Shared Ledger
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user.displayName} 👋
          </h1>
          <p className="text-sm text-brand-200 mt-1">
            Here is your financial command center summary for August 2026.
          </p>
        </div>
        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="self-start sm:self-center px-5 py-3 rounded-2xl bg-white text-brand-900 font-bold text-sm hover:bg-brand-50 active:scale-95 transition-all shadow-lg shadow-black/10 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span>+ Quick Add Expense</span>
        </button>
      </div>

      {/* 1. FINANCIAL SUMMARY CARDS GRID */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
          Financial Summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Balance */}
          <div className="glass-panel p-5 rounded-2xl card-hover flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Balance</span>
              <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {formatCurrency(totalBalance)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Across {accounts.length} active accounts</p>
            </div>
          </div>

          {/* Card 2: Total Income */}
          <div className="glass-panel p-5 rounded-2xl card-hover flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Income (Aug)</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(income)}
              </div>
              <p className="text-[11px] text-emerald-600/80 font-medium mt-1">Salary & Investment dividends</p>
            </div>
          </div>

          {/* Card 3: Total Expenses */}
          <div className="glass-panel p-5 rounded-2xl card-hover flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Expenses (Aug)</span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                {formatCurrency(expenses)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Savings rate: {savingsRate}%</p>
            </div>
          </div>

          {/* Card 4: Circles Receive / Pay */}
          <div className="glass-panel p-5 rounded-2xl card-hover flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Circles Split Ledger</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">To Receive:</span>
                <span className="font-bold text-emerald-600">{formatCurrency(totalReceive)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">To Pay:</span>
                <span className="font-bold text-rose-600">{formatCurrency(totalPay)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Row: Credit Card & Loan Outstanding */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-600/30 text-purple-300">
                <CreditCardIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Credit Card Outstanding</p>
                <p className="text-lg font-bold">{formatCurrency(ccOutstanding)}</p>
              </div>
            </div>
            <Link href="/credit-cards" className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1">
              <span>View Cards</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600/30 text-blue-300">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Loan Outstanding Principal</p>
                <p className="text-lg font-bold">{formatCurrency(loanOutstanding)}</p>
              </div>
            </div>
            <Link href="/loans" className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
              <span>View Loans</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. MONTHLY OVERVIEW CHART & FINANCIAL HEALTH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Income vs Expense Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Monthly Income vs Expense</h3>
              <p className="text-xs text-slate-500">Comparative financial cashflow trend</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Income
              </span>
              <span className="flex items-center gap-1.5 text-rose-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Expense
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none'
                  }}
                  formatter={(value: any) => [`₹${value}`, '']}
                />
                <Bar dataKey="Income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={36} />
                <Bar dataKey="Expense" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Health Score Widget */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between border-brand-200/50">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Financial Health</h3>
              <ShieldCheck className="w-5 h-5 text-brand-600" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Automated cashflow & budget evaluation</p>

            <div className="mt-6 flex flex-col items-center justify-center text-center">
              <div className="relative w-28 h-28 flex items-center justify-center rounded-full bg-gradient-to-tr from-brand-700 to-indigo-600 text-white shadow-xl shadow-brand-600/30">
                <span className="text-3xl font-extrabold">{healthScore.score}</span>
                <span className="text-xs absolute bottom-3 text-brand-200">/ 100</span>
              </div>
              <span className="mt-3 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                {healthScore.rating} Score
              </span>
            </div>

            {/* Key Insights List */}
            <div className="mt-6 space-y-2">
              {healthScore.insights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="text-brand-500 mt-0.5">•</span>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-400 italic text-center mt-4">
            Educational estimate only. Not professional advice.
          </p>
        </div>
      </div>

      {/* 3. RECENT TRANSACTIONS & UPCOMING PAYMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions List */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Recent Transactions</h3>
            <Link href="/transactions" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {transactions.slice(0, 5).map((t) => (
              <div key={t.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0 ${
                      t.type === 'income'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                        : t.type === 'transfer'
                        ? 'bg-brand-100 dark:bg-brand-950 text-brand-600'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-600'
                    }`}
                  >
                    {t.type === 'income' ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : t.type === 'transfer' ? (
                      <RefreshCwIcon className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{t.description}</p>
                    <p className="text-xs text-slate-500">
                      {t.category} • {t.date}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`font-extrabold text-sm ${
                      t.type === 'income' ? 'text-emerald-600' : t.type === 'transfer' ? 'text-brand-600' : 'text-rose-600'
                    }`}
                  >
                    {t.type === 'income' ? '+' : t.type === 'transfer' ? '' : '-'}{formatCurrency(t.amount)}
                  </span>
                  <p className="text-[11px] text-slate-400 capitalize">{t.paymentMethod || 'Direct'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Payments & Reminders */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Upcoming Payments</h3>
            <Link href="/reminders" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              Manage
            </Link>
          </div>

          <div className="space-y-3">
            {reminders.map((rem) => (
              <div
                key={rem.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{rem.title}</p>
                    <p className="text-[11px] text-slate-500">Due {rem.dueDate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">
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

function RefreshCwIcon(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h0.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}
