'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

function RegisterPageContent() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [niche, setNiche] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // --- Client-side validation ---
    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (!supabase) {
      setLoading(true);
      // Create a local session for guest
      const guestUser = {
        id: 'guest-' + Math.random().toString(36).substring(2, 11),
        email: email,
        user_metadata: {
          full_name: fullName,
          niche: niche,
          avatar_url: null
        }
      };
      const guestSession = {
        access_token: 'offline-guest-token',
        user: guestUser
      };

      // Save custom guest session
      localStorage.setItem('creatoros_guest_session', JSON.stringify(guestSession));
      
      // Save customized profile with the user's name and niche
      const customProfile = {
        full_name: fullName,
        avatar_url: null,
        niche: niche || 'Gaming',
        bio: `Professional ${niche || 'Gaming'} creator managing content pipelines and brand sponsorships.`,
        platforms: {
          youtube: { handle: `@${fullName.toLowerCase().replace(/\s+/g, '')}`, followers: 150000, engagement: 4.5 },
          instagram: { handle: `@${fullName.toLowerCase().replace(/\s+/g, '')}_insta`, followers: 85000, engagement: 3.8 }
        }
      };
      localStorage.setItem('creatoros_profile', JSON.stringify(customProfile));

      setTimeout(() => {
        setLoading(false);
        window.location.href = '/dashboard';
      }, 1000);
      return;
    }

    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, niche }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      setSuccess('Account created! Check your email to verify your account before signing in.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-6 py-12 font-sans select-none">
      <div className="w-full max-w-sm bg-surface-card border border-outline-variant/10 p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Create your CreatorOS</h2>
          <p className="text-xs text-on-surface-variant mt-2">Join thousands of pro creators managing smarter</p>
        </div>

        {error && (
          <div className="p-3 bg-error/10 border border-error/20 text-error rounded-lg text-xs font-semibold mb-4 text-center whitespace-pre-line">{error}</div>
        )}
        {success && (
          <div className="p-3 bg-success/10 border border-success/20 text-success rounded-lg text-xs font-semibold mb-4 text-center">{success}</div>
        )}

        <form onSubmit={handleRegister} className="space-y-4" noValidate>
          <div>
            <label htmlFor="reg-name" className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Full Name</label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              placeholder="Alex Rivera"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="reg-niche" className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Creator Niche</label>
            <select
              id="reg-niche"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="">Select your niche</option>
              <option value="Tech & Coding">Tech & Coding</option>
              <option value="Lifestyle & Vlogging">Lifestyle & Vlogging</option>
              <option value="Gaming">Gaming</option>
              <option value="Finance & Investing">Finance & Investing</option>
              <option value="Fitness & Wellness">Fitness & Wellness</option>
              <option value="Beauty & Fashion">Beauty & Fashion</option>
              <option value="Education">Education</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="reg-email" className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Email Address</label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              placeholder="alex@rivera.tech"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="reg-password" className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Password</label>
            <input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-lg transition-all active:scale-95 disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-xs text-on-surface-variant text-center mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-semibold">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <AuthProvider>
      <RegisterPageContent />
    </AuthProvider>
  );
}
