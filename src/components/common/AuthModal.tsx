'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, User, LogIn, AlertCircle, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { useData } from '@/context/DataContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useData();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      setError(err?.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email.trim(), password);
      } else {
        if (!displayName.trim()) {
          setError('Please enter your display name.');
          setLoading(false);
          return;
        }
        await signUpWithEmail(email.trim(), password, displayName.trim());
      }
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      let errMsg = err?.message || 'Authentication failed. Please check your credentials.';
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/user-not-found') {
        errMsg = 'Invalid email or password.';
      } else if (err?.code === 'auth/email-already-in-use') {
        errMsg = 'An account with this email already exists.';
      } else if (err?.code === 'auth/weak-password') {
        errMsg = 'Password should be at least 6 characters.';
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Frosted Scrim */}
      <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md" onClick={onClose} />

      <div
        className="relative w-full max-w-md glass-panel bg-white/95 dark:bg-slate-900/95 rounded-3xl shadow-2xl border border-white/40 dark:border-white/10 overflow-hidden z-10 space-y-5 p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 border border-white/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white leading-snug">Welcome to KhataKithab</h2>
              <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold">Realtime Cloud Sync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container */}
        <div className="space-y-4">
          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl glass-subtle hover:bg-white/80 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-sm transition-all active:scale-[0.99] disabled:opacity-60 border border-slate-200 dark:border-white/10 cursor-pointer"
          >
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200/50 dark:border-white/10 w-full" />
            <span className="glass-pill px-3 py-0.5 rounded-full text-[10px] text-slate-400 font-bold uppercase tracking-wider shrink-0">
              or with email
            </span>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-brand-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full pl-10 pr-3.5 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-brand-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-brand-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 active:scale-[0.99] text-white font-black text-xs shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 border border-white/20 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{mode === 'signin' ? 'Sign In to Ledger' : 'Create Account'}</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setError(null);
                }}
                className="ml-1.5 text-brand-600 dark:text-brand-400 font-bold hover:underline cursor-pointer"
              >
                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
