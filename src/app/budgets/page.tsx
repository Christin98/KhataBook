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
  WalletCards
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { formatCurrency, getBudgetStatus } from '@/lib/calculations';
import { APP_INFO } from '@/lib/constants';
import UnderDevelopmentScreen from '@/components/common/UnderDevelopmentScreen';

export default function BudgetsPage() {
  const { budgets, addBudget, user } = useData();
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <PieChart className="w-8 h-8 text-brand-600" />
            <span>Monthly Category Budgets</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enforce spending limits with automated 80% warning & 100% breach alerts.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-600/30 flex items-center gap-2 active:scale-95 transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Budget</span>
        </button>
      </div>

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map((b) => {
          const { percentage, status, remaining } = getBudgetStatus(b.spent, b.monthlyLimit);

          return (
            <div
              key={b.id}
              className={`glass-panel p-6 rounded-3xl space-y-4 border transition-all ${
                status === 'exceeded'
                  ? 'border-rose-500/50 bg-rose-500/5'
                  : status === 'warning'
                  ? 'border-amber-500/50 bg-amber-500/5'
                  : 'border-slate-200/60 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">{b.category}</h3>
                  <p className="text-xs text-slate-500">Period: August 2026</p>
                </div>

                {status === 'exceeded' ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Exceeded (100%+)
                  </span>
                ) : status === 'warning' ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> 80%+ Used
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> On Track
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500">
                    Spent: <strong className="text-slate-900 dark:text-white">{formatCurrency(b.spent)}</strong>
                  </span>
                  <span className="text-slate-500">
                    Budget: <strong>{formatCurrency(b.monthlyLimit)}</strong>
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      status === 'exceeded'
                        ? 'bg-rose-500'
                        : status === 'warning'
                        ? 'bg-amber-500'
                        : 'bg-brand-600'
                    }`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs font-medium">
                <span className="text-slate-400">
                  {remaining >= 0 ? 'Remaining Capacity' : 'Overbudget by'}
                </span>
                <span
                  className={`font-extrabold ${
                    remaining < 0 ? 'text-rose-600' : 'text-emerald-600'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl z-10 border space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Monthly Budget</h3>

            <form onSubmit={handleCreateBudget} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium"
                >
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Bills & Utilities">Bills & Utilities</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Financial">Financial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Monthly Limit (₹)</label>
                <input
                  type="number"
                  placeholder="8000"
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-lg font-bold text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2.5 rounded-xl border text-xs font-bold">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-md">
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // If in Production, show UnderDevelopmentScreen with preview option
  if (!APP_INFO.isBeta) {
    return (
      <UnderDevelopmentScreen
        featureName="Monthly Category Budgets"
        tagline="Enforce category spending caps, auto-calculate 80% & 100% breach notifications, and optimize monthly cash flow."
        category="Financial Planning"
        icon={PieChart}
        highlights={budgetHighlights}
        plannedRelease="v0.4.0 (Q3 2026)"
        progressPercent={85}
        childrenIfBypassed={mainBudgetContent}
      />
    );
  }

  return mainBudgetContent;
}

