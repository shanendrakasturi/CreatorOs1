'use client';

import React, { useState } from 'react';
import { useCreatorStore } from '@/store/useCreatorStore';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PLATFORM_COLORS: Record<string, string> = {
  YouTube: 'border-l-4 border-red-500 bg-red-500/5 hover:bg-red-500/10 text-red-400',
  Instagram: 'border-l-4 border-fuchsia-500 bg-fuchsia-500/5 hover:bg-fuchsia-500/10 text-fuchsia-400',
  TikTok: 'border-l-4 border-cyan-400 bg-cyan-400/5 hover:bg-cyan-400/10 text-cyan-300',
  Twitter: 'border-l-4 border-sky-400 bg-sky-400/5 hover:bg-sky-400/10 text-sky-300',
  Twitch: 'border-l-4 border-purple-500 bg-purple-500/5 hover:bg-purple-500/10 text-purple-400',
  Other: 'border-l-4 border-zinc-400 bg-zinc-400/5 hover:bg-zinc-400/10 text-zinc-300',
};

export default function CalendarView() {
  const { calendar, addPost, deletePost, searchQuery } = useCreatorStore();
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // New Post Form State
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('YouTube');
  const [status, setStatus] = useState('Idea');
  const [description, setDescription] = useState('');

  // Fixed Anchor Month: July 2026
  const year = 2026;
  const month = 6; // July (0-indexed)
  
  // First day of month (July 1, 2026 was a Wednesday)
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create padding cells for calendar grid
  const daysArray = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  // Week Mode calculation (Focusing on the week of July 12th to July 18th, 2026)
  const weekStartDay = 12; // Sunday July 12, 2026
  const weekDays = Array.from({ length: 7 }, (_, idx) => weekStartDay + idx);

  // Helper: Filter posts on a specific day in July 2026
  const getPostsForDay = (day: number) => {
    return calendar.filter((item) => {
      const date = new Date(item.schedule_date);
      const matchesDay = date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
      
      const cleanQuery = searchQuery.trim().toLowerCase();
      if (!cleanQuery) return matchesDay;

      const matchesSearch = item.title.toLowerCase().includes(cleanQuery) ||
        item.platform.toLowerCase().includes(cleanQuery) ||
        (item.description && item.description.toLowerCase().includes(cleanQuery));

      return matchesDay && matchesSearch;
    });
  };

  const handleCellClick = (day: number) => {
    setSelectedDay(day);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedDay === null) return;

    const scheduledDate = new Date(year, month, selectedDay, 15, 0, 0); // 3 PM default
    addPost({
      title,
      platform,
      status,
      description,
      schedule_date: scheduledDate.toISOString(),
      cover_image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400'
    });

    setTitle('');
    setPlatform('YouTube');
    setStatus('Idea');
    setDescription('');
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Calendar Header Controls */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Content Calendar</h2>
          <p className="text-sm text-on-surface-variant">July 2026 — Track uploads across channels</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-surface-card border border-outline-variant/10 rounded-lg p-0.5 flex gap-1">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'month' ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-white'}`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'week' ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-white'}`}
            >
              Week
            </button>
          </div>
          <button
            onClick={() => handleCellClick(new Date().getDate())}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-xs font-bold active:scale-95 transition-all"
          >
            + Schedule Post
          </button>
        </div>
      </div>

      {/* Month View Grid */}
      {viewMode === 'month' ? (
        <div className="flex-1 flex flex-col min-w-[700px]">
          {/* Days labels */}
          <div className="grid grid-cols-7 gap-2 text-center py-2 border-b border-outline-variant/5">
            {DAYS_OF_WEEK.map((day) => (
              <span key={day} className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {day}
              </span>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-2 flex-1 mt-2">
            {daysArray.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="bg-surface-dim/10 rounded-lg min-h-[100px] border border-transparent" />;
              }

              const dayPosts = getPostsForDay(day);
              const isToday = day === 11; // Anchor simulation for current date July 11, 2026

              return (
                <div
                  key={day}
                  onClick={() => handleCellClick(day)}
                  className={`bg-surface-dim/30 hover:bg-surface-card rounded-lg p-2 min-h-[100px] border transition-all flex flex-col group cursor-pointer ${
                    isToday ? 'border-primary' : 'border-outline-variant/5'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-bold ${isToday ? 'bg-primary text-white px-1.5 py-0.5 rounded-full' : 'text-on-surface-variant group-hover:text-white'}`}>
                      {day}
                    </span>
                  </div>

                  <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[80px] custom-scrollbar">
                    {dayPosts.map((post) => (
                      <div
                        key={post.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete post "${post.title}"?`)) {
                            deletePost(post.id);
                          }
                        }}
                        className={`p-1.5 rounded text-[10px] font-medium leading-tight truncate relative group/card ${
                          PLATFORM_COLORS[post.platform] || PLATFORM_COLORS.Other
                        }`}
                        title={`${post.platform}: ${post.title} (${post.status})`}
                      >
                        <p className="font-bold truncate">{post.title}</p>
                        <span className="text-[8px] opacity-75 uppercase tracking-wide">{post.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Week View Grid */
        <div className="flex-1 grid grid-cols-7 gap-4 min-w-[700px]">
          {weekDays.map((day, idx) => {
            const dayPosts = getPostsForDay(day);
            const dayName = DAYS_OF_WEEK[idx];
            const isToday = day === 11;

            return (
              <div
                key={day}
                onClick={() => handleCellClick(day)}
                className={`bg-surface-dim/30 hover:bg-surface-card rounded-xl p-4 border flex flex-col cursor-pointer transition-all ${
                  isToday ? 'border-primary shadow-[0_0_15px_rgba(21,92,190,0.1)]' : 'border-outline-variant/5'
                }`}
              >
                <div className="text-center mb-4 pb-2 border-b border-outline-variant/5">
                  <p className="text-xs text-on-surface-variant font-bold uppercase">{dayName}</p>
                  <h4 className={`text-lg font-bold mt-1 ${isToday ? 'text-primary' : 'text-white'}`}>July {day}</h4>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar">
                  {dayPosts.length === 0 ? (
                    <p className="text-xs text-on-surface-variant text-center py-8">No content</p>
                  ) : (
                    dayPosts.map((post) => (
                      <div
                        key={post.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete post "${post.title}"?`)) {
                            deletePost(post.id);
                          }
                        }}
                        className={`p-3 rounded-lg text-xs font-semibold leading-relaxed border transition-all ${
                          PLATFORM_COLORS[post.platform] || PLATFORM_COLORS.Other
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] uppercase tracking-wide bg-white/10 px-1.5 py-0.5 rounded">
                            {post.platform}
                          </span>
                          <span className="text-[9px] opacity-75">{post.status}</span>
                        </div>
                        <p className="text-white truncate">{post.title}</p>
                        <p className="text-[10px] text-on-surface-variant line-clamp-2 mt-1">{post.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Calendar Post Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-card border border-outline-variant/10 rounded-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="text-lg font-bold text-white mb-4">Schedule Post for July {selectedDay}, 2026</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                  Post Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mechanical Keyboard Review"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                    Platform
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="YouTube">YouTube</option>
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Twitter">Twitter</option>
                    <option value="Twitch">Twitch</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="Idea">Idea</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                  Description / Notes
                </label>
                <textarea
                  placeholder="Draft ideas, caption outline, hashtags..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-primary hover:bg-primary-hover text-white rounded-lg"
                >
                  Schedule Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
