'use client';

import React from 'react';
import { Search, Bell, Plus, Sparkles, User as UserIcon, LogIn, LogOut, Cloud, HardDrive } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { APP_INFO } from '@/lib/constants';

interface HeaderProps {
  onOpenMobileNav: () => void;
}

export default function Header({ onOpenMobileNav }: HeaderProps) {
  const {
    setIsQuickAddOpen,
    setIsSearchModalOpen,
    user,
    firebaseUser,
    setIsAuthModalOpen,
    logout,
    isDemoMode,
    unreadNotificationCount,
    setIsNotificationDrawerOpen
  } = useData();

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 px-4 lg:px-8 flex items-center justify-between">
      {/* Mobile Menu & Title */}
      <div className="flex items-center gap-3 lg:gap-4">
        <button
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Open mobile navigation"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Global Search Bar Trigger */}
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors w-48 sm:w-72"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="truncate">Search txns, circles, cards...</span>
          <kbd className="hidden sm:inline-block ml-auto text-[10px] bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-sm font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Environment Stage Badge */}
        {APP_INFO.isDev ? (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
            <span>Local Dev</span>
          </span>
        ) : APP_INFO.isBeta ? (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <span>Beta Flight</span>
          </span>
        ) : null}

        {/* Connection Mode Badge */}
        {firebaseUser ? (
          <span className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Cloud className="w-3.5 h-3.5 text-emerald-600" />
            <span>Firebase Connected</span>
          </span>
        ) : (
          <span className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <HardDrive className="w-3.5 h-3.5 text-amber-600" />
            <span>Local Storage Mode</span>
          </span>
        )}


        {/* Auth Button or User Profile */}
        {firebaseUser ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {firebaseUser.photoURL ? (
                <img
                  src={firebaseUser.photoURL}
                  alt={user.displayName}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs">
                  {user.displayName.charAt(0)}
                </div>
              )}
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 hidden sm:inline truncate max-w-[100px]">
                {user.displayName}
              </span>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-1 rounded-full text-slate-400 hover:text-rose-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}

        {/* Quick Add Button */}
        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Expense</span>
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => setIsNotificationDrawerOpen(true)}
          className="p-2 rounded-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-all active:scale-95"
          title="Notification Center & Alarms"
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white font-extrabold text-[10px] flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
              {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
