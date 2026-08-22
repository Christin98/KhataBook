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
  Plus
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
  const { setIsQuickAddOpen, user } = useData();

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Rupee Khata</span>
              {APP_INFO.isBeta && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold tracking-wider uppercase bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60">
                  BETA
                </span>
              )}
            </h1>
            <span className="text-[11px] font-medium text-brand-600 dark:text-brand-400">
              Personal & Shared Finance
            </span>
          </div>
        </Link>
      </div>

      {/* Sub-10s Quick Add Button */}
      <div className="px-4 py-4">
        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-medium shadow-md shadow-brand-600/30 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Main Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile summary & Version Info */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 font-bold flex items-center justify-center text-sm border border-brand-200 dark:border-brand-800">
              {user.displayName.charAt(0)}
            </div>
            <div className="text-xs">
              <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">{user.displayName}</p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate w-28">{user.email}</p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Online & Offline Sync Ready" />
        </div>

        <div className="pt-2 border-t border-slate-100/60 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
          <span>{APP_INFO.name}</span>
          <span className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
            {APP_INFO.version}
          </span>
        </div>
      </div>
    </aside>
  );
}
