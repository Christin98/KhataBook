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
  User
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-8 h-8 text-brand-600" />
              <span>Expense Splitting Circles</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
              Shared Only
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Split bills with flatmates, trip buddies, & friends without mixing with personal accounts.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-600/30 flex items-center gap-2 active:scale-95 transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Circle</span>
        </button>
      </div>

      {/* Net Splitting Ledger Overview Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center font-bold">
              <ArrowDownLeft className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Total Money You Are Owed</p>
              <p className="text-2xl font-extrabold">{formatCurrency(totalReceive)}</p>
            </div>
          </div>
          <span className="text-xs font-bold bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded-full">
            Receivable
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-900 dark:text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 flex items-center justify-center font-bold">
              <ArrowUpRight className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-rose-700 dark:text-rose-400">Total Money You Owe Others</p>
              <p className="text-2xl font-extrabold">{formatCurrency(totalPay)}</p>
            </div>
          </div>
          <span className="text-xs font-bold bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 px-3 py-1 rounded-full">
            Payable
          </span>
        </div>
      </div>

      {/* Circles Cards Grid */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Active Circles</h2>
        {circles.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-3xl space-y-3">
            <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300">No circles yet</h3>
            <p className="text-xs text-slate-500">
              Start a Goa Plan, 3 BHK Ki Kahani or Kaminey Dost circle.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-md"
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
                  className="glass-panel p-6 rounded-3xl card-hover flex flex-col justify-between space-y-6 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-950 text-2xl flex items-center justify-center border border-brand-200 dark:border-brand-800">
                        {funItem.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                          {circle.name}
                        </h3>
                        <span className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                          {circle.category} • {circle.members.length} Members
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>

                  {/* Members Avatars preview */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center -space-x-2">
                      {circle.members.slice(0, 4).map((m, idx) => (
                        <div
                          key={m.id}
                          className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-white dark:ring-slate-900"
                          title={m.name}
                        >
                          {m.name.charAt(0)}
                        </div>
                      ))}
                      {circle.members.length > 4 && (
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 text-xs font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                          +{circle.members.length - 4}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400">Total Shared</span>
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl z-10 border border-slate-100 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Circle</h3>

            <form onSubmit={handleCreateCircle} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Circle Name</label>
                <input
                  type="text"
                  placeholder="e.g., Goa Trip 2026, 3 BHK Rent & WiFi"
                  value={circleName}
                  onChange={(e) => setCircleName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-semibold text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">
                  Select Fun Category
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 border rounded-2xl">
                  {FUN_CIRCLE_CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat.name}
                      onClick={() => {
                        setSelectedFunCategory(cat.name);
                        if (!circleName) setCircleName(cat.name);
                      }}
                      className={`p-2 rounded-xl text-left text-xs font-medium flex items-center gap-2 transition-all ${
                        selectedFunCategory === cat.name
                          ? 'bg-brand-600 text-white font-bold shadow'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span className="truncate">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Members Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-slate-500">
                    Number of Members (including you)
                  </label>
                  <span className="text-xs font-extrabold text-brand-600 dark:text-brand-400">
                    {memberCount} Members
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleMemberCountChange(memberCount - 1)}
                    disabled={memberCount <= 2}
                    className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 flex items-center justify-center shrink-0"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <div className="flex flex-1 items-center justify-around gap-1">
                    {[2, 3, 4, 5, 6, 8].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleMemberCountChange(num)}
                        className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all ${
                          memberCount === num
                            ? 'bg-brand-600 text-white shadow-md'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleMemberCountChange(memberCount + 1)}
                    disabled={memberCount >= 15}
                    className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 flex items-center justify-center shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Customize Member Names */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">
                  Member Names
                </label>
                <div className="space-y-2 max-h-36 overflow-y-auto p-1">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-800/40 text-xs">
                    <span className="font-bold text-brand-600">Member 1:</span>
                    <span className="font-bold text-slate-900 dark:text-white flex-1 truncate">
                      {user.displayName} (You - Circle Owner)
                    </span>
                  </div>

                  {memberNames.map((name, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-slate-400 w-20 shrink-0">
                        Member {idx + 2}:
                      </span>
                      <input
                        type="text"
                        placeholder={`Member ${idx + 2} Name`}
                        value={name}
                        onChange={(e) => handleMemberNameUpdate(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-md hover:bg-brand-700"
                >
                  Create Circle ({memberCount} Members)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

