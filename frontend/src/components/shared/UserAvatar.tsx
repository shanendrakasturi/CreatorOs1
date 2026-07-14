'use client';

import React, { useState, useEffect } from 'react';

interface UserAvatarProps {
  /** The user's avatar URL — if null/empty, shows initial-letter fallback */
  avatarUrl?: string | null;
  /** The user's display name — used for the initial letter and alt text */
  name?: string | null;
  /** Size in pixels (width & height) */
  size?: number;
  /** Extra CSS classes */
  className?: string;
}

// Deterministic color palette based on name hash
const PALETTE = [
  '#155CBE', // Blue
  '#7C3AED', // Purple
  '#059669', // Emerald
  '#D97706', // Amber
  '#DC2626', // Red
  '#0891B2', // Cyan
  '#9333EA', // Violet
  '#16A34A', // Green
];

function getColor(name: string): string {
  if (!name) return PALETTE[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function getInitial(name?: string | null): string {
  if (!name) return '?';
  // Try to get a meaningful initial: skip spaces, take first non-space char
  const trimmed = name.trim();
  return trimmed.charAt(0).toUpperCase();
}

/**
 * UserAvatar — displays a user's profile photo or an initial-letter
 * colored circle fallback. Never falls back to a third-party stock photo.
 */
export default function UserAvatar({
  avatarUrl,
  name,
  size = 32,
  className = '',
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  // Reset error state whenever the URL changes
  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  const hasValidUrl = !!avatarUrl && !imgError;
  const initial = getInitial(name);
  const bgColor = getColor(name || '');
  const fontSize = Math.max(10, Math.round(size * 0.4));

  if (hasValidUrl) {
    return (
      <img
        src={avatarUrl!}
        alt={name || 'User avatar'}
        width={size}
        height={size}
        onError={() => setImgError(true)}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    );
  }

  return (
    <div
      aria-label={name || 'User avatar'}
      title={name || 'User avatar'}
      className={`rounded-full flex items-center justify-center font-bold text-white uppercase select-none flex-shrink-0 ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: bgColor,
        fontSize: `${fontSize}px`,
        lineHeight: 1,
      }}
    >
      {initial}
    </div>
  );
}
