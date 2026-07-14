'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';

import { useCreatorStore } from '@/store/useCreatorStore';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const fetchData = useCreatorStore((state) => state.fetchData);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const applyTheme = (theme: string) => {
      const root = document.documentElement;
      let isDark = true;
      if (theme === 'light') {
        isDark = false;
      } else if (theme === 'auto') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      if (isDark) {
        root.classList.add('dark');
        root.style.setProperty('--background', '#0A0A0A');
        root.style.setProperty('--foreground', '#e5e2e1');
        root.style.setProperty('--color-background', '#0A0A0A');
        root.style.setProperty('--color-surface-dim', '#131313');
        root.style.setProperty('--color-surface-card', '#141414');
        root.style.setProperty('--color-surface-container', '#201f1f');
        root.style.setProperty('--color-surface-container-high', '#2a2a2a');
        root.style.setProperty('--color-on-surface', '#e5e2e1');
        root.style.setProperty('--color-on-surface-variant', '#c2c6d5');
      } else {
        root.classList.remove('dark');
        root.style.setProperty('--background', '#F9FAFB');
        root.style.setProperty('--foreground', '#111827');
        root.style.setProperty('--color-background', '#F9FAFB');
        root.style.setProperty('--color-surface-dim', '#F3F4F6');
        root.style.setProperty('--color-surface-card', '#FFFFFF');
        root.style.setProperty('--color-surface-container', '#E5E7EB');
        root.style.setProperty('--color-surface-container-high', '#D1D5DB');
        root.style.setProperty('--color-on-surface', '#111827');
        root.style.setProperty('--color-on-surface-variant', '#4B5563');
      }
    };

    const getAccentHover = (color: string) => {
      switch (color.toLowerCase()) {
        case '#155cbe': return '#1c6ad6';
        case '#8b5cf6': return '#9f7aea';
        case '#10b981': return '#059669';
        case '#f97316': return '#ea580c';
        case '#ec4899': return '#db2777';
        case '#06b6d4': return '#0891b2';
        default: return '#1c6ad6';
      }
    };

    const applyPreferences = () => {
      try {
        const stored = localStorage.getItem('creatoros_settings');
        if (stored) {
          const settings = JSON.parse(stored);
          const theme = settings.theme || 'dark';
          const accentColor = settings.accentColor || '#155CBE';
          const compactMode = !!settings.compactMode;

          applyTheme(theme);

          const root = document.documentElement;
          root.style.setProperty('--color-primary', accentColor);
          root.style.setProperty('--color-primary-hover', getAccentHover(accentColor));
          
          if (compactMode) {
            document.body.classList.add('compact');
          } else {
            document.body.classList.remove('compact');
          }
        } else {
          applyTheme('dark');
        }
      } catch (e) {
        console.error(e);
      }
    };

    applyPreferences();

    window.addEventListener('storage', applyPreferences);
    const interval = setInterval(applyPreferences, 500);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      const stored = localStorage.getItem('creatoros_settings');
      if (stored) {
        const settings = JSON.parse(stored);
        if (settings.theme === 'auto') {
          applyTheme('auto');
        }
      }
    };
    mediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      window.removeEventListener('storage', applyPreferences);
      clearInterval(interval);
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    } else if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, loading, router, fetchData]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-on-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-xs text-on-surface-variant uppercase tracking-widest font-semibold animate-pulse">Loading CreatorOS...</p>
        </div>
      </div>
    );
  }

  // Do not render any dashboard content until authentication is confirmed
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      {/* Sidebar Nav */}
      <Sidebar />

      {/* Main Panel */}
      <div className="ml-[240px] flex-1 flex flex-col min-w-0">
        <Navbar />

        {/* Main Canvas Scroll Area */}
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </AuthProvider>
  );
}
