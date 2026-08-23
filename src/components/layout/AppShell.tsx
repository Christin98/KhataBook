'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import QuickAddModal from '@/components/common/QuickAddModal';
import GlobalSearchModal from '@/components/common/GlobalSearchModal';
import AuthModal from '@/components/common/AuthModal';
import BetaAccessGate from '@/components/common/BetaAccessGate';
import { useData } from '@/context/DataContext';

import { APP_INFO } from '@/lib/constants';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { isAuthModalOpen, setIsAuthModalOpen } = useData();

  return (
    <BetaAccessGate>
      <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Workspace */}
        <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
          <Header onOpenMobileNav={() => setIsMobileNavOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>

          {/* Global Page Footer */}
          <footer className="mt-auto py-6 mb-16 lg:mb-0 px-4 sm:px-6 lg:px-8 border-t border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl w-full mx-auto">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="font-bold text-slate-600 dark:text-slate-300">{APP_INFO.name}</span>
              {APP_INFO.isBeta && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                  Beta
                </span>
              )}
              <span className="hidden sm:inline">•</span>
              <span className="text-center sm:text-left text-slate-500 dark:text-slate-400">{APP_INFO.description}</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="font-mono bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 font-semibold">
                {APP_INFO.version}
              </span>
              <span className="text-slate-400">Build {APP_INFO.build}</span>
            </div>
          </footer>
        </div>

        {/* Mobile Drawer & Navigation */}
        <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />

        {/* Global Modals */}
        <QuickAddModal />
        <GlobalSearchModal />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    </BetaAccessGate>
  );
}

