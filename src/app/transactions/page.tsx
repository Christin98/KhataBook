'use client';

import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRight,
  RefreshCw,
  Trash2,
  Calendar,
  Building2,
  Check,
  X,
  Sparkles,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Wallet
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import {
  formatCurrency,
  filterTransactionsByPeriod,
  calculatePeriodSummary,
  getDateRangeForPeriod,
  PERIOD_OPTIONS
} from '@/lib/calculations';
import { TransactionType } from '@/lib/types';
import PeriodSelector from '@/components/common/PeriodSelector';

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
    selectedPeriod,
    user,
    setIsQuickAddOpen
  } = useData();

  const [activeTab, setActiveTab] = useState<'all' | 'expense' | 'income' | 'transfer'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Period filtering and summary
  const periodFiltered = filterTransactionsByPeriod(transactions, selectedPeriod);
  const periodSummary = calculatePeriodSummary(transactions, selectedPeriod);
  const activePeriodOption = PERIOD_OPTIONS.find((p) => p.id === selectedPeriod) || PERIOD_OPTIONS[0];
  const dateRange = getDateRangeForPeriod(selectedPeriod);

  // New Transaction Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formType, setFormType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [description, setDescription] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notes, setNotes] = useState('');

  // Escape key handler
  React.useEffect(() => {
    if (!isAddModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAddModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddModalOpen]);

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

  // Filter transactions logic with DatePeriod applied
  const filteredTransactions = periodFiltered.filter((t) => {
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

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Please enter a valid amount.');
      return;
    }

    if (formType === 'transfer' && accountId === toAccountId) {
      setFormError('Source and destination accounts must be different.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addTransaction({
        userId: user.id,
        type: formType,
        amount: numAmount,
        category: formType === 'transfer' ? 'Self Transfer' : category,
        description: description.trim() || (formType === 'transfer' ? 'Account Transfer' : category),
        date,
        accountId: accountId || accounts[0]?.id,
        toAccountId: formType === 'transfer' ? toAccountId : undefined,
        paymentMethod,
        notes
      });

      setIsAddModalOpen(false);
      setIsSubmitting(false);
      setAmount('');
      setDescription('');
      setNotes('');
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save transaction.');
      setIsSubmitting(false);
    }
  };

  const getAccountName = (id: string) => {
    return accounts.find((a) => a.id === id)?.name || 'Account';
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header with PeriodSelector and New Transaction */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20 mb-2">
            <Receipt className="w-3.5 h-3.5" />
            <span>Ledger Audit & Filter Log</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Personal Transactions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Real-time ledger audit log. Self-transfers do not calculate as expenses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start lg:self-center shrink-0">
          <PeriodSelector />

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center gap-2 active:scale-95 transition-all cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* Period Financial Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 sm:p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {activePeriodOption.label} Inflow
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              +{formatCurrency(periodSummary.income)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 flex items-center justify-center border border-emerald-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-4 sm:p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {activePeriodOption.label} Outflow
            </span>
            <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
              -{formatCurrency(periodSummary.expenses)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-300 flex items-center justify-center border border-rose-500/20">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-4 sm:p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {activePeriodOption.label} Net Savings
            </span>
            <div className={`text-xl sm:text-2xl font-black mt-1 ${
              periodSummary.savings >= 0 ? 'text-brand-600 dark:text-brand-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {formatCurrency(periodSummary.savings)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300 flex items-center justify-center border border-brand-500/20">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Segmented Type Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/50 dark:border-white/10 pb-3 overflow-x-auto">
        {(['all', 'expense', 'income', 'transfer'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold capitalize transition-all shrink-0 cursor-pointer min-h-[44px] flex items-center justify-center ${
              activeTab === tab
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60'
            }`}
          >
            {tab === 'all' ? 'All Activities' : tab}
          </button>
        ))}
      </div>

      {/* Filter Controls Bar */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-3.5 shadow-xl">
        {/* Search Input */}
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-brand-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search description, merchant, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none min-h-[44px]"
          />
        </div>

        {/* Category Select */}
        <div className="w-full sm:w-52">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 glass-input rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none min-h-[44px]"
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
            className="w-full px-3.5 py-2.5 glass-input rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none min-h-[44px]"
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
      <div className="glass-card rounded-2xl overflow-hidden divide-y divide-slate-200/50 dark:divide-white/5 shadow-xl">
        {filteredTransactions.length === 0 ? (
          <div className="py-20 text-center text-slate-400 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-500 mx-auto flex items-center justify-center border border-brand-500/20 shadow-inner">
              <Receipt className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-base">No transactions found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
              No matching records for {activePeriodOption.label.toLowerCase()} ({dateRange.formattedRange}).
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/25 cursor-pointer min-h-[44px]"
            >
              + Add Entry
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
                    <span className="px-2 py-0.5 rounded-lg bg-slate-200/50 dark:bg-slate-800/50 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-300/40 dark:border-white/5">
                      {t.category}
                    </span>
                    <span>•</span>
                    <span>{getAccountName(t.accountId)}</span>
                    {t.toAccountId && (
                      <>
                        <ArrowRight className="w-3.5 h-3.5 text-brand-500 inline shrink-0" />
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
                  <span className="text-xs text-slate-400 font-bold uppercase">{t.paymentMethod || 'Direct'}</span>
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
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="record-txn-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
        >
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto glass-panel bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-7 shadow-2xl z-10 border border-slate-200/80 dark:border-slate-800/80 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
              <h3 id="record-txn-modal-title" className="text-lg font-black text-slate-900 dark:text-white">
                Record Transaction
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Close record transaction dialog"
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inline Error Alert */}
            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

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
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/20 border border-white/20 cursor-pointer active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 min-h-[44px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Transaction</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
