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
    isDevMode,
    browserNotificationPermission,
    requestBrowserNotificationPermission,
    sendBrowserNotification
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

    // 1. Mark paid
    markReminderPaid(payingReminder.id);

    // 2. If recordInLedger is checked, debit the selected account
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
    } else {
      alert('Browser notifications are not supported on this browser or platform.');
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

  const reminderHighlights = [
    {
      title: 'Smart Bill & Due Date Radar',
      description: 'Centralizes credit card statement dates, payment dues, EMIs, house rent, and utility bills in one unified calendar.',
      icon: Calendar,
      badge: 'Core'
    },
    {
      title: 'Browser & Mobile Push Notifications',
      description: 'Firebase Cloud Messaging (FCM) push alerts sent 3 days, 1 day, and on the morning of bill due dates.',
      icon: Smartphone,
      badge: 'Cloud'
    },
    {
      title: 'Recurring Cadence Automation',
      description: 'Set monthly, weekly, quarterly, or annual recurrence so subscriptions roll over automatically upon payment.',
      icon: Repeat,
      badge: 'Automated'
    },
    {
      title: 'Credit Card Minimum vs Full Due Tracking',
      description: 'Integrates with card billing cycles to highlight interest-free grace periods and prevent late payment penalty fees.',
      icon: CreditCard,
      badge: 'Upcoming'
    }
  ];

  const mainRemindersContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-8 h-8 text-brand-600" />
            <span>Bill & Payment Reminders</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Never miss a Credit Card bill, Rent payment, EMI, or Subscription renewal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTestAlarm}
            className="px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all"
            title="Test notification sound & alarm"
          >
            <BellRing className="w-4 h-4 text-brand-600" />
            <span>Test Alarm</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-lg shadow-brand-600/30 flex items-center gap-1.5 active:scale-95 transition-all"
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
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
              activeFilter === tab.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {filteredReminders.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No reminders in this filter</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              You're completely on schedule with all your bills and payments!
            </p>
          </div>
        ) : (
          filteredReminders.map((rem) => {
            const dueInfo = getDueStatus(rem.dueDate, rem.status === 'paid');

            return (
              <div
                key={rem.id}
                className={`glass-panel p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border transition-all ${
                  rem.status === 'paid'
                    ? 'opacity-60 bg-emerald-500/5 border-emerald-500/30'
                    : dueInfo.isOverdue
                    ? 'bg-rose-500/5 border-rose-500/40'
                    : dueInfo.isDueToday
                    ? 'bg-amber-500/5 border-amber-500/40'
                    : 'border-slate-200/60 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 ${
                      rem.status === 'paid'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600'
                        : dueInfo.isOverdue
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600'
                        : dueInfo.isDueToday
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 animate-pulse'
                        : 'bg-brand-100 dark:bg-brand-950/60 text-brand-600'
                    }`}
                  >
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">{rem.title}</h3>
                      <span
                        className={`px-2 py-0.2 rounded-full text-[10px] font-extrabold uppercase ${
                          rem.status === 'paid'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                            : dueInfo.isOverdue
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-600'
                            : dueInfo.isDueToday
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-600'
                            : 'bg-brand-50 dark:bg-brand-950 text-brand-600'
                        }`}
                      >
                        {dueInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                      <span className="font-semibold text-brand-600 dark:text-brand-400">{rem.category}</span>
                      <span>•</span>
                      <span>Due: {rem.dueDate}</span>
                      <span>•</span>
                      <span className="capitalize">{rem.recurrence}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left sm:text-right">
                    <span className="font-extrabold text-lg text-slate-900 dark:text-white">
                      {formatCurrency(rem.amount)}
                    </span>
                  </div>

                  {rem.status === 'paid' ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 text-xs font-bold flex items-center gap-1">
                      <Check className="w-4 h-4" /> Paid
                    </span>
                  ) : (
                    <button
                      onClick={() => setPayingReminder(rem)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Pay & Record</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setPayingReminder(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl z-10 border border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
              <span>Confirm Bill Payment</span>
            </h3>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <p className="text-xs text-slate-500">Bill Details</p>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{payingReminder.title}</p>
              <p className="text-lg font-black text-emerald-600">{formatCurrency(payingReminder.amount)}</p>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={recordInLedger}
                    onChange={(e) => setRecordInLedger(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Deduct from My Account & Log in Transactions</span>
                </label>

                {recordInLedger && accounts.length > 0 && (
                  <select
                    value={payAccountId}
                    onChange={(e) => setPayAccountId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} • ₹{acc.currentBalance.toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingReminder(null)}
                  className="flex-1 py-2.5 rounded-xl border text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md active:scale-95 transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl z-10 border space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Reminder</h3>

            <form onSubmit={handleCreateReminder} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Reminder Title</label>
                <input
                  type="text"
                  placeholder="e.g. Credit Card Bill, Rent, Netflix"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="2500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Recurrence</label>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="yearly">Yearly</option>
                  <option value="once">One-time</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2.5 rounded-xl border text-xs font-bold">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-md">
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  return mainRemindersContent;
}


