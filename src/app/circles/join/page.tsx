'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Users, Sparkles, ArrowRight, ShieldCheck, Clock, Layers } from 'lucide-react';

function CircleJoinContent() {
  const searchParams = useSearchParams();
  const rawCode = searchParams.get('code') || '';
  const cleanCode = decodeURIComponent(rawCode).replace(/-/g, ' ');

  return (
    <div className="max-w-xl mx-auto py-12 px-4 space-y-6 animate-fadeIn">
      {/* Hero Card */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-5 shadow-2xl bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-brand-500/25">
          <Users className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300/50">
            Invite Links • Coming Soon in v0.5.0
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Circle Invite Received!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            You were invited to join an expense splitting circle in KhataKithab.
          </p>
        </div>

        {cleanCode && (
          <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-800/60 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Invite Code</span>
            <p className="text-base font-extrabold text-brand-700 dark:text-brand-300 font-mono">
              {cleanCode}
            </p>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 text-left text-xs space-y-2 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span>Instant Cloud Circle Join is in Flight Testing</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Multi-device real-time invite links are currently under flight development. In the meantime, the circle owner can add you directly using your name inside their circle.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/circles"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <span>Go to My Circles</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CircleJoinPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-slate-400">Loading invite details...</div>}>
      <CircleJoinContent />
    </Suspense>
  );
}
