'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, X, Check, ArrowRight, ShieldCheck, Bell, Users, RefreshCw, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CHANGELOG_RELEASES, CURRENT_RELEASE } from '@/lib/changelog';
import { APP_INFO } from '@/lib/constants';

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WhatsNewModal({ isOpen, onClose }: WhatsNewModalProps) {
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [selectedVersion, setSelectedVersion] = useState<string>(CURRENT_RELEASE.version);

  useEffect(() => {
    if (isOpen) {
      // Trigger festive confetti
      try {
        confetti({
          particleCount: 60,
          spread: 80,
          origin: { y: 0.5 }
        });
      } catch (e) {}

      // Save version as seen
      if (typeof window !== 'undefined') {
        localStorage.setItem('khatakithab_last_seen_version', APP_INFO.version);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentChangelog = CHANGELOG_RELEASES.find((r) => r.version === selectedVersion) || CURRENT_RELEASE;

  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  What's New
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                  {APP_INFO.version}
                </span>
                {APP_INFO.isBeta ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                    Beta Flight
                  </span>
                ) : APP_INFO.isDev ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                    Dev Build
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Released {currentChangelog.date} • {currentChangelog.stage}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 pt-4 pb-2">
          <button
            onClick={() => {
              setActiveTab('current');
              setSelectedVersion(CURRENT_RELEASE.version);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'current'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Current Release ({CURRENT_RELEASE.version})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Version History
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 py-2 space-y-6">
          {activeTab === 'history' && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {CHANGELOG_RELEASES.map((rel) => (
                <button
                  key={rel.version}
                  onClick={() => setSelectedVersion(rel.version)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 border transition-all ${
                    selectedVersion === rel.version
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {rel.version} ({rel.date})
                </button>
              ))}
            </div>
          )}

          {/* Headline Summary */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-50 to-indigo-50/50 dark:from-brand-950/40 dark:to-indigo-950/20 border border-brand-100 dark:border-brand-900/40">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {currentChangelog.title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {currentChangelog.summary}
            </p>
          </div>

          {/* Key Highlights */}
          {currentChangelog.highlights && currentChangelog.highlights.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Key Highlights
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentChangelog.highlights.map((hl, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200 font-medium"
                  >
                    <span className="w-5 h-5 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 text-[10px] font-bold">
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
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                New Features & Capabilities
              </h4>
              <div className="space-y-2">
                {currentChangelog.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                        {feat.title}
                      </h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {feat.description}
                      </p>
                    </div>
                    {feat.tag && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shrink-0">
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
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Fixes & System Improvements
              </h4>
              <ul className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                {currentChangelog.fixes.map((fix, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>{fix}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Encrypted • Fast • Progressive Web App</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleReload}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh App</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-brand-600/30 flex items-center justify-center gap-1.5 transition-all"
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
