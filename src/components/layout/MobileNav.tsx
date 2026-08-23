'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  Users,
  Building2,
  MoreHorizontal,
  X,
  Plus,
  Wallet,
  LogOut
} from 'lucide-react';
import { NAV_ITEMS } from './Sidebar';
import { useData } from '@/context/DataContext';
import { APP_INFO } from '@/lib/constants';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const { setIsQuickAddOpen, user, firebaseUser, setIsAuthModalOpen, logout } = useData();

  const primaryMobileNav = [
    { label: 'Home', href: '/', icon: LayoutDashboard },
    { label: 'Txns', href: '/transactions', icon: Receipt },
    { label: 'Circles', href: '/circles', icon: Users },
    { label: 'Accounts', href: '/accounts', icon: Building2 },
  ];

  return (
    <>
      {/* Sliding Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-2xl transition-transform">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white font-bold">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 dark:text-white">KhataKithab</h2>
                    <p className="text-xs text-brand-600 dark:text-brand-400">Personal & Circles</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="mt-6 space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  const isUnderDevInProd = !APP_INFO.isBeta && ['/budgets', '/goals', '/reminders'].includes(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {isUnderDevInProd ? (
                        <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border border-amber-300/60 dark:border-amber-700/60">
                          Soon
                        </span>
                      ) : item.badge ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {firebaseUser?.photoURL ? (
                    <img
                      src={firebaseUser.photoURL}
                      alt={user.displayName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs">
                      {user.displayName.charAt(0)}
                    </div>
                  )}
                  <div className="text-xs">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{user.displayName}</p>
                    <p className="text-[10px] text-slate-400 truncate w-24">{user.email}</p>
                  </div>
                </div>

                {firebaseUser ? (
                  <button
                    onClick={() => {
                      logout();
                      onClose();
                    }}
                    className="p-2 rounded-lg text-rose-600 bg-rose-50 dark:bg-rose-950/40 text-xs font-bold"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onClose();
                      setIsAuthModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-sm"
                  >
                    Sign In
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  onClose();
                  setIsQuickAddOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-600 text-white font-semibold shadow-md shadow-brand-600/30"
              >
                <Plus className="w-5 h-5" />
                <span>Quick Add Expense</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sticky Mobile Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-2 py-2 flex items-center justify-around shadow-lg">
        {primaryMobileNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[11px] font-medium transition-colors ${
                isActive ? 'text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <button
          onClick={onClose}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[11px] font-medium text-slate-500 dark:text-slate-400"
        >
          <MoreHorizontal className="w-5 h-5 text-slate-400" />
          <span>More</span>
        </button>
      </div>
    </>
  );
}
