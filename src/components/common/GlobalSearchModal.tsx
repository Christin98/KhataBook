'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, X, Receipt, Users, Building2, CreditCard, Landmark, ArrowRight, Sparkles } from 'lucide-react';
import { useData } from '@/context/DataContext';
import BankLogo from '@/components/common/BankLogo';

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

  // Escape key handler
  React.useEffect(() => {
    if (!isSearchModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchModalOpen, setIsSearchModalOpen]);

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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="global-search-title"
      className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 p-4 animate-fadeIn"
    >
      {/* Frosted Backdrop */}
      <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md" onClick={() => setIsSearchModalOpen(false)} />

      <div className="relative w-full max-w-2xl glass-panel bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Search Bar Input */}
        <div className="p-4 sm:p-5 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center gap-3.5">
          <Search className="w-5 h-5 text-brand-500 shrink-0" />
          <h2 id="global-search-title" className="sr-only">Global Search</h2>
          <input
            type="text"
            autoFocus
            placeholder="Type to search transactions, friends (Rahul), circles, cards, loans..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-base font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            aria-label="Search transactions, circles, accounts, credit cards and loans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchModalOpen(false)}
            aria-label="Close global search"
            className="text-xs font-black text-slate-500 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-xl glass-subtle cursor-pointer min-h-[36px] flex items-center justify-center"
          >
            Esc
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {!query ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-brand-500/60" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Quick Global Search</p>
              <p className="text-[11px]">Type an expense description, friend's name, bank account, or circle to jump instantly.</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No results found for "{query}"</p>
              <p className="text-xs">Try searching by category (Food, Travel), member name, or card bank.</p>
            </div>
          ) : (
            <>
              {/* Transactions Matches */}
              {filteredTxns.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Transactions ({filteredTxns.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredTxns.slice(0, 5).map((t) => (
                      <Link
                        key={t.id}
                        href="/transactions"
                        onClick={() => setIsSearchModalOpen(false)}
                        className="p-3 rounded-2xl glass-subtle hover:bg-brand-500/10 flex items-center justify-between transition-colors group"
                      >
                        <div>
                          <p className="text-xs font-black text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400">{t.description}</p>
                          <p className="text-[11px] text-slate-400 font-medium">{t.category} • {t.date}</p>
                        </div>
                        <span className={`font-black text-xs ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          ₹{t.amount.toLocaleString('en-IN')}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Circles Matches */}
              {filteredCircles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>Circles ({filteredCircles.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredCircles.slice(0, 4).map((c) => (
                      <Link
                        key={c.id}
                        href={`/circles/${c.id}`}
                        onClick={() => setIsSearchModalOpen(false)}
                        className="p-3 rounded-2xl glass-subtle hover:bg-brand-500/10 flex items-center justify-between transition-colors group"
                      >
                        <div>
                          <p className="text-xs font-black text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400">{c.name}</p>
                          <p className="text-[11px] text-slate-400 font-medium">{c.members.length} members • {c.category}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Accounts Matches */}
              {filteredAccounts.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Accounts ({filteredAccounts.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredAccounts.slice(0, 4).map((a) => (
                      <Link
                        key={a.id}
                        href="/accounts"
                        onClick={() => setIsSearchModalOpen(false)}
                        className="p-2.5 rounded-2xl glass-subtle hover:bg-brand-500/10 flex items-center justify-between transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <BankLogo bankName={a.bankName} accountName={a.name} accountType={a.type} size="sm" customColor={a.color} />
                          <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400">{a.name}</p>
                            <p className="text-[11px] text-slate-400 font-medium capitalize">{a.bankName || a.type}</p>
                          </div>
                        </div>
                        <span className="font-black text-xs text-slate-900 dark:text-white">
                          ₹{a.currentBalance.toLocaleString('en-IN')}
                        </span>
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
