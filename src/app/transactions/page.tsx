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
  X
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { formatCurrency } from '@/lib/calculations';
import { TransactionType } from '@/lib/types';

export default function TransactionsPage() {
  const {
    transactions,
    accounts,
    categories,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-8 h-8 text-brand-600" />
            <span>Personal Transactions</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete transaction ledger. Transfers do not count as expenses.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-600/30 flex items-center gap-2 active:scale-95 transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>New Transaction</span>
        </button>
      </div>

      {/* Type Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {(['all', 'expense', 'income', 'transfer'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
              activeTab === tab
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filter Controls Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search description or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Category Select */}
        <div className="w-full sm:w-48">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
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
        <div className="w-full sm:w-48">
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
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
      <div className="glass-panel rounded-3xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <Receipt className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300">No transactions found</h3>
            <p className="text-xs">Your first expense or income is waiting to be recorded.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-md"
            >
              + Record Expense
            </button>
          </div>
        ) : (
          filteredTransactions.map((t) => (
            <div
              key={t.id}
              className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 ${
                    t.type === 'income'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                      : t.type === 'transfer'
                      ? 'bg-brand-100 dark:bg-brand-950 text-brand-600'
                      : 'bg-rose-100 dark:bg-rose-950 text-rose-600'
                  }`}
                >
                  {t.type === 'income' ? (
                    <ArrowDownLeft className="w-5 h-5" />
                  ) : t.type === 'transfer' ? (
                    <RefreshCw className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{t.description}</h4>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                      {t.category}
                    </span>
                    <span>•</span>
                    <span>{getAccountName(t.accountId)}</span>
                    {t.toAccountId && (
                      <>
                        <span>➔</span>
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
                    className={`font-extrabold text-base ${
                      t.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : t.type === 'transfer'
                        ? 'text-brand-600 dark:text-brand-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {t.type === 'income' ? '+' : t.type === 'transfer' ? '' : '-'}{formatCurrency(t.amount)}
                  </div>
                  <span className="text-[10px] text-slate-400">{t.paymentMethod || 'Direct'}</span>
                </div>

                <button
                  onClick={() => deleteTransaction(t.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                  title="Delete transaction"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detailed Modal Form */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl z-10 border border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Record Transaction</h3>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormType('expense')}
                className={`py-2 rounded-xl text-xs font-bold ${
                  formType === 'expense' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setFormType('income')}
                className={`py-2 rounded-xl text-xs font-bold ${
                  formType === 'income' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setFormType('transfer')}
                className={`py-2 rounded-xl text-xs font-bold ${
                  formType === 'transfer' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Transfer
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-lg font-bold text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Uber, Groceries, Salary"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  required
                />
              </div>

              {formType === 'transfer' ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">From Account</label>
                    <select
                      value={accountId}
                      onChange={(e) => handleFromAccountChange(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Transfer To Account</label>
                    <select
                      value={toAccountId}
                      onChange={(e) => setToAccountId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium text-slate-900 dark:text-white"
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
                <div className="grid grid-cols-2 gap-2">
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
                          className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-brand-500 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddNewCategory}
                          className="px-2 py-1.5 bg-brand-600 text-white rounded-xl text-xs font-bold shrink-0"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddingCategory(false)}
                          className="px-1 py-1.5 text-slate-400 hover:text-slate-600 shrink-0"
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
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium text-slate-900 dark:text-white"
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

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Account</label>
                    <select
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium"
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
                <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-md"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
