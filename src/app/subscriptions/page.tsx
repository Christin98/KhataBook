'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  Calendar,
  CreditCard,
  Pencil,
  Trash2,
  EyeOff,
  MoreVertical,
  X,
  Check,
  Zap,
  TrendingDown,
  Layers,
  Power,
  Tv,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { formatCurrency } from '@/lib/calculations';
import { convertToMonthlyAndAnnual } from '@/lib/recurringDetection';
import { MAX_SAFE_TRANSACTION_AMOUNT } from '@/lib/moneySafe';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import {
  Subscription,
  CadenceType,
  DetectedRecurringSuggestion
} from '@/lib/types';

export default function SubscriptionsPage() {
  const {
    subscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    detectedRecurringSuggestions,
    keepSuggestion,
    ignoreSuggestion,
    accounts,
    user
  } = useData();

  // Search & Menu State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [formServiceName, setFormServiceName] = useState('');
  const [formCategory, setFormCategory] = useState('Streaming & Media');
  const [formAmount, setFormAmount] = useState('');
  const [formCadence, setFormCadence] = useState<CadenceType>('monthly');
  const [formNextRenewalDate, setFormNextRenewalDate] = useState(new Date().toISOString().split('T')[0]);
  const [formAccountId, setFormAccountId] = useState('');
  const [formPlanTier, setFormPlanTier] = useState('Standard');
  const [formNotes, setFormNotes] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  // Delete Confirmation State
  const [deletingSub, setDeletingSub] = useState<Subscription | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Filter detected suggestions for Subscriptions
  const subscriptionSuggestions = useMemo(() => {
    return detectedRecurringSuggestions.filter((s) => s.kind === 'subscription');
  }, [detectedRecurringSuggestions]);

  // Combined Monthly & Annual Subscription Commitments
  const { totalMonthlySub, totalAnnualSub, nextRenewal } = useMemo<{
    totalMonthlySub: number;
    totalAnnualSub: number;
    nextRenewal: { name: string; amount: number; date: string } | null;
  }>(() => {
    let monthlySum = 0;
    let annualSum = 0;
    let earliestRenewal: { name: string; amount: number; date: string } | null = null;

    // 1. Add active confirmed subscriptions
    subscriptions
      .filter((s) => s.isActive)
      .forEach((s) => {
        const { monthly, annual } = convertToMonthlyAndAnnual(s.amount, s.cadence);
        monthlySum += monthly;
        annualSum += annual;

        if (s.nextRenewalDate) {
          if (!earliestRenewal || new Date(s.nextRenewalDate).getTime() < new Date(earliestRenewal.date).getTime()) {
            earliestRenewal = { name: s.serviceName, amount: s.amount, date: s.nextRenewalDate };
          }
        }
      });

    // 2. Add visible suggestions
    subscriptionSuggestions.forEach((s) => {
      monthlySum += s.monthlyEquivalent;
      annualSum += s.annualEquivalent;

      if (s.nextExpectedDate) {
        if (!earliestRenewal || new Date(s.nextExpectedDate).getTime() < new Date(earliestRenewal.date).getTime()) {
          earliestRenewal = { name: s.originalMerchant, amount: s.lastAmount || s.averageCharge, date: s.nextExpectedDate };
        }
      }
    });

    return {
      totalMonthlySub: monthlySum,
      totalAnnualSub: annualSum,
      nextRenewal: earliestRenewal
    };
  }, [subscriptions, subscriptionSuggestions]);

  // Filtered confirmed list
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((s) =>
      s.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [subscriptions, searchQuery]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingSub(null);
    setFormServiceName('');
    setFormCategory('Streaming & Media');
    setFormAmount('');
    setFormCadence('monthly');
    setFormNextRenewalDate(new Date().toISOString().split('T')[0]);
    setFormAccountId(accounts.find((a) => a.isActive)?.id || '');
    setFormPlanTier('Standard');
    setFormNotes('');
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (sub: Subscription) => {
    setEditingSub(sub);
    setFormServiceName(sub.serviceName);
    setFormCategory(sub.category);
    setFormAmount(sub.amount.toString());
    setFormCadence(sub.cadence);
    setFormNextRenewalDate(sub.nextRenewalDate || new Date().toISOString().split('T')[0]);
    setFormAccountId(sub.accountId || '');
    setFormPlanTier(sub.planTier || 'Standard');
    setFormNotes(sub.notes || '');
    setFormIsActive(sub.isActive);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  // Save Modal
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(formAmount);
    if (!formServiceName.trim() || isNaN(amt) || amt <= 0 || amt > MAX_SAFE_TRANSACTION_AMOUNT) return;

    if (editingSub) {
      await updateSubscription(editingSub.id, {
        serviceName: formServiceName.trim(),
        category: formCategory,
        amount: amt,
        cadence: formCadence,
        nextRenewalDate: formNextRenewalDate,
        accountId: formAccountId || undefined,
        planTier: formPlanTier.trim() || undefined,
        notes: formNotes.trim() || undefined,
        isActive: formIsActive
      });
    } else {
      await addSubscription({
        userId: user.id,
        serviceName: formServiceName.trim(),
        category: formCategory,
        amount: amt,
        cadence: formCadence,
        nextRenewalDate: formNextRenewalDate,
        accountId: formAccountId || undefined,
        planTier: formPlanTier.trim() || undefined,
        notes: formNotes.trim() || undefined,
        isActive: formIsActive
      });
    }

    setIsModalOpen(false);
  };

  // Keep Suggestion Flow
  const handleKeepSuggestion = async (suggestion: DetectedRecurringSuggestion) => {
    await keepSuggestion(suggestion, 'subscription');
  };

  // Ignore Suggestion Flow
  const handleIgnoreSuggestion = async (suggestion: DetectedRecurringSuggestion) => {
    await ignoreSuggestion(suggestion.normalizedMerchant);
  };

  // Delete Subscription Flow
  const handleConfirmDelete = async () => {
    if (!deletingSub) return;
    setIsDeleting(true);
    try {
      await deleteSubscription(deletingSub.id);
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
      setDeletingSub(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-pink-500/10 text-pink-600 dark:text-pink-300 border border-pink-500/20 mb-2">
            <Tv className="w-3.5 h-3.5" />
            <span>Digital Subscriptions & Memberships</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Subscriptions & Memberships
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Monitor streaming, cloud, software, and memberships with automatic renewal schedules.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 flex items-center gap-2 active:scale-95 transition-all self-start sm:self-center border border-white/20 glass-shimmer cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subscription</span>
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card glass-interactive p-5 sm:p-6 rounded-3xl shadow-xl">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Monthly Subscription Cost</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
            {formatCurrency(totalMonthlySub)}
          </p>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
            Combined active & detected services
          </span>
        </div>

        <div className="glass-card glass-interactive p-5 sm:p-6 rounded-3xl shadow-xl border-pink-500/20">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Annualized Total</span>
          <p className="text-2xl sm:text-3xl font-black text-pink-600 dark:text-pink-400 mt-1 tracking-tight">
            {formatCurrency(totalAnnualSub)}
          </p>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
            12-month projected subscription spend
          </span>
        </div>

        <div className="glass-card glass-interactive p-5 sm:p-6 rounded-3xl shadow-xl border-amber-500/20">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Next Renewal</span>
          {nextRenewal ? (
            <div className="mt-1">
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">
                {formatCurrency(nextRenewal.amount)}
              </p>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {nextRenewal.name} · Renewing {nextRenewal.date}
              </p>
            </div>
          ) : (
            <p className="text-sm font-bold text-slate-400 mt-2">No upcoming renewals</p>
          )}
        </div>
      </div>

      {/* DETECTED SUBSCRIPTION SUGGESTIONS */}
      {subscriptionSuggestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Detected Subscriptions ({subscriptionSuggestions.length})
              </h2>
            </div>
            <span className="text-xs text-slate-400">Click Keep to track or Ignore to dismiss</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subscriptionSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="glass-card glass-interactive p-5 rounded-3xl space-y-4 shadow-xl border border-pink-500/25 relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white truncate">
                      {suggestion.originalMerchant}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      {suggestion.category} • <span className="capitalize font-bold text-pink-600 dark:text-pink-400">{suggestion.cadence}</span>
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
                    <p className="font-black text-pink-600 dark:text-pink-400">
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
                    <span className="text-[10px] text-slate-400 font-medium">Next Renewal</span>
                    <p className="font-bold text-slate-700 dark:text-slate-300 truncate">
                      {suggestion.nextExpectedDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleKeepSuggestion(suggestion)}
                    className="flex-1 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-md shadow-pink-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
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

      {/* CONFIRMED SUBSCRIPTIONS LIST */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
            Active Subscriptions ({subscriptions.length})
          </h2>

          <input
            type="text"
            placeholder="Search subscriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 px-3.5 py-1.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        {filteredSubscriptions.length === 0 ? (
          <div className="p-12 text-center space-y-3 glass-card rounded-3xl">
            <Tv className="w-10 h-10 text-slate-400 mx-auto opacity-75" />
            <h3 className="font-black text-base text-slate-900 dark:text-white">
              No confirmed subscriptions yet.
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Add your streaming, cloud storage, software, or gym memberships to track monthly and annual commitments.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="mt-2 px-4 py-2 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer"
            >
              + Add First Subscription
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSubscriptions.map((sub) => {
              const { monthly } = convertToMonthlyAndAnnual(sub.amount, sub.cadence);
              const linkedAcc = accounts.find((a) => a.id === sub.accountId);

              return (
                <div
                  key={sub.id}
                  className={`glass-card glass-interactive p-5 sm:p-6 rounded-3xl space-y-4 shadow-xl relative overflow-visible transition-all ${
                    !sub.isActive ? 'opacity-65 grayscale-[0.2]' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-base text-slate-900 dark:text-white truncate">
                          {sub.serviceName}
                        </h3>
                        {sub.planTier && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-pink-500/15 text-pink-700 dark:text-pink-300 border border-pink-500/25">
                            {sub.planTier}
                          </span>
                        )}
                        {!sub.isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-slate-500/15 text-slate-500 border border-slate-500/20">
                            Paused
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                        {sub.category} • <span className="capitalize font-bold text-brand-600 dark:text-brand-400">{sub.cadence}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <strong className="text-base font-black text-slate-900 dark:text-white">
                        {formatCurrency(sub.amount)}
                      </strong>

                      {/* Action Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === sub.id ? null : sub.id)}
                          className="p-1.5 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === sub.id && (
                          <div
                            className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-800 ring-1 ring-black/10 py-1.5 z-50 animate-fadeIn"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handleOpenEditModal(sub)}
                              className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5 text-slate-400" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={async () => {
                                setActiveMenuId(null);
                                await updateSubscription(sub.id, { isActive: !sub.isActive });
                              }}
                              className="w-full px-4 py-2.5 text-left text-xs font-bold text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/30 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Power className="w-3.5 h-3.5" />
                              <span>{sub.isActive ? 'Pause' : 'Activate'}</span>
                            </button>

                            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                setDeletingSub(sub);
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
                      <span className="text-[10px] text-slate-400 font-medium">Next Renewal</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300 truncate">
                        {sub.nextRenewalDate || 'Ongoing'}
                      </p>
                    </div>
                    {linkedAcc && (
                      <div className="col-span-2 pt-1 border-t border-slate-200/40 dark:border-white/5 flex items-center gap-1.5 text-[11px] text-slate-500">
                        <CreditCard className="w-3 h-3 text-slate-400" />
                        <span>Billed to {linkedAcc.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADD / EDIT SUBSCRIPTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md glass-panel bg-white/98 dark:bg-slate-900/98 rounded-3xl shadow-2xl z-10 border border-white/40 dark:border-white/10 flex flex-col max-h-[90vh] overflow-hidden animate-scaleUp">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-200/50 dark:border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-pink-500/10 text-pink-600 flex items-center justify-center border border-pink-500/20">
                  <Tv className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {editingSub ? 'Edit Subscription' : 'Add Subscription'}
                  </h3>
                  <p className="text-xs text-slate-400">Track recurring digital membership or service</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="subscription-form" onSubmit={handleSaveModal} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Service / Provider Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Netflix, Spotify, iCloud, ChatGPT Plus, YouTube Premium"
                  value={formServiceName}
                  onChange={(e) => setFormServiceName(e.target.value)}
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
                    <option value="Streaming & Media">Streaming & Media</option>
                    <option value="Cloud Storage & Productivity">Cloud & Productivity</option>
                    <option value="Software & AI Tools">Software & AI Tools</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Fitness & Gym">Fitness & Gym</option>
                    <option value="News & Reading">News & Reading</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Plan / Tier
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4K Premium, Pro, 2TB"
                    value={formPlanTier}
                    onChange={(e) => setFormPlanTier(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                  />
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
                    placeholder="649"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Billing Cadence
                  </label>
                  <select
                    value={formCadence}
                    onChange={(e) => setFormCadence(e.target.value as CadenceType)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none capitalize"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annual">Annual (Yearly)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Next Renewal Date
                  </label>
                  <input
                    type="date"
                    value={formNextRenewalDate}
                    onChange={(e) => setFormNextRenewalDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Billed Account
                  </label>
                  <select
                    value={formAccountId}
                    onChange={(e) => setFormAccountId(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="">None / Manual</option>
                    {accounts
                      .filter((a) => a.isActive)
                      .map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({formatCurrency(acc.currentBalance)})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shared with family, renews on Apple Pay"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl glass-subtle text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Subscription Status</span>
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
                form="subscription-form"
                className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-500 hover:to-pink-500 text-white text-xs font-black shadow-lg shadow-brand-500/25 border border-white/20 transition-all cursor-pointer active:scale-95"
              >
                {editingSub ? 'Save Changes' : 'Add Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deletingSub && (
        <ConfirmDialog
          isOpen={isDeleteConfirmOpen}
          title="Delete Subscription?"
          description={`Are you sure you want to delete the subscription for "${deletingSub.serviceName}"? Recorded transaction history will remain intact.`}
          confirmText="Delete Subscription"
          cancelText="Cancel"
          variant="danger"
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
          onClose={() => {
            setIsDeleteConfirmOpen(false);
            setDeletingSub(null);
          }}
        />
      )}
    </div>
  );
}
