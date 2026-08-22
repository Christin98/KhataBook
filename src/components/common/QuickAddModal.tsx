'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, ArrowDownLeft, RefreshCw, Users, Check, Sparkles } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { formatCurrency } from '@/lib/calculations';

export default function QuickAddModal() {
  const {
    isQuickAddOpen,
    setIsQuickAddOpen,
    accounts,
    circles,
    categories,
    addCategory,
    addTransaction,
    addCircleExpense,
    user
  } = useData();

  const [activeTab, setActiveTab] = useState<'personal' | 'circle'>('personal');
  const [txnType, setTxnType] = useState<'expense' | 'income' | 'transfer'>('expense');

  // Personal Txn Form
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Food & Dining');
  const [description, setDescription] = useState<string>('');
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState<string>(accounts[1]?.id || '');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Custom Category State
  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);
  const [newCategoryInput, setNewCategoryInput] = useState<string>('');

  // Circle Txn Form
  const [selectedCircleId, setSelectedCircleId] = useState<string>(circles[0]?.id || '');
  const [circleTitle, setCircleTitle] = useState<string>('');
  const [circleAmount, setCircleAmount] = useState<string>('');
  const [circleCategory, setCircleCategory] = useState<string>('Food');
  const [circleSplitType, setCircleSplitType] = useState<'equal' | 'exact'>('equal');
  const [circlePaidById, setCirclePaidById] = useState<string>(user.id);
  const [circleSplitMode, setCircleSplitMode] = useState<'all' | 'custom'>('all');
  const [selectedCircleMemberIds, setSelectedCircleMemberIds] = useState<string[]>([]);

  const activeCircle = circles.find((c) => c.id === selectedCircleId) || circles[0];

  useEffect(() => {
    if (activeCircle) {
      setSelectedCircleMemberIds(activeCircle.members.map((m) => m.id));
    }
  }, [selectedCircleId, circles]);

  const toggleCircleMemberSelection = (memberId: string) => {
    setSelectedCircleMemberIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isQuickAddOpen) return null;

  const handleAddNewCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCategoryInput.trim();
    if (trimmed) {
      addCategory(trimmed);
      setCategory(trimmed);
      setNewCategoryInput('');
      setIsAddingCategory(false);
    }
  };

  const handleFromAccountChange = (newFromId: string) => {
    setAccountId(newFromId);
    if (toAccountId === newFromId) {
      const differentAcc = accounts.find((a) => a.id !== newFromId);
      if (differentAcc) {
        setToAccountId(differentAcc.id);
      }
    }
  };

  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;

    if (txnType === 'transfer' && accountId === toAccountId) {
      alert('Source and destination accounts cannot be the same.');
      return;
    }

    const finalCategory = txnType === 'transfer' ? 'Self Transfer' : category;

    addTransaction({
      userId: user.id,
      type: txnType,
      amount: numericAmount,
      category: finalCategory,
      description: description || `${finalCategory} (${txnType})`,
      date: date || new Date().toISOString().split('T')[0],
      accountId: accountId || accounts[0]?.id,
      toAccountId: txnType === 'transfer' ? toAccountId : undefined,
      paymentMethod: 'UPI / Direct'
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setAmount('');
      setDescription('');
      setIsQuickAddOpen(false);
    }, 600);
  };

  const handleSaveCircleExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(circleAmount);
    if (isNaN(numericAmount) || numericAmount <= 0 || !activeCircle) return;

    const targetMembers = circleSplitMode === 'all'
      ? activeCircle.members
      : activeCircle.members.filter((m) => selectedCircleMemberIds.includes(m.id));

    if (targetMembers.length === 0) {
      alert('Please select at least 1 member to split this expense with.');
      return;
    }

    const paidMember = activeCircle.members.find((m) => m.id === circlePaidById) || activeCircle.members[0];
    const equalShare = numericAmount / targetMembers.length;

    const splits = targetMembers.map((m) => ({
      userId: m.id,
      userName: m.name,
      amount: Math.round(equalShare * 100) / 100
    }));

    addCircleExpense({
      circleId: activeCircle.id,
      title: circleTitle || 'Shared Expense',
      amount: numericAmount,
      paidByUserId: paidMember.id,
      paidByUserName: paidMember.name,
      date: new Date().toISOString().split('T')[0],
      category: circleCategory,
      splitType: circleSplitType,
      splits
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setCircleAmount('');
      setCircleTitle('');
      setCircleSplitMode('all');
      setIsQuickAddOpen(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsQuickAddOpen(false)} />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 overflow-hidden z-10">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Fast Entry</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-medium">
              Sub-10s UX
            </span>
          </div>
          <button
            onClick={() => setIsQuickAddOpen(false)}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs (Personal vs Circle) */}
        <div className="grid grid-cols-2 gap-2 mt-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('personal')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'personal'
                ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Personal Txn
          </button>
          <button
            onClick={() => setActiveTab('circle')}
            className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'circle'
                ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Circle Split</span>
          </button>
        </div>

        {isSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-bounce">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white">Transaction Recorded!</h4>
            <p className="text-xs text-slate-500">Balances updated seamlessly.</p>
          </div>
        ) : activeTab === 'personal' ? (
          <form onSubmit={handleSavePersonal} className="mt-4 space-y-4">
            {/* Transaction Type Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTxnType('expense')}
                className={`py-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold transition-all ${
                  txnType === 'expense'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-rose-500" />
                Expense
              </button>
              <button
                type="button"
                onClick={() => setTxnType('income')}
                className={`py-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold transition-all ${
                  txnType === 'income'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                Income
              </button>
              <button
                type="button"
                onClick={() => setTxnType('transfer')}
                className={`py-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold transition-all ${
                  txnType === 'transfer'
                    ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-300 dark:border-brand-800 text-brand-700 dark:text-brand-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 text-brand-600" />
                Transfer
              </button>
            </div>

            {/* Big Amount Input */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  step="0.01"
                  autoFocus
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>
            </div>

            {txnType === 'transfer' ? (
              <div className="grid grid-cols-2 gap-3">
                {/* From Account */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">From Account</label>
                  <select
                    value={accountId}
                    onChange={(e) => handleFromAccountChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} (₹{acc.currentBalance})
                      </option>
                    ))}
                  </select>
                </div>

                {/* To Account */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">To Account</label>
                  <select
                    value={toAccountId}
                    onChange={(e) => setToAccountId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                  >
                    {accounts
                      .filter((acc) => acc.id !== accountId)
                      .map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {/* Category */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-500">Category</label>
                    {!isAddingCategory && (
                      <button
                        type="button"
                        onClick={() => setIsAddingCategory(true)}
                        className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline"
                      >
                        + New
                      </button>
                    )}
                  </div>

                  {isAddingCategory ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Category Name"
                        value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddNewCategory();
                          }
                        }}
                        className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-brand-500 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddNewCategory}
                        className="px-2 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold shrink-0"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingCategory(false)}
                        className="px-1.5 py-2 text-slate-400 hover:text-slate-600 shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <select
                      value={category}
                      onChange={(e) => {
                        if (e.target.value === '__NEW_CATEGORY__') {
                          setIsAddingCategory(true);
                        } else {
                          setCategory(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="__NEW_CATEGORY__">+ Add Custom Category...</option>
                    </select>
                  )}
                </div>

                {/* Account Selection */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Account</label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} (₹{acc.currentBalance})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Description (Optional)</label>
              <input
                type="text"
                placeholder="e.g., Dinner at Social, Uber Ride"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Save Action */}
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base shadow-lg shadow-brand-600/30 transition-all active:scale-95"
            >
              Save Transaction
            </button>
          </form>
        ) : (
          <form onSubmit={handleSaveCircleExpense} className="mt-4 space-y-4">
            {/* Circle Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Select Circle</label>
              <select
                value={selectedCircleId}
                onChange={(e) => setSelectedCircleId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white"
              >
                {circles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.members.length} members)
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Expense Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={circleAmount}
                  onChange={(e) => setCircleAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-2xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Expense Title</label>
              <input
                type="text"
                placeholder="e.g., Dinner bill, Petrol, Airbnb advance"
                value={circleTitle}
                onChange={(e) => setCircleTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                required
              />
            </div>

            {/* Paid By */}
            {activeCircle && (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Paid By</label>
                <select
                  value={circlePaidById}
                  onChange={(e) => setCirclePaidById(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white"
                >
                  {activeCircle.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Split Between: All vs Specific Members */}
            {activeCircle && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-500">Split Between</label>
                  <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400">
                    {circleSplitMode === 'all' ? activeCircle.members.length : selectedCircleMemberIds.length} of {activeCircle.members.length} members
                  </span>
                </div>

                {/* Mode Switcher */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCircleSplitMode('all');
                      setSelectedCircleMemberIds(activeCircle.members.map((m) => m.id));
                    }}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      circleSplitMode === 'all'
                        ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    All Members ({activeCircle.members.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCircleSplitMode('custom')}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      circleSplitMode === 'custom'
                        ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    Select Specific
                  </button>
                </div>

                {/* Specific Member Checkboxes */}
                {circleSplitMode === 'custom' && (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto p-1.5 border rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                    {activeCircle.members.map((m) => {
                      const isSelected = selectedCircleMemberIds.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => toggleCircleMemberSelection(m.id)}
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
                          {isSelected && parseFloat(circleAmount) > 0 && selectedCircleMemberIds.length > 0 && (
                            <span className="text-[11px] text-brand-600 dark:text-brand-400 font-extrabold">
                              {formatCurrency(parseFloat(circleAmount) / selectedCircleMemberIds.length)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base shadow-lg shadow-brand-600/30 transition-all active:scale-95"
            >
              {circleSplitMode === 'all'
                ? `Split Equally (${activeCircle?.members.length || 0} Members)`
                : `Split Among ${selectedCircleMemberIds.length} Selected`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
