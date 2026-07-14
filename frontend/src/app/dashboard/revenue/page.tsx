'use client';
export const dynamic = 'force-dynamic';

import React from 'react';
import { useCreatorStore } from '@/store/useCreatorStore';
import { RevenueTrendChart, PlatformShareBarChart, CategoryDonutChart } from '@/components/analytics/Charts';
import BrandAvatar from '@/components/shared/BrandAvatar';

function MetricCard({ label, value, change, positive }: { label: string; value: string; change: string; positive: boolean }) {
  return (
    <div className="glass-panel card-interactive p-6">
      <p className="font-label text-[10px] text-on-surface-variant mb-3 tracking-wider">{label}</p>
      <h3 className="text-2xl font-extrabold text-white mb-2 tracking-tight">{value}</h3>
      <p className={`font-label text-[10px] font-bold flex items-center gap-1 ${positive ? 'text-emerald-400' : 'text-error'}`}>
        <span className="material-symbols-outlined text-[14px]">{positive ? 'trending_up' : 'trending_down'}</span>
        {change} vs last period
      </p>
    </div>
  );
}

export default function RevenuePage() {
  const { deals, revenueRecords } = useCreatorStore();
  const data = revenueRecords || [];
  const totalRevenue = data.reduce((s, r) => s + r.YouTube + r.Sponsorship + r.Affiliate, 0);
  const avgDeal = deals.length > 0 ? (deals.reduce((s, d) => s + Number(d.deal_value || 0), 0) / deals.length) : 0;

  const topDeals = [...deals]
    .sort((a, b) => (Number(b.deal_value) || 0) - (Number(a.deal_value) || 0))
    .slice(0, 5)
    .map(d => ({
      brand: d.brand_name,
      amount: Number(d.deal_value) || 0,
      platform: d.stage || 'Campaign'
    }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Revenue Analytics</h1>
        <p className="text-sm text-on-surface-variant mt-1">Business performance across all revenue streams</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <MetricCard label="Total Revenue (YTD)" value={`$${(totalRevenue / 1000).toFixed(1)}k`} change="+18.4%" positive={true} />
        <MetricCard label="Avg Deal Size" value={`$${avgDeal.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} change="+5.2%" positive={true} />
        <MetricCard label="Growth Rate" value="+12%" change="-0.8%" positive={false} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h2 className="text-base font-bold text-white mb-1">Revenue Trend</h2>
          <p className="text-xs text-on-surface-variant mb-6">Monthly Sponsorship + AdSense income</p>
          <RevenueTrendChart data={data} />
        </div>

        <div className="glass-panel p-6">
          <h2 className="text-base font-bold text-white mb-1">Revenue by Platform</h2>
          <p className="text-xs text-on-surface-variant mb-6">Distribution across channels</p>
          <PlatformShareBarChart data={data} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h2 className="text-base font-bold text-white mb-1">Revenue by Category</h2>
          <p className="text-xs text-on-surface-variant mb-4">Breakdown of income types</p>
          <CategoryDonutChart />
        </div>

        {/* Top Deals Summary */}
        <div className="glass-panel p-6">
          <h2 className="text-base font-bold text-white mb-4">Top Earning Deals</h2>
          <div className="space-y-3">
            {topDeals.length > 0 ? (
              topDeals.map((deal, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-outline-variant/5">
                  <div className="flex items-center gap-3">
                    <BrandAvatar brandName={deal.brand} logoUrl={`https://logo.clearbit.com/${deal.brand.toLowerCase().replace(/\s+/g, '')}.com`} size={32} />
                    <div>
                      <p className="text-sm font-bold text-white">{deal.brand}</p>
                      <p className="text-[10px] text-on-surface-variant">{deal.platform}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-primary">${deal.amount.toLocaleString()}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-on-surface-variant">No earning deals found in database.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
