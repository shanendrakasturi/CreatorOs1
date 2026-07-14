'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCreatorStore } from '@/store/useCreatorStore';
import { useAuth } from '@/context/AuthContext';
import UserAvatar from '@/components/shared/UserAvatar';

export default function Sidebar() {
  const pathname = usePathname();
  const profile = useCreatorStore((state) => state.profile);
  const notifications = useCreatorStore((state) => state.notifications);
  const { user, logout } = useAuth();

  const unreadCount = (notifications || []).filter(n => !n.is_read).length;

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Calendar', path: '/dashboard/calendar', icon: 'calendar_today' },
    { name: 'AI Captions', path: '/dashboard/captions', icon: 'auto_awesome' },
    { name: 'Creator Brain', path: '/dashboard/creator-brain', icon: 'psychology' },
    { name: 'Brand Deals', path: '/dashboard/deals', icon: 'handshake' },
    { name: 'Opportunity Radar', path: '/dashboard/opportunity-radar', icon: 'radar' },
    { name: 'Revenue', path: '/dashboard/revenue', icon: 'payments' },
    { name: 'Assets', path: '/dashboard/assets', icon: 'folder_open' },
    { name: 'Media Kit', path: '/dashboard/mediakit', icon: 'badge' },
    { name: 'Invoicing', path: '/dashboard/invoices', icon: 'receipt_long' },
    { name: 'Growth', path: '/dashboard/insights', icon: 'trending_up' },
    { name: 'Notifications', path: '/dashboard/notifications', icon: 'notifications' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-surface-dim border-r border-outline-variant/10 flex flex-col py-6 z-50">
      <div className="px-6 mb-10">
        <h1 className="font-sans text-xl font-bold text-primary">CreatorOS</h1>
        <p className="text-xs text-on-surface-variant opacity-60">Professional Hub</p>
      </div>
      
      <nav className="flex-1 space-y-1 px-2 custom-scrollbar overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const isNotifications = item.path === '/dashboard/notifications';
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 group rounded-lg ${
                isActive
                  ? 'text-white bg-primary border-r-2 border-primary-hover font-medium'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="text-sm font-medium flex-1">{item.name}</span>
              {isNotifications && unreadCount > 0 && (
                <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-error/20 text-error min-w-[18px] text-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 mt-auto">
        <div className="flex items-center justify-between p-3 rounded-xl bg-surface-card border border-outline-variant/5">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <UserAvatar
                avatarUrl={profile?.avatar_url}
                name={profile?.full_name || user?.user_metadata?.full_name}
                size={40}
                className="w-full h-full"
              />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-label font-bold truncate text-on-surface">{profile?.full_name || user?.user_metadata?.full_name || 'Creator'}</p>
              <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-wider">Pro Creator</p>
            </div>
          </div>
          <button 
            onClick={() => logout()}
            className="text-on-surface-variant hover:text-error transition-colors p-1"
            title="Log Out"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
