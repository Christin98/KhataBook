'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check, Loader2, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { DatePeriod } from '@/lib/types';
import { PERIOD_OPTIONS, getDateRangeForPeriod } from '@/lib/calculations';

interface PeriodSelectorProps {
  className?: string;
  variant?: 'compact' | 'expanded' | 'toolbar';
}

export default function PeriodSelector({ className = '', variant = 'expanded' }: PeriodSelectorProps) {
  const { selectedPeriod, setSelectedPeriod, preferencesError, setPreferencesError } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeOption = PERIOD_OPTIONS.find((p) => p.id === selectedPeriod) || PERIOD_OPTIONS[0];
  const dateRange = getDateRangeForPeriod(selectedPeriod);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelectPeriod = async (periodId: DatePeriod) => {
    if (periodId === selectedPeriod) {
      setIsOpen(false);
      return;
    }
    setIsOpen(false);
    setIsUpdating(true);
    try {
      await setSelectedPeriod(periodId);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Error Banner if persistence failed */}
      {preferencesError && (
        <div className="absolute top-full left-0 mt-2 z-50 p-3 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-xl border border-rose-400 flex items-center gap-2 max-w-sm animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{preferencesError}</span>
          <button
            onClick={() => setPreferencesError(null)}
            className="text-white/80 hover:text-white font-black text-xs cursor-pointer p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Selector Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Date period: ${activeOption.label}. Click to change.`}
        className="group flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-xs border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-sm transition-all cursor-pointer min-h-[44px]"
      >
        <div className="w-7 h-7 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/20">
          {isUpdating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Calendar className="w-3.5 h-3.5" />
          )}
        </div>

        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-xs text-slate-900 dark:text-white leading-tight">
              {activeOption.label}
            </span>
            {selectedPeriod === 'all_time' && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold uppercase bg-brand-500/15 text-brand-700 dark:text-brand-300">
                Default
              </span>
            )}
          </div>
          {variant !== 'compact' && (
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-tight truncate max-w-[140px] sm:max-w-[180px]">
              {dateRange.formattedRange}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform duration-200 ml-1 ${
            isOpen ? 'rotate-180 text-brand-500' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Select date period"
          className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/90 dark:border-slate-800 p-2 z-50 space-y-1 animate-fadeIn backdrop-blur-xl"
        >
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1 flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Filter by Date Period
            </span>
            <Clock className="w-3.5 h-3.5 text-brand-500" />
          </div>

          {PERIOD_OPTIONS.map((option) => {
            const isSelected = option.id === selectedPeriod;
            const optionRange = getDateRangeForPeriod(option.id);

            return (
              <button
                key={option.id}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelectPeriod(option.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left min-h-[44px] ${
                  isSelected
                    ? 'bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/25 shadow-2xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent'
                }`}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs">{option.label}</span>
                    {option.id === 'all_time' && (
                      <span className="text-[10px] text-slate-400 font-normal">(Full Ledger)</span>
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                    {optionRange.formattedRange}
                  </span>
                </div>

                {isSelected ? (
                  <div className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
