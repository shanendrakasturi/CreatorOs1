'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCreatorStore } from '@/store/useCreatorStore';
import { RevenueTrendChart } from '@/components/analytics/Charts';
import BrandAvatar from '@/components/shared/BrandAvatar';

function KpiCard({ icon, label, value, badge, badgeColor, href }: {
  icon: string; label: string; value: string; badge?: string; badgeColor?: string; href: string;
}) {
  return (
    <Link
      href={href}
      className="glass-panel card-interactive p-6 block group cursor-pointer
        hover:scale-[1.03] hover:shadow-[0_12px_32px_rgba(0,0,0,0.45)]
        hover:border-primary/40 active:scale-[0.98] transition-all duration-200"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary/20 transition-colors duration-200">
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </div>
        {badge && (
          <span className={`font-label text-[10px] font-bold px-2 py-1 rounded ${badgeColor}`}>{badge}</span>
        )}
      </div>
      <p className="font-label text-on-surface-variant text-[10px] mb-1 tracking-wider">{label}</p>
      <h3 className="text-2xl font-extrabold text-white tracking-tight group-hover:text-primary transition-colors duration-200">{value}</h3>
      <div className="mt-3 flex items-center gap-1 text-[10px] text-primary/0 group-hover:text-primary/70 transition-all duration-200">
        <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
        <span className="font-semibold">View details</span>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { deals, invoices, calendar, notifications, revenueRecords } = useCreatorStore();
  const revenueData = revenueRecords || [];
  const profile = useCreatorStore(s => s.profile);

  const [greeting, setGreeting] = useState("Good evening, Creator 👋");

  useEffect(() => {
    const hour = new Date().getHours();
    const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : 'there';
    let msg = '';
    
    if (hour >= 5 && hour < 12) {
      msg = `Good morning, ${firstName} ☀️`;
    } else if (hour >= 12 && hour < 17) {
      msg = `Good afternoon, ${firstName} 🌤️`;
    } else if (hour >= 17 && hour < 21) {
      msg = `Good evening, ${firstName} 👋`;
    } else {
      msg = `Good night, ${firstName} 🌙`;
    }
    setGreeting(msg);
  }, [profile]);

  const totalRevenue = revenueData.reduce((sum, r) => sum + r.YouTube + r.Sponsorship + r.Affiliate, 0);
  const activeDeals = deals.filter(d => d.stage === 'Active').length;
  const upcomingPosts = calendar.filter(p => p.status === 'Scheduled' || p.status === 'In Progress').length;
  const unreadNotifs = notifications.filter(n => !n.is_read).length;

  const recentActivity = [
    { icon: 'handshake', color: 'text-primary', text: 'Spotify deal moved to Active stage', time: '2h ago' },
    { icon: 'receipt_long', color: 'text-success', text: 'Invoice INV-2026-002 sent to Spotify', time: '4h ago' },
    { icon: 'calendar_today', color: 'text-yellow-400', text: 'Post "Next.js 15 Tutorial" scheduled for July 20', time: '1d ago' },
    { icon: 'auto_awesome', color: 'text-fuchsia-400', text: 'AI captions generated for Instagram Reel', time: '1d ago' },
    { icon: 'trending_up', color: 'text-cyan-400', text: 'TikTok engagement up 8.1% this week', time: '2d ago' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          {greeting}
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">Here's what's happening with your business today.</p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          href="/dashboard/revenue"
          icon="payments"
          label="Total Revenue (YTD)"
          value={`$${(totalRevenue / 1000).toFixed(1)}k`}
          badge="+12%"
          badgeColor="text-emerald-400 bg-emerald-400/10"
        />
        <KpiCard
          href="/dashboard/deals"
          icon="handshake"
          label="Active Deals"
          value={activeDeals.toString()}
          badge="Active"
          badgeColor="text-primary bg-primary/10"
        />
        <KpiCard
          href="/dashboard/calendar"
          icon="schedule"
          label="Upcoming Posts"
          value={upcomingPosts.toString()}
          badge="This week"
          badgeColor="text-on-surface-variant bg-surface-container"
        />
        <KpiCard
          href="/dashboard/notifications"
          icon="notifications"
          label="Unread Alerts"
          value={unreadNotifs.toString()}
          badge={unreadNotifs > 0 ? 'New' : 'Clear'}
          badgeColor={unreadNotifs > 0 ? 'text-error bg-error/10' : 'text-success bg-success/10'}
        />
      </div>


      {/* Revenue Chart + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <div className="glass-panel p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-base font-bold text-white">Revenue Trend</h2>
              <p className="text-xs text-on-surface-variant">Sponsorship + AdSense over 11 months</p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                <span className="text-on-surface-variant">Sponsorship</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
                <span className="text-on-surface-variant">AdSense</span>
              </div>
            </div>
          </div>
          <RevenueTrendChart data={revenueData} />
        </div>

        {/* Activity Feed */}
        <div className="glass-panel p-6">
          <h2 className="text-base font-bold text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className={`p-1.5 rounded-lg bg-surface-container flex-shrink-0 ${item.color}`}>
                  <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-on-surface leading-relaxed">{item.text}</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Deals Summary */}
      <div className="glass-panel p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-bold text-white">Deal Pipeline Overview</h2>
          <a href="/dashboard/deals" className="text-xs text-primary hover:underline">View All Deals →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-outline-variant/10 text-on-surface-variant uppercase tracking-wider">
                <th className="text-left py-3 font-bold">Brand</th>
                <th className="text-left py-3 font-bold">Stage</th>
                <th className="text-left py-3 font-bold">Value</th>
                <th className="text-left py-3 font-bold">Deadline</th>
              </tr>
            </thead>
            <tbody>
              {deals.slice(0, 4).map((deal) => (
                <tr key={deal.id} className="border-b border-outline-variant/5 hover:bg-surface-container/30 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <BrandAvatar brandName={deal.brand_name} logoUrl={deal.brandLogoUrl || deal.logo_url} size={32} />
                      <span className="font-semibold text-white">{deal.brand_name}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      deal.stage === 'Paid' ? 'bg-emerald-400/10 text-emerald-400' :
                      deal.stage === 'Active' ? 'bg-primary/10 text-primary' :
                      deal.stage === 'Lead' ? 'bg-zinc-400/10 text-zinc-400' :
                      'bg-yellow-400/10 text-yellow-400'
                    }`}>{deal.stage}</span>
                  </td>
                  <td className="py-3 font-bold text-white">${deal.deal_value.toLocaleString()}</td>
                  <td className="py-3 text-on-surface-variant">{deal.deadline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
