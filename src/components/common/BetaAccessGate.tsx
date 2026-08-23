'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, KeyRound, ArrowRight, Lock, CheckCircle2, AlertCircle, LogIn, ExternalLink } from 'lucide-react';
import { APP_INFO } from '@/lib/constants';
import { useData } from '@/context/DataContext';

const VALID_BETA_CODES = [
  'KHATA-BETA-2026',
  'BETA1998',
  'KHATA2026',
  'BETA-TESTER',
  ...(process.env.NEXT_PUBLIC_BETA_ACCESS_CODE ? [process.env.NEXT_PUBLIC_BETA_ACCESS_CODE.trim().toUpperCase()] : [])
];

export const BETA_STORAGE_KEY = 'khatakithab_beta_access_granted';

export default function BetaAccessGate({ children }: { children: React.ReactNode }) {
  const { firebaseUser, signInWithGoogle, isAuthModalOpen, setIsAuthModalOpen } = useData();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Check if current build is Beta
  const isBetaEnvironment = APP_INFO.isBeta || process.env.NEXT_PUBLIC_APP_ENV === 'beta';

  useEffect(() => {
    // If not in beta environment (e.g. Production build), allow unrestricted access
    if (!isBetaEnvironment) {
      setHasAccess(true);
      return;
    }

    // Check if already unlocked via localStorage
    const savedAccess = localStorage.getItem(BETA_STORAGE_KEY);
    if (savedAccess === 'true') {
      setHasAccess(true);
      return;
    }

    // Developer auto-grant
    if (firebaseUser) {
      const devUid = 'kW7ipg0EapgXqDGqNcoYVGeQaC52';
      const devEmail = 'christinkoshy1998@gmail.com';
      if (firebaseUser.uid === devUid || firebaseUser.email?.toLowerCase() === devEmail) {
        localStorage.setItem(BETA_STORAGE_KEY, 'true');
        setHasAccess(true);
        return;
      }
    }

    setHasAccess(false);
  }, [isBetaEnvironment, firebaseUser]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = passcode.trim().toUpperCase();

    if (!cleanCode) {
      setError('Please enter your beta invite code.');
      return;
    }

    setIsVerifying(true);
    setError(null);

    setTimeout(() => {
      if (VALID_BETA_CODES.includes(cleanCode)) {
        setIsSuccess(true);
        localStorage.setItem(BETA_STORAGE_KEY, 'true');
        setTimeout(() => {
          setHasAccess(true);
        }, 600);
      } else {
        setError('Invalid beta access key. Please check with the project admin.');
        setIsVerifying(false);
      }
    }, 400);
  };

  // Loading state while checking storage
  if (hasAccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Verifying flight access...</span>
        </div>
      </div>
    );
  }

  // If granted access or not in beta mode, render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // Render Full-Screen Futuristic Beta Access Lock Gate
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 left-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Main Card */}
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/20 text-center relative">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Early Access Flight • {APP_INFO.version}</span>
          </div>

          {/* Logo / App Name */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30 mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            KhataKithab <span className="text-emerald-400">Beta</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            This preview release is private and gated for invited testers and developers. Enter your access key to enter.
          </p>

          {/* Passcode Form */}
          <form onSubmit={handleUnlock} className="mt-8 space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Beta Passcode / Invite Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. KHATA-BETA-2026"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all uppercase"
                  autoFocus
                />
              </div>
              {error && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 mt-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isVerifying || isSuccess}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                isSuccess
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-500/20 active:scale-[0.98]'
              }`}
            >
              {isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Access Granted!
                </>
              ) : isVerifying ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Unlock KhataKithab</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-900 px-3 text-slate-500 font-medium">or tester login</span>
            </div>
          </div>

          {/* Developer / Tester Google Sign-In */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={async () => {
                try {
                  await signInWithGoogle();
                } catch (err: any) {
                  setError(err?.message || 'Authentication failed.');
                }
              }}
              className="w-full py-2.5 px-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn className="w-4 h-4 text-emerald-400" />
              <span>Sign In with Google (Auto-Unlocks Admins)</span>
            </button>

            <p className="text-[11px] text-slate-500 text-center">
              Don&apos;t have a code? Contact{' '}
              <a
                href="mailto:christinkoshy1998@gmail.com?subject=KhataKithab%20Beta%20Access%20Request"
                className="text-emerald-400 hover:underline font-medium inline-flex items-center gap-0.5"
              >
                christinkoshy1998@gmail.com
                <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
              </a>
            </p>
          </div>

          {/* Build Info Footer inside Card */}
          <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
            <span className="font-mono">{APP_INFO.versionFull}</span>
            <span>Security Gate v1.0</span>
          </div>

        </div>
      </div>
    </div>
  );
}
