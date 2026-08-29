'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  Users,
  Building2,
  CreditCard,
  Landmark,
  PieChart,
  Target,
  BarChart3,
  Bell,
  Settings,
  Wallet,
  Sparkles,
  Plus,
  LogOut,
  Zap
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { APP_INFO } from '@/lib/constants';

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Transactions', href: '/transactions', icon: Receipt },
  { label: 'Circles', href: '/circles', icon: Users, badge: 'Split' },
  { label: 'Accounts', href: '/accounts', icon: Building2 },
  { label: 'Credit Cards', href: '/credit-cards', icon: CreditCard },
  { label: 'Loans & EMIs', href: '/loans', icon: Landmark },
  { label: 'Budgets', href: '/budgets', icon: PieChart },
  { label: 'Goals', href: '/goals', icon: Target },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Reminders', href: '/reminders', icon: Bell },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { setIsQuickAddOpen, user, firebaseUser, setIsAuthModalOpen, logout, isDevMode } = useData();

  return (
    <aside className="hidden lg:flex flex-col w-[238px] min-w-[238px] max-w-[238px] border-r border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl h-screen sticky top-0 z-30 select-none shadow-[1px_0_6px_rgba(0,0,0,0.02)]">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 h-[76px]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-all">
            <Wallet className="w-4.5 h-4.5" />
          </div>
          <div>
            <h1 className="font-black text-base leading-none tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>KhataKithab</span>
              {APP_INFO.isDev ? (
                <span className="px-1.5 py-0.5 rounded text-xs font-extrabold tracking-wider uppercase bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-400/40">
                  DEV
                </span>
              ) : APP_INFO.isBeta ? (
                <span className="px-1.5 py-0.5 rounded text-xs font-extrabold tracking-wider uppercase bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/40">
                  BETA
                </span>
              ) : null}
            </h1>
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 tracking-tight">
              Financial Suite
            </span>
          </div>
        </Link>
      </div>

      {/* Quick Add CTA */}
      <div className="px-4 py-4">
        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-indigo-500 active:scale-98 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all border border-white/25 glass-shimmer cursor-pointer"
        >
          <Plus className="w-4 h-4 text-brand-200" />
          <span>Quick Add Entry</span>
        </button>
      </div>

      {/* Main Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-brand-500/15 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 font-extrabold shadow-sm border border-brand-500/30 backdrop-blur-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-brand-500/20 text-brand-600 dark:text-brand-300'
                      : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span>{item.label}</span>
              </div>
              
              {item.badge ? (
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-500/20">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile summary & Version Info */}
      <div className="p-4 border-t border-slate-200/40 dark:border-white/5 space-y-3 bg-white/20 dark:bg-slate-900/20 backdrop-blur-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {firebaseUser?.photoURL ? (
              <img
                src={firebaseUser.photoURL}
                alt={user.displayName}
                className="w-9 h-9 rounded-full object-cover border border-slate-200/80 dark:border-white/20 shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-md border border-white/20">
                {user.displayName.charAt(0)}
              </div>
            )}
            <div className="text-xs">
              <p className="font-extrabold text-slate-800 dark:text-slate-200 leading-snug truncate max-w-[110px]">
                {user.displayName}
              </p>
              <p className="text-slate-400 text-xs truncate w-24">{user.email}</p>
            </div>
          </div>

          {firebaseUser ? (
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer min-h-[36px]"
            >
              Sign In
            </button>
          )}
        </div>

        <div className="pt-2 border-t border-slate-200/40 dark:border-white/5 flex items-center justify-between text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${firebaseUser ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-amber-500 shadow-sm shadow-amber-500/50'}`} />
            {firebaseUser ? 'Firebase Cloud' : 'Local Storage'}
          </span>
          <span className="font-mono font-bold bg-slate-200/50 dark:bg-slate-800/60 px-2 py-0.5 rounded-md text-slate-700 dark:text-slate-300 border border-slate-300/40 dark:border-white/5">
            {APP_INFO.version}
          </span>
        </div>
      </div>
    </aside>
  );
}
