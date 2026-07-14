'use client';

import React, { useState, useEffect } from 'react';

interface BrandAvatarProps {
  brandName: string;
  logoUrl?: string;
  size?: number; // Size in pixels
  className?: string;
}

export default function BrandAvatar({ brandName, logoUrl, size = 32, className = '' }: BrandAvatarProps) {
  const [hasError, setHasError] = useState(false);

  // Reset error state when logoUrl changes
  useEffect(() => {
    setHasError(false);
  }, [logoUrl]);

  const colors = ['#155CBE', '#7C3AED', '#059669', '#D97706', '#DC2626'];

  const getFallbackColor = (name: string) => {
    if (!name) return colors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const initial = brandName ? brandName.charAt(0).toUpperCase() : '?';
  const backgroundColor = getFallbackColor(brandName);

  if (logoUrl && !hasError) {
    return (
      <img
        src={logoUrl}
        alt={`${brandName} logo`}
        width={size}
        height={size}
        onError={() => setHasError(true)}
        className={`rounded-full object-contain bg-white p-0.5 border border-outline-variant/10 flex-shrink-0 ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white uppercase select-none flex-shrink-0 border border-outline-variant/10 ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor,
        fontSize: `${size * 0.4}px`,
      }}
      title={brandName}
    >
      {initial}
    </div>
  );
}
