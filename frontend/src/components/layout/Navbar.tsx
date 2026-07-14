'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useCreatorStore } from '@/store/useCreatorStore';
import { useAuth } from '@/context/AuthContext';
import ProfileModal from '@/components/shared/ProfileModal';
import SettingsModal from '@/components/shared/SettingsModal';
import UserAvatar from '@/components/shared/UserAvatar';

export default function Navbar() {
  const { searchQuery, setSearchQuery, notifications, markNotificationRead, markAllNotificationsRead, deals, assets, calendar } = useCreatorStore();
  const profile = useCreatorStore((state) => state.profile);
  const { user, logout } = useAuth();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAddPostModal, setShowAddPostModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postPlatform, setPostPlatform] = useState('YouTube');
  const [postDate, setPostDate] = useState(() => {
    // Default to tomorrow's date for scheduling
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const addPost = useCreatorStore((state) => state.addPost);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Close profile and search menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search query update to global store
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(localSearchQuery);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [localSearchQuery, setSearchQuery]);

  // Sync store value to local query if it changes from outside
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim()) return;
    
    addPost({
      title: postTitle,
      platform: postPlatform,
      status: 'Idea',
      schedule_date: new Date(postDate).toISOString(),
      cover_image_url: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&q=80&w=400',
      description: 'Quick idea scheduled from dashboard top navbar.'
    });
    
    setPostTitle('');
    // Reset to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setPostDate(tomorrow.toISOString().split('T')[0]);
    setShowAddPostModal(false);
  };

  // Global Search Filtering
  const cleanQuery = localSearchQuery.trim().toLowerCase();
  const matchedDeals = cleanQuery
    ? deals.filter(d => 
        d.brand_name.toLowerCase().includes(cleanQuery) || 
        d.stage.toLowerCase().includes(cleanQuery) || 
        (d.description && d.description.toLowerCase().includes(cleanQuery))
      ).slice(0, 3)
    : [];

  const matchedAssets = cleanQuery
    ? assets.filter(a => 
        a.name.toLowerCase().includes(cleanQuery) || 
        (a.folder && a.folder.toLowerCase().includes(cleanQuery))
      ).slice(0, 3)
    : [];

  const matchedCalendar = cleanQuery
    ? calendar.filter(p => 
        p.title.toLowerCase().includes(cleanQuery) || 
        p.platform.toLowerCase().includes(cleanQuery) || 
        (p.description && p.description.toLowerCase().includes(cleanQuery))
      ).slice(0, 3)
    : [];

  return (
    <>
      <header className="flex justify-between items-center h-16 px-8 sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-outline-variant/5">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-md" ref={searchRef}>
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              className="w-full bg-surface-dim/40 border border-outline-variant/20 rounded-lg pl-10 pr-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="Search analytics, deals, or assets..."
              type="text"
              value={localSearchQuery}
              onChange={(e) => {
                setLocalSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              onFocus={() => setIsSearchFocused(true)}
            />

            {/* Global Search Results Dropdown */}
            {isSearchFocused && localSearchQuery.trim() !== '' && (
              <div className="absolute top-full left-0 mt-2 w-full bg-surface-card border border-outline-variant/10 rounded-xl shadow-2xl p-4 z-50 max-h-96 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                {matchedDeals.length === 0 && matchedAssets.length === 0 && matchedCalendar.length === 0 ? (
                  <div className="text-center py-6 text-on-surface-variant">
                    <span className="material-symbols-outlined text-3xl mb-2 block text-outline-variant">search_off</span>
                    <p className="text-xs">No results found for &quot;{localSearchQuery}&quot;</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {matchedDeals.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-label">Brand Deals</h4>
                        <div className="space-y-1">
                          {matchedDeals.map(deal => (
                            <Link
                              key={deal.id}
                              href="/dashboard/deals"
                              onClick={() => {
                                setIsSearchFocused(false);
                                setLocalSearchQuery('');
                              }}
                              className="flex items-center justify-between p-2 hover:bg-surface-dim/80 rounded-lg transition-colors group"
                            >
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <span className="material-symbols-outlined text-[18px] text-primary">handshake</span>
                                <span className="text-xs text-white truncate font-medium">{deal.brand_name}</span>
                              </div>
                              <span className="text-[10px] font-label text-on-surface-variant uppercase bg-surface-container px-2 py-0.5 rounded">
                                {deal.stage}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {matchedAssets.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-label">Assets</h4>
                        <div className="space-y-1">
                          {matchedAssets.map(asset => (
                            <Link
                              key={asset.id}
                              href="/dashboard/assets"
                              onClick={() => {
                                setIsSearchFocused(false);
                                setLocalSearchQuery('');
                              }}
                              className="flex items-center justify-between p-2 hover:bg-surface-dim/80 rounded-lg transition-colors group"
                            >
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <span className="material-symbols-outlined text-[18px] text-cyan-400">folder_open</span>
                                <span className="text-xs text-white truncate font-medium">{asset.name}</span>
                              </div>
                              <span className="text-[10px] font-label text-on-surface-variant uppercase bg-surface-container px-2 py-0.5 rounded">
                                {asset.folder}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {matchedCalendar.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-label">Calendar</h4>
                        <div className="space-y-1">
                          {matchedCalendar.map(post => (
                            <Link
                              key={post.id}
                              href="/dashboard/calendar"
                              onClick={() => {
                                setIsSearchFocused(false);
                                setLocalSearchQuery('');
                              }}
                              className="flex items-center justify-between p-2 hover:bg-surface-dim/80 rounded-lg transition-colors group"
                            >
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <span className="material-symbols-outlined text-[18px] text-yellow-400">calendar_today</span>
                                <span className="text-xs text-white truncate font-medium">{post.title}</span>
                              </div>
                              <span className="text-[10px] font-label text-on-surface-variant uppercase bg-surface-container px-2 py-0.5 rounded">
                                {post.platform}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Notifications Trigger */}
          <div className="relative">
            <button 
              className="relative text-on-surface-variant hover:text-on-surface transition-colors p-1"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <span className="material-symbols-outlined text-[24px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full border border-background"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-surface-card border border-outline-variant/10 rounded-xl shadow-2xl p-4 z-50">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-outline-variant/5">
                  <h4 className="text-sm font-semibold text-white">Notifications</h4>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => markAllNotificationsRead()}
                      className="text-xs text-primary hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-on-surface-variant text-center py-4">No notifications</p>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`p-2 rounded-lg text-left transition-colors ${notif.is_read ? 'opacity-60' : 'bg-primary-container/5 border-l-2 border-primary'}`}
                        onClick={() => markNotificationRead(notif.id)}
                      >
                        <div className="flex justify-between items-start mb-0.5">
                          <p className="text-xs font-bold text-white">{notif.title}</p>
                          <span className="text-[10px] text-on-surface-variant">{notif.date || 'now'}</span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-[1px] bg-outline-variant/20"></div>

          <button 
            onClick={() => setShowAddPostModal(true)}
            className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg text-sm font-bold active:scale-95 transition-all shadow-lg shadow-primary/20"
          >
            + New Post
          </button>

          {/* Profile Menu Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(prev => !prev)}
              className="flex items-center gap-2 rounded-full p-1 hover:bg-surface-dim/80 transition-colors focus:outline-none"
              aria-label="Profile menu"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-outline-variant/10">
                <UserAvatar
                  avatarUrl={profile?.avatar_url}
                  name={profile?.full_name || user?.user_metadata?.full_name}
                  size={32}
                  className="w-full h-full"
                />
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-64 bg-surface-card border border-outline-variant/10 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-outline-variant/10">
                    <UserAvatar
                      avatarUrl={profile?.avatar_url}
                      name={profile?.full_name || user?.user_metadata?.full_name}
                      size={40}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-white truncate">{profile?.full_name || user?.user_metadata?.full_name || 'Creator'}</p>
                    <p className="text-xs text-on-surface-variant truncate">{user?.email || ''}</p>
                  </div>
                </div>
                <hr className="border-outline-variant/10 mb-3" />
                <button 
                  onClick={() => {
                    setShowProfileModal(true);
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left text-sm text-on-surface hover:text-primary py-2 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  View Profile
                </button>
                <button 
                  onClick={() => {
                    setShowSettingsModal(true);
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left text-sm text-on-surface hover:text-primary py-2 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">settings</span>
                  Settings
                </button>
                <button 
                  onClick={() => {
                    logout();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left text-sm text-error hover:text-error/80 py-2 transition-colors flex items-center gap-2 mt-1 border-t border-outline-variant/5 pt-3"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Add Post Dialog */}
      {showAddPostModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-card border border-outline-variant/10 rounded-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setShowAddPostModal(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="text-lg font-bold text-white mb-4">Quick Schedule Post</h3>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                  Post Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js 15 Performance Review"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                  Platform
                </label>
                <select
                  value={postPlatform}
                  onChange={(e) => setPostPlatform(e.target.value)}
                  className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="YouTube">YouTube</option>
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Twitter">Twitter</option>
                  <option value="Twitch">Twitch</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                  Schedule Date
                </label>
                <input
                  type="date"
                  required
                  value={postDate}
                  onChange={(e) => setPostDate(e.target.value)}
                  className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary font-label"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddPostModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-primary hover:bg-primary-hover text-white rounded-lg"
                >
                  Add to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Details Dialog */}
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />

      {/* Settings Preferences Dialog */}
      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
    </>
  );
}
