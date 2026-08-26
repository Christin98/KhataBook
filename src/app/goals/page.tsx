'use client';

import React, { useState } from 'react';
import {
  Target,
  Plus,
  ShieldCheck,
  Plane,
  Bike,
  Laptop,
  Home,
  CheckCircle2,
  TrendingUp,
  Coins,
  Compass,
  Milestone,
  Sparkles
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { formatCurrency } from '@/lib/calculations';
import { APP_INFO } from '@/lib/constants';
import UnderDevelopmentScreen from '@/components/common/UnderDevelopmentScreen';

export default function GoalsPage() {
  const { goals, addGoal, updateGoal, accounts, user, isDevMode } = useData();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('2027-12-31');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const tarNum = parseFloat(targetAmount);
    const curNum = parseFloat(currentAmount) || 0;
    if (!name.trim() || isNaN(tarNum)) return;

    addGoal({
      userId: user.id,
      name,
      targetAmount: tarNum,
      currentAmount: curNum,
      targetDate,
      icon: 'Target',
      color: '#8b5cf6'
    });

    setIsAddModalOpen(false);
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
  };

  const goalHighlights = [
    {
      title: 'Milestone Tracking',
      description: 'Track emergency funds, vacations, gadgets, vehicles, and real estate savings with visual progress milestones.',
      icon: Milestone,
      badge: 'Core'
    },
    {
      title: 'Auto-SIP & Daily Savings Calculator',
      description: 'Calculates the exact daily or monthly contribution required to reach your target by your deadline.',
      icon: TrendingUp,
      badge: 'Smart'
    },
    {
      title: 'Account Linking & Surplus Sweeps',
      description: 'Link goals directly to dedicated savings accounts or automatically sweep leftover monthly cash flow.',
      icon: Coins,
      badge: 'Automated'
    },
    {
      title: 'Inflation & ROI Projections',
      description: 'Projects goal achievement dates with interest compounding from fixed deposits and index investments.',
      icon: Compass,
      badge: 'Upcoming'
    }
  ];

  const mainGoalsContent = (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 mb-2">
            <Target className="w-3.5 h-3.5" />
            <span>Target Milestones</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Savings & Wealth Goals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Lock funds for dreams, emergency reserves, vehicles, and vacations with visual progress meters.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 flex items-center gap-2 active:scale-95 transition-all self-start sm:self-center border border-white/20 glass-shimmer cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((g) => {
          const progressPct = g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0;
          const remaining = Math.max(0, g.targetAmount - g.currentAmount);

          return (
            <div
              key={g.id}
              className="glass-card glass-interactive p-6 sm:p-7 rounded-3xl space-y-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-13 h-13 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg border border-white/20 group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: g.color || '#8b5cf6' }}
                  >
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900 dark:text-white leading-snug">{g.name}</h3>
                    <p className="text-xs text-slate-400 font-medium">Target: {g.targetDate}</p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-brand-500/15 text-brand-700 dark:text-brand-300 font-black text-xs border border-brand-500/30">
                  {progressPct}%
                </span>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">
                    Saved: <strong className="text-slate-900 dark:text-white">{formatCurrency(g.currentAmount)}</strong>
                  </span>
                  <span className="text-slate-400">
                    Goal: <strong className="text-slate-900 dark:text-white">{formatCurrency(g.targetAmount)}</strong>
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-slate-200/60 dark:bg-slate-800/80 overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-brand-600 to-indigo-600 rounded-full transition-all"
                    style={{ width: `${Math.min(100, progressPct)}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Remaining to Save:</span>
                <span className="font-black text-brand-600 dark:text-brand-400 text-sm">
                  {formatCurrency(remaining)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-md glass-panel bg-white/95 dark:bg-slate-900/95 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 border border-white/40 dark:border-white/10 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-white/10">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Create Savings Goal</h3>
              <span className="text-xs text-brand-600 dark:text-brand-400 font-bold">Dream Milestone</span>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Goal Name</label>
                <input
                  type="text"
                  placeholder="e.g., Emergency Fund, Japan Trip, New Bike"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Target Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="100000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-sm font-black text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Initial Saved (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-sm font-black text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Target Completion Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
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
                  Save Goal
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
        featureName="Savings & Wealth Goals"
        tagline="Set financial milestones, track progress toward emergency reserves, vehicles, and vacations with visual progress meters."
        category="Wealth Building"
        icon={Target}
        highlights={goalHighlights}
        plannedRelease="v0.4.5 (Target: Next Flight Drop)"
        progressPercent={85}
        childrenIfBypassed={mainGoalsContent}
      />
    );
  }

  return mainGoalsContent;
}
