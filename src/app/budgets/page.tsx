'use client';

import React, { useState } from 'react';
import {
  PieChart,
  Plus,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Sliders,
  TrendingDown,
  BellRing,
  WalletCards,
  Sparkles
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { formatCurrency, getBudgetStatus } from '@/lib/calculations';
import { APP_INFO } from '@/lib/constants';
import UnderDevelopmentScreen from '@/components/common/UnderDevelopmentScreen';

export default function BudgetsPage() {
  const { budgets, expenseCategories, addBudget, user, isDevMode } = useData();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [category, setCategory] = useState('Food & Dining');
  const [monthlyLimit, setMonthlyLimit] = useState('');

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const limitNum = parseFloat(monthlyLimit);
    if (isNaN(limitNum) || limitNum <= 0) return;

    addBudget({
      userId: user.id,
      category,
      monthlyLimit: limitNum,
      period: '2026-08'
    });

    setIsAddModalOpen(false);
    setMonthlyLimit('');
  };

  const budgetHighlights = [
    {
      title: 'Smart Category Caps',
      description: 'Set custom monthly spending ceilings on Food, Dining, Fuel, Groceries, Shopping, & Subscriptions.',
      icon: Sliders,
      badge: 'Core'
    },
    {
      title: 'Automated 80% & 100% Alerts',
      description: 'Get early warning badges as you approach 80% of your budget, preventing month-end overdraft surprises.',
      icon: BellRing,
      badge: 'Smart'
    },
    {
      title: 'Realtime Cash Flow Optimization',
      description: 'Dynamic visual progress bars synchronize in realtime with all personal & circle split transactions.',
      icon: TrendingDown,
      badge: 'Realtime'
    },
    {
      title: 'Flexible Rollover Budgets',
      description: 'Unused budget limits can automatically roll over into the next calendar month or transfer to savings goals.',
      icon: WalletCards,
      badge: 'Upcoming'
    }
  ];

  const mainBudgetContent = (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20 mb-2">
            <PieChart className="w-3.5 h-3.5" />
            <span>Spending Guardrails</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Monthly Category Budgets
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Enforce spending limits with automated 80% warning and 100% breach guardrails.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 flex items-center gap-2 active:scale-95 transition-all self-start sm:self-center border border-white/20 glass-shimmer cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Budget</span>
        </button>
      </div>

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map((b) => {
          const { percentage, status, remaining } = getBudgetStatus(b.spent, b.monthlyLimit);

          return (
            <div
              key={b.id}
              className={`glass-card glass-interactive p-6 sm:p-7 rounded-3xl space-y-5 shadow-2xl relative overflow-hidden transition-all ${
                status === 'exceeded'
                  ? 'border-rose-500/40 bg-rose-500/5'
                  : status === 'warning'
                  ? 'border-amber-500/40 bg-amber-500/5'
                  : 'border-white/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white leading-snug">{b.category}</h3>
                  <p className="text-xs text-slate-400 font-medium">Period: Active Cycle</p>
                </div>

                {status === 'exceeded' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1.5 backdrop-blur-md">
                    <ShieldAlert className="w-3.5 h-3.5" /> Exceeded (100%+)
                  </span>
                ) : status === 'warning' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5 backdrop-blur-md">
                    <AlertTriangle className="w-3.5 h-3.5" /> 80%+ Warning
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 backdrop-blur-md">
                    <CheckCircle2 className="w-3.5 h-3.5" /> On Track
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">
                    Spent: <strong className="text-slate-900 dark:text-white">{formatCurrency(b.spent)}</strong>
                  </span>
                  <span className="text-slate-400">
                    Cap: <strong className="text-slate-900 dark:text-white">{formatCurrency(b.monthlyLimit)}</strong>
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-slate-200/60 dark:bg-slate-800/80 overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all ${
                      status === 'exceeded'
                        ? 'bg-gradient-to-r from-rose-500 to-red-600'
                        : status === 'warning'
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                        : 'bg-gradient-to-r from-brand-600 to-indigo-600'
                    }`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/50 dark:border-white/5 flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-400">
                  {remaining >= 0 ? 'Remaining Capacity' : 'Overbudget by'}
                </span>
                <span
                  className={`font-black text-sm ${
                    remaining < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {formatCurrency(Math.abs(remaining))}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Budget Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-md glass-panel bg-white/95 dark:bg-slate-900/95 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 border border-white/40 dark:border-white/10 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-white/10">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Create Monthly Budget</h3>
              <span className="text-xs text-brand-600 dark:text-brand-400 font-bold">Category Cap</span>
            </div>

            <form onSubmit={handleCreateBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                >
                  {expenseCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Monthly Limit (₹)</label>
                <input
                  type="number"
                  placeholder="8000"
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(e.target.value)}
                  className="w-full px-4 py-3 glass-input rounded-2xl text-xl font-black text-slate-900 dark:text-white focus:outline-none"
                  required
                />
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
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // Only lock if in pure production (unlocked in Dev mode, Beta Flight, and for Developers)
  const isLockedInProduction = !APP_INFO.isBeta && !APP_INFO.isDev && !isDevMode;

  if (isLockedInProduction) {
    return (
      <UnderDevelopmentScreen
        featureName="Monthly Category Budgets"
        tagline="Enforce category spending caps, auto-calculate 80% & 100% breach notifications, and optimize monthly cash flow."
        category="Financial Planning"
        icon={PieChart}
        highlights={budgetHighlights}
        plannedRelease="v0.4.5 (Target: Next Flight Drop)"
        progressPercent={90}
        childrenIfBypassed={mainBudgetContent}
      />
    );
  }

  return mainBudgetContent;
}
