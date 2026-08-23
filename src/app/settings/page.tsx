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
  ShieldAlert
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { APP_INFO } from '@/lib/constants';
import { BETA_STORAGE_KEY } from '@/components/common/BetaAccessGate';

export default function SettingsPage() {
  const {
    user,
    firebaseUser,
    setIsAuthModalOpen,
    logout,
    isDevMode,
    setIsDevMode,
    resetToCleanLedger,
    loadSampleDemoData
  } = useData();

  const [displayName, setDisplayName] = useState(user.displayName);
  const [currency, setCurrency] = useState(user.currency || '₹');
  const [timezone, setTimezone] = useState(user.timezone || 'Asia/Kolkata');
  const [dateFormat, setDateFormat] = useState(user.dateFormat || 'DD/MM/YYYY');
  const [savedSuccess, setSavedSuccess] = useState(false);

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
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-8 h-8 text-brand-600" />
          <span>Application Settings & Sync</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your account profile, Firebase cloud authentication, regional formats, and ledger options.
        </p>
      </div>

      {/* 1. Firebase Authentication & Cloud Sync Status */}
      <div className="glass-panel p-6 rounded-3xl space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-brand-600" />
            <h2 className="font-bold text-base text-slate-900 dark:text-white">Firebase Cloud & Account</h2>
          </div>
          {firebaseUser ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5" />
              <span>Realtime Cloud Active</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" />
              <span>Local Storage Mode</span>
            </span>
          )}
        </div>

        {firebaseUser ? (
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {firebaseUser.photoURL ? (
                <img
                  src={firebaseUser.photoURL}
                  alt={user.displayName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-bold text-lg flex items-center justify-center">
                  {user.displayName.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{user.displayName}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                  UID: {firebaseUser.uid.substring(0, 16)}...
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">Not Signed In</p>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                You are currently running in Local Storage mode. Sign in with Google or Email to sync your transactions and circles in real-time across all your devices.
              </p>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md flex items-center gap-2 shrink-0"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Create Account</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. User Profile Preferences */}
      <div className="glass-panel p-6 rounded-3xl space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <User className="w-5 h-5 text-brand-600" />
          <h2 className="font-bold text-base text-slate-900 dark:text-white">Profile & Preferences</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Email Address</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/50 border rounded-xl text-sm text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Currency Preference</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="₹">₹ INR (Indian Rupee)</option>
                <option value="$">$ USD (US Dollar)</option>
                <option value="€">€ EUR (Euro)</option>
                <option value="£">£ GBP (British Pound)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Date Format</label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-2"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : null}
              <span>{savedSuccess ? 'Saved!' : 'Save Preferences'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Clean Ledger Action (Available to all users) */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <h2 className="font-bold text-base text-slate-900 dark:text-white">Ledger Data Management</h2>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Clear all transactions, accounts, circles, credit cards, loans, budgets, goals, and reminders to start with a fresh clean ledger.
        </p>

        <button
          onClick={async () => {
            if (confirm('Are you sure you want to reset to a clean ledger? All current transactions and accounts will be cleared.')) {
              await resetToCleanLedger();
              alert('Ledger reset to clean state!');
            }
          }}
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset to Clean Ledger</span>
        </button>
      </div>

      {/* 4. GATED DEVELOPER / TESTER TOOLS (Restricted to developer testing) */}
      {isDeveloperUser && (
        <div className="glass-panel p-6 rounded-3xl space-y-4 border-amber-200/60 dark:border-amber-900/60">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <h2 className="font-bold text-base text-slate-900 dark:text-white">Developer / Tester Tools</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
              {isDevMode ? 'Unlocked' : 'Restricted'}
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Demo sample data seeding is restricted strictly to developer testing. Passcode access is required to unlock testing features.
          </p>

          {isDevMode ? (
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-bold">
                  <Unlock className="w-4 h-4" />
                  <span>Developer Mode Activated</span>
                </div>
                <button
                  onClick={() => setIsDevMode(false)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
                >
                  Lock Dev Tools
                </button>
              </div>

              <p className="text-xs text-amber-700 dark:text-amber-400">
                You can now seed your personal account with realistic sample demo data (Goa Plan circle, 3 BHK Flatmates, HDFC Regalia, EMIs, & Loans).
              </p>

              <button
                onClick={async () => {
                  if (confirm('Load sample demo dataset for developer testing?')) {
                    await loadSampleDemoData();
                    alert('Sample demo data successfully loaded!');
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Load Sample Demo Data (Developer Testing)</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleUnlockDevMode} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={devPasscode}
                  onChange={(e) => setDevPasscode(e.target.value)}
                  placeholder="Enter Dev Passcode (1998)..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-sm transition-all"
              >
                Unlock Dev Mode
              </button>
              {devError && <p className="text-xs text-rose-500 font-semibold">{devError}</p>}
            </form>
          )}
        </div>
      )}

      {/* Beta Flight Access Management */}
      {APP_INFO.isBeta && (
        <div className="glass-panel p-6 rounded-3xl space-y-4 border-amber-200/60 dark:border-amber-900/60">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="font-bold text-base text-slate-900 dark:text-white">Beta Flight Early Access</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
              Active Beta Preview
            </span>
          </div>

          <p className="text-xs text-slate-500">
            This deployment is running on the <strong className="text-slate-700 dark:text-slate-300">Beta Flight Channel</strong>. Unlocked access is persisted locally in your browser.
          </p>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 text-xs font-medium text-amber-800 dark:text-amber-300">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Beta Access Key Verified & Active</span>
            </div>
            <button
              onClick={() => {
                if (confirm('Lock Beta Access? You will be prompted to re-enter your beta invite key on next refresh.')) {
                  localStorage.removeItem(BETA_STORAGE_KEY);
                  window.location.reload();
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-semibold transition-all"
            >
              Lock & Re-test Gate
            </button>
          </div>
        </div>
      )}

      {/* 5. App Version & Build Information */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-brand-600" />
            <h2 className="font-bold text-base text-slate-900 dark:text-white">App Information & Build</h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-mono">
            {APP_INFO.version}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
            <p className="text-slate-400 font-medium">Application Name</p>
            <p className="font-bold text-slate-900 dark:text-white">{APP_INFO.name}</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
            <p className="text-slate-400 font-medium">Current Build</p>
            <p className="font-bold text-slate-900 dark:text-white">{APP_INFO.build}</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
            <p className="text-slate-400 font-medium">Architecture & Tech</p>
            <p className="font-semibold text-slate-700 dark:text-slate-300">{APP_INFO.techStack}</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
            <p className="text-slate-400 font-medium">Platform Platform</p>
            <p className="font-semibold text-slate-700 dark:text-slate-300">Desktop Web / PWA / Firebase Cloud Engine</p>
          </div>
        </div>
      </div>
    </div>
  );
}
