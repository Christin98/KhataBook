'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Plus,
  Share2,
  ArrowLeft,
  CheckCircle2,
  Receipt,
  DollarSign,
  UserPlus,
  Check,
  Zap,
  Sparkles,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  CreditCard
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useData } from '@/context/DataContext';
import { formatCurrency, calculateCircleNetBalances } from '@/lib/calculations';
import { FUN_CIRCLE_CATEGORIES } from '@/lib/sampleData';
import { APP_INFO } from '@/lib/constants';

export default function CircleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const circleId = params.id as string;

  const {
    circles,
    circleExpenses,
    settlements,
    addCircleExpense,
    addSettlement,
    accounts,
    addTransaction,
    user,
    isDevMode
  } = useData();

  const circle = circles.find((c) => c.id === circleId);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSettleOpen, setIsSettleOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Add Expense State
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [paidByUserId, setPaidByUserId] = useState(user.id);
  const [splitType, setSplitType] = useState<'equal' | 'exact' | 'percentage' | 'shares'>('equal');
  const [splitMode, setSplitMode] = useState<'all' | 'custom'>('all');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [recordPersonalTxn, setRecordPersonalTxn] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');

  useEffect(() => {
    if (circle) {
      setSelectedMemberIds(circle.members.map((m) => m.id));
      const userMember = circle.members.find(
        (m) =>
          m.id === user.id ||
          m.userId === user.id ||
          m.role === 'owner' ||
          m.name.toLowerCase().includes('(you)')
      );
      if (userMember) {
        setPaidByUserId(userMember.id);
      }
    }
  }, [circle, user.id]);

  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  // Settlement Form State
  const [settlePayerId, setSettlePayerId] = useState('');
  const [settlePayeeId, setSettlePayeeId] = useState('');
  const [settleAmount, setSettleAmount] = useState('');
  const [recordSettlePersonalTxn, setRecordSettlePersonalTxn] = useState(true);
  const [settleAccountId, setSettleAccountId] = useState(accounts[0]?.id || '');

  useEffect(() => {
    if (accounts.length > 0 && !settleAccountId) {
      setSettleAccountId(accounts[0].id);
    }
  }, [accounts, settleAccountId]);

  const isUserMember = (memberId: string) => {
    if (!circle || !memberId) return false;
    const m = circle.members.find((mem) => mem.id === memberId);
    if (!m) return false;
    return (
      m.id === user.id ||
      m.userId === user.id ||
      m.role === 'owner' ||
      m.name.toLowerCase().includes('(you)') ||
      (user.displayName && m.name.toLowerCase().includes(user.displayName.toLowerCase()))
    );
  };

  if (!circle) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">Circle Not Found</h2>
        <Link href="/circles" className="text-brand-600 font-bold text-sm">
          ← Return to Circles
        </Link>
      </div>
    );
  }

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  // Calculate live net balances & simplified debt engine ("Who owes whom")
  const { netBalances, simplifiedDebts } = calculateCircleNetBalances(circleId, circleExpenses, settlements);
  const thisCircleExpenses = circleExpenses.filter((e) => e.circleId === circleId);
  const thisCircleSettlements = settlements.filter((s) => s.circleId === circleId);

  const funItem = FUN_CIRCLE_CATEGORIES.find((f) => f.name === circle.category) || FUN_CIRCLE_CATEGORIES[0];

  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}/circles/join?code=${circle.inviteCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(expenseAmount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    const targetMembers = splitMode === 'all'
      ? circle.members
      : circle.members.filter((m) => selectedMemberIds.includes(m.id));

    if (targetMembers.length === 0) {
      alert('Please select at least 1 member to split this expense with.');
      return;
    }

    const paidMember = circle.members.find((m) => m.id === paidByUserId) || circle.members[0];
    const equalShare = numAmount / targetMembers.length;

    const splits = targetMembers.map((m) => ({
      userId: m.id,
      userName: m.name,
      amount: Math.round(equalShare * 100) / 100
    }));

    addCircleExpense({
      circleId: circle.id,
      title: expenseTitle || 'Group Expense',
      amount: numAmount,
      paidByUserId: paidMember.id,
      paidByUserName: paidMember.name,
      date: new Date().toISOString().split('T')[0],
      category: 'General',
      splitType,
      splits
    });

    // Auto-record personal transaction and debit account if paid by current user
    if (isUserMember(paidMember.id) && recordPersonalTxn && selectedAccountId) {
      addTransaction({
        userId: user.id,
        type: 'expense',
        amount: numAmount,
        category: 'Circles & Friends',
        description: `[${circle.name}] ${expenseTitle || 'Group Expense'}`,
        date: new Date().toISOString().split('T')[0],
        accountId: selectedAccountId,
        notes: `Paid ₹${numAmount} for circle "${circle.name}" (${circle.category})`
      });
    }

    setIsAddExpenseOpen(false);
    setExpenseTitle('');
    setExpenseAmount('');
    setSplitMode('all');
    setSelectedMemberIds(circle.members.map((m) => m.id));
  };

  const handleRecordSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(settleAmount);
    if (isNaN(numAmount) || numAmount <= 0 || !settlePayerId || !settlePayeeId) return;

    const payer = circle.members.find((m) => m.id === settlePayerId);
    const payee = circle.members.find((m) => m.id === settlePayeeId);

    if (!payer || !payee) return;

    addSettlement({
      circleId: circle.id,
      payerId: payer.id,
      payerName: payer.name,
      payeeId: payee.id,
      payeeName: payee.name,
      amount: numAmount,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      notes: 'Recorded Settlement'
    });

    // Auto-record personal transaction if user is payer (debit) or payee (credit)
    if (recordSettlePersonalTxn && settleAccountId) {
      if (isUserMember(payer.id)) {
        // User paid someone to settle debt -> Expense transaction
        addTransaction({
          userId: user.id,
          type: 'expense',
          amount: numAmount,
          category: 'Settlement',
          description: `[${circle.name}] Settled with ${payee.name}`,
          date: new Date().toISOString().split('T')[0],
          accountId: settleAccountId,
          notes: `Settlement payment to ${payee.name} in circle "${circle.name}"`
        });
      } else if (isUserMember(payee.id)) {
        // Someone paid the user -> Income transaction
        addTransaction({
          userId: user.id,
          type: 'income',
          amount: numAmount,
          category: 'Settlement',
          description: `[${circle.name}] Received from ${payer.name}`,
          date: new Date().toISOString().split('T')[0],
          accountId: settleAccountId,
          notes: `Settlement received from ${payer.name} in circle "${circle.name}"`
        });
      }
    }

    // Celebratory confetti animation on settlement!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setIsSettleOpen(false);
    setSettleAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <Link href="/circles" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-brand-600">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Circles</span>
      </Link>

      {/* Circle Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur text-3xl flex items-center justify-center border border-white/20">
            {funItem.icon}
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-500/20 text-brand-300 border border-brand-400/30">
              {circle.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">{circle.name}</h1>
            <p className="text-xs text-brand-200 mt-0.5">
              {circle.members.length} Members • Created {circle.createdAt.substring(0, 10)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            disabled={!APP_INFO.isBeta && !APP_INFO.isDev && !isDevMode}
            onClick={handleCopyInvite}
            className={`px-4 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 border transition-all ${
              !APP_INFO.isBeta && !APP_INFO.isDev && !isDevMode
                ? 'bg-white/5 border-white/10 opacity-75 cursor-not-allowed text-white/70'
                : 'bg-white/10 hover:bg-white/20 border-white/20 active:scale-95'
            }`}
            title={!APP_INFO.isBeta && !APP_INFO.isDev && !isDevMode ? 'Invite links coming in v0.5.0' : 'Copy circle invite link'}
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedLink ? 'Link Copied!' : 'Invite Friends'}</span>
            {!APP_INFO.isBeta && !APP_INFO.isDev && !isDevMode && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Soon
              </span>
            )}
          </button>
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-lg shadow-brand-500/30 flex items-center gap-2 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Circle Expense</span>
          </button>
        </div>
      </div>

      {/* 2. DEBT MINIMIZER / WHO OWES WHOM BANNER */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span>Simplified Settlement Ledger ("Who Owes Whom")</span>
          </h2>
          <button
            onClick={() => setIsSettleOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
          >
            Record Settlement
          </button>
        </div>

        {simplifiedDebts.length === 0 ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold text-center">
            🎉 All settled up! No outstanding debts in this circle.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {simplifiedDebts.map((debt, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    <span className="text-rose-600">{debt.fromMemberName}</span> owes{' '}
                    <span className="text-emerald-600">{debt.toMemberName}</span>
                  </p>
                  <p className="text-xs font-extrabold text-brand-600 mt-1">
                    {formatCurrency(debt.amount)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSettlePayerId(debt.fromMemberId);
                    setSettlePayeeId(debt.toMemberId);
                    setSettleAmount(debt.amount.toString());
                    setIsSettleOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-[11px] font-bold hover:bg-brand-600 hover:text-white transition-colors"
                >
                  Settle
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. EXPENSES FEED & SETTLEMENT HISTORY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expenses List */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Shared Expenses</h3>
          {thisCircleExpenses.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No expenses recorded yet. Click "+ Add Circle Expense" to split dinner or trip bills.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {thisCircleExpenses.map((exp) => (
                <div key={exp.id} className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{exp.title}</h4>
                    <p className="text-xs text-slate-500">
                      Paid by <span className="font-bold text-brand-600">{exp.paidByUserName}</span> • {exp.date}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {exp.splits.map((s, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {s.userName}: ₹{s.amount}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-base text-slate-900 dark:text-white">
                      {formatCurrency(exp.amount)}
                    </span>
                    <p className="text-[10px] text-slate-400 capitalize">{exp.splitType} Split</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settlement History Log */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Settlement History</h3>
          {thisCircleSettlements.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">No settlements recorded yet.</div>
          ) : (
            <div className="space-y-3">
              {thisCircleSettlements.map((set) => (
                <div key={set.id} className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 text-xs">
                  <p className="font-bold text-emerald-800 dark:text-emerald-300">
                    {set.payerName} paid {set.payeeName}
                  </p>
                  <p className="font-extrabold text-emerald-600 text-sm mt-0.5">{formatCurrency(set.amount)}</p>
                  <p className="text-[10px] text-emerald-600/70 mt-0.5">{set.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal 1: Add Circle Expense */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddExpenseOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl z-10 border border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Circle Expense</h3>

            <form onSubmit={handleCreateExpense} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Expense Title</label>
                <input
                  type="text"
                  placeholder="e.g. Dinner bill, Airbnb booking"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-lg font-bold text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Paid By</label>
                <select
                  value={paidByUserId}
                  onChange={(e) => setPaidByUserId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                >
                  {circle.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Personal Account Debit Integration */}
              {isUserMember(paidByUserId) && (
                <div className="p-3.5 rounded-2xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-bold text-brand-900 dark:text-brand-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={recordPersonalTxn}
                        onChange={(e) => setRecordPersonalTxn(e.target.checked)}
                        className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                      />
                      <span>Debit from My Personal Account</span>
                    </label>
                    <span className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold uppercase">Auto-Ledger</span>
                  </div>
                  {recordPersonalTxn && accounts.length > 0 && (
                    <div className="space-y-1">
                      <select
                        value={selectedAccountId}
                        onChange={(e) => setSelectedAccountId(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        {accounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name} ({acc.type.toUpperCase()}) • ₹{acc.currentBalance.toLocaleString('en-IN')}
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        ₹{expenseAmount || 0} will be debited from this account and logged under personal transactions.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Split Between: All vs Specific Members */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-500">Split Between</label>
                  <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400">
                    {splitMode === 'all' ? circle.members.length : selectedMemberIds.length} of {circle.members.length} members
                  </span>
                </div>

                {/* Mode Switcher */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSplitMode('all');
                      setSelectedMemberIds(circle.members.map((m) => m.id));
                    }}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      splitMode === 'all'
                        ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    All Members ({circle.members.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitMode('custom')}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      splitMode === 'custom'
                        ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    Select Specific
                  </button>
                </div>

                {/* Specific Member Checkboxes */}
                {splitMode === 'custom' && (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto p-1.5 border rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                    {circle.members.map((m) => {
                      const isSelected = selectedMemberIds.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => toggleMemberSelection(m.id)}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-brand-500/10 border border-brand-500/30 text-brand-700 dark:text-brand-300 font-bold'
                              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 opacity-60'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                              isSelected ? 'bg-brand-600 text-white font-extrabold' : 'border border-slate-300'
                            }`}>
                              {isSelected ? '✓' : ''}
                            </span>
                            {m.name}
                          </span>
                          {isSelected && parseFloat(expenseAmount) > 0 && selectedMemberIds.length > 0 && (
                            <span className="text-[11px] text-brand-600 dark:text-brand-400 font-extrabold">
                              {formatCurrency(parseFloat(expenseAmount) / selectedMemberIds.length)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsAddExpenseOpen(false)} className="flex-1 py-2.5 rounded-xl border text-xs font-bold">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-md">
                  Save & Split
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Record Settlement */}
      {isSettleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsSettleOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl z-10 border border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Record Settlement</h3>

            <form onSubmit={handleRecordSettlement} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Who Paid?</label>
                <select
                  value={settlePayerId}
                  onChange={(e) => setSettlePayerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium"
                  required
                >
                  <option value="">Select Payer</option>
                  {circle.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Who Received?</label>
                <select
                  value={settlePayeeId}
                  onChange={(e) => setSettlePayeeId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium"
                  required
                >
                  <option value="">Select Payee</option>
                  {circle.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Settlement Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-lg font-bold text-slate-900 dark:text-white"
                  required
                />
              </div>

              {/* Personal Ledger Sync for Settlement */}
              {isUserMember(settlePayerId) && (
                <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-rose-900 dark:text-rose-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={recordSettlePersonalTxn}
                      onChange={(e) => setRecordSettlePersonalTxn(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                    />
                    <span>Debit ₹{settleAmount || 0} from My Account (Expense)</span>
                  </label>
                  {recordSettlePersonalTxn && accounts.length > 0 && (
                    <select
                      value={settleAccountId}
                      onChange={(e) => setSettleAccountId(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                    >
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} • ₹{acc.currentBalance.toLocaleString('en-IN')}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {isUserMember(settlePayeeId) && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={recordSettlePersonalTxn}
                      onChange={(e) => setRecordSettlePersonalTxn(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>Deposit ₹{settleAmount || 0} into My Account (Income)</span>
                  </label>
                  {recordSettlePersonalTxn && accounts.length > 0 && (
                    <select
                      value={settleAccountId}
                      onChange={(e) => setSettleAccountId(e.target.value)}
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
              )}

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsSettleOpen(false)} className="flex-1 py-2.5 rounded-xl border text-xs font-bold">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md">
                  Complete Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

