'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { CreatorAPI } from '@/lib/api';
import { useCreatorStore } from '@/store/useCreatorStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export default function InsightsPage() {
  const profile = useCreatorStore(s => s.profile);
  const searchQuery = useCreatorStore(s => s.searchQuery);
  const [insights, setInsights] = useState<any[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const youtube = profile?.platforms?.youtube || { handle: '', followers: 0, engagement: 0 };
  const instagram = profile?.platforms?.instagram || { handle: '', followers: 0, engagement: 0 };
  const tiktok = profile?.platforms?.tiktok || { handle: '', followers: 0, engagement: 0 };

  const youtubeFollowers = youtube.followers || 0;
  const instagramFollowers = instagram.followers || 0;
  const tiktokFollowers = tiktok.followers || 0;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const followerGrowthData = months.map((month, idx) => {
    const factor = 0.85 + (idx / 6) * 0.15;
    return {
      month,
      YouTube: Math.round(youtubeFollowers * factor),
      Instagram: Math.round(instagramFollowers * factor),
      TikTok: Math.round(tiktokFollowers * factor),
    };
  });

  const avgEng = ((youtube.engagement || 0) + (instagram.engagement || 0) + (tiktok.engagement || 0)) / 3 || 5;
  const engagementData = [
    { type: 'Tutorial', engagement: Number((avgEng * 1.1).toFixed(1)) },
    { type: 'Review', engagement: Number((avgEng * 0.9).toFixed(1)) },
    { type: 'Vlog', engagement: Number((avgEng * 0.7).toFixed(1)) },
    { type: 'Collab', engagement: Number((avgEng * 1.3).toFixed(1)) },
    { type: 'Shorts', engagement: Number((avgEng * 1.5).toFixed(1)) },
  ];

  const formatFollowers = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return val.toString();
  };

  const platformStats = [
    { platform: 'YouTube', color: 'text-red-400', followers: formatFollowers(youtubeFollowers), growth: '+3.5%', engagement: `${youtube.engagement || 0}%`, icon: 'video_library' },
    { platform: 'Instagram', color: 'text-fuchsia-400', followers: formatFollowers(instagramFollowers), growth: '+2.1%', engagement: `${instagram.engagement || 0}%`, icon: 'photo_camera' },
    { platform: 'TikTok', color: 'text-cyan-400', followers: formatFollowers(tiktokFollowers), growth: '+1.3%', engagement: `${tiktok.engagement || 0}%`, icon: 'music_video' },
  ];

  const filteredPlatformStats = platformStats.filter(s => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return s.platform.toLowerCase().includes(q) || s.followers.includes(q) || s.engagement.includes(q);
  });

  const generateInsights = async () => {
    setLoadingInsights(true);
    const summary = `
      YouTube: 850k subs (+4.8% engagement), TikTok: 1.2M (+8.1%), Instagram: 420k (+5.2%).
      Best performing content: Shorts (9.1% eng), Collab (7.4% eng).
      Revenue growth: +18.4% YoY. Top platform: Sponsorships ($65.9k).
      Current niche: ${profile?.niche || 'Tech & Digital Lifestyle'}.
    `;
    try {
      const result = await CreatorAPI.generateInsights(summary);
      setInsights(Array.isArray(result) ? result : []);
    } catch {
      setInsights([]);
    } finally {
      setLoadingInsights(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-card border border-outline-variant/10 p-3 rounded-lg shadow-xl text-xs">
          <p className="text-on-surface-variant mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color }} className="font-bold">
              {p.name}: {p.value >= 1000 ? `${(p.value / 1000).toFixed(0)}k` : `${p.value}%`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Audience & Growth Insights</h1>
          <p className="text-sm text-on-surface-variant mt-1">Cross-platform analytics and AI-powered growth recommendations</p>
        </div>
        <button
          onClick={generateInsights}
          disabled={loadingInsights}
          className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-sm font-bold active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loadingInsights ? (
            <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>Analyzing...</>
          ) : (
            <><span className="material-symbols-outlined text-[18px]">auto_awesome</span>Generate AI Insights</>
          )}
        </button>
      </div>

      {/* Platform Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {filteredPlatformStats.length === 0 ? (
          <div className="sm:col-span-3 glass-panel p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">search_off</span>
            <p className="text-sm font-bold text-white mb-1">No platforms matched</p>
            <p className="text-xs text-on-surface-variant">Try searching &quot;YouTube&quot;, &quot;TikTok&quot;, or &quot;Instagram&quot;.</p>
          </div>
        ) : (
          filteredPlatformStats.map(stat => (
            <div key={stat.platform} className="glass-panel card-interactive p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg bg-surface-container ${stat.color}`}>
                  <span className="material-symbols-outlined text-[20px]">{stat.icon}</span>
                </div>
                <h3 className="font-bold text-white">{stat.platform}</h3>
              </div>
              <p className="text-2xl font-extrabold text-white mb-1">{stat.followers}</p>
              <div className="flex justify-between">
                <span className="font-label text-[10px] text-emerald-400 font-bold">{stat.growth} this month</span>
                <span className="font-label text-[10px] text-on-surface-variant">{stat.engagement} eng.</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Follower Growth Chart */}
      <div className="glass-panel p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-base font-bold text-white">Cross-Platform Follower Growth</h2>
            <p className="text-xs text-on-surface-variant">7-month trajectory across all channels</p>
          </div>
          <div className="flex gap-4 text-xs">
            {[{ name: 'YouTube', color: '#EF4444' }, { name: 'Instagram', color: '#D946EF' }, { name: 'TikTok', color: '#22D3EE' }].map(p => (
              <div key={p.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></span>
                <span className="text-on-surface-variant">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={followerGrowthData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="yt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ig" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D946EF" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#D946EF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="tt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" stroke="#c2c6d5" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#c2c6d5" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="YouTube" stroke="#EF4444" strokeWidth={2} fill="url(#yt)" />
              <Area type="monotone" dataKey="Instagram" stroke="#D946EF" strokeWidth={2} fill="url(#ig)" />
              <Area type="monotone" dataKey="TikTok" stroke="#22D3EE" strokeWidth={2} fill="url(#tt)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Engagement Bar Chart + AI Insight Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h2 className="text-base font-bold text-white mb-1">Engagement by Content Type</h2>
          <p className="text-xs text-on-surface-variant mb-6">Average rate per format across all platforms</p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="type" stroke="#c2c6d5" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#c2c6d5" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="engagement" radius={[6, 6, 0, 0]}>
                  {engagementData.map((_, i) => (
                    <Cell key={i} fill={i === 4 ? '#155CBE' : i === 3 ? '#10b981' : '#2a2a2a'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-white">AI Growth Insight Cards</h2>
            {insights.length === 0 && !loadingInsights && (
              <span className="text-xs text-on-surface-variant">Click Generate above</span>
            )}
          </div>

          {loadingInsights && (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse p-4 bg-surface-container rounded-xl space-y-2">
                  <div className="h-3 bg-surface-container-high rounded w-1/2"></div>
                  <div className="h-3 bg-surface-container-high rounded w-full"></div>
                  <div className="h-3 bg-surface-container-high rounded w-3/4"></div>
                </div>
              ))}
            </div>
          )}

          {!loadingInsights && insights.length === 0 && (
            <div className="flex flex-col items-center justify-center h-52 text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3">insights</span>
              <p className="text-xs text-on-surface-variant">No insights generated yet. Click the button above.</p>
            </div>
          )}

          <div className="space-y-3">
            {insights.map((card, idx) => (
              <div key={idx} className={`p-4 rounded-xl border-l-4 ${
                card.impact === 'High' ? 'bg-primary/5 border-primary' :
                card.impact === 'Medium' ? 'bg-emerald-400/5 border-emerald-400' :
                'bg-zinc-400/5 border-zinc-400'
              }`}>
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-bold text-white">{card.title}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    card.impact === 'High' ? 'bg-primary/10 text-primary' :
                    card.impact === 'Medium' ? 'bg-emerald-400/10 text-emerald-400' :
                    'bg-zinc-400/10 text-zinc-400'
                  }`}>{card.impact}</span>
                </div>
                <p className="text-xs font-bold text-on-surface-variant mb-1.5">{card.metric}</p>
                <p className="text-xs text-on-surface-variant leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
