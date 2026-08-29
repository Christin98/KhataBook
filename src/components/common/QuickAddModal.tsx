'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, ArrowDownLeft, RefreshCw, Users, Check, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { formatCurrency } from '@/lib/calculations';
import { MAX_SAFE_TRANSACTION_AMOUNT } from '@/lib/moneySafe';

export default function QuickAddModal() {
  const {
    isQuickAddOpen,
    setIsQuickAddOpen,
    accounts,
    circles,
    categories,
    expenseCategories,
    incomeCategories,
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

  const activeCategories = txnType === 'income' ? incomeCategories : expenseCategories;

  const handleTxnTypeChange = (type: 'expense' | 'income' | 'transfer') => {
    setTxnType(type);
    if (type === 'income') {
      if (!incomeCategories.includes(category)) {
        setCategory(incomeCategories[0] || 'Salary');
      }
    } else if (type === 'expense') {
      if (!expenseCategories.includes(category)) {
        setCategory(expenseCategories[0] || 'Food & Dining');
      }
    }
  };

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
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Escape key handler
  useEffect(() => {
    if (!isQuickAddOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsQuickAddOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuickAddOpen, setIsQuickAddOpen]);

  if (!isQuickAddOpen) return null;

  const handleAddNewCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCategoryInput.trim();
    if (trimmed) {
      addCategory(trimmed, txnType === 'income' ? 'income' : 'expense');
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

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setFormError('Please enter a valid amount greater than ₹0.');
      return;
    }
    if (numericAmount > MAX_SAFE_TRANSACTION_AMOUNT) {
      setFormError(`Amount cannot exceed realistic limit of ₹${MAX_SAFE_TRANSACTION_AMOUNT.toLocaleString('en-IN')} (₹10 Crores).`);
      return;
    }

    if (txnType === 'transfer' && accountId === toAccountId) {
      setFormError('Source and destination accounts cannot be the same.');
      return;
    }

    setIsSubmitting(true);
    const finalCategory = txnType === 'transfer' ? 'Self Transfer' : category;

    try {
      await addTransaction({
        userId: user.id,
        type: txnType,
        amount: numericAmount,
        category: finalCategory,
        description: description.trim() || `${finalCategory} (${txnType})`,
        date: date || new Date().toISOString().split('T')[0],
        accountId: accountId || accounts[0]?.id,
        toAccountId: txnType === 'transfer' ? toAccountId : undefined,
        paymentMethod: 'UPI / Direct'
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsSubmitting(false);
        setAmount('');
        setDescription('');
        setIsQuickAddOpen(false);
      }, 500);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to record transaction.');
      setIsSubmitting(false);
    }
  };

  const handleSaveCircleExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const numericAmount = parseFloat(circleAmount);
    if (isNaN(numericAmount) || numericAmount <= 0 || !activeCircle) {
      setFormError('Please enter a valid expense amount greater than ₹0.');
      return;
    }
    if (numericAmount > MAX_SAFE_TRANSACTION_AMOUNT) {
      setFormError(`Expense amount cannot exceed realistic limit of ₹${MAX_SAFE_TRANSACTION_AMOUNT.toLocaleString('en-IN')} (₹10 Crores).`);
      return;
    }

    const targetMembers = circleSplitMode === 'all'
      ? activeCircle.members
      : activeCircle.members.filter((m) => selectedCircleMemberIds.includes(m.id));

    if (targetMembers.length === 0) {
      setFormError('Please select at least 1 member to split this expense with.');
      return;
    }

    setIsSubmitting(true);
    const paidMember = activeCircle.members.find((m) => m.id === circlePaidById) || activeCircle.members[0];
    const equalShare = numericAmount / targetMembers.length;

    const splits = targetMembers.map((m) => ({
      userId: m.id,
      userName: m.name,
      amount: Math.round(equalShare * 100) / 100
    }));

    try {
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
        setIsSubmitting(false);
        setCircleAmount('');
        setCircleTitle('');
        setCircleSplitMode('all');
        setIsQuickAddOpen(false);
      }, 500);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to record circle expense.');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-add-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
    >
      {/* Frosted Scrim Backdrop */}
      <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md" onClick={() => setIsQuickAddOpen(false)} />

      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto glass-panel bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-7 z-10 space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-2">
            <h3 id="quick-add-modal-title" className="text-lg font-black text-slate-900 dark:text-white">
              Fast Entry
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/15 text-brand-700 dark:text-brand-300 font-extrabold border border-brand-500/25">
              Sub-10s UX
            </span>
          </div>
          <button
            onClick={() => setIsQuickAddOpen(false)}
            aria-label="Close fast entry dialog"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inline Error Alert */}
        {formError && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Mode Selector Tabs (Personal vs Circle) */}
        <div className="grid grid-cols-2 gap-2 p-1.5 glass-subtle rounded-xl">
          <button
            onClick={() => setActiveTab('personal')}
            className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
              activeTab === 'personal'
                ? 'bg-white dark:bg-slate-800 text-brand-700 dark:text-brand-300 shadow-md border border-white/20'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Personal Txn
          </button>
          <button
            onClick={() => setActiveTab('circle')}
            className={`py-2 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'circle'
                ? 'bg-white dark:bg-slate-800 text-brand-700 dark:text-brand-300 shadow-md border border-white/20'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Circle Split</span>
          </button>
        </div>

        {isSuccess ? (
          <div className="py-14 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-lg animate-bounce">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="font-black text-xl text-slate-900 dark:text-white">Transaction Recorded!</h4>
            <p className="text-xs text-slate-400 font-medium">Ledger balances updated seamlessly.</p>
          </div>
        ) : activeTab === 'personal' ? (
          <form onSubmit={handleSavePersonal} className="space-y-4">
            {/* Transaction Type Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTxnTypeChange('expense')}
                className={`py-2.5 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-black transition-all cursor-pointer ${
                  txnType === 'expense'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'glass-subtle text-slate-600 dark:text-slate-400'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                Expense
              </button>
              <button
                type="button"
                onClick={() => handleTxnTypeChange('income')}
                className={`py-2.5 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-black transition-all cursor-pointer ${
                  txnType === 'income'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'glass-subtle text-slate-600 dark:text-slate-400'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                Income
              </button>
              <button
                type="button"
                onClick={() => handleTxnTypeChange('transfer')}
                className={`py-2.5 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-black transition-all cursor-pointer ${
                  txnType === 'transfer'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'glass-subtle text-slate-600 dark:text-slate-400'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Transfer
              </button>
            </div>

            {/* Big Amount Input */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={MAX_SAFE_TRANSACTION_AMOUNT}
                  autoFocus
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 glass-input rounded-2xl text-2xl font-black text-slate-900 dark:text-white focus:outline-none ${
                    parseFloat(amount) > MAX_SAFE_TRANSACTION_AMOUNT ? 'border-rose-500 ring-1 ring-rose-500' : ''
                  }`}
                  required
                />
              </div>
              {parseFloat(amount) > MAX_SAFE_TRANSACTION_AMOUNT && (
                <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1 mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Amount cannot exceed ₹10 Crores (₹{MAX_SAFE_TRANSACTION_AMOUNT.toLocaleString('en-IN')}).</span>
                </p>
              )}
            </div>

            {txnType === 'transfer' ? (
              <div className="grid grid-cols-2 gap-3">
                {/* From Account */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">From Account</label>
                  <select
                    value={accountId}
                    onChange={(e) => handleFromAccountChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
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
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">To Account</label>
                  <select
                    value={toAccountId}
                    onChange={(e) => setToAccountId(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Category</label>
                    {!isAddingCategory && (
                      <button
                        type="button"
                        onClick={() => setIsAddingCategory(true)}
                        className="text-[11px] font-extrabold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
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
                        placeholder="Category"
                        value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddNewCategory();
                          }
                        }}
                        className="w-full px-2.5 py-2 glass-input border-brand-500 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddNewCategory}
                        className="px-2 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingCategory(false)}
                        className="px-1.5 py-2 text-slate-400 hover:text-slate-600 shrink-0 cursor-pointer"
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
                      className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                    >
                      {activeCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="__NEW_CATEGORY__">+ Add Custom...</option>
                    </select>
                  )}
                </div>

                {/* Account Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Account</label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
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
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Description (Optional)</label>
              <input
                type="text"
                placeholder="e.g., Dinner at Social, Uber, Groceries"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            {/* Save Action */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white font-bold text-sm shadow-md shadow-brand-500/20 transition-all active:scale-98 disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Entry...</span>
                </>
              ) : (
                <span>Save Transaction</span>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSaveCircleExpense} className="space-y-4">
            {/* Circle Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Select Circle</label>
              <select
                value={selectedCircleId}
                onChange={(e) => setSelectedCircleId(e.target.value)}
                className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
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
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Expense Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={MAX_SAFE_TRANSACTION_AMOUNT}
                  placeholder="0.00"
                  value={circleAmount}
                  onChange={(e) => setCircleAmount(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 glass-input rounded-2xl text-2xl font-black text-slate-900 dark:text-white focus:outline-none ${
                    parseFloat(circleAmount) > MAX_SAFE_TRANSACTION_AMOUNT ? 'border-rose-500 ring-1 ring-rose-500' : ''
                  }`}
                  required
                />
              </div>
              {parseFloat(circleAmount) > MAX_SAFE_TRANSACTION_AMOUNT && (
                <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1 mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Expense cannot exceed ₹10 Crores (₹{MAX_SAFE_TRANSACTION_AMOUNT.toLocaleString('en-IN')}).</span>
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Expense Title</label>
              <input
                type="text"
                placeholder="e.g., Dinner bill, Petrol, Airbnb stay"
                value={circleTitle}
                onChange={(e) => setCircleTitle(e.target.value)}
                className="w-full px-4 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                required
              />
            </div>

            {/* Paid By */}
            {activeCircle && (
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Paid By</label>
                <select
                  value={circlePaidById}
                  onChange={(e) => setCirclePaidById(e.target.value)}
                  className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                >
                  {activeCircle.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Split Between */}
            {activeCircle && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Split Between</label>
                  <span className="text-[11px] font-extrabold text-brand-600 dark:text-brand-400">
                    {circleSplitMode === 'all' ? activeCircle.members.length : selectedCircleMemberIds.length} of {activeCircle.members.length} members
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 p-1 glass-subtle rounded-xl mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCircleSplitMode('all');
                      setSelectedCircleMemberIds(activeCircle.members.map((m) => m.id));
                    }}
                    className={`py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      circleSplitMode === 'all'
                        ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-300 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    All ({activeCircle.members.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCircleSplitMode('custom')}
                    className={`py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      circleSplitMode === 'custom'
                        ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-300 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Select Specific
                  </button>
                </div>

                {circleSplitMode === 'custom' && (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto p-1.5 rounded-2xl glass-subtle">
                    {activeCircle.members.map((m) => {
                      const isSelected = selectedCircleMemberIds.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => toggleCircleMemberSelection(m.id)}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-brand-500/15 border border-brand-500/30 text-brand-700 dark:text-brand-300'
                              : 'bg-white/40 dark:bg-slate-800/40 text-slate-500 opacity-60'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className={`w-4 h-4 rounded-md flex items-center justify-center ${
                              isSelected ? 'bg-brand-600 text-white font-black' : 'border border-slate-300'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </span>
                            {m.name}
                          </span>
                          {isSelected && parseFloat(circleAmount) > 0 && selectedCircleMemberIds.length > 0 && (
                            <span className="text-xs text-brand-600 dark:text-brand-400 font-black">
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
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white font-bold text-sm shadow-md shadow-brand-500/20 transition-all active:scale-98 disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Splitting Expense...</span>
                </>
              ) : circleSplitMode === 'all' ? (
                `Split Equally (${activeCircle?.members.length || 0} Members)`
              ) : (
                `Split Among ${selectedCircleMemberIds.length} Selected`
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
