'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Clock,
  Rocket,
  CheckCircle2,
  Bell,
  ArrowRight,
  ShieldAlert,
  Flame,
  Zap,
  Code2,
  LucideIcon
} from 'lucide-react';
import { APP_INFO } from '@/lib/constants';

interface FeatureHighlight {
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
}

interface UnderDevelopmentScreenProps {
  featureName: string;
  tagline: string;
  category: string;
  icon: LucideIcon;
  highlights: FeatureHighlight[];
  plannedRelease: string;
  progressPercent: number;
  betaAvailable?: boolean;
  childrenIfBypassed?: React.ReactNode;
}

export default function UnderDevelopmentScreen({
  featureName,
  tagline,
  category,
  icon: Icon,
  highlights,
  plannedRelease,
  progressPercent,
  betaAvailable = true,
  childrenIfBypassed
}: UnderDevelopmentScreenProps) {
  const [isNotified, setIsNotified] = useState(false);
  const [showSneakPeek, setShowSneakPeek] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setIsNotified(true);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* 1. Hero Feature Banner */}
      <div className="relative overflow-hidden p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-brand-950/80 via-slate-900/80 to-indigo-950/80 text-white shadow-2xl border border-white/15 backdrop-blur-2xl">
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-brand-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30 backdrop-blur-md">
              {category}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 backdrop-blur-md">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>In Active Build</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-brand-500/30 border border-white/25 shrink-0">
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{featureName}</h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 max-w-xl leading-relaxed">{tagline}</p>
            </div>
          </div>

          {/* Build Completion Progress */}
          <div className="pt-2 max-w-md space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-300">
              <span>Engineering Progress</span>
              <span className="text-brand-300 font-extrabold">{progressPercent}% Completed</span>
            </div>
            <div className="w-full h-3 rounded-full bg-white/15 overflow-hidden p-0.5 backdrop-blur-md">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-400 via-indigo-400 to-purple-400 transition-all duration-1000 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Target Rollout: <span className="text-white font-bold">{plannedRelease}</span></p>
          </div>
        </div>
      </div>

      {/* 2. Feature Architecture Highlights */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-500" />
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            What We Are Crafting For You
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {highlights.map((h, idx) => {
            const HIcon = h.icon;
            return (
              <div key={idx} className="glass-card glass-interactive p-6 rounded-3xl space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-brand-500/15 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-500/30 shadow-inner">
                    <HIcon className="w-5 h-5" />
                  </div>
                  {h.badge && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-200/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-300/40 dark:border-white/5">
                      {h.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-black text-base text-slate-900 dark:text-white leading-snug">{h.title}</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">{h.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Notification & Dev Bypass Bar */}
      <div className="glass-card p-6 sm:p-7 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-black text-slate-900 dark:text-white text-base">Get Early Access Notification</h3>
          <p className="text-xs text-slate-400 font-medium">Be the first to test when this module drops in Beta Flight.</p>
        </div>

        {isNotified ? (
          <span className="px-4 py-2 rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-black flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> You're on the VIP list!
          </span>
        ) : (
          <form onSubmit={handleNotifyMe} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="email"
              placeholder="Enter email for drop alert..."
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="px-4 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none w-full sm:w-64"
              required
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all shrink-0 cursor-pointer"
            >
              Notify Me
            </button>
          </form>
        )}
      </div>

      {/* Dev Sneak Peek Toggle */}
      {childrenIfBypassed && (
        <div className="pt-4 border-t border-slate-200/50 dark:border-white/10 text-center">
          <button
            onClick={() => setShowSneakPeek(!showSneakPeek)}
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-bold"
          >
            {showSneakPeek ? 'Hide Preview Module' : '⚡ Developer Sneak Peek (Simulated Prototype)'}
          </button>
          {showSneakPeek && <div className="mt-6 text-left">{childrenIfBypassed}</div>}
        </div>
      )}
    </div>
  );
}
