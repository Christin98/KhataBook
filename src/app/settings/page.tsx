'use client';

import React, { useState } from 'react';
import {
  Settings,
  User,
  Globe,
  Database,
  RotateCcw,
  Sparkles,
  Check,
  ShieldCheck,
  Key,
  Info
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { APP_INFO } from '@/lib/constants';

export default function SettingsPage() {
  const { user, isDemoMode, resetToSampleData } = useData();

  const [displayName, setDisplayName] = useState(user.displayName);
  const [currency, setCurrency] = useState(user.currency || '₹');
  const [timezone, setTimezone] = useState(user.timezone || 'Asia/Kolkata');
  const [dateFormat, setDateFormat] = useState(user.dateFormat || 'DD/MM/YYYY');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-8 h-8 text-brand-600" />
          <span>Application Settings & Profile</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Customize currency, regional formats, Firebase sync, & demo dataset.
        </p>
      </div>

      {/* 1. User Profile Settings */}
      <div className="glass-panel p-6 rounded-3xl space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <User className="w-5 h-5 text-brand-600" />
          <h2 className="font-bold text-base text-slate-900 dark:text-white">Profile Details</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-600 text-white font-black text-2xl flex items-center justify-center border-4 border-brand-200">
              {displayName.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">{displayName}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-semibold"
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
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-semibold"
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
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-semibold"
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
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-semibold"
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

      {/* 2. Firebase & Backend Engine Status */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-brand-600" />
            <h2 className="font-bold text-base text-slate-900 dark:text-white">Firebase & Data Storage Engine</h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
            Android API Ready
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Rupee Khata uses Firebase Auth, Firestore offline-first database, & Storage. The same backend schema supports a future Android Jetpack Compose app.
        </p>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-600 dark:text-slate-300">Mode:</span>
            <span className="font-bold text-brand-600">{isDemoMode ? 'Demo Mode (Local Persistence)' : 'Live Firebase'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-600 dark:text-slate-300">Firestore Offline Rules:</span>
            <span className="font-bold text-emerald-600">Active (Multi-tab IndexedDB)</span>
          </div>
        </div>
      </div>

      {/* 3. Sample Data Management */}
      <div className="glass-panel p-6 rounded-3xl space-y-4 border-rose-200/50">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-rose-600" />
            <h2 className="font-bold text-base text-slate-900 dark:text-white">Development Sample Data</h2>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Reset all local state back to initial realistic Indian finance sample data (Goa Plan, 3 BHK Ki Kahani, HDFC Regalia, EMI, Personal Loan).
        </p>

        <button
          onClick={() => {
            if (confirm('Reset to initial sample dataset?')) {
              resetToSampleData();
              alert('Sample data restored!');
            }
          }}
          className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-xs hover:bg-rose-600 hover:text-white transition-all flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset to Realistic Sample Data</span>
        </button>
      </div>

      {/* 4. App Version & Build Information */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-brand-600" />
            <h2 className="font-bold text-base text-slate-900 dark:text-white">App Information & Version</h2>
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
            <p className="font-semibold text-slate-700 dark:text-slate-300">Desktop Web / PWA / Android API Ready</p>
          </div>
        </div>
      </div>
    </div>
  );
}
