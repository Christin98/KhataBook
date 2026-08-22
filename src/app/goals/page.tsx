'use client';

import React, { useState } from 'react';
import { Target, Plus, ShieldCheck, Plane, Bike, Laptop, Home, CheckCircle2 } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { formatCurrency } from '@/lib/calculations';

export default function GoalsPage() {
  const { goals, addGoal, updateGoal, accounts, user } = useData();
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-8 h-8 text-brand-600" />
            <span>Savings & Wealth Goals</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track progress for Emergency reserve, Vacation, Phone, Bike, Laptop & House.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-600/30 flex items-center gap-2 active:scale-95 transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Savings Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const progressPct = Math.round((goal.currentAmount / goal.targetAmount) * 100);

          return (
            <div key={goal.id} className="glass-panel p-6 rounded-3xl space-y-6 card-hover flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl text-white font-bold flex items-center justify-center shadow-md"
                    style={{ backgroundColor: goal.color }}
                  >
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{goal.name}</h3>
                    <p className="text-xs text-slate-500">Target Date: {goal.targetDate}</p>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(goal.currentAmount)}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      / {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-brand-600 rounded-full transition-all"
                      style={{ width: `${Math.min(100, progressPct)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-extrabold text-brand-600">{progressPct}% Achieved</span>
                <button
                  onClick={() => {
                    const extra = prompt('Add funds to goal (₹):', '5000');
                    if (extra) {
                      const val = parseFloat(extra);
                      if (!isNaN(val)) updateGoal(goal.id, goal.currentAmount + val);
                    }
                  }}
                  className="px-3 py-1 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-bold hover:bg-brand-600 hover:text-white transition-colors"
                >
                  + Add Funds
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl z-10 border space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Savings Goal</h3>

            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Goal Name</label>
                <input
                  type="text"
                  placeholder="e.g. Emergency Fund, New Laptop, Bike"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Target Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="100000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Current Saved (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Target Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2.5 rounded-xl border text-xs font-bold">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-md">
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
