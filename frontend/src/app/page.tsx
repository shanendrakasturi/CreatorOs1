'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-on-surface select-none font-sans">
      {/* Top Navbar */}
      <nav className="flex justify-between items-center max-w-7xl mx-auto px-6 w-full h-20 bg-background/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="font-sans text-2xl font-extrabold text-primary">CreatorOS</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-on-surface-variant hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="text-sm font-medium text-on-surface-variant hover:text-white transition-colors">Pricing</a>
          <a href="#roadmap" className="text-sm font-medium text-on-surface-variant hover:text-white transition-colors">Roadmap</a>
          <a href="#contact" className="text-sm font-medium text-on-surface-variant hover:text-white transition-colors">Contact</a>
        </div>
        <button
          onClick={() => router.push('/login')}
          className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-lg active:scale-95 transition-all shadow-md shadow-primary/15"
        >
          Get Started
        </button>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-20 pb-28 overflow-hidden hero-gradient bg-[radial-gradient(circle_at_center_top,rgba(21,92,190,0.12),transparent_60%)]">
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Now in Early Access</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold max-w-4xl mx-auto leading-tight mb-6 tracking-tight text-white">
            Manage your creator business in <span className="text-primary">one place</span>
          </h1>
          
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed">
            The all-in-one OS for professional YouTubers and influencers. Stop juggling spreadsheets and start growing your business with automated brand deals, invoicing, and AI-powered insights.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button 
              onClick={() => router.push('/login')}
              className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl hover:shadow-[0_0_25px_rgba(21,92,190,0.45)] transition-all"
            >
              Get Started Free
            </button>
            <button 
              onClick={() => alert("Watch Demo clip coming soon!")}
              className="w-full sm:w-auto px-8 py-4 bg-surface-card border border-outline-variant/15 text-on-surface font-bold rounded-xl hover:bg-surface-container-high transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">play_circle</span> Watch Demo
            </button>
          </div>

          {/* Interactive Mockup */}
          <div className="relative mx-auto max-w-5xl group mt-8">
            <div className="absolute -inset-4 bg-primary/10 rounded-[2rem] blur-3xl opacity-20 group-hover:opacity-45 transition-opacity duration-500"></div>
            <div className="relative bg-surface-card rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <div className="h-8 bg-surface-dim/90 flex items-center px-4 gap-1.5 border-b border-white/5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/40"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/40"></div>
              </div>
              <img
                className="w-full h-auto aspect-video object-cover"
                src="/dashboard-mockup.png"
                alt="CreatorOS Dashboard UI Mockup"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Trusted By Grid */}
      <section className="py-12 border-y border-outline-variant/5 bg-surface-dim/20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-8">Trusted by top creators on</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
            <div className="flex items-center gap-2 text-white">
              <span className="material-symbols-outlined text-3xl">video_library</span>
              <span className="font-bold text-lg">YouTube</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <span className="material-symbols-outlined text-3xl">photo_camera</span>
              <span className="font-bold text-lg">Instagram</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <span className="material-symbols-outlined text-3xl">music_video</span>
              <span className="font-bold text-lg">TikTok</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <span className="material-symbols-outlined text-3xl">podcasts</span>
              <span className="font-bold text-lg">Spotify</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers Section */}
      <section id="pricing" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Sleek plans for scalable channels</h2>
          <p className="text-on-surface-variant max-w-md mx-auto">Choose a plan that matches your audience size and business complexity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Starter */}
          <div className="bg-surface-card border border-outline-variant/10 rounded-2xl p-8 hover:border-white/20 transition-all flex flex-col">
            <h3 className="text-lg font-bold text-white mb-2">Starter</h3>
            <p className="text-xs text-on-surface-variant mb-6">For emerging creators getting set up.</p>
            <p className="text-3xl font-extrabold text-white mb-6">$0 <span className="text-sm font-normal text-on-surface-variant">/ month</span></p>
            <ul className="space-y-4 text-xs text-on-surface-variant mb-8 flex-1">
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check</span> Content calendar grid</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check</span> Basic brand deals tracking</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check</span> 5 AI Captions monthly</li>
            </ul>
            <button 
              onClick={() => router.push('/login')}
              className="w-full py-3 bg-surface-container border border-outline-variant/10 rounded-xl text-xs font-bold text-white hover:bg-surface-container-high transition-all"
            >
              Get Started
            </button>
          </div>

          {/* Pro */}
          <div className="bg-surface-card border-2 border-primary rounded-2xl p-8 relative hover:scale-[1.02] transition-all flex flex-col shadow-2xl shadow-primary/5">
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              Most Popular
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Pro</h3>
            <p className="text-xs text-on-surface-variant mb-6">For full-time independent creators.</p>
            <p className="text-3xl font-extrabold text-white mb-6">$29 <span className="text-sm font-normal text-on-surface-variant">/ month</span></p>
            <ul className="space-y-4 text-xs text-on-surface-variant mb-8 flex-1">
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check</span> All calendar & kanban modules</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check</span> Unlimited AI tools & templates</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check</span> Invoice & Media Kit PDF builders</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check</span> Direct analytics integrations</li>
            </ul>
            <button 
              onClick={() => router.push('/login')}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/20"
            >
              Subscribe Pro
            </button>
          </div>

          {/* Team */}
          <div className="bg-surface-card border border-outline-variant/10 rounded-2xl p-8 hover:border-white/20 transition-all flex flex-col">
            <h3 className="text-lg font-bold text-white mb-2">Team</h3>
            <p className="text-xs text-on-surface-variant mb-6">For creator collectives & management agents.</p>
            <p className="text-3xl font-extrabold text-white mb-6">$89 <span className="text-sm font-normal text-on-surface-variant">/ month</span></p>
            <ul className="space-y-4 text-xs text-on-surface-variant mb-8 flex-1">
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check</span> Multiple creator profile switching</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check</span> Advanced contract signing tags</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check</span> Premium support & custom analytics</li>
            </ul>
            <button 
              onClick={() => router.push('/login')}
              className="w-full py-3 bg-surface-container border border-outline-variant/10 rounded-xl text-xs font-bold text-white hover:bg-surface-container-high transition-all"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-outline-variant/5 py-12 bg-surface-dim/40 text-xs text-on-surface-variant">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p>© 2026 CreatorOS Inc. Built for professional creator businesses.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
