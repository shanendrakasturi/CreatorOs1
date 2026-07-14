'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

function LoginPageContent() {
  const { isAuthenticated, loginGuest } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setLoading(true);

    if (supabase) {
      // Real Supabase auth
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(authError.message || 'Invalid credentials. Please try again.');
        setLoading(false);
        return;
      }
    } else {
      // Offline / no-Supabase mode — accept any non-empty credentials
      loginGuest();
      router.replace('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-6 py-12 font-sans select-none">
      <div className="w-full max-w-sm bg-surface-card border border-outline-variant/10 p-8 rounded-2xl shadow-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome to CreatorOS</h2>
          <p className="text-xs text-on-surface-variant mt-2">Manage your creator business empire</p>
        </div>

        {error && (
          <div className="p-3 bg-error/10 border border-error/20 text-error rounded-lg text-xs font-semibold mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5" noValidate>
          <div>
            <label htmlFor="login-email" className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="alex@rivera.tech"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-lg transition-all active:scale-95 duration-100 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-xs text-on-surface-variant text-center mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="text-primary hover:underline font-semibold">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginPageContent />
    </AuthProvider>
  );
}
