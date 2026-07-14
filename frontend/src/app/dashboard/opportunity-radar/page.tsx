'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import OpportunityCard from '@/components/opportunity-radar/OpportunityCard';
import { MockDatabase } from '@/lib/supabase';
import { CreatorAPI } from '@/lib/api';
import { useCreatorStore } from '@/store/useCreatorStore';

type OppType = 'all' | 'trending_topic' | 'brand_collab' | 'viral_trend' | 'sponsorship' | 'event' | 'content_gap';

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

const FILTER_TABS: { key: OppType; label: string }[] = [
  { key: 'all',           label: 'All' },
  { key: 'trending_topic',label: 'Trending Topics' },
  { key: 'brand_collab',  label: 'Brand Collabs' },
  { key: 'viral_trend',   label: 'Viral Trends' },
  { key: 'sponsorship',   label: 'Sponsorships' },
  { key: 'event',         label: 'Events' },
  { key: 'content_gap',   label: 'Content Gaps' },
];

function genId() {
  return 'opp_' + Math.random().toString(36).slice(2, 9);
}

export default function OpportunityRadarPage() {
  const profile = useCreatorStore(s => s.profile);
  const setProfile = useCreatorStore(s => s.setProfile);
  
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [activeFilter, setActiveFilter] = useState<OppType>('all');
  const [niche, setNiche] = useState('Tech Reviews');
  const [editingNiche, setEditingNiche] = useState(false);
  const [nicheInput, setNicheInput] = useState('');
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const loaded: Opportunity[] = MockDatabase.getOpportunities();
    setOpportunities(loaded);
    if (profile?.niche) setNiche(profile.niche);
  }, [profile]);

  const visible = opportunities.filter(o => {
    if (o.status === 'dismissed') return false;
    if (activeFilter === 'all') return true;
    return o.type === activeFilter;
  });

  const newThisWeek = opportunities.filter(o => {
    const age = Date.now() - new Date(o.createdAt).getTime();
    return age < 7 * 24 * 60 * 60 * 1000 && o.status !== 'dismissed';
  }).length;

  const contentGaps = opportunities.filter(o => o.type === 'content_gap' && o.status !== 'dismissed').length;

  const avgScore = opportunities.filter(o => o.status !== 'dismissed').length > 0
    ? Math.round(
        opportunities.filter(o => o.status !== 'dismissed').reduce((s, o) => s + o.relevanceScore, 0) /
        opportunities.filter(o => o.status !== 'dismissed').length
      )
    : 0;

  const handleSave = (id: string) => {
    const updated = opportunities.map(o =>
      o.id === id ? { ...o, status: o.status === 'saved' ? 'new' : 'saved' as 'new' | 'saved' } : o
    );
    setOpportunities(updated);
    MockDatabase.saveOpportunities(updated);
  };

  const handleDismiss = (id: string) => {
    const updated = opportunities.map(o =>
      o.id === id ? { ...o, status: 'dismissed' as const } : o
    );
    setOpportunities(updated);
    MockDatabase.saveOpportunities(updated);
  };

  const handleNicheSave = async (newNiche: string) => {
    const trimmed = newNiche.trim();
    if (!trimmed) {
      setEditingNiche(false);
      return;
    }
    setNiche(trimmed);
    setEditingNiche(false);
    
    // Save to store (Zustand profile) and MockDatabase/Supabase
    const updatedProfile = { ...profile, niche: trimmed };
    await setProfile(updatedProfile);
    
    // Save/Persist to backend directly
    await CreatorAPI.updateProfile({ niche: trimmed });
  };

  const handleScan = async () => {
    let currentNiche = niche;
    
    // Race-condition guard: save niche before scanning if currently editing niche
    if (editingNiche && nicheInput.trim()) {
      const pendingNiche = nicheInput.trim();
      await handleNicheSave(pendingNiche);
      currentNiche = pendingNiche;
    }
    
    setScanning(true);
    
    // Clear out only "new" opportunities to avoid visual caching / layering
    const savedOpps = opportunities.filter(o => o.status === 'saved');
    setOpportunities(savedOpps);
    
    try {
      const newOpps = await CreatorAPI.scanOpportunities(currentNiche);
      if (newOpps && newOpps.length > 0) {
        const withIds: Opportunity[] = newOpps.map((o: Partial<Opportunity>) => ({
          ...o,
          id: genId(),
          status: 'new' as const,
          createdAt: new Date().toISOString(),
          expiresAt: null,
          niche: currentNiche,
          title: o.title || '',
          description: o.description || '',
          relevanceScore: o.relevanceScore || 75,
          source: o.source || 'via AI Scan',
          type: (o.type || 'trending_topic') as Opportunity['type'],
        }));
        
        const updated = [...withIds, ...savedOpps];
        setOpportunities(updated);
        MockDatabase.saveOpportunities(updated);
      } else {
        // Restore saved if no new opportunities found
        setOpportunities(savedOpps);
      }
    } catch (e) {
      console.error("Scan opportunities failed", e);
      setOpportunities(savedOpps);
    } finally {
      setScanning(false);
    }
  };

  const handleNicheSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleNicheSave(nicheInput);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Opportunity Radar</h1>
          <p className="text-sm text-on-surface-variant mt-1 font-label tracking-wide">Discover opportunities before everyone else.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Niche Badge */}
          <div className="flex items-center gap-1.5">
            {editingNiche ? (
              <form onSubmit={handleNicheSubmit} className="flex items-center gap-1.5">
                <input
                  autoFocus
                  value={nicheInput}
                  onChange={e => setNicheInput(e.target.value)}
                  onBlur={() => handleNicheSave(nicheInput)}
                  className="bg-surface-container border border-primary rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none w-36"
                />
                <button type="submit" className="text-primary hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[18px]">check</span>
                </button>
                <button type="button" onClick={() => setEditingNiche(false)} className="text-on-surface-variant hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </form>
            ) : (
              <button
                onClick={() => { setEditingNiche(true); setNicheInput(niche); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container border border-outline-variant/20 rounded-lg hover:border-primary/40 transition-colors group"
              >
                <span className="material-symbols-outlined text-[14px] text-primary">radar</span>
                <span className="text-xs font-semibold text-white">{niche}</span>
                <span className="material-symbols-outlined text-[12px] text-on-surface-variant group-hover:text-white transition-colors">edit</span>
              </button>
            )}
          </div>

          {/* Scan Button */}
          <button
            onClick={handleScan}
            disabled={scanning}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all active:scale-95"
          >
            {scanning ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Scanning...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">radar</span>
                Scan Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: 'notifications_active', label: 'New This Week',        value: newThisWeek.toString(),  badge: 'Live', badgeColor: 'text-emerald-400 bg-emerald-400/10' },
          { icon: 'search_insights',      label: 'Content Gaps Found',   value: contentGaps.toString(),  badge: 'Gaps',  badgeColor: 'text-cyan-400 bg-cyan-400/10' },
          { icon: 'analytics',            label: 'Avg Relevance Score',  value: avgScore ? `${avgScore}%` : '—', badge: 'Score', badgeColor: 'text-primary bg-primary/10' },
        ].map((stat) => (
          <div key={stat.label} className="glass-panel card-interactive p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <span className="material-symbols-outlined text-[22px]">{stat.icon}</span>
              </div>
              <span className={`font-label text-[10px] font-bold px-2 py-1 rounded ${stat.badgeColor}`}>{stat.badge}</span>
            </div>
            <p className="font-label text-on-surface-variant text-[10px] mb-1 tracking-wider">{stat.label}</p>
            <h3 className="text-2xl font-extrabold text-white tracking-tight">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {FILTER_TABS.map((tab) => {
          const count = tab.key === 'all'
            ? opportunities.filter(o => o.status !== 'dismissed').length
            : opportunities.filter(o => o.type === tab.key && o.status !== 'dismissed').length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                activeFilter === tab.key
                  ? 'bg-primary text-white'
                  : 'bg-surface-container text-on-surface-variant hover:text-white hover:bg-surface-container-high'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeFilter === tab.key ? 'bg-white/20' : 'bg-surface-container-high'
                }`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Opportunity List */}
      {visible.length === 0 ? (
        /* Empty State */
        <div className="glass-panel p-16 text-center">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/40 mb-4 block">radar</span>
          <h3 className="text-lg font-bold text-white mb-2">
            {scanning ? 'Scanning for opportunities...' : 'No opportunities in this category'}
          </h3>
          <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
            {scanning
              ? 'CreatorOS is analyzing your niche — check back soon.'
              : 'Try switching to "All" or click "Scan Now" to discover fresh opportunities for your niche.'}
          </p>
          {!scanning && (
            <button
              onClick={handleScan}
              className="mt-5 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl transition-all"
            >
              Scan for Opportunities
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {visible
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                onSave={handleSave}
                onDismiss={handleDismiss}
              />
            ))}
        </div>
      )}
    </div>
  );
}
