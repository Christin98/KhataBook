'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import QuickAddModal from '@/components/common/QuickAddModal';
import GlobalSearchModal from '@/components/common/GlobalSearchModal';
import AuthModal from '@/components/common/AuthModal';
import BetaAccessGate from '@/components/common/BetaAccessGate';
import NotificationDrawer from '@/components/common/NotificationDrawer';
import WhatsNewModal from '@/components/common/WhatsNewModal';
import { useData } from '@/context/DataContext';

import { ShieldCheck, Sparkles, Lock } from 'lucide-react';
import { APP_INFO } from '@/lib/constants';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    isWhatsNewOpen,
    setIsWhatsNewOpen
  } = useData();

  return (
    <BetaAccessGate>
      <div className="min-h-screen flex bg-[#f4f5f7] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 relative overflow-x-hidden selection:bg-brand-500/20 selection:text-brand-800 dark:selection:text-brand-200">
        {/* Calm Ambient Lighting */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Subtle Top Violet Aura */}
          <div className="absolute -top-[12%] left-[10%] w-[50vw] h-[50vw] max-w-[650px] max-h-[650px] rounded-full bg-brand-500/6 blur-[140px] pointer-events-none" />
          
          {/* Subtle Mid Teal Aura */}
          <div className="absolute top-[35%] -right-[10%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] rounded-full bg-emerald-500/5 blur-[140px] pointer-events-none" />
        </div>

        {/* Desktop Glass Sidebar (238px) */}
        <Sidebar />

        {/* Main Content Workspace */}
        <div className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-0 relative z-10">
          <Header onOpenMobileNav={() => setIsMobileNavOpen(true)} />
          
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
            {children}
          </main>

          {/* Global Footer */}
          <footer className="mt-auto py-6 mb-16 lg:mb-0 px-4 sm:px-6 lg:px-8 border-t border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl w-full mx-auto bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-t-2xl sm:rounded-none">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-800 dark:text-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                <span>{APP_INFO.name}</span>
              </div>
              
              {APP_INFO.isDev ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-extrabold uppercase bg-purple-100/80 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-300/60 shadow-2xs backdrop-blur-md">
                  DEV
                </span>
              ) : APP_INFO.isBeta ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-extrabold uppercase bg-amber-100/80 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300/60 shadow-2xs backdrop-blur-md">
                  Beta
                </span>
              ) : null}

              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
              <span className="text-center sm:text-left text-slate-500 dark:text-slate-400 font-medium">
                {APP_INFO.description}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 font-bold shadow-2xs">
                <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Client-Side AES-256</span>
              </span>
              
              <span className="font-mono bg-slate-200/60 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-lg text-slate-700 dark:text-slate-300 font-bold border border-slate-300/50 dark:border-white/5">
                {APP_INFO.version}
              </span>
              
              <span className="text-slate-400 font-medium">Build {APP_INFO.build}</span>
            </div>
          </footer>
        </div>

        {/* Mobile Drawer & Navigation */}
        <MobileNav
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
          onOpen={() => setIsMobileNavOpen(true)}
        />

        {/* Global Modals & Drawers */}
        <QuickAddModal />
        <GlobalSearchModal />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        <NotificationDrawer isOpen={isNotificationDrawerOpen} onClose={() => setIsNotificationDrawerOpen(false)} />
        <WhatsNewModal isOpen={isWhatsNewOpen} onClose={() => setIsWhatsNewOpen(false)} />
      </div>
    </BetaAccessGate>
  );
}
