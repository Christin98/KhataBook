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
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Header Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 border border-brand-500/20 p-6 sm:p-10 text-white shadow-2xl">
        {/* Glowing atmospheric circles */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-extrabold uppercase tracking-wider animate-pulse">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Under Active Development • Coming Soon</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-600/40 border border-brand-400/30 flex items-center justify-center text-brand-300 shadow-inner">
                <Icon className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                {featureName}
              </h1>
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {tagline}
            </p>
          </div>

          {/* Development Status Metric Card */}
          <div className="bg-slate-950/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 sm:p-6 min-w-[260px] space-y-4 shrink-0 shadow-lg">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold uppercase tracking-wider">Flight Progress</span>
              <span className="font-mono font-bold text-amber-400">{progressPercent}% Ready</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out shadow-sm shadow-emerald-400/50"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-brand-400" />
                <span>Target: {plannedRelease}</span>
              </span>
              <span className="font-bold text-emerald-400 uppercase">Beta Testing</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Feature Highlights Grid */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            What&apos;s Coming in {featureName}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {highlights.map((item, idx) => {
            const ItemIcon = item.icon;
            return (
              <div
                key={idx}
                className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-3 hover:border-brand-500/40 transition-all hover:shadow-lg group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ItemIcon className="w-5 h-5" />
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {item.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Interactive Notification & Beta Testing Call-To-Action */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card A: Join Beta Flight to Test Now */}
        <div className="glass-panel p-6 rounded-3xl border-amber-200/60 dark:border-amber-900/60 bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 space-y-4">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-sm uppercase tracking-wide">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Early Access in Beta Flight</span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Want to test this feature right now?
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            This feature is actively functional on our private <strong>Beta Flight Channel</strong>. If you are an invited tester or developer, you can test it on our beta branch deploy.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {childrenIfBypassed && (
              <button
                onClick={() => setShowSneakPeek(!showSneakPeek)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
              >
                <Code2 className="w-4 h-4 text-amber-400" />
                <span>{showSneakPeek ? 'Hide Preview Interface' : 'Preview Working Beta Interface'}</span>
              </button>
            )}

            <a
              href="mailto:christinkoshy1998@gmail.com?subject=KhataKithab%20Beta%20Tester%20Invite"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Rocket className="w-4 h-4" />
              <span>Request Beta Tester Key</span>
            </a>
          </div>
        </div>

        {/* Card B: Launch Alert Notification */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-sm uppercase tracking-wide">
            <Bell className="w-4 h-4" />
            <span>Release Notifications</span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Get notified when {featureName} goes live
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Leave your email and we&apos;ll ping you as soon as this feature lands on the production branch.
          </p>

          {isNotified ? (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-medium animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>You&apos;re on the early access list! We will notify you upon launch.</span>
            </div>
          ) : (
            <form onSubmit={handleNotifyMe} className="flex gap-2">
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter your email..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition-all shrink-0"
              >
                Notify Me
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 4. Optional Working Beta Interface (when toggled or bypassed) */}
      {showSneakPeek && childrenIfBypassed && (
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Interactive Beta Preview Mode — Data will be saved to your local ledger or cloud account.</span>
          </div>
          {childrenIfBypassed}
        </div>
      )}
    </div>
  );
}
