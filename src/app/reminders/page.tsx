'use client';

import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Calendar,
  Check,
  AlertCircle,
  Sparkles,
  Smartphone,
  Repeat,
  ShieldAlert,
  CreditCard,
  BellRing,
  Wallet,
  Clock,
  ArrowRight,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useData } from '@/context/DataContext';
import { formatCurrency } from '@/lib/calculations';
import { RecurrenceType, Reminder } from '@/lib/types';
import { APP_INFO } from '@/lib/constants';

export default function RemindersPage() {
  const {
    reminders,
    addReminder,
    markReminderPaid,
    accounts,
    addTransaction,
    user,
    isDevMode
  } = useData();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'overdue' | 'paid'>('all');

  // Pay Modal State
  const [payingReminder, setPayingReminder] = useState<Reminder | null>(null);
  const [payAccountId, setPayAccountId] = useState(accounts[0]?.id || '');
  const [recordInLedger, setRecordInLedger] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('2026-09-01');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('monthly');
  const [category, setCategory] = useState('Bills & Utilities');

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount)) return;

    addReminder({
      userId: user.id,
      title,
      amount: numAmount,
      dueDate,
      recurrence,
      category,
      status: 'pending'
    });

    setIsAddModalOpen(false);
    setTitle('');
    setAmount('');
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingReminder) return;

    markReminderPaid(payingReminder.id);

    if (recordInLedger && payAccountId) {
      addTransaction({
        userId: user.id,
        type: 'expense',
        amount: payingReminder.amount,
        category: payingReminder.category || 'Bills & Utilities',
        description: `Bill Payment: ${payingReminder.title}`,
        date: new Date().toISOString().split('T')[0],
        accountId: payAccountId,
        notes: `Auto-recorded from reminder due on ${payingReminder.dueDate}`
      });
    }

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    setPayingReminder(null);
  };

  const handleTestAlarm = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        if (Notification.permission === 'granted') {
          new Notification('⏰ KhataKithab Bill Alarm Test', {
            body: 'HDFC Credit Card bill (₹24,500) is due tomorrow. Tap to view.',
            icon: '/icon.png'
          });
        } else {
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            new Notification('⏰ KhataKithab Bill Alarm Test', {
              body: 'HDFC Credit Card bill (₹24,500) is due tomorrow. Tap to view.',
              icon: '/icon.png'
            });
          }
        }
      } catch (err) {
        console.error('Notification error:', err);
      }
    }
  };

  const getDueStatus = (dueDateStr: string, isPaid: boolean) => {
    if (isPaid) {
      return { label: 'Paid', color: 'emerald', isOverdue: false, isDueToday: false, days: 0 };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `Overdue by ${Math.abs(diffDays)}d`, color: 'rose', isOverdue: true, isDueToday: false, days: diffDays };
    } else if (diffDays === 0) {
      return { label: 'Due Today!', color: 'amber', isOverdue: false, isDueToday: true, days: 0 };
    } else {
      return { label: `Due in ${diffDays}d`, color: 'brand', isOverdue: false, isDueToday: false, days: diffDays };
    }
  };

  const filteredReminders = reminders.filter((rem) => {
    const status = getDueStatus(rem.dueDate, rem.status === 'paid');
    if (activeFilter === 'paid') return rem.status === 'paid';
    if (activeFilter === 'overdue') return rem.status !== 'paid' && status.isOverdue;
    if (activeFilter === 'upcoming') return rem.status !== 'paid' && !status.isOverdue;
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20 mb-2">
            <Bell className="w-3.5 h-3.5" />
            <span>Due Dates & Subscriptions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Bill & Payment Reminders
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Never miss credit card bills, house rent, EMIs, or recurring subscription renewals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTestAlarm}
            className="px-4 py-2.5 rounded-2xl glass-subtle hover:bg-white/70 dark:hover:bg-slate-800/70 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Test notification sound & alarm"
          >
            <BellRing className="w-4 h-4 text-brand-500" />
            <span>Test Alarm</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 flex items-center gap-2 active:scale-95 transition-all border border-white/20 glass-shimmer cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Reminder</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: `All (${reminders.length})` },
          { id: 'upcoming', label: `Upcoming (${reminders.filter((r) => r.status !== 'paid' && !getDueStatus(r.dueDate, false).isOverdue).length})` },
          { id: 'overdue', label: `Overdue (${reminders.filter((r) => r.status !== 'paid' && getDueStatus(r.dueDate, false).isOverdue).length})` },
          { id: 'paid', label: `Paid (${reminders.filter((r) => r.status === 'paid').length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold shrink-0 transition-all cursor-pointer ${
              activeFilter === tab.id
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 border border-white/20'
                : 'glass-subtle text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reminders List */}
      <div className="space-y-4">
        {filteredReminders.length === 0 ? (
          <div className="glass-card p-16 text-center rounded-3xl space-y-3 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-inner">
              <Check className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-200">No reminders in this filter</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto font-medium">
              You are completely on schedule with all your bills and payments!
            </p>
          </div>
        ) : (
          filteredReminders.map((rem) => {
            const dueInfo = getDueStatus(rem.dueDate, rem.status === 'paid');

            return (
              <div
                key={rem.id}
                className={`glass-card glass-interactive p-5 sm:p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl transition-all ${
                  rem.status === 'paid'
                    ? 'opacity-65 bg-emerald-500/5 border-emerald-500/25'
                    : dueInfo.isOverdue
                    ? 'bg-rose-500/5 border-rose-500/35'
                    : dueInfo.isDueToday
                    ? 'bg-amber-500/5 border-amber-500/35'
                    : 'border-white/20'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-13 h-13 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 shadow-inner ${
                      rem.status === 'paid'
                        ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30'
                        : dueInfo.isOverdue
                        ? 'bg-rose-500/20 text-rose-600 border border-rose-500/30'
                        : dueInfo.isDueToday
                        ? 'bg-amber-500/20 text-amber-600 border border-amber-500/30 animate-pulse'
                        : 'bg-brand-500/20 text-brand-600 border border-brand-500/30'
                    }`}
                  >
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-black text-base text-slate-900 dark:text-white leading-snug">{rem.title}</h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          rem.status === 'paid'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                            : dueInfo.isOverdue
                            ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                            : dueInfo.isDueToday
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                            : 'bg-brand-500/15 text-brand-700 dark:text-brand-300 border-brand-500/30'
                        }`}
                      >
                        {dueInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 flex-wrap font-medium">
                      <span className="font-bold text-brand-600 dark:text-brand-400">{rem.category}</span>
                      <span>•</span>
                      <span>Due: {rem.dueDate}</span>
                      <span>•</span>
                      <span className="capitalize">{rem.recurrence}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200/50 dark:border-white/5">
                  <div className="text-left sm:text-right">
                    <span className="font-black text-lg sm:text-xl text-slate-900 dark:text-white">
                      {formatCurrency(rem.amount)}
                    </span>
                  </div>

                  {rem.status === 'paid' ? (
                    <span className="px-3.5 py-2 rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-black flex items-center gap-1.5">
                      <Check className="w-4 h-4" /> Paid
                    </span>
                  ) : (
                    <button
                      onClick={() => setPayingReminder(rem)}
                      className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-md shadow-emerald-600/25 transition-all active:scale-95 flex items-center gap-1.5 border border-white/20 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Pay & Settle</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pay & Ledger Debit Modal */}
      {payingReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setPayingReminder(null)} />
          <div className="relative w-full max-w-md glass-panel bg-white/95 dark:bg-slate-900/95 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 border border-white/40 dark:border-white/10 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-white/10">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600" />
                <span>Confirm Bill Payment</span>
              </h3>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Settlement</span>
            </div>

            <div className="p-4 rounded-2xl glass-subtle space-y-1">
              <p className="text-xs text-slate-400 font-medium">Bill Details</p>
              <p className="font-black text-slate-900 dark:text-white text-sm">{payingReminder.title}</p>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(payingReminder.amount)}</p>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2.5">
                <label className="flex items-center gap-2.5 text-xs font-black text-emerald-900 dark:text-emerald-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={recordInLedger}
                    onChange={(e) => setRecordInLedger(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 accent-emerald-600"
                  />
                  <span>Deduct from account & record in transactions</span>
                </label>

                {recordInLedger && accounts.length > 0 && (
                  <select
                    value={payAccountId}
                    onChange={(e) => setPayAccountId(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} • ₹{acc.currentBalance.toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setPayingReminder(null)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-white/10 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black shadow-lg shadow-emerald-500/25 border border-white/20 cursor-pointer hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition-all"
                >
                  Complete Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Reminder Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-md glass-panel bg-white/95 dark:bg-slate-900/95 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 border border-white/40 dark:border-white/10 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-white/10">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Add Reminder</h3>
              <span className="text-xs text-brand-600 dark:text-brand-400 font-bold">Due Calendar</span>
            </div>

            <form onSubmit={handleCreateReminder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Reminder Title</label>
                <input
                  type="text"
                  placeholder="e.g. Credit Card Bill, Rent, Netflix, Electricity"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="2500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-sm font-black text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Recurrence</label>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                  className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="yearly">Yearly</option>
                  <option value="once">One-time</option>
                </select>
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
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
