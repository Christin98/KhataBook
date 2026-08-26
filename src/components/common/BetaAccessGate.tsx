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
    if (!isBetaEnvironment) {
      setHasAccess(true);
      return;
    }

    const savedAccess = localStorage.getItem(BETA_STORAGE_KEY);
    if (savedAccess === 'true') {
      setHasAccess(true);
      return;
    }

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

  if (hasAccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07090e] text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Verifying flight access...</span>
        </div>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#07090e] text-slate-100 relative overflow-hidden animate-fadeIn">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-500/12 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 left-10 w-64 h-64 bg-purple-500/12 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Main Glass Card */}
        <div className="glass-card bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative space-y-5">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Early Access Flight • {APP_INFO.version}</span>
          </div>

          {/* Logo / App Name */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center mx-auto shadow-xl shadow-brand-500/30 border border-white/20">
            <Lock className="w-8 h-8 text-white" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              KhataKithab <span className="text-brand-400">Beta</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed font-medium">
              This preview release is private and gated for invited testers and developers. Enter your access key to unlock.
            </p>
          </div>

          {/* Passcode Form */}
          <form onSubmit={handleUnlock} className="space-y-4 text-left pt-2">
            <div>
              <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                Beta Passcode / Invite Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-500">
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
                  className="w-full pl-10 pr-4 py-3 glass-input rounded-2xl text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none uppercase font-bold"
                  autoFocus
                />
              </div>
              {error && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 mt-2 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isVerifying || isSuccess}
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg border border-white/20 cursor-pointer ${
                isSuccess
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-brand-500/25 active:scale-[0.98]'
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
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="glass-pill px-3 py-0.5 rounded-full text-slate-500 font-bold text-[10px] uppercase">or tester login</span>
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
              className="w-full py-2.5 px-4 glass-subtle hover:bg-slate-800/80 rounded-2xl text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer border border-white/10"
            >
              <LogIn className="w-4 h-4 text-brand-400" />
              <span>Sign In with Google (Auto-Unlocks Admins)</span>
            </button>

            <p className="text-[11px] text-slate-500 text-center font-medium">
              Don&apos;t have a code? Contact{' '}
              <a
                href="mailto:christinkoshy1998@gmail.com?subject=KhataKithab%20Beta%20Access%20Request"
                className="text-brand-400 hover:underline font-bold inline-flex items-center gap-0.5"
              >
                christinkoshy1998@gmail.com
                <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
              </a>
            </p>
          </div>

          {/* Build Info Footer */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span className="font-mono">{APP_INFO.versionFull}</span>
            <span>Security Gate v1.0</span>
          </div>

        </div>
      </div>
    </div>
  );
}
