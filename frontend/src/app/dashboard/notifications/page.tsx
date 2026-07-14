'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useCreatorStore } from '@/store/useCreatorStore';
import Link from 'next/link';

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead, deleteNotification } = useCreatorStore();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
  };

  const filteredNotifs = (notifications || []).filter(n => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'deal': return 'handshake';
      case 'invoice': return 'receipt_long';
      case 'calendar': return 'calendar_today';
      case 'system': return 'settings';
      default: return 'notifications';
    }
  };

  const getNotifColor = (type: string) => {
    switch (type) {
      case 'deal': return 'text-primary bg-primary/10';
      case 'invoice': return 'text-success bg-success/10';
      case 'calendar': return 'text-warning bg-warning/10';
      default: return 'text-on-surface-variant bg-surface-container';
    }
  };

  const getNotifLabel = (type: string) => {
    switch (type) {
      case 'deal': return 'Brand Deal';
      case 'invoice': return 'Invoicing';
      case 'calendar': return 'Calendar';
      default: return 'Alert';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Notifications</h1>
          <p className="text-sm text-on-surface-variant mt-1">Manage your activity alerts and business updates</p>
        </div>

        {notifications && notifications.some(n => !n.is_read) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-4 py-2 bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 rounded-xl text-xs font-semibold text-white hover:text-primary transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">drafts</span>
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-outline-variant/10 pb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
            filter === 'all'
              ? 'bg-primary text-white font-bold'
              : 'bg-surface-container text-on-surface-variant hover:text-white hover:bg-surface-container-high'
          }`}
        >
          All Alerts ({notifications ? notifications.length : 0})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
            filter === 'unread'
              ? 'bg-primary text-white font-bold'
              : 'bg-surface-container text-on-surface-variant hover:text-white hover:bg-surface-container-high'
          }`}
        >
          Unread ({notifications ? notifications.filter(n => !n.is_read).length : 0})
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifs.length === 0 ? (
        <div className="glass-panel p-16 text-center">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/40 mb-4 block">notifications_off</span>
          <h3 className="text-lg font-bold text-white mb-2">No alerts found</h3>
          <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
            {filter === 'unread' 
              ? 'You have cleared all unread notifications. Awesome work!' 
              : 'Your notification inbox is currently empty.'}
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl transition-all inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map((n) => {
            const displayTime = n.date || (n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Just now');
            
            return (
              <div
                key={n.id}
                className={`glass-panel p-5 flex items-start justify-between gap-4 transition-all duration-300 ${
                  !n.is_read 
                    ? 'border-primary/30 bg-surface-dim/40' 
                    : 'border-outline-variant/10 opacity-80'
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  {/* Category Icon Badge */}
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${getNotifColor(n.type)}`}>
                    <span className="material-symbols-outlined text-[20px]">{getNotifIcon(n.type)}</span>
                  </div>

                  {/* Body Content */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white leading-none">{n.title}</h4>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant uppercase tracking-wider">
                        {getNotifLabel(n.type)}
                      </span>
                      {!n.is_read && (
                        <span className="h-2 w-2 rounded-full bg-primary animate-pulse" title="Unread" />
                      )}
                    </div>
                    <p className="text-xs text-on-surface leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-on-surface-variant font-label mt-1">{displayTime}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!n.is_read && (
                    <button
                      onClick={() => markNotificationRead(n.id)}
                      className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                      title="Mark as Read"
                    >
                      <span className="material-symbols-outlined text-[18px]">drafts</span>
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(n.id)}
                    className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                    title="Delete Notification"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
