'use client';

import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Trash2,
  Calendar,
  Building2,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { formatCurrency } from '@/lib/calculations';
import { TransactionType } from '@/lib/types';

export default function TransactionsPage() {
  const {
    transactions,
    accounts,
    categories,
    expenseCategories,
    incomeCategories,
    addCategory,
    addTransaction,
    deleteTransaction,
    user,
    setIsQuickAddOpen
  } = useData();

  const [activeTab, setActiveTab] = useState<'all' | 'expense' | 'income' | 'transfer'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // New Transaction Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formType, setFormType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [description, setDescription] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notes, setNotes] = useState('');

  // Custom Category State
  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);
  const [newCategoryInput, setNewCategoryInput] = useState<string>('');

  const activeCategories = formType === 'income' ? incomeCategories : expenseCategories;

  const handleFormTypeChange = (type: TransactionType) => {
    setFormType(type);
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

  const handleAddNewCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCategoryInput.trim();
    if (trimmed) {
      addCategory(trimmed, formType === 'income' ? 'income' : 'expense');
      setCategory(trimmed);
      setNewCategoryInput('');
      setIsAddingCategory(false);
    }
  };

  // Filter transactions logic
  const filteredTransactions = transactions.filter((t) => {
    if (activeTab !== 'all' && t.type !== activeTab) return false;
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (selectedAccount !== 'all' && t.accountId !== selectedAccount) return false;
    if (
      searchTerm &&
      !t.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !t.category.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleFromAccountChange = (newFromId: string) => {
    setAccountId(newFromId);
    if (toAccountId === newFromId) {
      const differentAcc = accounts.find((a) => a.id !== newFromId);
      if (differentAcc) {
        setToAccountId(differentAcc.id);
      }
    }
  };

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    if (formType === 'transfer' && accountId === toAccountId) {
      alert('Source and destination accounts cannot be the same.');
      return;
    }

    const finalCategory = formType === 'transfer' ? 'Self Transfer' : category;

    addTransaction({
      userId: user.id,
      type: formType,
      amount: numAmount,
      category: finalCategory,
      description: description || `${finalCategory} (${formType})`,
      date,
      accountId: accountId || accounts[0]?.id,
      toAccountId: formType === 'transfer' ? toAccountId : undefined,
      paymentMethod,
      notes
    });

    setIsAddModalOpen(false);
    setAmount('');
    setDescription('');
    setNotes('');
  };

  const getAccountName = (id: string) => {
    return accounts.find((a) => a.id === id)?.name || 'Account';
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20 mb-2">
            <Receipt className="w-3.5 h-3.5" />
            <span>Complete Ledger History</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Personal Transactions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Real-time ledger audit log. Self-transfers do not calculate as expenses.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 flex items-center gap-2 active:scale-95 transition-all self-start sm:self-center border border-white/20 glass-shimmer cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Transaction</span>
        </button>
      </div>

      {/* Segmented Type Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/50 dark:border-white/10 pb-3 overflow-x-auto">
        {(['all', 'expense', 'income', 'transfer'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold capitalize transition-all shrink-0 cursor-pointer ${
              activeTab === tab
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 border border-white/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60'
            }`}
          >
            {tab === 'all' ? 'All Activities' : tab}
          </button>
        ))}
      </div>

      {/* Filter Controls Bar */}
      <div className="glass-card p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row items-center gap-3.5 shadow-xl">
        {/* Search Input */}
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-brand-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search description, merchant, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 glass-input rounded-2xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        {/* Category Select */}
        <div className="w-full sm:w-52">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Account Select */}
        <div className="w-full sm:w-52">
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="all">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="glass-card rounded-3xl overflow-hidden divide-y divide-slate-200/50 dark:divide-white/5 shadow-2xl">
        {filteredTransactions.length === 0 ? (
          <div className="py-20 text-center text-slate-400 space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-brand-500/10 text-brand-500 mx-auto flex items-center justify-center border border-brand-500/20 shadow-inner">
              <Receipt className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-base">No transactions found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
              No matching records found for the selected filter or search query.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/25 cursor-pointer"
            >
              + Record Expense
            </button>
          </div>
        ) : (
          filteredTransactions.map((t) => (
            <div
              key={t.id}
              className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 shadow-inner ${
                    t.type === 'income'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : t.type === 'transfer'
                      ? 'bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-500/30'
                      : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {t.type === 'income' ? (
                    <ArrowDownLeft className="w-5 h-5" />
                  ) : t.type === 'transfer' ? (
                    <RefreshCw className="w-5 h-5" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{t.description}</h4>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1 font-medium">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-200/50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-300/40 dark:border-white/5">
                      {t.category}
                    </span>
                    <span>•</span>
                    <span>{getAccountName(t.accountId)}</span>
                    {t.toAccountId && (
                      <>
                        <span className="text-brand-500">➔</span>
                        <span>{getAccountName(t.toAccountId)}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>{t.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div
                    className={`font-black text-base ${
                      t.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : t.type === 'transfer'
                        ? 'text-brand-600 dark:text-brand-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {t.type === 'income' ? '+' : t.type === 'transfer' ? '' : '-'}{formatCurrency(t.amount)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{t.paymentMethod || 'Direct'}</span>
                </div>

                <button
                  onClick={() => deleteTransaction(t.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20 cursor-pointer"
                  title="Delete transaction"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Form */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-md glass-panel bg-white/95 dark:bg-slate-900/95 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 border border-white/40 dark:border-white/10 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-white/10">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Record Transaction</h3>
              <span className="text-xs text-brand-600 dark:text-brand-400 font-bold">Personal Ledger</span>
            </div>

            {/* Type selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFormTypeChange('expense')}
                className={`py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                  formType === 'expense'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'glass-subtle text-slate-600 dark:text-slate-400'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => handleFormTypeChange('income')}
                className={`py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                  formType === 'income'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'glass-subtle text-slate-600 dark:text-slate-400'
                }`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => handleFormTypeChange('transfer')}
                className={`py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                  formType === 'transfer'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'glass-subtle text-slate-600 dark:text-slate-400'
                }`}
              >
                Transfer
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 glass-input rounded-2xl text-xl font-black text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Description / Note</label>
                <input
                  type="text"
                  placeholder="e.g. Uber, Dinner with friends, Freelance"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              {formType === 'transfer' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">From Account</label>
                    <select
                      value={accountId}
                      onChange={(e) => handleFromAccountChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Transfer To</label>
                    <select
                      value={toAccountId}
                      onChange={(e) => setToAccountId(e.target.value)}
                      className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                    >
                      {accounts
                        .filter((a) => a.id !== accountId)
                        .map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
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
                          className="px-1 py-2 text-slate-400 hover:text-slate-600 shrink-0 cursor-pointer"
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

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Account</label>
                    <select
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
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
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
