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
import { APP_INFO } from '@/lib/constants';

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
          <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-600 flex items-center justify-center shrink-0 border border-rose-500/30">
            <Calendar className="w-5 h-5" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0 border border-amber-500/30">
            <Calendar className="w-5 h-5" />
          </div>
        );
      case 'budget':
        return (
          <div className="w-10 h-10 rounded-2xl bg-orange-500/15 text-orange-600 flex items-center justify-center shrink-0 border border-orange-500/30">
            <AlertTriangle className="w-5 h-5" />
          </div>
        );
      case 'circle':
        return (
          <div className="w-10 h-10 rounded-2xl bg-brand-500/15 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/30">
            <Users className="w-5 h-5" />
          </div>
        );
      case 'update':
        return (
          <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-600 flex items-center justify-center shrink-0 border border-purple-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-2xl bg-slate-500/15 text-slate-600 flex items-center justify-center shrink-0 border border-slate-500/30">
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
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Frosted Scrim Backdrop */}
      <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md transition-opacity" onClick={onClose} />

      {/* Slide-over Glass Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md glass-panel bg-white/95 dark:bg-slate-900/95 shadow-2xl border-l border-white/40 dark:border-white/10 flex flex-col z-10">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-200/50 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-500/15 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold border border-brand-500/30 shadow-inner">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Notifications</span>
                  {unreadNotificationCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs">
                      {unreadNotificationCount} New
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">Bill dues, budget alerts & releases</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={markAllNotificationsAsRead}
                    title="Mark all as read"
                    className="p-2 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                  <button
                    onClick={clearAllNotifications}
                    title="Clear all"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Browser Permission Banner */}
          {browserNotificationPermission === 'default' && (
            <div className="p-3.5 bg-gradient-to-r from-brand-500/10 to-indigo-500/10 border-b border-brand-500/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <BellRing className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 animate-bounce" />
                <p className="text-xs text-brand-900 dark:text-brand-200 font-bold leading-tight">
                  Enable browser alerts for bill due alarms
                </p>
              </div>
              <button
                onClick={() => requestBrowserNotificationPermission && requestBrowserNotificationPermission()}
                className="px-3 py-1 rounded-xl bg-brand-600 hover:bg-brand-500 active:scale-95 text-white text-[11px] font-black shadow-sm shrink-0 cursor-pointer"
              >
                Allow
              </button>
            </div>
          )}

          {/* Filter Pills */}
          <div className="px-4 py-3 border-b border-slate-200/50 dark:border-white/10 flex items-center gap-1.5 overflow-x-auto select-none">
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
                className={`px-3 py-1 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                  selectedTab === tab.id
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'glass-subtle text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-14 h-14 rounded-3xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-inner">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <p className="text-sm font-black text-slate-800 dark:text-slate-200">All caught up!</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto font-medium">
                  No notifications in this filter. You are completely on track with your finances.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationAsRead(notif.id)}
                  className={`relative p-4 rounded-3xl border transition-all cursor-pointer ${
                    notif.read
                      ? 'glass-subtle opacity-70 border-slate-200/50 dark:border-white/5'
                      : 'glass-card border-brand-500/30 shadow-md'
                  }`}
                >
                  {!notif.read && (
                    <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-brand-600 ring-2 ring-white dark:ring-slate-900 shadow-sm" />
                  )}

                  <div className="flex items-start gap-3.5">
                    {getNotificationIcon(notif.type, notif.priority)}

                    <div className="flex-1 min-w-0 pr-4 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                          {notif.title}
                        </h4>
                        {notif.priority === 'high' && (
                          <span className="px-2 py-0.2 rounded-full text-[9px] font-black uppercase bg-rose-500/15 text-rose-600 border border-rose-500/30">
                            Urgent
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        {notif.message}
                      </p>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[10px] text-slate-400 font-medium">{notif.date}</span>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          {notif.actionLabel && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleActionClick(notif);
                              }}
                              className="px-3 py-1 rounded-xl bg-brand-500/15 hover:bg-brand-500/25 text-brand-700 dark:text-brand-300 text-[11px] font-black flex items-center gap-1 border border-brand-500/30 cursor-pointer"
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
                              className="px-3 py-1 rounded-xl glass-subtle text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800"
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
          <div className="p-4 border-t border-slate-200/50 dark:border-white/10 glass-subtle flex items-center justify-between text-xs text-slate-400">
            <button
              onClick={() => {
                setIsWhatsNewOpen(true);
                onClose();
              }}
              className="text-brand-600 dark:text-brand-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>What's New in KhataKithab</span>
            </button>
            <span className="text-[11px] font-mono font-bold">{APP_INFO.version}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
