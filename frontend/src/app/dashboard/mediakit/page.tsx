'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useCreatorStore } from '@/store/useCreatorStore';
import nextDynamic from 'next/dynamic';

const PdfPreview = nextDynamic(() => import('@/components/shared/PdfPreview'), { ssr: false });

export default function MediaKitPage() {
  const profile = useCreatorStore(s => s.profile);
  const [fullName, setFullName] = useState(profile?.full_name || 'Alex Rivera');
  const [niche, setNiche] = useState(profile?.niche || 'Tech & Digital Lifestyle');
  const [bio, setBio] = useState(profile?.bio || '');
  const [youtubeHandle, setYoutubeHandle] = useState(profile?.platforms?.youtube?.handle || '@alexriveratech');
  const [youtubeFollowers, setYoutubeFollowers] = useState(profile?.platforms?.youtube?.followers || 850000);
  const [instagramHandle, setInstagramHandle] = useState(profile?.platforms?.instagram?.handle || '@alexrivera');
  const [instagramFollowers, setInstagramFollowers] = useState(profile?.platforms?.instagram?.followers || 420000);
  const [tiktokHandle, setTiktokHandle] = useState(profile?.platforms?.tiktok?.handle || '@alexrivera_tech');
  const [tiktokFollowers, setTiktokFollowers] = useState(profile?.platforms?.tiktok?.followers || 1200000);
  const [rateDedicated, setRateDedicated] = useState(15000);
  const [rateIntegration, setRateIntegration] = useState(8500);
  const [rateReel, setRateReel] = useState(5000);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setNiche(profile.niche || '');
      setBio(profile.bio || '');
      setYoutubeHandle(profile.platforms?.youtube?.handle || '');
      setYoutubeFollowers(profile.platforms?.youtube?.followers || 0);
      setInstagramHandle(profile.platforms?.instagram?.handle || '');
      setInstagramFollowers(profile.platforms?.instagram?.followers || 0);
      setTiktokHandle(profile.platforms?.tiktok?.handle || '');
      setTiktokFollowers(profile.platforms?.tiktok?.followers || 0);
    }
  }, [profile]);

  const previewData = {
    full_name: fullName, niche, bio,
    avatar_url: profile?.avatar_url || null,
    youtubeHandle, youtubeFollowers, instagramHandle, instagramFollowers,
    tiktokHandle, tiktokFollowers, rateDedicated, rateIntegration, rateReel
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Media Kit Builder</h1>
        <p className="text-sm text-on-surface-variant mt-1">Edit your sponsorship proposal — preview updates in real-time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Edit Panel */}
        <div className="glass-panel p-6 space-y-6">
          <div>
            <h2 className="text-sm font-bold text-white mb-4 pb-2 border-b border-outline-variant/5">Profile Info</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Display Name</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Niche / Category</label>
                <input value={niche} onChange={e => setNiche(e.target.value)} className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Creator Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary resize-none" />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-white mb-4 pb-2 border-b border-outline-variant/5">Platform Stats</h2>
            <div className="space-y-3">
              {[
                { platform: 'YouTube', handle: youtubeHandle, setHandle: setYoutubeHandle, followers: youtubeFollowers, setFollowers: setYoutubeFollowers },
                { platform: 'Instagram', handle: instagramHandle, setHandle: setInstagramHandle, followers: instagramFollowers, setFollowers: setInstagramFollowers },
                { platform: 'TikTok', handle: tiktokHandle, setHandle: setTiktokHandle, followers: tiktokFollowers, setFollowers: setTiktokFollowers },
              ].map(({ platform, handle, setHandle, followers, setFollowers }) => (
                <div key={platform} className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">{platform} Handle</label>
                    <input value={handle} onChange={e => setHandle(e.target.value)} className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Followers</label>
                    <input type="number" value={followers} onChange={e => setFollowers(Number(e.target.value))} className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-white mb-4 pb-2 border-b border-outline-variant/5">Rate Card (USD)</h2>
            <div className="space-y-3">
              {[
                { label: 'YouTube Dedicated Video', val: rateDedicated, setVal: setRateDedicated },
                { label: 'YouTube Integration (60s)', val: rateIntegration, setVal: setRateIntegration },
                { label: 'Reel / TikTok Placement', val: rateReel, setVal: setRateReel },
              ].map(({ label, val, setVal }) => (
                <div key={label} className="flex items-center gap-3">
                  <label className="flex-1 text-xs text-on-surface-variant">{label}</label>
                  <div className="relative w-32">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant">$</span>
                    <input
                      type="number" value={val} onChange={e => setVal(Number(e.target.value))}
                      className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg pl-6 pr-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="lg:sticky lg:top-24 h-[700px]">
          <PdfPreview type="mediakit" data={previewData} />
        </div>
      </div>
    </div>
  );
}
