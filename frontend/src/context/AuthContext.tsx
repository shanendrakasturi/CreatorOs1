'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: any;
  session: any;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  loginGuest: () => void;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<any>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const token = session?.access_token ?? null;
  const isAuthenticated = !!user && !!session;

  useEffect(() => {
    if (supabase) {
      // With real Supabase: get existing session, then verify the user token is still valid
      supabase.auth.getSession().then(async ({ data: { session: activeSession } }) => {
        if (activeSession) {
          // Verify the access token is still valid by fetching the user
          const { data: { user: verifiedUser }, error } = await supabase!.auth.getUser(activeSession.access_token);
          if (error || !verifiedUser) {
            // Token expired or invalid — clear everything
            await supabase!.auth.signOut();
            setSession(null);
            setUser(null);
          } else {
            setSession(activeSession);
            setUser(verifiedUser);
          }
        } else {
          setSession(null);
          setUser(null);
        }
        setLoading(false);
      });

      // Listen to auth state changes (login, logout, token refresh)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // Offline mode: only restore if guest session was explicitly saved
      const guestSession = localStorage.getItem('creatoros_guest_session');
      if (guestSession) {
        try {
          const parsed = JSON.parse(guestSession);
          // Validate that the stored session has the required structure
          if (parsed?.user?.id && parsed?.access_token) {
            setUser(parsed.user);
            setSession(parsed);
          } else {
            // Corrupt or old session format — clear it
            localStorage.removeItem('creatoros_guest_session');
          }
        } catch {
          localStorage.removeItem('creatoros_guest_session');
        }
      }
      setLoading(false);
    }
  }, []);

  // Guest/demo login for offline mode — requires explicit user action
  const loginGuest = () => {
    const demoUser = {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'demo@creatoros.app',
      user_metadata: {
        full_name: 'Alex Rivera',
        avatar_url: null
      }
    };
    const demoSession = {
      access_token: 'offline-demo-token',
      user: demoUser
    };

    localStorage.setItem('creatoros_guest_session', JSON.stringify(demoSession));
    setUser(demoUser);
    setSession(demoSession);
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('creatoros_guest_session');
    setUser(null);
    setSession(null);
  };

  const updateUser = (updates: Partial<any>) => {
    setUser((prev: any) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        user_metadata: { ...prev.user_metadata, ...updates }
      };
      // Persist for guest sessions
      const guestSession = localStorage.getItem('creatoros_guest_session');
      if (guestSession) {
        try {
          const parsed = JSON.parse(guestSession);
          parsed.user = updated;
          localStorage.setItem('creatoros_guest_session', JSON.stringify(parsed));
        } catch {}
      }
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, session, token, isAuthenticated, loading, loginGuest, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
