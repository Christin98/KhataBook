'use client';

import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  ShieldCheck,
  Plane,
  Bike,
  Laptop,
  Home,
  Heart,
  Gift,
  Car,
  Sparkles,
  Calendar,
  Pencil,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Coins,
  ArrowUpRight,
  Clock,
  Check
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { formatCurrency, safeRound } from '@/lib/calculations';
import { MAX_SAFE_TRANSACTION_AMOUNT } from '@/lib/moneySafe';
import { Goal } from '@/lib/types';
import ConfirmDialog from '@/components/common/ConfirmDialog';

// Preset icon mapping
const ICON_OPTIONS = [
  { name: 'Target', icon: Target },
  { name: 'ShieldCheck', icon: ShieldCheck },
  { name: 'Plane', icon: Plane },
  { name: 'Bike', icon: Bike },
  { name: 'Laptop', icon: Laptop },
  { name: 'Home', icon: Home },
  { name: 'Car', icon: Car },
  { name: 'Gift', icon: Gift },
  { name: 'Heart', icon: Heart }
];

const COLOR_OPTIONS = [
  { label: 'Violet', value: '#6558D3' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Rose', value: '#f43f5e' },
  { label: 'Cyan', value: '#06b6d4' }
];

export default function GoalsPage() {
  const { goals, addGoal, updateGoal, deleteGoal, user } = useData();

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);

  // Create Form State
  const [createName, setCreateName] = useState('');
  const [createTargetAmount, setCreateTargetAmount] = useState('');
  const [createCurrentAmount, setCreateCurrentAmount] = useState('');
  const [createDueDate, setCreateDueDate] = useState('');
  const [createNotes, setCreateNotes] = useState('');
  const [createIcon, setCreateIcon] = useState('Target');
  const [createColor, setCreateColor] = useState('#6558D3');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  // Edit Form State
  const [editName, setEditName] = useState('');
  const [editTargetAmount, setEditTargetAmount] = useState('');
  const [editCurrentAmount, setEditCurrentAmount] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editIcon, setEditIcon] = useState('Target');
  const [editColor, setEditColor] = useState('#6558D3');
  const [editError, setEditError] = useState<string | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Add Funds State
  const [fundsToAdd, setFundsToAdd] = useState('');
  const [fundsError, setFundsError] = useState<string | null>(null);
  const [isSubmittingFunds, setIsSubmittingFunds] = useState(false);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setIsAddFundsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute aggregate statistics
  const totalTarget = safeRound(goals.reduce((sum, g) => sum + (g.targetAmount || 0), 0));
  const totalSaved = safeRound(goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0));
  const totalRemaining = safeRound(Math.max(0, totalTarget - totalSaved));
  const overallProgress = totalTarget > 0 ? safeRound((totalSaved / totalTarget) * 100) : 0;
  const completedGoalsCount = goals.filter((g) => (g.currentAmount || 0) >= (g.targetAmount || 0)).length;

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    const targetNum = parseFloat(createTargetAmount);
    const currentNum = parseFloat(createCurrentAmount) || 0;

    if (!createName.trim()) {
      setCreateError('Please enter a goal name.');
      return;
    }
    if (isNaN(targetNum) || targetNum <= 0) {
      setCreateError('Please enter a valid target amount greater than ₹0.');
      return;
    }
    if (targetNum > MAX_SAFE_TRANSACTION_AMOUNT) {
      setCreateError(`Target amount cannot exceed realistic limit of ₹${MAX_SAFE_TRANSACTION_AMOUNT.toLocaleString('en-IN')} (₹10 Crores).`);
      return;
    }
    if (currentNum < 0) {
      setCreateError('Current saved amount cannot be negative.');
      return;
    }
    if (currentNum > MAX_SAFE_TRANSACTION_AMOUNT) {
      setCreateError(`Current saved amount cannot exceed realistic limit of ₹${MAX_SAFE_TRANSACTION_AMOUNT.toLocaleString('en-IN')}.`);
      return;
    }

    setIsSubmittingCreate(true);
    try {
      await addGoal({
        userId: user.id,
        name: createName.trim(),
        targetAmount: targetNum,
        currentAmount: currentNum,
        targetDate: createDueDate || undefined,
        dueDate: createDueDate || undefined,
        notes: createNotes.trim() || undefined,
        icon: createIcon,
        color: createColor
      });

      setIsCreateModalOpen(false);
      setCreateName('');
      setCreateTargetAmount('');
      setCreateCurrentAmount('');
      setCreateDueDate('');
      setCreateNotes('');
      setCreateError(null);
    } catch (err: any) {
      setCreateError(err?.message || 'Failed to create savings goal.');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const openEditModal = (goal: Goal) => {
    setActiveGoal(goal);
    setEditName(goal.name);
    setEditTargetAmount(String(goal.targetAmount));
    setEditCurrentAmount(String(goal.currentAmount || 0));
    setEditDueDate(goal.dueDate || goal.targetDate || '');
    setEditNotes(goal.notes || '');
    setEditIcon(goal.icon || 'Target');
    setEditColor(goal.color || '#6558D3');
    setEditError(null);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGoal) return;
    setEditError(null);

    const targetNum = parseFloat(editTargetAmount);
    const currentNum = parseFloat(editCurrentAmount) || 0;

    if (!editName.trim()) {
      setEditError('Please enter a goal name.');
      return;
    }
    if (isNaN(targetNum) || targetNum <= 0) {
      setEditError('Please enter a valid target amount greater than ₹0.');
      return;
    }
    if (targetNum > MAX_SAFE_TRANSACTION_AMOUNT) {
      setEditError(`Target amount cannot exceed realistic limit of ₹${MAX_SAFE_TRANSACTION_AMOUNT.toLocaleString('en-IN')} (₹10 Crores).`);
      return;
    }
    if (currentNum < 0) {
      setEditError('Current saved amount cannot be negative.');
      return;
    }
    if (currentNum > MAX_SAFE_TRANSACTION_AMOUNT) {
      setEditError(`Current saved amount cannot exceed realistic limit of ₹${MAX_SAFE_TRANSACTION_AMOUNT.toLocaleString('en-IN')}.`);
      return;
    }

    setIsSubmittingEdit(true);
    try {
      await updateGoal(activeGoal.id, {
        name: editName.trim(),
        targetAmount: targetNum,
        currentAmount: currentNum,
        targetDate: editDueDate || undefined,
        dueDate: editDueDate || undefined,
        notes: editNotes.trim() || undefined,
        icon: editIcon,
        color: editColor
      });

      setIsEditModalOpen(false);
      setActiveGoal(null);
    } catch (err: any) {
      setEditError(err?.message || 'Failed to update goal.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const openAddFundsModal = (goal: Goal) => {
    setActiveGoal(goal);
    setFundsToAdd('');
    setFundsError(null);
    setIsAddFundsModalOpen(true);
  };

  const handleSaveFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGoal) return;
    setFundsError(null);

    const amountNum = parseFloat(fundsToAdd);
    if (isNaN(amountNum) || amountNum <= 0) {
      setFundsError('Please enter a valid deposit amount greater than ₹0.');
      return;
    }
    if (amountNum > MAX_SAFE_TRANSACTION_AMOUNT) {
      setFundsError(`Deposit amount cannot exceed realistic limit of ₹${MAX_SAFE_TRANSACTION_AMOUNT.toLocaleString('en-IN')}.`);
      return;
    }

    setIsSubmittingFunds(true);
    try {
      const newAmount = safeRound((activeGoal.currentAmount || 0) + amountNum);
      if (newAmount > MAX_SAFE_TRANSACTION_AMOUNT) {
        setFundsError(`Total saved amount would exceed ₹${MAX_SAFE_TRANSACTION_AMOUNT.toLocaleString('en-IN')}.`);
        return;
      }
      await updateGoal(activeGoal.id, { currentAmount: newAmount });
      setIsAddFundsModalOpen(false);
      setActiveGoal(null);
    } catch (err: any) {
      setFundsError(err?.message || 'Failed to deposit funds.');
    } finally {
      setIsSubmittingFunds(false);
    }
  };

  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const promptDeleteGoal = (goal: Goal) => {
    setGoalToDelete(goal);
  };

  const handleConfirmDelete = async () => {
    if (!goalToDelete) return;
    setIsDeleting(true);
    try {
      await deleteGoal(goalToDelete.id);
      if (activeGoal?.id === goalToDelete.id) {
        setIsEditModalOpen(false);
        setIsAddFundsModalOpen(false);
        setActiveGoal(null);
      }
      setGoalToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderGoalIcon = (iconName?: string) => {
    const item = ICON_OPTIONS.find((i) => i.name === iconName);
    const Comp = item ? item.icon : Target;
    return <Comp className="w-5 h-5" />;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20 mb-2">
            <Target className="w-3.5 h-3.5" />
            <span>Savings & Wealth Milestones</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Financial Goals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Lock funds for dreams, emergency reserves, vehicles, and vacations with visual progress meters.
          </p>
        </div>

        <button
          onClick={() => {
            setCreateError(null);
            setIsCreateModalOpen(true);
          }}
          className="px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center gap-2 active:scale-95 transition-all self-start sm:self-center cursor-pointer min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Create Goal</span>
        </button>
      </div>

      {/* 2. Aggregate Goal Summary Strip (when goals exist) */}
      {goals.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-4 sm:p-5 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-400">Total Target</span>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
              {formatCurrency(totalTarget)}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Across {goals.length} goals</span>
          </div>

          <div className="glass-card p-4 sm:p-5 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-400">Total Saved</span>
            <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {formatCurrency(totalSaved)}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">{overallProgress.toFixed(0)}% overall funded</span>
          </div>

          <div className="glass-card p-4 sm:p-5 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-400">Remaining to Save</span>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
              {formatCurrency(totalRemaining)}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Total gap remaining</span>
          </div>

          <div className="glass-card p-4 sm:p-5 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-400">Completed Goals</span>
            <div className="text-lg sm:text-xl font-black text-brand-600 dark:text-brand-400 mt-1">
              {completedGoalsCount} / {goals.length}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">100% funded milestones</span>
          </div>
        </div>
      )}

      {/* 3. Main Goals Grid or Empty State */}
      {goals.length === 0 ? (
        /* Empty State: Starts empty with clear Create Goal Action */
        <div className="glass-card p-10 sm:p-14 rounded-2xl text-center space-y-4 shadow-xl border border-dashed border-slate-300 dark:border-slate-700">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-300 mx-auto flex items-center justify-center border border-brand-500/20 shadow-inner">
            <Target className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              No Savings Goals Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Start by creating a goal for your emergency fund, dream vacation, new vehicle, or gadget purchase. Track saved funds with live progress meters.
            </p>
          </div>
          <button
            onClick={() => {
              setCreateError(null);
              setIsCreateModalOpen(true);
            }}
            className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 inline-flex items-center gap-2 cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Goal</span>
          </button>
        </div>
      ) : (
        /* Goal Cards List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((g) => {
            const cur = g.currentAmount || 0;
            const tar = g.targetAmount || 0;
            const progress = tar > 0 ? safeRound((cur / tar) * 100) : 0;
            const remaining = safeRound(Math.max(0, tar - cur));
            const isCompleted = cur >= tar && tar > 0;
            const dueDateStr = g.dueDate || g.targetDate;

            return (
              <div
                key={g.id}
                className="glass-card p-5 sm:p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden transition-all shadow-sm hover:shadow-md"
              >
                <div>
                  {/* Card Header: Icon, Name, Due Date, and Actions */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: g.color || '#6558D3' }}
                      >
                        {renderGoalIcon(g.icon)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-base text-slate-900 dark:text-white truncate">
                          {g.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-400 font-medium">
                          <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">
                            {dueDateStr ? `Due by ${new Date(dueDateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'Flexible deadline'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Edit & Delete Action Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditModal(g)}
                        aria-label={`Edit ${g.name}`}
                        className="p-2 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => promptDeleteGoal(g)}
                        aria-label={`Delete ${g.name}`}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Notes (if present) */}
                  {g.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 mb-3 line-clamp-2">
                      {g.notes}
                    </p>
                  )}

                  {/* Financial Metrics Strip */}
                  <div className="space-y-1.5 my-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-400 font-medium">Saved Amount</span>
                      <span className="text-xs text-slate-400 font-medium">Target Amount</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        {formatCurrency(cur)}
                      </span>
                      <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                        / {formatCurrency(tar)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar & Percentage */}
                  <div className="space-y-1.5 my-3">
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, progress)}%`,
                          backgroundColor: isCompleted ? '#10b981' : g.color || '#6558D3'
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-500 dark:text-slate-400">
                        {progress.toFixed(0)}% funded
                      </span>
                      <span className={isCompleted ? 'text-emerald-600 dark:text-emerald-400 font-black' : 'text-slate-700 dark:text-slate-300'}>
                        {isCompleted ? 'Goal Reached! 🎉' : `${formatCurrency(remaining)} remaining`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Add Funds Action */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">
                    {isCompleted ? 'Milestone Complete' : 'Quick Progress'}
                  </span>
                  <button
                    onClick={() => openAddFundsModal(g)}
                    className="px-3.5 py-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Funds</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. MODAL: Create Goal */}
      {isCreateModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-goal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md" onClick={() => setIsCreateModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <h3 id="create-goal-title" className="text-base font-black text-slate-900 dark:text-white">
                  Create Savings Goal
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                aria-label="Close dialog"
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateGoal} className="space-y-4">
              {/* Goal Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Goal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emergency Fund, Japan Trip 2027, New Laptop"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 min-h-[44px]"
                />
              </div>

              {/* Amounts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Target Amount (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={MAX_SAFE_TRANSACTION_AMOUNT}
                    required
                    placeholder="e.g. 200000"
                    value={createTargetAmount}
                    onChange={(e) => setCreateTargetAmount(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none min-h-[44px] ${
                      parseFloat(createTargetAmount) > MAX_SAFE_TRANSACTION_AMOUNT
                        ? 'border-rose-500 focus:border-rose-500'
                        : 'border-slate-200 dark:border-slate-800 focus:border-brand-500'
                    }`}
                  />
                  {parseFloat(createTargetAmount) > MAX_SAFE_TRANSACTION_AMOUNT && (
                    <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Amount cannot exceed ₹10 Crores (₹{MAX_SAFE_TRANSACTION_AMOUNT.toLocaleString('en-IN')}).</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Current Saved Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={MAX_SAFE_TRANSACTION_AMOUNT}
                    placeholder="e.g. 50000 (Optional)"
                    value={createCurrentAmount}
                    onChange={(e) => setCreateCurrentAmount(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none min-h-[44px] ${
                      parseFloat(createCurrentAmount) > MAX_SAFE_TRANSACTION_AMOUNT
                        ? 'border-rose-500 focus:border-rose-500'
                        : 'border-slate-200 dark:border-slate-800 focus:border-brand-500'
                    }`}
                  />
                  {parseFloat(createCurrentAmount) > MAX_SAFE_TRANSACTION_AMOUNT && (
                    <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Amount cannot exceed ₹10 Crores.</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Optional Due Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Target Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={createDueDate}
                  onChange={(e) => setCreateDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 min-h-[44px]"
                />
              </div>

              {/* Optional Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Save ₹10,000 every month after salary deposit."
                  value={createNotes}
                  onChange={(e) => setCreateNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Icon & Color Palette Picker */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Choose Icon
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ICON_OPTIONS.map((item) => {
                      const IconComp = item.icon;
                      const isSelected = createIcon === item.name;
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => setCreateIcon(item.name)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
                            isSelected
                              ? 'bg-brand-500/15 border-brand-500 text-brand-600 dark:text-brand-300'
                              : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                          }`}
                        >
                          <IconComp className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Theme Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setCreateColor(c.value)}
                        className={`w-8 h-8 rounded-full transition-transform cursor-pointer flex items-center justify-center min-h-[44px] min-w-[44px] ${
                          createColor === c.value ? 'ring-2 ring-offset-2 ring-brand-500 scale-110' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.value }}
                      >
                        {createColor === c.value && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCreate}
                  className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-60 min-h-[44px]"
                >
                  {isSubmittingCreate ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Save Goal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: Edit Goal */}
      {isEditModalOpen && activeGoal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-goal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <h3 id="edit-goal-title" className="text-base font-black text-slate-900 dark:text-white">
                  Edit Savings Goal
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                aria-label="Close dialog"
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Goal Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Goal Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 min-h-[44px]"
                />
              </div>

              {/* Amounts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Target Amount (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={MAX_SAFE_TRANSACTION_AMOUNT}
                    required
                    value={editTargetAmount}
                    onChange={(e) => setEditTargetAmount(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none min-h-[44px] ${
                      parseFloat(editTargetAmount) > MAX_SAFE_TRANSACTION_AMOUNT
                        ? 'border-rose-500 focus:border-rose-500'
                        : 'border-slate-200 dark:border-slate-800 focus:border-brand-500'
                    }`}
                  />
                  {parseFloat(editTargetAmount) > MAX_SAFE_TRANSACTION_AMOUNT && (
                    <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Amount cannot exceed ₹10 Crores.</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Current Saved (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={MAX_SAFE_TRANSACTION_AMOUNT}
                    value={editCurrentAmount}
                    onChange={(e) => setEditCurrentAmount(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none min-h-[44px] ${
                      parseFloat(editCurrentAmount) > MAX_SAFE_TRANSACTION_AMOUNT
                        ? 'border-rose-500 focus:border-rose-500'
                        : 'border-slate-200 dark:border-slate-800 focus:border-brand-500'
                    }`}
                  />
                  {parseFloat(editCurrentAmount) > MAX_SAFE_TRANSACTION_AMOUNT && (
                    <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Amount cannot exceed ₹10 Crores.</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Optional Due Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Target Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 min-h-[44px]"
                />
              </div>

              {/* Optional Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Icon & Color Palette Picker */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Choose Icon
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ICON_OPTIONS.map((item) => {
                      const IconComp = item.icon;
                      const isSelected = editIcon === item.name;
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => setEditIcon(item.name)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
                            isSelected
                              ? 'bg-brand-500/15 border-brand-500 text-brand-600 dark:text-brand-300'
                              : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                          }`}
                        >
                          <IconComp className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Theme Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setEditColor(c.value)}
                        className={`w-8 h-8 rounded-full transition-transform cursor-pointer flex items-center justify-center min-h-[44px] min-w-[44px] ${
                          editColor === c.value ? 'ring-2 ring-offset-2 ring-brand-500 scale-110' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.value }}
                      >
                        {editColor === c.value && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => promptDeleteGoal(activeGoal)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-1.5 cursor-pointer min-h-[44px]"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Goal</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingEdit}
                    className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-60 min-h-[44px]"
                  >
                    {isSubmittingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Update Goal</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: Add Funds */}
      {isAddFundsModalOpen && activeGoal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-funds-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md" onClick={() => setIsAddFundsModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="add-funds-title" className="text-base font-black text-slate-900 dark:text-white">
                    Add Funds
                  </h3>
                  <p className="text-xs text-slate-400 font-medium truncate max-w-[180px]">{activeGoal.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddFundsModalOpen(false)}
                aria-label="Close dialog"
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {fundsError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{fundsError}</span>
              </div>
            )}

            <form onSubmit={handleSaveFunds} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Amount to Deposit (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={MAX_SAFE_TRANSACTION_AMOUNT}
                  required
                  placeholder="e.g. 5000"
                  value={fundsToAdd}
                  onChange={(e) => setFundsToAdd(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none min-h-[44px] ${
                    parseFloat(fundsToAdd) > MAX_SAFE_TRANSACTION_AMOUNT
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-slate-200 dark:border-slate-800 focus:border-brand-500'
                  }`}
                  autoFocus
                />
                {parseFloat(fundsToAdd) > MAX_SAFE_TRANSACTION_AMOUNT && (
                  <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Deposit cannot exceed ₹10 Crores.</span>
                  </p>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs flex justify-between">
                <span className="text-slate-400 font-medium">New Total:</span>
                <span className="font-black text-slate-900 dark:text-white">
                  {formatCurrency((activeGoal.currentAmount || 0) + (parseFloat(fundsToAdd) || 0))}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddFundsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFunds}
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-60 min-h-[44px]"
                >
                  {isSubmittingFunds ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Confirm Deposit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Animated Confirmation Dialog for Goal Deletion */}
      <ConfirmDialog
        isOpen={!!goalToDelete}
        title="Delete Savings Goal"
        description={`Are you sure you want to remove "${goalToDelete?.name}"? Any progress milestones saved for this goal will be removed.`}
        confirmText="Delete Goal"
        cancelText="Keep Goal"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setGoalToDelete(null)}
      />
    </div>
  );
}
