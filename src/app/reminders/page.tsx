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
  CreditCard
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { formatCurrency } from '@/lib/calculations';
import { RecurrenceType } from '@/lib/types';
import { APP_INFO } from '@/lib/constants';
import UnderDevelopmentScreen from '@/components/common/UnderDevelopmentScreen';

export default function RemindersPage() {
  const { reminders, addReminder, markReminderPaid, accounts, user } = useData();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-8 h-8 text-brand-600" />
            <span>Bill & Payment Reminders</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Never miss a Credit Card due date, Rent payment, EMI, or Subscription renewal.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-600/30 flex items-center gap-2 active:scale-95 transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Reminder</span>
        </button>
      </div>

      {/* FCM Push Notification Ready Banner */}
      <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-600 text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-brand-900 dark:text-brand-200">
              Firebase Cloud Messaging (FCM) Architecture Ready
            </h3>
            <p className="text-xs text-brand-700 dark:text-brand-400">
              Reminders synchronize with browser push notifications & future Android app.
            </p>
          </div>
        </div>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {reminders.map((rem) => (
          <div
            key={rem.id}
            className={`glass-panel p-5 rounded-3xl flex items-center justify-between gap-4 border transition-all ${
              rem.status === 'paid'
                ? 'opacity-60 bg-emerald-500/5 border-emerald-500/30'
                : 'border-slate-200/60 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base ${
                  rem.status === 'paid'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-amber-100 text-amber-600'
                }`}
              >
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{rem.title}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="font-semibold text-brand-600">{rem.category}</span>
                  <span>•</span>
                  <span>Due: {rem.dueDate}</span>
                  <span>•</span>
                  <span className="capitalize">{rem.recurrence}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
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
                  onClick={() => markReminderPaid(rem.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                >
                  Mark as Paid
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

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

  // If in Production, show UnderDevelopmentScreen with preview option
  if (!APP_INFO.isBeta) {
    return (
      <UnderDevelopmentScreen
        featureName="Bill & Payment Reminders"
        tagline="Never miss a credit card payment due date, rent, recurring EMI, or streaming subscription renewal."
        category="Bill Tracking"
        icon={Bell}
        highlights={reminderHighlights}
        plannedRelease="v0.4.0 (Q3 2026)"
        progressPercent={85}
        childrenIfBypassed={mainRemindersContent}
      />
    );
  }

  return mainRemindersContent;
}

