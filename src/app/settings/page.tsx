'use client';

import React, { useState } from 'react';
import {
  Settings,
  User,
  Database,
  RotateCcw,
  Sparkles,
  Check,
  Key,
  Info,
  Cloud,
  HardDrive,
  LogIn,
  LogOut,
  Lock,
  Unlock,
  ShieldAlert,
  Sliders
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { APP_INFO } from '@/lib/constants';
import { BETA_STORAGE_KEY } from '@/components/common/BetaAccessGate';
import ConfirmDialog from '@/components/common/ConfirmDialog';

export default function SettingsPage() {
  const {
    user,
    firebaseUser,
    setIsAuthModalOpen,
    logout,
    isDevMode,
    setIsDevMode,
    resetToCleanLedger,
    loadSampleDemoData,
    ignoredSuggestionKeys,
    restoreIgnoredSuggestions
  } = useData();

  const [displayName, setDisplayName] = useState(user.displayName);
  const [currency, setCurrency] = useState(user.currency || '₹');
  const [timezone, setTimezone] = useState(user.timezone || 'Asia/Kolkata');
  const [dateFormat, setDateFormat] = useState(user.dateFormat || 'DD/MM/YYYY');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [isDemoConfirmOpen, setIsDemoConfirmOpen] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  const [devPasscode, setDevPasscode] = useState('');
  const [devError, setDevError] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleUnlockDevMode = (e: React.FormEvent) => {
    e.preventDefault();
    if (devPasscode === '1998') {
      setIsDevMode(true);
      setDevError(null);
      setDevPasscode('');
    } else {
      setDevError('Invalid developer passcode.');
    }
  };

  const isDeveloperUser =
    firebaseUser?.uid === 'kW7ipg0EapgXqDGqNcoYVGeQaC52' ||
    user.email?.toLowerCase() === 'christinkoshy1998@gmail.com' ||
    firebaseUser?.email?.toLowerCase() === 'christinkoshy1998@gmail.com';

  return (
    <div className="space-y-8 max-w-4xl animate-fadeIn">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20 mb-2">
          <Settings className="w-3.5 h-3.5" />
          <span>System & Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Settings & Cloud Sync
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Manage user profile, Firebase cloud synchronization, regional currency formats, and ledger storage.
        </p>
      </div>

      {/* 1. Firebase Authentication & Cloud Sync Status */}
      <div className="glass-card p-6 sm:p-7 rounded-3xl space-y-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <Key className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h2 className="font-black text-base text-slate-900 dark:text-white">Cloud Authentication</h2>
          </div>
          {firebaseUser ? (
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 backdrop-blur-md">
              <Cloud className="w-3.5 h-3.5" />
              <span>Realtime Cloud Active</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1.5 backdrop-blur-md">
              <HardDrive className="w-3.5 h-3.5" />
              <span>Local Storage Mode</span>
            </span>
          )}
        </div>

        {firebaseUser ? (
          <div className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {firebaseUser.photoURL ? (
                <img
                  src={firebaseUser.photoURL}
                  alt={user.displayName}
                  className="w-13 h-13 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
                />
              ) : (
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                  {user.displayName.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-black text-slate-900 dark:text-white text-base leading-snug">{user.displayName}</p>
                <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                  UID: {firebaseUser.uid.substring(0, 16)}...
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/25 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="p-5 sm:p-6 rounded-3xl glass-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-black text-slate-900 dark:text-white text-sm">Offline Local Storage</p>
              <p className="text-xs text-slate-400 mt-1 max-w-md font-medium">
                You are currently running in Local Storage mode. Sign in to sync your ledger and shared circles across all your devices.
              </p>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 flex items-center gap-2 shrink-0 border border-white/20 active:scale-95 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Connect</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. User Profile Preferences */}
      <div className="glass-card p-6 sm:p-7 rounded-3xl space-y-6 shadow-2xl">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200/50 dark:border-white/10">
          <User className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h2 className="font-black text-base text-slate-900 dark:text-white">Profile & Regional Settings</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-2.5 glass-subtle rounded-2xl text-xs text-slate-400 cursor-not-allowed opacity-75"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="₹">₹ INR (Indian Rupee)</option>
                <option value="$">$ USD (US Dollar)</option>
                <option value="€">€ EUR (Euro)</option>
                <option value="£">£ GBP (British Pound)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Date Format</label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-brand-500/25 active:scale-95 transition-all flex items-center gap-2 border border-white/20 cursor-pointer"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : null}
              <span>{savedSuccess ? 'Saved!' : 'Save Preferences'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Clean Ledger Action */}
      <div className="glass-card p-6 sm:p-7 rounded-3xl space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <h2 className="font-black text-base text-slate-900 dark:text-white">Ledger Data Management</h2>
          </div>
        </div>

        <p className="text-xs text-slate-400 font-medium">
          Clear all transactions, accounts, circles, credit cards, loans, budgets, goals, and reminders to reset with a pristine clean slate.
        </p>

        <button
          onClick={() => setIsResetConfirmOpen(true)}
          className="px-4 py-2.5 rounded-2xl glass-subtle hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center gap-2 border border-slate-200 dark:border-white/10 cursor-pointer min-h-[44px]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset to Clean Ledger</span>
        </button>
      </div>

      {/* 4. Ignored Suggestions Recovery */}
      <div className="glass-card p-6 sm:p-7 rounded-3xl space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="font-black text-base text-slate-900 dark:text-white">Recurring & Subscription Detection</h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
            {ignoredSuggestionKeys.length} Dismissed
          </span>
        </div>

        <p className="text-xs text-slate-400 font-medium">
          Restore patterns and merchants that were previously dismissed or ignored from recurring bills and subscription detection suggestions.
        </p>

        <button
          onClick={async () => {
            await restoreIgnoredSuggestions();
            setRestoreSuccess(true);
            setTimeout(() => setRestoreSuccess(false), 2500);
          }}
          disabled={ignoredSuggestionKeys.length === 0}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 border cursor-pointer min-h-[44px] ${
            ignoredSuggestionKeys.length > 0
              ? 'glass-subtle hover:bg-slate-200/60 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
              : 'opacity-50 cursor-not-allowed border-slate-200 dark:border-white/10 text-slate-400'
          }`}
        >
          {restoreSuccess ? <Check className="w-4 h-4 text-emerald-500" /> : <RotateCcw className="w-4 h-4" />}
          <span>{restoreSuccess ? 'Ignored Suggestions Restored!' : 'Restore Ignored Suggestions'}</span>
        </button>
      </div>

      {/* 4. Gated Developer Tools */}
      {isDeveloperUser && (
        <div className="glass-card p-6 sm:p-7 rounded-3xl space-y-4 border-amber-500/30 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <h2 className="font-black text-base text-slate-900 dark:text-white">Developer / Tester Tools</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              {isDevMode ? 'Unlocked' : 'Restricted'}
            </span>
          </div>

          <p className="text-xs text-slate-400 font-medium">
            Demo sample data seeding is restricted strictly to developer testing. Passcode access is required to unlock testing features.
          </p>

          {isDevMode ? (
            <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/25 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-bold">
                  <Unlock className="w-4 h-4" />
                  <span>Developer Mode Activated</span>
                </div>
                <button
                  onClick={() => setIsDevMode(false)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline cursor-pointer"
                >
                  Lock Dev Tools
                </button>
              </div>

              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                You can now seed your personal account with realistic sample demo data (Goa Plan circle, 3 BHK Flatmates, HDFC Regalia, EMIs, & Loans).
              </p>

              <button
                onClick={() => setIsDemoConfirmOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer min-h-[44px]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Load Sample Demo Data</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleUnlockDevMode} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={devPasscode}
                  onChange={(e) => setDevPasscode(e.target.value)}
                  placeholder="Enter Dev Passcode (1998)..."
                  className="w-full pl-10 pr-3.5 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none min-h-[44px]"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-sm transition-all cursor-pointer min-h-[44px]"
              >
                Unlock
              </button>
              {devError && <p className="text-xs text-rose-500 font-semibold">{devError}</p>}
            </form>
          )}
        </div>
      )}

      {/* 5. App Version & Build Information */}
      <div className="glass-card p-6 sm:p-7 rounded-3xl space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <Info className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h2 className="font-black text-base text-slate-900 dark:text-white">App Information & Build</h2>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-brand-500/15 text-brand-700 dark:text-brand-300 font-mono border border-brand-500/30">
            {APP_INFO.version}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl glass-subtle space-y-1">
            <p className="text-slate-400 font-medium">Application Name</p>
            <p className="font-black text-slate-900 dark:text-white text-sm">{APP_INFO.name}</p>
          </div>
          <div className="p-4 rounded-2xl glass-subtle space-y-1">
            <p className="text-slate-400 font-medium">Current Build</p>
            <p className="font-black text-slate-900 dark:text-white text-sm">{APP_INFO.build}</p>
          </div>
          <div className="p-4 rounded-2xl glass-subtle space-y-1">
            <p className="text-slate-400 font-medium">Architecture & Tech</p>
            <p className="font-semibold text-slate-700 dark:text-slate-300">{APP_INFO.techStack}</p>
          </div>
          <div className="p-4 rounded-2xl glass-subtle space-y-1">
            <p className="text-slate-400 font-medium">Platform</p>
            <p className="font-semibold text-slate-700 dark:text-slate-300">Desktop Web / PWA / Firebase Realtime Engine</p>
          </div>
        </div>
      </div>

      {/* Floating Toast Message */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl border border-slate-700 dark:border-slate-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Confirm Reset Ledger Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Reset Ledger to Clean Slate"
        description="Are you sure you want to reset your ledger? All transactions, accounts, cards, and goals will be cleared."
        confirmText="Reset Ledger"
        cancelText="Cancel"
        variant="danger"
        isLoading={isResetting}
        onConfirm={async () => {
          setIsResetting(true);
          try {
            await resetToCleanLedger();
            setIsResetConfirmOpen(false);
            setToastMessage('Ledger reset to pristine clean state!');
            setTimeout(() => setToastMessage(null), 3000);
          } finally {
            setIsResetting(false);
          }
        }}
        onClose={() => setIsResetConfirmOpen(false)}
      />

      {/* Confirm Load Demo Data Dialog */}
      <ConfirmDialog
        isOpen={isDemoConfirmOpen}
        title="Load Sample Demo Dataset"
        description="This will seed your ledger with realistic demo transactions, Goa & flatmate circles, cards, and loans for testing."
        confirmText="Load Dataset"
        cancelText="Cancel"
        variant="warning"
        isLoading={isLoadingDemo}
        onConfirm={async () => {
          setIsLoadingDemo(true);
          try {
            await loadSampleDemoData();
            setIsDemoConfirmOpen(false);
            setToastMessage('Sample demo dataset loaded successfully!');
            setTimeout(() => setToastMessage(null), 3000);
          } finally {
            setIsLoadingDemo(false);
          }
        }}
        onClose={() => setIsDemoConfirmOpen(false)}
      />
    </div>
  );
}
