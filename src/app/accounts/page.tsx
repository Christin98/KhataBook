'use client';

import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Landmark,
  Wallet,
  Banknote,
  Vault,
  ArrowRightLeft,
  Check
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { formatCurrency, calculateTotalBalance } from '@/lib/calculations';
import { AccountType } from '@/lib/types';

export default function AccountsPage() {
  const { accounts, addAccount, updateAccount, user } = useData();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [bankName, setBankName] = useState('');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState('#6d28d9');

  const totalBalance = calculateTotalBalance(accounts);

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const numBalance = parseFloat(balance);
    if (!name.trim() || isNaN(numBalance)) return;

    addAccount({
      userId: user.id,
      name,
      type,
      bankName: type === 'bank' || type === 'savings' ? bankName || 'Bank' : undefined,
      openingBalance: numBalance,
      currentBalance: numBalance,
      color,
      icon: type === 'bank' ? 'Building2' : type === 'cash' ? 'Banknote' : 'Wallet',
      isActive: true
    });

    setIsAddModalOpen(false);
    setName('');
    setBalance('');
    setBankName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-8 h-8 text-brand-600" />
            <span>Accounts & Liquid Assets</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track bank accounts, cash wallets, & savings vaults.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-600/30 flex items-center gap-2 active:scale-95 transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Account</span>
        </button>
      </div>

      {/* Summary Total Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-900 text-white shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs text-brand-200 uppercase font-bold tracking-wider">Total Net Liquid Balance</span>
          <h2 className="text-3xl sm:text-4xl font-black mt-1">{formatCurrency(totalBalance)}</h2>
        </div>
        <div className="p-3 rounded-2xl bg-white/10 backdrop-blur border border-white/20">
          <Wallet className="w-8 h-8 text-brand-200" />
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            className="glass-panel p-6 rounded-3xl card-hover flex flex-col justify-between space-y-6 relative overflow-hidden"
          >
            {/* Top Color Stripe */}
            <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: acc.color }} />

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-md"
                  style={{ backgroundColor: acc.color }}
                >
                  {acc.type === 'bank' ? (
                    <Building2 className="w-6 h-6" />
                  ) : acc.type === 'cash' ? (
                    <Banknote className="w-6 h-6" />
                  ) : (
                    <Wallet className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{acc.name}</h3>
                  <span className="text-xs text-slate-500 capitalize">{acc.bankName || acc.type}</span>
                </div>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  acc.isActive
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {acc.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium">Current Balance</span>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {formatCurrency(acc.currentBalance)}
                </p>
              </div>

              <button
                onClick={() => updateAccount(acc.id, { isActive: !acc.isActive })}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                {acc.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Account Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl z-10 border border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Account</h3>

            <form onSubmit={handleCreateAccount} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Account Name</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Salary Account, Axis Savings"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Account Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AccountType)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium"
                  >
                    <option value="bank">Bank Account</option>
                    <option value="cash">Cash Wallet</option>
                    <option value="wallet">Digital Wallet</option>
                    <option value="savings">Savings Vault</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Bank Name</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC, ICICI, SBI"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Opening Balance (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-lg font-bold text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2.5 rounded-xl border text-xs font-bold">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-md">
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
