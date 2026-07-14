'use client';

import React from 'react';

interface Opportunity {
  id: string;
  type: 'trending_topic' | 'brand_collab' | 'viral_trend' | 'sponsorship' | 'event' | 'content_gap';
  title: string;
  description: string;
  relevanceScore: number;
  source: string;
  niche?: string;
  status: 'new' | 'saved' | 'dismissed';
  expiresAt?: string | null;
  createdAt: string;
}

const TYPE_CONFIG: Record<Opportunity['type'], { label: string; color: string; bg: string; icon: string }> = {
  trending_topic: { label: 'Trending',      color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/20',   icon: 'trending_up' },
  brand_collab:   { label: 'Brand',         color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20', icon: 'handshake' },
  viral_trend:    { label: 'Viral',         color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20', icon: 'bolt' },
  sponsorship:    { label: 'Sponsorship',   color: 'text-emerald-400',bg: 'bg-emerald-400/10 border-emerald-400/20', icon: 'payments' },
  event:          { label: 'Event',         color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20', icon: 'event' },
  content_gap:    { label: 'Content Gap',   color: 'text-cyan-400',   bg: 'bg-cyan-400/10 border-cyan-400/20',   icon: 'search_insights' },
};

function formatExpiry(expiresAt: string | null | undefined, createdAt: string): string {
  if (!expiresAt) {
    // Show "Trending now" for fresh items
    const age = Date.now() - new Date(createdAt).getTime();
    if (age < 24 * 60 * 60 * 1000) return 'Trending now';
    return 'Ongoing';
  }
  const deadline = new Date(expiresAt);
  const diffDays = Math.ceil((deadline.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  if (diffDays <= 0) return 'Expired';
  if (diffDays === 1) return 'Expires tomorrow';
  return `Deadline: ${deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

function scoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-400 bg-emerald-400/10';
  if (score >= 75) return 'text-primary bg-primary/10';
  return 'text-amber-400 bg-amber-400/10';
}

export default function OpportunityCard({
  opportunity,
  onSave,
  onDismiss,
}: {
  opportunity: Opportunity;
  onSave: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const cfg = TYPE_CONFIG[opportunity.type];
  const expiry = formatExpiry(opportunity.expiresAt, opportunity.createdAt);
  const isSaved = opportunity.status === 'saved';

  return (
    <div className="glass-panel px-5 py-4 flex items-start gap-4 group transition-all duration-200 hover:border-white/10 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      {/* Type Badge */}
      <div className={`flex-shrink-0 flex flex-col items-center justify-center w-[90px] py-2.5 px-2 rounded-xl border text-center ${cfg.bg}`}>
        <span className={`material-symbols-outlined text-[20px] ${cfg.color} mb-1`}>{cfg.icon}</span>
        <span className={`text-[9px] font-bold font-label uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white leading-snug mb-1">{opportunity.title}</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">{opportunity.description}</p>
          </div>

          {/* Score + Actions */}
          <div className="flex-shrink-0 flex flex-col items-end gap-2">
            <span className={`text-[10px] font-bold font-label px-2 py-1 rounded-lg ${scoreColor(opportunity.relevanceScore)}`}>
              {opportunity.relevanceScore}% match
            </span>
            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onSave(opportunity.id)}
                title={isSaved ? 'Saved' : 'Save'}
                className={`p-1.5 rounded-lg transition-colors ${
                  isSaved
                    ? 'text-primary bg-primary/10'
                    : 'text-on-surface-variant hover:text-primary hover:bg-primary/10'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isSaved ? 'bookmark' : 'bookmark_border'}
                </span>
              </button>
              <button
                onClick={() => onDismiss(opportunity.id)}
                title="Dismiss"
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 mt-2.5">
          <span className="text-[10px] font-label text-on-surface-variant/60">{opportunity.source}</span>
          <span className="w-1 h-1 rounded-full bg-outline-variant/40" />
          <span className={`text-[10px] font-label font-semibold ${
            expiry.includes('Expired') ? 'text-error' :
            expiry === 'Trending now' ? 'text-emerald-400' :
            'text-on-surface-variant'
          }`}>{expiry}</span>
          {isSaved && (
            <>
              <span className="w-1 h-1 rounded-full bg-outline-variant/40" />
              <span className="text-[10px] font-label text-primary">Saved</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
