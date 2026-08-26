'use client';

import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Wallet,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { formatCurrency, calculateTotalBalance } from '@/lib/calculations';
import { Account, AccountType } from '@/lib/types';
import { POPULAR_BANKS, BankDefinition, detectBank } from '@/lib/banks';
import BankLogo from '@/components/common/BankLogo';

export default function AccountsPage() {
  const { accounts, addAccount, updateAccount, deleteAccount, user } = useData();

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [bankName, setBankName] = useState('');
  const [balance, setBalance] = useState('');

  // Edit Modal State
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<AccountType>('bank');
  const [editBankName, setEditBankName] = useState('');
  const [editBalance, setEditBalance] = useState('');

  // Delete Confirmation State
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  // Bank Search filter inside modal
  const [bankSearch, setBankSearch] = useState('');

  const totalBalance = calculateTotalBalance(accounts);

  const getAutoBrandColor = (bankStr?: string, nameStr?: string, accType?: string): string => {
    const detected = detectBank(bankStr, accType) || detectBank(nameStr, accType);
    if (detected) return detected.primaryColor;
    if (accType === 'cash') return '#10b981';
    if (accType === 'wallet') return '#8b5cf6';
    if (accType === 'savings') return '#f59e0b';
    return '#6366f1';
  };

  const handleSelectBankForAdd = (bank: BankDefinition) => {
    setBankName(bank.name);
    setName(`${bank.shortName} Account`);
    setType(bank.category === 'cash' ? 'cash' : bank.category === 'wallet' ? 'wallet' : 'bank');
  };

  const handleSelectBankForEdit = (bank: BankDefinition) => {
    setEditBankName(bank.name);
    if (!editName || editName.toLowerCase().includes('account')) {
      setEditName(`${bank.shortName} Account`);
    }
    setEditType(bank.category === 'cash' ? 'cash' : bank.category === 'wallet' ? 'wallet' : 'bank');
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const numBalance = parseFloat(balance);
    if (!name.trim() || isNaN(numBalance)) return;

    const autoColor = getAutoBrandColor(bankName, name, type);

    addAccount({
      userId: user.id,
      name: name.trim(),
      type,
      bankName: type === 'bank' || type === 'savings' ? bankName.trim() || 'Bank' : undefined,
      openingBalance: numBalance,
      currentBalance: numBalance,
      color: autoColor,
      icon: type === 'bank' ? 'Building2' : type === 'cash' ? 'Banknote' : 'Wallet',
      isActive: true
    });

    setIsAddModalOpen(false);
    setName('');
    setBalance('');
    setBankName('');
  };

  const handleOpenEdit = (acc: Account) => {
    setEditingAccount(acc);
    setEditName(acc.name);
    setEditType(acc.type);
    setEditBankName(acc.bankName || '');
    setEditBalance(acc.currentBalance.toString());
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    const numBalance = parseFloat(editBalance);
    if (!editName.trim() || isNaN(numBalance)) return;

    const autoColor = getAutoBrandColor(editBankName, editName, editType);

    updateAccount(editingAccount.id, {
      name: editName.trim(),
      type: editType,
      bankName: editType === 'bank' || editType === 'savings' ? editBankName.trim() || 'Bank' : undefined,
      currentBalance: numBalance,
      color: autoColor
    });

    setEditingAccount(null);
  };

  const handleConfirmDelete = () => {
    if (!accountToDelete) return;
    deleteAccount(accountToDelete.id);
    setAccountToDelete(null);
  };

  const filteredBanksForAdd = POPULAR_BANKS.filter((b) =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase()) ||
    b.shortName.toLowerCase().includes(bankSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20 mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Liquid Asset Portfolio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Accounts & Vaults
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Manage your liquid bank accounts, cash wallets, and savings vaults with real bank logos.
          </p>
        </div>

        <button
          onClick={() => {
            setBankSearch('');
            setIsAddModalOpen(true);
          }}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 flex items-center gap-2 active:scale-95 transition-all self-start sm:self-center border border-white/20 glass-shimmer cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Account</span>
        </button>
      </div>

      {/* Summary Total Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-950/80 via-slate-900/80 to-indigo-950/80 text-white shadow-2xl border border-white/15 backdrop-blur-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="absolute -top-20 -right-20 w-52 h-52 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-brand-300">
            Total Net Liquid Balance
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mt-1 text-white">
            {formatCurrency(totalBalance)}
          </h2>
          <p className="text-xs text-slate-300 font-medium">
            Across {accounts.filter((a) => a.isActive).length} active storage accounts ({accounts.length} total)
          </p>
        </div>

        <div className="relative z-10 p-4 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl self-start sm:self-auto">
          <Wallet className="w-9 h-9 text-brand-300" />
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((acc) => {
          const cardBrandColor = getAutoBrandColor(acc.bankName, acc.name, acc.type);

          return (
            <div
              key={acc.id}
              className={`glass-card glass-interactive p-6 rounded-3xl flex flex-col justify-between space-y-6 relative overflow-hidden group shadow-xl transition-all ${
                !acc.isActive ? 'opacity-70 grayscale-[0.2]' : ''
              }`}
            >
              {/* Top Glowing Color Stripe */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5 opacity-85 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: cardBrandColor }}
              />

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <BankLogo
                    bankName={acc.bankName}
                    accountName={acc.name}
                    accountType={acc.type}
                    size="md"
                    customColor={cardBrandColor}
                  />
                  <div className="min-w-0">
                    <h3 className="font-black text-base text-slate-900 dark:text-white leading-snug truncate">
                      {acc.name}
                    </h3>
                    <span className="text-xs text-slate-400 capitalize font-medium">
                      {acc.bankName || acc.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Status Badge */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      acc.isActive
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-400 border-slate-300/40 dark:border-white/5'
                    }`}
                  >
                    {acc.isActive ? 'Active' : 'Inactive'}
                  </span>

                  {/* Edit Action */}
                  <button
                    onClick={() => handleOpenEdit(acc)}
                    title="Edit Account"
                    className="p-1.5 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Action */}
                  <button
                    onClick={() => setAccountToDelete(acc)}
                    title="Delete Account"
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold">Current Balance</span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                    {formatCurrency(acc.currentBalance)}
                  </p>
                </div>

                {/* Deactivate / Activate Button */}
                <button
                  onClick={() => updateAccount(acc.id, { isActive: !acc.isActive })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                    acc.isActive
                      ? 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                      : 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30'
                  }`}
                >
                  {acc.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE ACCOUNT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-lg glass-panel bg-white/95 dark:bg-slate-900/95 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 border border-white/40 dark:border-white/10 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-white/10">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Add New Account</h3>
                <p className="text-xs text-slate-400">Choose a major bank or enter custom details</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Popular Banks Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                  <span>Quick Select Major Bank</span>
                </label>
                <span className="text-[10px] text-slate-400 font-bold">Auto Theme & Logo</span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-2 glass-subtle rounded-2xl max-h-36 overflow-y-auto">
                {filteredBanksForAdd.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleSelectBankForAdd(b)}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all border border-transparent hover:border-brand-500/30 group cursor-pointer"
                    title={b.name}
                  >
                    <BankLogo bankName={b.name} size="sm" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-full text-center group-hover:text-brand-600">
                      {b.shortName}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Account Name</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Salary, SBI Savings, Cash"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Account Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AccountType)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="bank">Bank Account</option>
                    <option value="cash">Cash Wallet</option>
                    <option value="wallet">Digital Wallet</option>
                    <option value="savings">Savings Vault</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Bank / Provider</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC, ICICI, SBI"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Opening Balance (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full px-4 py-3 glass-input rounded-2xl text-xl font-black text-slate-900 dark:text-white focus:outline-none"
                  required
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
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ACCOUNT MODAL */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md" onClick={() => setEditingAccount(null)} />
          <div className="relative w-full max-w-lg glass-panel bg-white/95 dark:bg-slate-900/95 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 border border-white/40 dark:border-white/10 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-white/10">
              <div className="flex items-center gap-3">
                <BankLogo
                  bankName={editBankName}
                  accountName={editName}
                  accountType={editType}
                  size="sm"
                />
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Edit Account</h3>
                  <p className="text-xs text-slate-400">Update account details, balance & brand logo</p>
                </div>
              </div>
              <button
                onClick={() => setEditingAccount(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Bank Selector inside Edit */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                  <span>Switch / Auto-Match Bank Logo</span>
                </label>
                <span className="text-[10px] text-slate-400 font-bold">Auto Theme & Logo</span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-2 glass-subtle rounded-2xl max-h-32 overflow-y-auto">
                {POPULAR_BANKS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleSelectBankForEdit(b)}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all border border-transparent hover:border-brand-500/30 group cursor-pointer"
                    title={b.name}
                  >
                    <BankLogo bankName={b.name} size="sm" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-full text-center group-hover:text-brand-600">
                      {b.shortName}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Account Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Account Type</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as AccountType)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="bank">Bank Account</option>
                    <option value="cash">Cash Wallet</option>
                    <option value="wallet">Digital Wallet</option>
                    <option value="savings">Savings Vault</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Bank / Provider</label>
                  <input
                    type="text"
                    value={editBankName}
                    onChange={(e) => setEditBankName(e.target.value)}
                    placeholder="e.g. HDFC, ICICI, SBI"
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Current Balance (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editBalance}
                  onChange={(e) => setEditBalance(e.target.value)}
                  className="w-full px-4 py-3 glass-input rounded-2xl text-xl font-black text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-white/10 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-black shadow-lg shadow-brand-500/25 border border-white/20 cursor-pointer hover:from-brand-500 hover:to-indigo-500 active:scale-95 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {accountToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setAccountToDelete(null)} />
          <div className="relative w-full max-w-md glass-panel bg-white/95 dark:bg-slate-900/95 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 border border-white/40 dark:border-white/10 space-y-5">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 flex items-center justify-center border border-rose-500/30">
                <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Delete Account?</h3>
                <p className="text-xs text-slate-400">Action cannot be undone</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-900 dark:text-white font-black">{accountToDelete.name}</strong> (₹
              {accountToDelete.currentBalance.toLocaleString('en-IN')})?
            </p>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-medium">
              Your historical transactions associated with this account will remain safely preserved in the ledger audit history.
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAccountToDelete(null)}
                className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-white/10 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-black shadow-lg shadow-rose-500/25 border border-white/20 cursor-pointer active:scale-95 transition-all"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
