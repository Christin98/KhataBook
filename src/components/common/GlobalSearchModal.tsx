'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, X, Receipt, Users, Building2, CreditCard, Landmark, ArrowRight } from 'lucide-react';
import { useData } from '@/context/DataContext';

export default function GlobalSearchModal() {
  const {
    isSearchModalOpen,
    setIsSearchModalOpen,
    transactions,
    circles,
    accounts,
    creditCards,
    loans
  } = useData();

  const [query, setQuery] = useState('');

  if (!isSearchModalOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  const filteredTxns = cleanQuery
    ? transactions.filter(
        (t) =>
          t.description.toLowerCase().includes(cleanQuery) ||
          t.category.toLowerCase().includes(cleanQuery) ||
          t.amount.toString().includes(cleanQuery)
      )
    : [];

  const filteredCircles = cleanQuery
    ? circles.filter(
        (c) =>
          c.name.toLowerCase().includes(cleanQuery) ||
          c.category.toLowerCase().includes(cleanQuery) ||
          c.members.some((m) => m.name.toLowerCase().includes(cleanQuery))
      )
    : [];

  const filteredAccounts = cleanQuery
    ? accounts.filter(
        (a) =>
          a.name.toLowerCase().includes(cleanQuery) ||
          (a.bankName && a.bankName.toLowerCase().includes(cleanQuery))
      )
    : [];

  const filteredCreditCards = cleanQuery
    ? creditCards.filter(
        (cc) =>
          cc.cardName.toLowerCase().includes(cleanQuery) ||
          cc.bank.toLowerCase().includes(cleanQuery)
      )
    : [];

  const filteredLoans = cleanQuery
    ? loans.filter(
        (l) =>
          l.loanName.toLowerCase().includes(cleanQuery) ||
          l.lender.toLowerCase().includes(cleanQuery)
      )
    : [];

  const totalResults =
    filteredTxns.length +
    filteredCircles.length +
    filteredAccounts.length +
    filteredCreditCards.length +
    filteredLoans.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsSearchModalOpen(false)} />

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Search Bar Input */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            placeholder="Type to search transactions, friends (Rahul), circles, cards..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-base font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchModalOpen(false)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800"
          >
            Esc
          </button>
        </div>

        {/* Results Container */}
        <div className="p-4 overflow-y-auto space-y-6">
          {!cleanQuery ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              <p>Search across transactions, circles, accounts, credit cards, and loans.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {['Goa Plan', 'Rahul', 'HDFC', 'Salary', 'Groceries', 'iPhone'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950"
                  >
                    "{tag}"
                  </button>
                ))}
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <p className="font-semibold">No matches found for "{query}"</p>
              <p className="text-xs mt-1">Try searching by category, friend's name, or bank name.</p>
            </div>
          ) : (
            <>
              {/* Transactions Matches */}
              {filteredTxns.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Transactions ({filteredTxns.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredTxns.slice(0, 5).map((t) => (
                      <Link
                        key={t.id}
                        href="/transactions"
                        onClick={() => setIsSearchModalOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.description}</p>
                          <p className="text-xs text-slate-500">{t.category} • {t.date}</p>
                        </div>
                        <span
                          className={`font-bold text-sm ${
                            t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {t.type === 'income' ? '+' : '-'}₹{t.amount}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Circles Matches */}
              {filteredCircles.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    <Users className="w-3.5 h-3.5 text-brand-500" />
                    <span>Circles ({filteredCircles.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredCircles.map((c) => (
                      <Link
                        key={c.id}
                        href={`/circles/${c.id}`}
                        onClick={() => setIsSearchModalOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{c.name}</p>
                          <p className="text-xs text-slate-500">
                            {c.category} • {c.members.length} members ({c.members.map((m) => m.name).join(', ')})
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Accounts Matches */}
              {filteredAccounts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Accounts ({filteredAccounts.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredAccounts.map((a) => (
                      <Link
                        key={a.id}
                        href="/accounts"
                        onClick={() => setIsSearchModalOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{a.name}</p>
                          <p className="text-xs text-slate-500">{a.bankName || a.type}</p>
                        </div>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">₹{a.currentBalance}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Credit Cards Matches */}
              {filteredCreditCards.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Credit Cards ({filteredCreditCards.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredCreditCards.map((cc) => (
                      <Link
                        key={cc.id}
                        href="/credit-cards"
                        onClick={() => setIsSearchModalOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{cc.cardName}</p>
                          <p className="text-xs text-slate-500">{cc.bank} • •••• {cc.last4Digits}</p>
                        </div>
                        <span className="font-bold text-sm text-rose-600">Outstanding: ₹{cc.currentOutstanding}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
