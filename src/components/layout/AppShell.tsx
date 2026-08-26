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
      <div className="min-h-screen flex bg-slate-50/70 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 relative overflow-x-hidden selection:bg-brand-500/30 selection:text-brand-800 dark:selection:text-brand-200">
        {/* Dynamic Multi-Stop Ambient Mesh Lighting */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Glowing Top-Left Brand / Violet Orb */}
          <div className="absolute -top-[18%] -left-[8%] w-[58vw] h-[58vw] max-w-[850px] max-h-[850px] rounded-full bg-gradient-to-br from-brand-500/20 via-indigo-500/12 to-transparent blur-[120px] ambient-orb-1 opacity-90 dark:opacity-80" />
          
          {/* Glowing Mid-Right Cyan / Indigo Orb */}
          <div className="absolute top-[28%] -right-[12%] w-[52vw] h-[52vw] max-w-[750px] max-h-[750px] rounded-full bg-gradient-to-tl from-purple-500/18 via-pink-500/10 to-transparent blur-[130px] ambient-orb-2 opacity-85 dark:opacity-75" />
          
          {/* Glowing Bottom-Left Emerald Orb */}
          <div className="absolute -bottom-[15%] left-[20%] w-[48vw] h-[48vw] max-w-[700px] max-h-[700px] rounded-full bg-gradient-to-tr from-emerald-500/14 via-teal-500/10 to-transparent blur-[110px] ambient-orb-3 opacity-90 dark:opacity-80" />

          {/* Subtle Cyber Dust Radial Highlight */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.12),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.18),rgba(255,255,255,0))] pointer-events-none" />
        </div>

        {/* Desktop Glass Sidebar */}
        <Sidebar />

        {/* Main Content Workspace */}
        <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0 relative z-10">
          <Header onOpenMobileNav={() => setIsMobileNavOpen(true)} />
          
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
            {children}
          </main>

          {/* Global Glass Footer */}
          <footer className="mt-auto py-6 mb-16 lg:mb-0 px-4 sm:px-6 lg:px-8 border-t border-slate-200/50 dark:border-white/10 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl w-full mx-auto backdrop-blur-xl bg-white/30 dark:bg-slate-900/30 rounded-t-3xl sm:rounded-none">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-800 dark:text-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                <span>{APP_INFO.name}</span>
              </div>
              
              {APP_INFO.isDev ? (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-purple-100/80 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-300/60 shadow-2xs backdrop-blur-md">
                  DEV
                </span>
              ) : APP_INFO.isBeta ? (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-100/80 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300/60 shadow-2xs backdrop-blur-md">
                  Beta
                </span>
              ) : null}

              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
              <span className="text-center sm:text-left text-slate-500 dark:text-slate-400 font-medium">
                {APP_INFO.description}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 text-[10px] font-bold backdrop-blur-md shadow-2xs">
                <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Client-Side AES-256</span>
              </span>
              
              <span className="font-mono bg-slate-200/50 dark:bg-slate-800/60 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-slate-700 dark:text-slate-300 font-bold border border-slate-300/40 dark:border-white/5">
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
