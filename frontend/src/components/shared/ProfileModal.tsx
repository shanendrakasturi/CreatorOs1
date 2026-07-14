'use client';

import React, { useState, useEffect } from 'react';
import { useCreatorStore } from '@/store/useCreatorStore';
import { useAuth } from '@/context/AuthContext';
import UserAvatar from '@/components/shared/UserAvatar';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const profile = useCreatorStore((state) => state.profile);
  const setProfile = useCreatorStore((state) => state.setProfile);
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);

  // ─── Edit-mode field states ───────────────────────────────────────────────
  const [fullName, setFullName] = useState('');
  const [niche, setNiche] = useState('');
  const [bio, setBio] = useState('');
  const [youtubeHandle, setYoutubeHandle] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [tiktokHandle, setTiktokHandle] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Sync edit-mode fields whenever profile changes (e.g. first load, external update)
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setNiche(profile.niche || '');
      setBio(profile.bio || '');
      setYoutubeHandle(profile.platforms?.youtube?.handle || '');
      setInstagramHandle(profile.platforms?.instagram?.handle || '');
      setTiktokHandle(profile.platforms?.tiktok?.handle || '');
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await setProfile({
      ...profile,
      full_name: fullName,
      niche,
      bio,
      avatar_url: avatarUrl,
      platforms: {
        ...profile?.platforms,
        youtube: { ...profile?.platforms?.youtube, handle: youtubeHandle },
        instagram: { ...profile?.platforms?.instagram, handle: instagramHandle },
        tiktok: { ...profile?.platforms?.tiktok, handle: tiktokHandle },
      },
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    // Reset fields back to current profile values
    setFullName(profile?.full_name || '');
    setNiche(profile?.niche || '');
    setBio(profile?.bio || '');
    setYoutubeHandle(profile?.platforms?.youtube?.handle || '');
    setInstagramHandle(profile?.platforms?.instagram?.handle || '');
    setTiktokHandle(profile?.platforms?.tiktok?.handle || '');
    setAvatarUrl(profile?.avatar_url || null);
    setIsEditing(false);
  };

  // Displayed name: prefer current edit state in edit mode, else profile
  const displayName = isEditing ? fullName : profile?.full_name;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-surface-card border border-outline-variant/10 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors"
          aria-label="Close modal"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">person</span>
          Creator Profile
        </h2>

        {isEditing ? (
          /* ─── EDIT MODE ─────────────────────────────────────────────────── */
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Niche
                </label>
                <input
                  type="text"
                  required
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary resize-none"
                placeholder="Tell brands about yourself..."
              />
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Social Media Handles
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant font-bold">YT</span>
                  <input
                    type="text"
                    value={youtubeHandle}
                    onChange={(e) => setYoutubeHandle(e.target.value)}
                    placeholder="@handle"
                    className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg pl-9 pr-2 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant font-bold">IG</span>
                  <input
                    type="text"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    placeholder="@handle"
                    className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg pl-9 pr-2 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant font-bold">TT</span>
                  <input
                    type="text"
                    value={tiktokHandle}
                    onChange={(e) => setTiktokHandle(e.target.value)}
                    placeholder="@handle"
                    className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg pl-9 pr-2 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/5">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg text-xs font-bold transition-all"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          /* ─── VIEW MODE ─────────────────────────────────────────────────── */
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-surface-dim/40 p-4 rounded-xl border border-outline-variant/5">
              <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border border-outline-variant/10">
                <UserAvatar
                  avatarUrl={profile?.avatar_url}
                  name={displayName}
                  size={64}
                  className="w-full h-full"
                />
              </div>
              <div className="overflow-hidden flex-1">
                <h3 className="text-lg font-bold text-white truncate">{displayName || 'Creator'}</h3>
                <p className="text-xs text-on-surface-variant mt-0.5 truncate">{user?.email || ''}</p>
                <div className="inline-block bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-2">
                  Pro Creator
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Niche</h4>
                <p className="text-sm text-white font-medium bg-surface-dim/20 px-3 py-2 rounded-lg border border-outline-variant/5">
                  {profile?.niche || '—'}
                </p>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Creator Bio</h4>
                <p className="text-xs text-white leading-relaxed bg-surface-dim/20 px-3 py-2 rounded-lg border border-outline-variant/5">
                  {profile?.bio || 'No bio set. Edit your profile to tell brands what you are about.'}
                </p>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Platform Details</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-surface-dim/30 border border-outline-variant/5 p-2.5 rounded-lg flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-0.5">YouTube</span>
                    <span className="text-xs text-white truncate w-full font-semibold">{profile?.platforms?.youtube?.handle || '—'}</span>
                    <span className="text-[10px] text-on-surface-variant mt-0.5">{(profile?.platforms?.youtube?.followers || 0).toLocaleString()} followers</span>
                  </div>
                  <div className="bg-surface-dim/30 border border-outline-variant/5 p-2.5 rounded-lg flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-pink-500 uppercase tracking-wider mb-0.5">Instagram</span>
                    <span className="text-xs text-white truncate w-full font-semibold">{profile?.platforms?.instagram?.handle || '—'}</span>
                    <span className="text-[10px] text-on-surface-variant mt-0.5">{(profile?.platforms?.instagram?.followers || 0).toLocaleString()} followers</span>
                  </div>
                  <div className="bg-surface-dim/30 border border-outline-variant/5 p-2.5 rounded-lg flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-0.5">TikTok</span>
                    <span className="text-xs text-white truncate w-full font-semibold">{profile?.platforms?.tiktok?.handle || '—'}</span>
                    <span className="text-[10px] text-on-surface-variant mt-0.5">{(profile?.platforms?.tiktok?.followers || 0).toLocaleString()} followers</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-3 border-t border-outline-variant/5">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-surface-dim hover:bg-surface-container-high text-white py-2.5 rounded-lg text-xs font-bold transition-all border border-outline-variant/10 hover:border-outline-variant/20 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                Edit Profile
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-primary hover:bg-primary-hover text-white py-2.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-primary/20"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
