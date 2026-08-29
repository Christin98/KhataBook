'use client';

import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  TrendingDown,
  ShieldCheck,
  AlertCircle,
  Pencil,
  Trash2,
  Calendar,
  X,
  Loader2,
  Sparkles,
  ArrowRight,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Wallet
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import {
  formatCurrency,
  calculateBudgetStats,
  calculateBudgetHealthRing
} from '@/lib/calculations';
import { Budget } from '@/lib/types';
import { MAX_SAFE_TRANSACTION_AMOUNT } from '@/lib/moneySafe';
import ConfirmDialog from '@/components/common/ConfirmDialog';

export default function BudgetsPage() {
  const {
    budgets,
    transactions,
    expenseCategories,
    addBudget,
    updateBudget,
    deleteBudget,
    user
  } = useData();

  // Selected Month State (Default to current month YYYY-MM)
  const now = new Date();
  const defaultMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonthStr);

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    setSelectedMonth(`${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    setSelectedMonth(`${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`);
  };

  const formattedMonthLabel = (() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const d = new Date(y, m - 1, 1);
    return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  })();

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Add Form State
  const [newCategory, setNewCategory] = useState(expenseCategories[0] || 'Food & Dining');
  const [newMonthlyLimit, setNewMonthlyLimit] = useState('');
  const [newIsActive, setNewIsActive] = useState(true);
  const [addFormError, setAddFormError] = useState<string | null>(null);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  // Adjust Form State
  const [adjustLimit, setAdjustLimit] = useState('');
  const [adjustIsActive, setAdjustIsActive] = useState(true);
  const [adjustFormError, setAdjustFormError] = useState<string | null>(null);
  const [isSubmittingAdjust, setIsSubmittingAdjust] = useState(false);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAddModalOpen(false);
        setIsAdjustModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Budget Health Ring calculation for the selected month
  const healthRing = calculateBudgetHealthRing(budgets, transactions, selectedMonth);

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddFormError(null);
    const limitNum = parseFloat(newMonthlyLimit);
    if (isNaN(limitNum) || limitNum <= 0) {
      setAddFormError('Please enter a valid positive budget limit greater than ₹0.');
      return;
    }
    if (limitNum > MAX_SAFE_TRANSACTION_AMOUNT) {
      setAddFormError(`Monthly budget limit cannot exceed realistic limit of ₹${MAX_SAFE_TRANSACTION_AMOUNT.toLocaleString('en-IN')} (₹10 Crores).`);
      return;
    }

    // Check if category already has a budget
    const existing = budgets.find(
      (b) => b.category.trim().toLowerCase() === newCategory.trim().toLowerCase()
    );
    if (existing) {
      setAddFormError(`A budget for "${newCategory}" already exists. Adjust the existing budget instead.`);
      return;
    }

    setIsSubmittingAdd(true);
    try {
      await addBudget({
        userId: user.id,
        category: newCategory,
        monthlyLimit: limitNum,
        isActive: newIsActive,
        period: selectedMonth
      });

      setIsAddModalOpen(false);
      setNewMonthlyLimit('');
      setAddFormError(null);
    } catch (err: any) {
      setAddFormError(err?.message || 'Failed to save budget.');
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  const openAdjustModal = (b: Budget) => {
    setEditingBudget(b);
    setAdjustLimit(String(b.monthlyLimit));
    setAdjustIsActive(b.isActive !== false);
    setAdjustFormError(null);
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBudget) return;
    setAdjustFormError(null);
    const limitNum = parseFloat(adjustLimit);
    if (isNaN(limitNum) || limitNum <= 0) {
      setAdjustFormError('Please enter a valid positive budget limit greater than ₹0.');
      return;
    }
    if (limitNum > MAX_SAFE_TRANSACTION_AMOUNT) {
      setAdjustFormError(`Monthly budget limit cannot exceed realistic limit of ₹${MAX_SAFE_TRANSACTION_AMOUNT.toLocaleString('en-IN')} (₹10 Crores).`);
      return;
    }

    setIsSubmittingAdjust(true);
    try {
      await updateBudget(editingBudget.id, {
        monthlyLimit: limitNum,
        isActive: adjustIsActive
      });
      setIsAdjustModalOpen(false);
      setEditingBudget(null);
    } catch (err: any) {
      setAdjustFormError(err?.message || 'Failed to update budget.');
    } finally {
      setIsSubmittingAdjust(false);
    }
  };

  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);
  const [isDeletingBudget, setIsDeletingBudget] = useState(false);

  const promptDeleteBudget = (b: Budget) => {
    setBudgetToDelete(b);
  };

  const handleConfirmDeleteBudget = async () => {
    if (!budgetToDelete) return;
    setIsDeletingBudget(true);
    try {
      await deleteBudget(budgetToDelete.id);
      if (editingBudget?.id === budgetToDelete.id) {
        setIsAdjustModalOpen(false);
        setEditingBudget(null);
      }
      setBudgetToDelete(null);
    } finally {
      setIsDeletingBudget(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20 mb-2">
            <PieChart className="w-3.5 h-3.5" />
            <span>Spending Guardrails & Limits</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Category Budgets
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Dynamic spending caps calculated from actual ledger debits for {formattedMonthLabel}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start lg:self-center shrink-0">
          {/* Month Selector Bar */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-2xs">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous Month"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 text-center min-w-[120px]">
              <div className="flex items-center justify-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-500" />
                <span>{formattedMonthLabel}</span>
              </div>
            </div>
            <button
              onClick={handleNextMonth}
              aria-label="Next Month"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Create Budget Button */}
          <button
            onClick={() => {
              setAddFormError(null);
              setIsAddModalOpen(true);
            }}
            className="px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center gap-2 active:scale-95 transition-all cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Budget</span>
          </button>
        </div>
      </div>

      {/* 2. Real-Time Budget Health Ring & Summary Panel */}
      {healthRing.hasBudgets && (
        <div className="glass-card p-6 sm:p-7 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Left: Overall Health Ring Indicator */}
            <div className="flex items-center gap-5 w-full lg:w-auto">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center">
                {/* SVG Ring Donut */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-slate-200 dark:text-slate-800"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * Math.min(100, healthRing.utilizationPercentage)) / 100}
                    strokeLinecap="round"
                    className={`transition-all duration-700 ${
                      healthRing.overBudgetCount > 0
                        ? 'text-rose-500'
                        : healthRing.warningCount > 0
                        ? 'text-amber-500'
                        : 'text-emerald-500'
                    }`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none">
                    {healthRing.utilizationPercentage.toFixed(0)}%
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 mt-0.5">Used</span>
                </div>
              </div>

              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">
                    Budget Health: {healthRing.rating}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {healthRing.overBudgetCount > 0
                    ? `${healthRing.overBudgetCount} category exceeded monthly ceiling.`
                    : healthRing.warningCount > 0
                    ? `${healthRing.warningCount} category approaching limit (>80%).`
                    : `All ${healthRing.totalCount} active budgets safely within limits.`}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[11px] font-extrabold border border-emerald-500/25">
                    {healthRing.onTrackCount} On Track
                  </span>
                  {healthRing.warningCount > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[11px] font-extrabold border border-amber-500/25">
                      {healthRing.warningCount} Warning
                    </span>
                  )}
                  {healthRing.overBudgetCount > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300 text-[11px] font-extrabold border border-rose-500/25">
                      {healthRing.overBudgetCount} Over Limit
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Aggregate Metric Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto shrink-0">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400">Total Allocated</span>
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  {formatCurrency(healthRing.totalLimit)}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400">Total Spent</span>
                <div className={`text-base sm:text-lg font-black mt-0.5 ${
                  healthRing.totalSpent > healthRing.totalLimit ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                }`}>
                  {formatCurrency(healthRing.totalSpent)}
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400">Safe Margin Left</span>
                <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {formatCurrency(healthRing.totalRemaining)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Budget Grid or Empty State */}
      {budgets.length === 0 ? (
        /* Empty State: Starts empty with clear Create Budget Action */
        <div className="glass-card p-10 sm:p-14 rounded-2xl text-center space-y-4 shadow-xl border border-dashed border-slate-300 dark:border-slate-700">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-300 mx-auto flex items-center justify-center border border-brand-500/20 shadow-inner">
            <PieChart className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              No Budgets Configured Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Start by setting custom spending caps for categories like Food, Groceries, Shopping, or Fuel. We'll automatically calculate your monthly debits in realtime.
            </p>
          </div>
          <button
            onClick={() => {
              setAddFormError(null);
              setIsAddModalOpen(true);
            }}
            className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 inline-flex items-center gap-2 cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Budget</span>
          </button>
        </div>
      ) : (
        /* Budget Cards List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => {
            const stats = calculateBudgetStats(b, transactions, selectedMonth);

            return (
              <div
                key={b.id}
                className={`glass-card p-5 sm:p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden transition-all shadow-sm hover:shadow-md ${
                  !stats.isActive
                    ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/50'
                    : stats.isOverBudget
                    ? 'border-rose-500/40 ring-1 ring-rose-500/30'
                    : stats.isWarning
                    ? 'border-amber-500/40'
                    : ''
                }`}
              >
                <div>
                  {/* Card Header: Category & Actions */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        !stats.isActive
                          ? 'bg-slate-200/50 text-slate-500'
                          : stats.isOverBudget
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25'
                          : stats.isWarning
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25'
                          : 'bg-brand-500/15 text-brand-600 dark:text-brand-300 border border-brand-500/25'
                      }`}>
                        {b.category.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                          {b.category}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`px-2 py-0.2 rounded text-[10px] font-extrabold uppercase ${
                            !stats.isActive
                              ? 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                              : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          }`}>
                            {stats.isActive ? 'Active' : 'Paused'}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">Monthly Cap</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openAdjustModal(b)}
                        aria-label={`Adjust budget for ${b.category}`}
                        className="p-2 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <Sliders className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Financial Metrics Strip */}
                  <div className="space-y-1.5 my-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-400 font-medium">Spent Amount</span>
                      <span className="text-xs text-slate-400 font-medium">Budget Limit</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className={`text-xl sm:text-2xl font-black ${
                        stats.isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                      }`}>
                        {formatCurrency(stats.spent)}
                      </span>
                      <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                        / {formatCurrency(stats.limit)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar & Percentage */}
                  <div className="space-y-1.5 my-3">
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          !stats.isActive
                            ? 'bg-slate-400'
                            : stats.isOverBudget
                            ? 'bg-rose-500'
                            : stats.isWarning
                            ? 'bg-amber-500'
                            : 'bg-brand-500'
                        }`}
                        style={{ width: `${Math.min(100, stats.percentage)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className={
                        !stats.isActive
                          ? 'text-slate-400'
                          : stats.isOverBudget
                          ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                          : stats.isWarning
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }>
                        {stats.percentage.toFixed(0)}% utilized
                      </span>
                      <span className={
                        stats.isOverBudget
                          ? 'text-rose-600 dark:text-rose-400 font-black'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }>
                        {stats.statusText}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Over-Budget or Safe Banner */}
                {stats.isOverBudget && (
                  <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300 font-bold">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                      <span>Over budget limit!</span>
                    </div>
                    <span className="font-black">+{formatCurrency(stats.overAmount)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 4. MODAL: Create Budget */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-budget-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                  <PieChart className="w-4 h-4" />
                </div>
                <h3 id="create-budget-title" className="text-base font-black text-slate-900 dark:text-white">
                  Create Budget Guardrail
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Close dialog"
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addFormError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{addFormError}</span>
              </div>
            )}

            <form onSubmit={handleCreateBudget} className="space-y-4">
              {/* Category Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Expense Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 min-h-[44px]"
                >
                  {expenseCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Monthly Limit Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Monthly Limit (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={MAX_SAFE_TRANSACTION_AMOUNT}
                  required
                  placeholder="e.g. 10000"
                  value={newMonthlyLimit}
                  onChange={(e) => setNewMonthlyLimit(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none min-h-[44px] ${
                    parseFloat(newMonthlyLimit) > MAX_SAFE_TRANSACTION_AMOUNT
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-slate-200 dark:border-slate-800 focus:border-brand-500'
                  }`}
                />
                {parseFloat(newMonthlyLimit) > MAX_SAFE_TRANSACTION_AMOUNT && (
                  <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Limit cannot exceed ₹10 Crores (₹{MAX_SAFE_TRANSACTION_AMOUNT.toLocaleString('en-IN')}).</span>
                  </p>
                )}
              </div>

              {/* Active Status Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Active Guardrail</p>
                  <p className="text-[11px] text-slate-400 font-medium">Enable real-time progress & warning notifications</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={newIsActive}
                  aria-label="Toggle active guardrail"
                  onClick={() => setNewIsActive(!newIsActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none p-0.5 items-center ${
                    newIsActive ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                      newIsActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-60 min-h-[44px]"
                >
                  {isSubmittingAdd ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Save Budget</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: Adjust Budget */}
      {isAdjustModalOpen && editingBudget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="adjust-budget-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md" onClick={() => setIsAdjustModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="adjust-budget-title" className="text-base font-black text-slate-900 dark:text-white">
                    Adjust Budget
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">{editingBudget.category}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                aria-label="Close dialog"
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {adjustFormError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{adjustFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAdjust} className="space-y-4">
              {/* Monthly Limit Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Monthly Limit (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={MAX_SAFE_TRANSACTION_AMOUNT}
                  required
                  value={adjustLimit}
                  onChange={(e) => setAdjustLimit(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none min-h-[44px] ${
                    parseFloat(adjustLimit) > MAX_SAFE_TRANSACTION_AMOUNT
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-slate-200 dark:border-slate-800 focus:border-brand-500'
                  }`}
                />
                {parseFloat(adjustLimit) > MAX_SAFE_TRANSACTION_AMOUNT && (
                  <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Limit cannot exceed ₹10 Crores (₹{MAX_SAFE_TRANSACTION_AMOUNT.toLocaleString('en-IN')}).</span>
                  </p>
                )}
              </div>

              {/* Active Status Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Active Status</p>
                  <p className="text-[11px] text-slate-400 font-medium">Pause to temporarily exclude from health score</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={adjustIsActive}
                  aria-label="Toggle active status"
                  onClick={() => setAdjustIsActive(!adjustIsActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none p-0.5 items-center ${
                    adjustIsActive ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                      adjustIsActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => promptDeleteBudget(editingBudget)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-1.5 cursor-pointer min-h-[44px]"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Budget</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAdjustModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAdjust}
                    className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-60 min-h-[44px]"
                  >
                    {isSubmittingAdjust ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Update Budget</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Budget Deletion */}
      <ConfirmDialog
        isOpen={!!budgetToDelete}
        title="Delete Budget Guardrail"
        description={`Are you sure you want to remove the monthly spending limit for "${budgetToDelete?.category}"?`}
        confirmText="Delete Budget"
        cancelText="Keep Budget"
        variant="danger"
        isLoading={isDeletingBudget}
        onConfirm={handleConfirmDeleteBudget}
        onClose={() => setBudgetToDelete(null)}
      />
    </div>
  );
}
