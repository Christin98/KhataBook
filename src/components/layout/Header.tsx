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
    unreadNotificationCount,
    setIsNotificationDrawerOpen
  } = useData();

  return (
    <header className="h-16 lg:h-[76px] glass-header sticky top-0 z-20 px-4 lg:px-8 flex items-center justify-between transition-all">
      {/* Mobile Menu & Title */}
      <div className="flex items-center gap-3 lg:gap-4">
        <button
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors border border-transparent hover:border-white/20 cursor-pointer"
          aria-label="Open mobile navigation"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Global Search Bar Trigger */}
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="flex items-center gap-2.5 px-4 py-2 rounded-2xl glass-input text-slate-500 dark:text-slate-400 text-xs font-medium hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all w-48 sm:w-80 shadow-2xs group cursor-pointer"
        >
          <Search className="w-4 h-4 text-brand-500 group-hover:scale-110 transition-transform" />
          <span className="truncate">Search txns, circles, cards...</span>
          <kbd className="hidden sm:inline-block ml-auto text-xs font-mono font-bold bg-slate-200/60 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-lg border border-slate-300/60 dark:border-white/10 shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Environment Stage Badge */}
        {APP_INFO.isDev ? (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
            <span>Local Dev</span>
          </span>
        ) : APP_INFO.isBeta ? (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 backdrop-blur-md">
            <span>Beta Flight</span>
          </span>
        ) : null}

        {/* Connection Mode Badge */}
        {firebaseUser ? (
          <span className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 backdrop-blur-md shadow-2xs">
            <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Cloud Sync</span>
          </span>
        ) : (
          <span className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 backdrop-blur-md shadow-2xs">
            <HardDrive className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Local Offline</span>
          </span>
        )}

        {/* Quick Add Entry Action Button */}
        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-brand-500/25 transition-all active:scale-95 border border-white/20 cursor-pointer min-h-[36px]"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Entry</span>
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => setIsNotificationDrawerOpen(true)}
          className="p-2 rounded-2xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60 relative transition-all active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-white/10 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
          title="Notification Center & Alarms"
        >
          <Bell className="w-4.5 h-4.5" />
          {unreadNotificationCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white font-black text-xs flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-md shadow-rose-500/50 animate-pulse">
              {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
            </span>
          )}
        </button>

        {/* User Auth Avatar / Sign In */}
        {firebaseUser ? (
          <div className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-2xl glass-subtle border border-slate-200/60 dark:border-white/10">
            {firebaseUser.photoURL ? (
              <img
                src={firebaseUser.photoURL}
                alt={user.displayName}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-white/40"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                {user.displayName.charAt(0)}
              </div>
            )}
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden sm:inline truncate max-w-[90px]">
              {user.displayName}
            </span>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
