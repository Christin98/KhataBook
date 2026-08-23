'use client';

import React, { useState } from 'react';
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  Calendar,
  AlertTriangle,
  Users,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CreditCard,
  CheckCircle2,
  ExternalLink,
  BellRing
} from 'lucide-react';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import { AppNotification, NotificationType } from '@/lib/types';
import { formatCurrency } from '@/lib/calculations';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const {
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotification,
    clearAllNotifications,
    setIsWhatsNewOpen,
    browserNotificationPermission,
    requestBrowserNotificationPermission,
    markReminderPaid,
    accounts,
    user
  } = useData();

  const [selectedTab, setSelectedTab] = useState<string>('all');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (selectedTab === 'all') return true;
    return n.type === selectedTab;
  });

  const getNotificationIcon = (type: NotificationType, priority?: string) => {
    switch (type) {
      case 'reminder':
        return priority === 'high' ? (
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
        );
      case 'budget':
        return (
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        );
      case 'circle':
        return (
          <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        );
      case 'update':
        return (
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-slate-500/10 text-slate-600 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
        );
    }
  };

  const handleActionClick = (notification: AppNotification) => {
    markNotificationAsRead(notification.id);
    if (notification.type === 'update') {
      setIsWhatsNewOpen(true);
      onClose();
    } else if (notification.type === 'reminder' && notification.metadata?.reminderId) {
      markReminderPaid(notification.metadata.reminderId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-100 dark:border-slate-800 flex flex-col z-10 animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Notifications</span>
                  {unreadNotificationCount > 0 && (
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-extrabold bg-rose-500 text-white">
                      {unreadNotificationCount} New
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-500">Bill dues, budget alerts & releases</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={markAllNotificationsAsRead}
                    title="Mark all as read"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                  <button
                    onClick={clearAllNotifications}
                    title="Clear all"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Browser Permission Banner (if not yet enabled) */}
          {browserNotificationPermission === 'default' && (
            <div className="p-3.5 bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-950/40 dark:to-indigo-950/20 border-b border-brand-100 dark:border-brand-900/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <BellRing className="w-4 h-4 text-brand-600 shrink-0 animate-bounce" />
                <p className="text-xs text-brand-900 dark:text-brand-200 font-semibold leading-tight">
                  Enable browser alerts for bill due dates
                </p>
              </div>
              <button
                onClick={() => requestBrowserNotificationPermission && requestBrowserNotificationPermission()}
                className="px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-[11px] font-bold shadow-sm shrink-0"
              >
                Allow
              </button>
            </div>
          )}

          {/* Filter Pills */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto select-none">
            {[
              { id: 'all', label: 'All' },
              { id: 'reminder', label: 'Reminders' },
              { id: 'budget', label: 'Budgets' },
              { id: 'circle', label: 'Circles' },
              { id: 'update', label: 'Updates' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  selectedTab === tab.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">All caught up!</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  No notifications matching this filter. You're completely on track with your finances.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationAsRead(notif.id)}
                  className={`relative p-4 rounded-2xl border transition-all cursor-pointer ${
                    notif.read
                      ? 'bg-slate-50/70 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 opacity-80'
                      : 'bg-white dark:bg-slate-800/80 border-brand-200/60 dark:border-brand-800/60 shadow-sm'
                  }`}
                >
                  {!notif.read && (
                    <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-brand-600 ring-2 ring-white dark:ring-slate-900" />
                  )}

                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notif.type, notif.priority)}

                    <div className="flex-1 min-w-0 pr-4 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {notif.title}
                        </h4>
                        {notif.priority === 'high' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-rose-100 dark:bg-rose-950 text-rose-600">
                            Urgent
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[10px] text-slate-400">{notif.date}</span>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          {notif.actionLabel && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleActionClick(notif);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-[11px] font-bold flex items-center gap-1"
                            >
                              <span>{notif.actionLabel}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          {notif.link && (
                            <Link
                              href={notif.link}
                              onClick={(e) => {
                                e.stopPropagation();
                                markNotificationAsRead(notif.id);
                                onClose();
                              }}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              View
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Info */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-400">
            <button
              onClick={() => {
                setIsWhatsNewOpen(true);
                onClose();
              }}
              className="text-brand-600 dark:text-brand-400 font-bold hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>What's New in KhataKithab</span>
            </button>
            <span className="text-[11px] font-mono">v0.3.4</span>
          </div>
        </div>
      </div>
    </div>
  );
}
