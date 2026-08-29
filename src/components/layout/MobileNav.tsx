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
  LogOut,
  Sparkles
} from 'lucide-react';
import { NAV_ITEMS } from './Sidebar';
import { useData } from '@/context/DataContext';
import { APP_INFO } from '@/lib/constants';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
}

export default function MobileNav({ isOpen, onClose, onOpen }: MobileNavProps) {
  const pathname = usePathname();
  const { setIsQuickAddOpen, user, firebaseUser, setIsAuthModalOpen, logout, isDevMode } = useData();

  // Escape key handler for mobile drawer
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Sliding Mobile Drawer Overlay */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
          className="fixed inset-0 z-50 lg:hidden animate-fadeIn"
        >
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md" onClick={onClose} />
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-xs glass-panel bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl p-6 flex flex-col justify-between shadow-2xl transition-transform border-r border-slate-200/60 dark:border-slate-800/60">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-200/60 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center text-white font-bold shadow-md shadow-brand-500/20">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-1.5 leading-none">
                      <span>KhataKithab</span>
                      {APP_INFO.isDev ? (
                        <span className="px-1.5 py-0.5 rounded text-xs font-extrabold uppercase bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-400/40">
                          DEV
                        </span>
                      ) : APP_INFO.isBeta ? (
                        <span className="px-1.5 py-0.5 rounded text-xs font-extrabold uppercase bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/40">
                          BETA
                        </span>
                      ) : null}
                    </h2>
                    <span className="text-xs text-slate-400 font-semibold">{APP_INFO.version}</span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                  aria-label="Close navigation drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links in Drawer */}
              <nav className="mt-6 space-y-1.5 max-h-[calc(100vh-230px)] overflow-y-auto pr-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all min-h-[44px] ${
                        isActive
                          ? 'bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-500/30'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-full ${
                          isActive ? 'bg-brand-600 text-white' : 'bg-brand-500/15 text-brand-700 dark:text-brand-300'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-200/50 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {firebaseUser?.photoURL ? (
                    <img
                      src={firebaseUser.photoURL}
                      alt={user.displayName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-brand-500 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                      {user.displayName.charAt(0)}
                    </div>
                  )}
                  <div className="text-xs">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{user.displayName}</p>
                    <p className="text-xs text-slate-400 truncate w-24">{user.email}</p>
                  </div>
                </div>

                {firebaseUser ? (
                  <button
                    onClick={() => {
                      logout();
                      onClose();
                    }}
                    className="p-2.5 rounded-xl text-rose-500 bg-rose-500/10 text-xs font-bold hover:bg-rose-500/20 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onClose();
                      setIsAuthModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-sm cursor-pointer min-h-[44px]"
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
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/25 border border-white/20 cursor-pointer min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>Quick Add Entry</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Horizontally Scrollable Bottom Navigation Dock (Mobile Only) */}
      <nav
        aria-label="Primary mobile navigation"
        className="fixed bottom-2.5 left-3 right-3 z-40 lg:hidden glass-panel bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl shadow-slate-900/10 overflow-hidden"
      >
        <div className="relative flex items-center">
          {/* Subtle Left Scroll Edge Fade Affordance */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-white/95 dark:from-slate-900/95 to-transparent z-10" />

          {/* Horizontally Scrollable Tab Track Reaching Every Tab */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth px-2.5 py-1.5 w-full">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[44px] min-w-[62px] ${
                    isActive
                      ? 'bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-500/25 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                  <span className="text-[11px] leading-tight whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Subtle Right Scroll Edge Fade Affordance */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white/95 dark:from-slate-900/95 to-transparent z-10" />
        </div>
      </nav>
    </>
  );
}
