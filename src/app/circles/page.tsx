'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Plus,
  Minus,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  Share2,
  Check,
  Zap,
  User,
  ShieldCheck
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { formatCurrency, calculateUserCircleTotals } from '@/lib/calculations';
import { FUN_CIRCLE_CATEGORIES } from '@/lib/sampleData';
import { CircleMember } from '@/lib/types';

const DEFAULT_MEMBER_NAMES = [
  'Rahul Sharma',
  'Anu Verma',
  'Akash Gupta',
  'Priya Patel',
  'Vikram Singh',
  'Rohit Mehta',
  'Neha Kapoor',
  'Karan Malhotra',
  'Divya Nair',
  'Siddharth Joshi'
];

export default function CirclesListPage() {
  const { circles, circleExpenses, settlements, user, addCircle } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [circleName, setCircleName] = useState('');
  const [selectedFunCategory, setSelectedFunCategory] = useState(FUN_CIRCLE_CATEGORIES[0].name);

  // Member Count & Name Customization State
  const [memberCount, setMemberCount] = useState(3);
  const [memberNames, setMemberNames] = useState<string[]>([
    'Rahul Sharma',
    'Anu Verma'
  ]);

  const { totalReceive, totalPay } = calculateUserCircleTotals(user.id, circles, circleExpenses, settlements);

  const handleMemberCountChange = (count: number) => {
    const validCount = Math.max(2, Math.min(15, count));
    setMemberCount(validCount);
    const numAdditional = validCount - 1;

    setMemberNames((prev) => {
      const nextNames = [...prev];
      while (nextNames.length < numAdditional) {
        const idx = nextNames.length;
        nextNames.push(DEFAULT_MEMBER_NAMES[idx % DEFAULT_MEMBER_NAMES.length]);
      }
      return nextNames.slice(0, numAdditional);
    });
  };

  const handleMemberNameUpdate = (index: number, newName: string) => {
    setMemberNames((prev) => {
      const updated = [...prev];
      updated[index] = newName;
      return updated;
    });
  };

  const handleCreateCircle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!circleName.trim()) return;

    // Owner member
    const membersList: CircleMember[] = [
      { id: user.id, userId: user.id, name: `${user.displayName} (You)`, email: user.email, role: 'owner', status: 'active' }
    ];

    // Additional members
    memberNames.forEach((name, idx) => {
      const cleanName = name.trim() || `Member ${idx + 2}`;
      membersList.push({
        id: `mem_${Date.now()}_${idx}`,
        name: cleanName,
        email: `${cleanName.toLowerCase().replace(/\s+/g, '')}@example.com`,
        role: 'member',
        status: 'active'
      });
    });

    addCircle({
      name: circleName,
      category: selectedFunCategory,
      ownerId: user.id,
      members: membersList
    });

    setIsModalOpen(false);
    setCircleName('');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Shared Expense Circles</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Circles & Split Ledgers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Split bills with flatmates, trips, and friends completely separated from your personal cash.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 flex items-center gap-2 active:scale-95 transition-all self-start sm:self-center border border-white/20 glass-shimmer cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Circle</span>
        </button>
      </div>

      {/* Net Splitting Ledger Overview Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card glass-interactive p-6 rounded-3xl flex items-center justify-between shadow-xl group border-emerald-500/20">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30 shadow-inner group-hover:scale-105 transition-transform">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Money You Are Owed</p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight mt-0.5">
                {formatCurrency(totalReceive)}
              </p>
            </div>
          </div>
          <span className="text-xs font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-3.5 py-1 rounded-full backdrop-blur-md">
            Receivable
          </span>
        </div>

        <div className="glass-card glass-interactive p-6 rounded-3xl flex items-center justify-between shadow-xl group border-rose-500/20">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold border border-rose-500/30 shadow-inner group-hover:scale-105 transition-transform">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Money You Owe Others</p>
              <p className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight mt-0.5">
                {formatCurrency(totalPay)}
              </p>
            </div>
          </div>
          <span className="text-xs font-black bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 px-3.5 py-1 rounded-full backdrop-blur-md">
            Payable
          </span>
        </div>
      </div>

      {/* Circles Cards Grid */}
      <div>
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
          Active Shared Circles
        </h2>

        {circles.length === 0 ? (
          <div className="glass-card p-16 text-center rounded-3xl space-y-3 shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-brand-500/10 text-brand-500 mx-auto flex items-center justify-center border border-brand-500/20 shadow-inner">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-base">No circles yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
              Start a Goa Plan, Flatmates Rent, or Dinner Squad circle to split seamlessly.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/25 cursor-pointer"
            >
              + Create Circle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {circles.map((circle) => {
              const funItem = FUN_CIRCLE_CATEGORIES.find((f) => f.name === circle.category) || FUN_CIRCLE_CATEGORIES[0];

              return (
                <Link
                  key={circle.id}
                  href={`/circles/${circle.id}`}
                  className="glass-card glass-interactive p-6 rounded-3xl flex flex-col justify-between space-y-6 group shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-brand-500/20 to-purple-500/20 text-2xl flex items-center justify-center border border-brand-500/30 shadow-inner group-hover:scale-110 transition-transform">
                        {funItem.icon}
                      </div>
                      <div>
                        <h3 className="font-black text-lg text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-snug">
                          {circle.name}
                        </h3>
                        <span className="text-xs text-brand-600 dark:text-brand-400 font-bold">
                          {circle.category} • {circle.members.length} Members
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                  </div>

                  {/* Members Avatars preview */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/50 dark:border-white/5">
                    <div className="flex items-center -space-x-2">
                      {circle.members.slice(0, 4).map((m, idx) => (
                        <div
                          key={m.id}
                          className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-xs"
                          title={m.name}
                        >
                          {m.name.charAt(0)}
                        </div>
                      ))}
                      {circle.members.length > 4 && (
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black flex items-center justify-center ring-2 ring-white dark:ring-slate-900 border border-white/20">
                          +{circle.members.length - 4}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 font-bold">Total Shared</span>
                      <p className="text-base font-black text-slate-900 dark:text-white">
                        {formatCurrency(circle.totalExpenses)}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Circle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-lg glass-panel bg-white/95 dark:bg-slate-900/95 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 border border-white/40 dark:border-white/10 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-white/10">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Create New Circle</h3>
              <span className="text-xs text-brand-600 dark:text-brand-400 font-bold">Shared Splitting</span>
            </div>

            <form onSubmit={handleCreateCircle} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Circle Name</label>
                <input
                  type="text"
                  placeholder="e.g., Goa Trip 2026, Flat 402 Rent & WiFi"
                  value={circleName}
                  onChange={(e) => setCircleName(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {FUN_CIRCLE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setSelectedFunCategory(cat.name)}
                      className={`p-2.5 rounded-2xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                        selectedFunCategory === cat.name
                          ? 'bg-brand-500/20 text-brand-700 dark:text-brand-300 border border-brand-500/40 shadow-xs'
                          : 'glass-subtle text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className="truncate">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of members selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                    Total Circle Members ({memberCount})
                  </label>
                  <span className="text-[11px] text-slate-400">Includes You</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleMemberCountChange(memberCount - 1)}
                    disabled={memberCount <= 2}
                    className="p-2 rounded-xl glass-subtle hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min="2"
                    max="12"
                    value={memberCount}
                    onChange={(e) => handleMemberCountChange(parseInt(e.target.value))}
                    className="flex-1 accent-brand-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleMemberCountChange(memberCount + 1)}
                    disabled={memberCount >= 12}
                    className="p-2 rounded-xl glass-subtle hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Member names list */}
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <User className="w-4 h-4 text-brand-500" />
                  <span>1. {user.displayName} (You, Admin)</span>
                </div>
                {memberNames.map((name, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 w-4">{idx + 2}.</span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleMemberNameUpdate(idx, e.target.value)}
                      placeholder={`Member ${idx + 2} name`}
                      className="flex-1 px-3 py-1.5 glass-input rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-white/10 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-black shadow-lg shadow-brand-500/25 border border-white/20 cursor-pointer hover:from-brand-500 hover:to-indigo-500 active:scale-95 transition-all"
                >
                  Create Circle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
