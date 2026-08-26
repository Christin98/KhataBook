'use client';

import React from 'react';
import Link from 'next/link';
import { Home, AlertCircle, ArrowLeft, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 animate-fadeIn">
      <div className="max-w-md w-full glass-card p-8 rounded-3xl text-center space-y-6 shadow-2xl border border-white/40 dark:border-white/10 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-brand-500/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-brand-500/30 border border-white/20">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">404 Error</span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
            The page or ledger resource you are looking for does not exist or has been moved.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all active:scale-95 border border-white/20 glass-shimmer cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
