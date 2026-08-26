'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, X, Check, ArrowRight, ShieldCheck, Bell, Users, RefreshCw, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CHANGELOG_RELEASES, CURRENT_RELEASE, getChangelogForCurrentEnv, PROD_CHANGELOG, BETA_CHANGELOG, DEV_CHANGELOG } from '@/lib/changelog';
import { APP_INFO } from '@/lib/constants';

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WhatsNewModal({ isOpen, onClose }: WhatsNewModalProps) {
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [selectedChannel, setSelectedChannel] = useState<'current' | 'prod' | 'beta' | 'dev'>('current');
  const [selectedVersion, setSelectedVersion] = useState<string>(CURRENT_RELEASE.version);

  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 60,
          spread: 80,
          origin: { y: 0.5 }
        });
      } catch (e) {}

      if (typeof window !== 'undefined') {
        localStorage.setItem('khatakithab_last_seen_version', APP_INFO.version);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getActiveReleases = () => {
    if (selectedChannel === 'prod') return PROD_CHANGELOG;
    if (selectedChannel === 'beta') return BETA_CHANGELOG;
    if (selectedChannel === 'dev') return DEV_CHANGELOG;
    return getChangelogForCurrentEnv().releases;
  };

  const activeReleases = getActiveReleases();
  const currentChangelog = activeReleases.find((r) => r.version === selectedVersion) || activeReleases[0];

  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Frosted Backdrop */}
      <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl max-h-[90vh] glass-panel bg-white/95 dark:bg-slate-900/95 rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/40 dark:border-white/10 z-10 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200/50 dark:border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 shrink-0 border border-white/20">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  What's New
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-500/30">
                  {APP_INFO.version}
                </span>
                {APP_INFO.isBeta ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    Beta Flight
                  </span>
                ) : APP_INFO.isDev ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                    Dev Build
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    Production
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Released {currentChangelog.date} • {currentChangelog.stage}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center justify-between gap-2 pt-4 pb-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('current');
                setSelectedChannel('current');
                setSelectedVersion(CURRENT_RELEASE.version);
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'current'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'glass-subtle text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Current Release
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'glass-subtle text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Version History
            </button>
          </div>

          {activeTab === 'history' && (
            <div className="flex items-center gap-1 text-[11px] font-bold p-1 glass-subtle rounded-xl">
              <button
                onClick={() => setSelectedChannel('dev')}
                className={`px-2.5 py-1 rounded-lg transition-all ${selectedChannel === 'dev' ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-300 shadow-xs' : 'text-slate-400'}`}
              >
                Dev
              </button>
              <button
                onClick={() => setSelectedChannel('beta')}
                className={`px-2.5 py-1 rounded-lg transition-all ${selectedChannel === 'beta' ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-300 shadow-xs' : 'text-slate-400'}`}
              >
                Beta
              </button>
              <button
                onClick={() => setSelectedChannel('prod')}
                className={`px-2.5 py-1 rounded-lg transition-all ${selectedChannel === 'prod' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-300 shadow-xs' : 'text-slate-400'}`}
              >
                Prod
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 py-2 space-y-5">
          {activeTab === 'history' && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {activeReleases.map((rel) => (
                <button
                  key={rel.version}
                  onClick={() => setSelectedVersion(rel.version)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 border transition-all cursor-pointer ${
                    selectedVersion === rel.version
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-sm'
                      : 'glass-subtle text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {rel.version} ({rel.date})
                </button>
              ))}
            </div>
          )}

          {/* Headline Summary */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-brand-500/10 to-indigo-500/10 border border-brand-500/20">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {currentChangelog.title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-medium">
              {currentChangelog.summary}
            </p>
          </div>

          {/* Key Highlights */}
          {currentChangelog.highlights && currentChangelog.highlights.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Key Highlights
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentChangelog.highlights.map((hl, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl glass-subtle flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200 font-semibold"
                  >
                    <span className="w-5 h-5 rounded-lg bg-brand-500/15 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 text-[10px] font-black">
                      ✓
                    </span>
                    <span>{hl}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Features */}
          {currentChangelog.features && currentChangelog.features.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                New Features & Capabilities
              </h4>
              <div className="space-y-2">
                {currentChangelog.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-3xl glass-subtle flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <h5 className="text-xs font-black text-slate-900 dark:text-white">
                        {feat.title}
                      </h5>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        {feat.description}
                      </p>
                    </div>
                    {feat.tag && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/25 shrink-0">
                        {feat.tag}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fixes and Improvements */}
          {currentChangelog.fixes && currentChangelog.fixes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Fixes & Optimizations
              </h4>
              <ul className="space-y-2 p-4 rounded-3xl glass-subtle text-xs text-slate-600 dark:text-slate-300 font-medium">
                {currentChangelog.fixes.map((fix, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>{fix}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="pt-4 mt-2 border-t border-slate-200/50 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Encrypted • Fast • Progressive Web App</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleReload}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl glass-subtle text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 active:scale-95 text-white text-xs font-black shadow-md shadow-brand-600/30 flex items-center justify-center gap-1.5 transition-all border border-white/20 cursor-pointer"
            >
              <span>Explore Features</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
