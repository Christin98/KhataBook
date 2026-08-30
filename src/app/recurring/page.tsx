'use client';

import React, { useState, useMemo } from 'react';
import {
  Repeat,
  Plus,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Calendar,
  DollarSign,
  TrendingDown,
  Building,
  CreditCard,
  Pencil,
  Trash2,
  EyeOff,
  MoreVertical,
  X,
  Check,
  Zap,
  ArrowRight,
  ShieldCheck,
  Clock,
  HelpCircle,
  Power
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { formatCurrency } from '@/lib/calculations';
import { convertToMonthlyAndAnnual } from '@/lib/recurringDetection';
import { MAX_SAFE_TRANSACTION_AMOUNT } from '@/lib/moneySafe';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import {
  RecurringPayment,
  CadenceType,
  DetectedRecurringSuggestion
} from '@/lib/types';

export default function RecurringPage() {
  const {
    recurringPayments,
    addRecurringPayment,
    updateRecurringPayment,
    deleteRecurringPayment,
    detectedRecurringSuggestions,
    keepSuggestion,
    ignoreSuggestion,
    accounts,
    user
  } = useData();

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<RecurringPayment | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Bills & Utilities');
  const [formAmount, setFormAmount] = useState('');
  const [formCadence, setFormCadence] = useState<CadenceType>('monthly');
  const [formNextDate, setFormNextDate] = useState(new Date().toISOString().split('T')[0]);
  const [formAccountId, setFormAccountId] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  // Keep Suggestion Confirmation Modal State
  const [keepingSuggestion, setKeepingSuggestion] = useState<DetectedRecurringSuggestion | null>(null);

  // Delete Confirmation State
  const [deletingPayment, setDeletingPayment] = useState<RecurringPayment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter detected suggestions for Recurring (bills and other recurring payments)
  const recurringSuggestions = useMemo(() => {
    return detectedRecurringSuggestions.filter((s) => s.kind !== 'subscription');
  }, [detectedRecurringSuggestions]);

  // Combined Monthly & Annual Commitments (Confirmed Active + Visible Suggestions without double-counting)
  const { totalMonthlyCommitment, totalAnnualCommitment, nextExpectedPayment } = useMemo<{
    totalMonthlyCommitment: number;
    totalAnnualCommitment: number;
    nextExpectedPayment: { name: string; amount: number; date: string; source: 'confirmed' | 'detected' } | null;
  }>(() => {
    let monthlySum = 0;
    let annualSum = 0;
    let earliestDue: { name: string; amount: number; date: string; source: 'confirmed' | 'detected' } | null = null;

    // 1. Add active confirmed recurring payments
    recurringPayments
      .filter((r) => r.isActive)
      .forEach((r) => {
        const { monthly, annual } = convertToMonthlyAndAnnual(r.amount, r.cadence);
        monthlySum += monthly;
        annualSum += annual;

        if (r.nextDate) {
          if (!earliestDue || new Date(r.nextDate).getTime() < new Date(earliestDue.date).getTime()) {
            earliestDue = { name: r.name, amount: r.amount, date: r.nextDate, source: 'confirmed' };
          }
        }
      });

    // 2. Add visible suggestions (already deduplicated by detection engine)
    recurringSuggestions.forEach((s) => {
      monthlySum += s.monthlyEquivalent;
      annualSum += s.annualEquivalent;

      if (s.nextExpectedDate) {
        if (!earliestDue || new Date(s.nextExpectedDate).getTime() < new Date(earliestDue.date).getTime()) {
          earliestDue = { name: s.originalMerchant, amount: s.lastAmount || s.averageCharge, date: s.nextExpectedDate, source: 'detected' };
        }
      }
    });

    return {
      totalMonthlyCommitment: monthlySum,
      totalAnnualCommitment: annualSum,
      nextExpectedPayment: earliestDue
    };
  }, [recurringPayments, recurringSuggestions]);

  // Filtered confirmed list
  const filteredRecurring = useMemo(() => {
    return recurringPayments.filter((r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [recurringPayments, searchQuery]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingPayment(null);
    setFormName('');
    setFormCategory('Bills & Utilities');
    setFormAmount('');
    setFormCadence('monthly');
    setFormNextDate(new Date().toISOString().split('T')[0]);
    setFormAccountId(accounts.find((a) => a.isActive)?.id || '');
    setFormNotes('');
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (payment: RecurringPayment) => {
    setEditingPayment(payment);
    setFormName(payment.name);
    setFormCategory(payment.category);
    setFormAmount(payment.amount.toString());
    setFormCadence(payment.cadence);
    setFormNextDate(payment.nextDate || new Date().toISOString().split('T')[0]);
    setFormAccountId(payment.accountId || '');
    setFormNotes(payment.notes || '');
    setFormIsActive(payment.isActive);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  // Save Modal (Create or Update)
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(formAmount);
    if (!formName.trim() || isNaN(amt) || amt <= 0 || amt > MAX_SAFE_TRANSACTION_AMOUNT) return;

    if (editingPayment) {
      await updateRecurringPayment(editingPayment.id, {
        name: formName.trim(),
        category: formCategory,
        amount: amt,
        cadence: formCadence,
        nextDate: formNextDate,
        accountId: formAccountId || undefined,
        notes: formNotes.trim() || undefined,
        isActive: formIsActive
      });
    } else {
      await addRecurringPayment({
        userId: user.id,
        name: formName.trim(),
        category: formCategory,
        amount: amt,
        cadence: formCadence,
        nextDate: formNextDate,
        accountId: formAccountId || undefined,
        notes: formNotes.trim() || undefined,
        isActive: formIsActive
      });
    }

    setIsModalOpen(false);
  };

  // Keep Suggestion Flow
  const handleKeepSuggestion = async (suggestion: DetectedRecurringSuggestion) => {
    await keepSuggestion(suggestion, 'recurring');
    setKeepingSuggestion(null);
  };

  // Ignore Suggestion Flow
  const handleIgnoreSuggestion = async (suggestion: DetectedRecurringSuggestion) => {
    await ignoreSuggestion(suggestion.normalizedMerchant);
  };

  // Delete Recurring Payment Flow
  const handleConfirmDelete = async () => {
    if (!deletingPayment) return;
    setIsDeleting(true);
    try {
      await deleteRecurringPayment(deletingPayment.id);
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
      setDeletingPayment(null);
    }
  };

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 mb-2">
            <Repeat className="w-3.5 h-3.5" />
            <span>Automated Recurring Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Recurring Bills & Payments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Automatically detect repeating payments, track cadence, and monitor cash flow commitments.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 flex items-center gap-2 active:scale-95 transition-all self-start sm:self-center border border-white/20 glass-shimmer cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Recurring Payment</span>
        </button>
      </div>

      {/* Active Detection Status Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 dark:text-white">Active Recurring Detection</h3>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Scanning real transactions for repeating intervals, merchant stability, and cadence windows.
            </p>
          </div>
        </div>
        <div className="text-slate-500 dark:text-slate-400 font-semibold self-start sm:self-auto shrink-0 bg-white/60 dark:bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-white/5">
          {recurringSuggestions.length} detected pattern{recurringSuggestions.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card glass-interactive p-5 sm:p-6 rounded-3xl shadow-xl">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Estimated Monthly Commitment</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
            {formatCurrency(totalMonthlyCommitment)}
          </p>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
            Confirmed active & detected suggestions
          </span>
        </div>

        <div className="glass-card glass-interactive p-5 sm:p-6 rounded-3xl shadow-xl border-indigo-500/20">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Annualized Total</span>
          <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1 tracking-tight">
            {formatCurrency(totalAnnualCommitment)}
          </p>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
            12-month projected commitment
          </span>
        </div>

        <div className="glass-card glass-interactive p-5 sm:p-6 rounded-3xl shadow-xl border-amber-500/20">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Next Expected Payment</span>
          {nextExpectedPayment ? (
            <div className="mt-1">
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">
                {formatCurrency(nextExpectedPayment.amount)}
              </p>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {nextExpectedPayment.name} · Due {nextExpectedPayment.date}
              </p>
            </div>
          ) : (
            <p className="text-sm font-bold text-slate-400 mt-2">No upcoming payments</p>
          )}
        </div>
      </div>

      {/* DETECTED SUGGESTIONS SECTION */}
      {recurringSuggestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Detected Recurring Bills ({recurringSuggestions.length})
              </h2>
            </div>
            <span className="text-xs text-slate-400">Click Keep to track or Ignore to dismiss</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recurringSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="glass-card glass-interactive p-5 rounded-3xl space-y-4 shadow-xl border border-indigo-500/25 relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white truncate">
                      {suggestion.originalMerchant}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      {suggestion.category} • <span className="capitalize font-bold text-indigo-600 dark:text-indigo-400">{suggestion.cadence}</span>
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase shrink-0 ${
                      suggestion.confidence === 'High confidence'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25'
                        : 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/25'
                    }`}
                  >
                    {suggestion.confidence}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl glass-subtle text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium">Avg Charge</span>
                    <p className="font-black text-slate-900 dark:text-white">
                      {formatCurrency(suggestion.averageCharge)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium">Monthly Equiv</span>
                    <p className="font-black text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(suggestion.monthlyEquivalent)}/mo
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium">Occurrences</span>
                    <p className="font-bold text-slate-700 dark:text-slate-300">
                      {suggestion.occurrenceCount} times
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium">Next Due</span>
                    <p className="font-bold text-slate-700 dark:text-slate-300 truncate">
                      {suggestion.nextExpectedDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleKeepSuggestion(suggestion)}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Keep</span>
                  </button>

                  <button
                    onClick={() => handleIgnoreSuggestion(suggestion)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                    title="Ignore suggestion"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Ignore</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONFIRMED RECURRING PAYMENTS SECTION */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
            Confirmed Recurring Payments ({recurringPayments.length})
          </h2>

          <input
            type="text"
            placeholder="Search recurring..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 px-3.5 py-1.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        {filteredRecurring.length === 0 ? (
          <div className="p-12 text-center space-y-3 glass-card rounded-3xl">
            <Repeat className="w-10 h-10 text-slate-400 mx-auto opacity-75" />
            <h3 className="font-black text-base text-slate-900 dark:text-white">
              No confirmed recurring payments yet.
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Add your scheduled utility bills, rent, or recurring commitments manually or keep detected items above.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="mt-2 px-4 py-2 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer"
            >
              + Add First Recurring Payment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRecurring.map((payment) => {
              const { monthly } = convertToMonthlyAndAnnual(payment.amount, payment.cadence);
              const linkedAcc = accounts.find((a) => a.id === payment.accountId);

              return (
                <div
                  key={payment.id}
                  className={`glass-card glass-interactive p-5 sm:p-6 rounded-3xl space-y-4 shadow-xl relative overflow-visible transition-all ${
                    !payment.isActive ? 'opacity-65 grayscale-[0.2]' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-base text-slate-900 dark:text-white truncate">
                          {payment.name}
                        </h3>
                        {!payment.isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-slate-500/15 text-slate-500 border border-slate-500/20">
                            Paused
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                        {payment.category} • <span className="capitalize font-bold text-brand-600 dark:text-brand-400">{payment.cadence}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <strong className="text-base font-black text-slate-900 dark:text-white">
                        {formatCurrency(payment.amount)}
                      </strong>

                      {/* Action Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === payment.id ? null : payment.id)}
                          className="p-1.5 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === payment.id && (
                          <div
                            className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-800 ring-1 ring-black/10 py-1.5 z-50 animate-fadeIn"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handleOpenEditModal(payment)}
                              className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5 text-slate-400" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={async () => {
                                setActiveMenuId(null);
                                await updateRecurringPayment(payment.id, { isActive: !payment.isActive });
                              }}
                              className="w-full px-4 py-2.5 text-left text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Power className="w-3.5 h-3.5" />
                              <span>{payment.isActive ? 'Pause' : 'Activate'}</span>
                            </button>

                            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                setDeletingPayment(payment);
                                setIsDeleteConfirmOpen(true);
                              }}
                              className="w-full px-4 py-2.5 text-left text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl glass-subtle text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium">Monthly Equiv</span>
                      <p className="font-bold text-brand-600 dark:text-brand-400">
                        {formatCurrency(monthly)}/mo
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium">Next Due Date</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300 truncate">
                        {payment.nextDate || 'Ongoing'}
                      </p>
                    </div>
                    {linkedAcc && (
                      <div className="col-span-2 pt-1 border-t border-slate-200/40 dark:border-white/5 flex items-center gap-1.5 text-[11px] text-slate-500">
                        <CreditCard className="w-3 h-3 text-slate-400" />
                        <span>Paid via {linkedAcc.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md glass-panel bg-white/98 dark:bg-slate-900/98 rounded-3xl shadow-2xl z-10 border border-white/40 dark:border-white/10 flex flex-col max-h-[90vh] overflow-hidden animate-scaleUp">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-200/50 dark:border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center border border-indigo-500/20">
                  <Repeat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {editingPayment ? 'Edit Recurring Payment' : 'Add Recurring Payment'}
                  </h3>
                  <p className="text-xs text-slate-400">Set payment details and recurring schedule</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="recurring-form" onSubmit={handleSaveModal} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Payment Name / Service
                </label>
                <input
                  type="text"
                  placeholder="e.g. Electricity Bill, Apartment Rent, Gym Membership"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Bills & Utilities">Bills & Utilities</option>
                    <option value="Rent">Rent</option>
                    <option value="Subscriptions">Subscriptions</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Education">Education</option>
                    <option value="Fitness & Health">Fitness & Health</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Cadence
                  </label>
                  <select
                    value={formCadence}
                    onChange={(e) => setFormCadence(e.target.value as CadenceType)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none capitalize"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly (14 days)</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annual">Annual (Yearly)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={MAX_SAFE_TRANSACTION_AMOUNT}
                    placeholder="2500"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Next Due Date
                  </label>
                  <input
                    type="date"
                    value={formNextDate}
                    onChange={(e) => setFormNextDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Linked Account / Payment Source
                </label>
                <select
                  value={formAccountId}
                  onChange={(e) => setFormAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="">None / Manual Tracking</option>
                  {accounts
                    .filter((a) => a.isActive)
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({formatCurrency(acc.currentBalance)})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Consumer ID, policy number, auto-debit on 5th"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl glass-subtle text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Active Status</span>
                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    formIsActive
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {formIsActive ? 'Active' : 'Paused'}
                </button>
              </div>
            </form>

            <div className="p-4 border-t border-slate-200/50 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 flex gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="recurring-form"
                className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-brand-500/25 border border-white/20 transition-all cursor-pointer active:scale-95"
              >
                {editingPayment ? 'Save Changes' : 'Add Recurring'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deletingPayment && (
        <ConfirmDialog
          isOpen={isDeleteConfirmOpen}
          title="Delete Recurring Payment?"
          description={`Are you sure you want to remove "${deletingPayment.name}"? Historical ledger transactions will not be deleted.`}
          confirmText="Delete Payment"
          cancelText="Cancel"
          variant="danger"
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
          onClose={() => {
            setIsDeleteConfirmOpen(false);
            setDeletingPayment(null);
          }}
        />
      )}
    </div>
  );
}
