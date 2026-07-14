'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { CreatorAPI } from '@/lib/api';

const PLATFORMS = ['YouTube', 'Instagram', 'TikTok', 'Twitter', 'Twitch'];
const TONES = ['Professional', 'Casual & Fun', 'Inspirational', 'Educational', 'Hype / Energetic'];
const MODELS = [
  { label: 'Llama 3.3 (Default)', value: 'llama-3.3-70b-versatile' },
  { label: 'Llama 3.1 8B', value: 'llama-3.1-8b-instant' },
  { label: 'DeepSeek R1', value: 'deepseek-r1-distill-llama-70b' },
  { label: 'Qwen QwQ', value: 'qwen-qwq-32b' },
];

interface CaptionVariant {
  caption: string;
  hook: string;
}

export default function CaptionsPage() {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('YouTube');
  const [tone, setTone] = useState('Professional');
  const [model, setModel] = useState('llama-3.3-70b-versatile');
  const [generating, setGenerating] = useState(false);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  const [variants, setVariants] = useState<CaptionVariant[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setGenerating(true);
    setVariants([]);

    try {
      const result = await CreatorAPI.generateCaptions(topic, platform, tone, model);
      setVariants(Array.isArray(result) ? result : []);
    } catch {
      setVariants([]);
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = async (idx: number) => {
    if (!topic.trim() || regeneratingIndex !== null || generating) return;
    setRegeneratingIndex(idx);

    const existingCaptions = variants.map(v => v.caption);

    try {
      const result = await CreatorAPI.generateCaptions(
        topic,
        platform,
        tone,
        model,
        idx,
        existingCaptions
      );
      
      if (result && typeof result === 'object' && !Array.isArray(result)) {
        setVariants(prev => {
          const next = [...prev];
          next[idx] = result;
          return next;
        });
      } else if (Array.isArray(result) && result.length > 0) {
        setVariants(prev => {
          const next = [...prev];
          next[idx] = result[0];
          return next;
        });
      }
    } catch (err) {
      console.error("Regeneration failed", err);
    } finally {
      setRegeneratingIndex(null);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idx);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Caption Generator</h1>
        <p className="text-sm text-on-surface-variant mt-1">Generate high-converting captions with AI. Powered by Groq.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="glass-panel p-6 space-y-5">
          <h2 className="text-base font-bold text-white">Configure Caption</h2>

          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Topic / Post Description</label>
              <textarea
                required
                placeholder="e.g. My 2026 desk setup tour featuring the new ASUS ROG and Spotify integration"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={4}
                className="w-full bg-surface-dim border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Target Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                >
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                >
                  {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">AI Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
              >
                {MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Generating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  Generate Captions
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output Panel */}
        <div className="space-y-4">
          {generating && (
            <div className="glass-panel p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                <span className="text-sm font-semibold text-primary animate-pulse">AI is composing your captions...</span>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="space-y-2 animate-pulse">
                    <div className="h-3 bg-surface-container-high rounded w-3/4"></div>
                    <div className="h-3 bg-surface-container-high rounded w-full"></div>
                    <div className="h-3 bg-surface-container-high rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!generating && variants.length === 0 && (
            <div className="glass-panel p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4 block">auto_awesome</span>
              <h3 className="text-base font-bold text-white mb-2">No captions generated yet</h3>
              <p className="text-xs text-on-surface-variant">Fill in the form and click Generate to get 3 caption variants.</p>
            </div>
          )}

          {variants.map((variant, idx) => (
            <div
              key={idx}
              className={`glass-panel p-5 group transition-all duration-300 ${
                regeneratingIndex === idx ? 'opacity-60 border-primary/40 scale-[0.99]' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full">
                  Variant {idx + 1}
                </span>
                <button
                  onClick={() => handleCopy(variant.caption, idx)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copiedId === idx ? 'check' : 'content_copy'}
                  </span>
                  {copiedId === idx ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-sm text-on-surface leading-relaxed mb-3 whitespace-pre-wrap">{variant.caption}</p>
              {variant.hook && (
                <div className="border-t border-outline-variant/5 pt-3 mt-3">
                  <p className="text-[10px] text-on-surface-variant">
                    <span className="font-bold text-primary">Why it works: </span>{variant.hook}
                  </p>
                </div>
              )}
              <div className="flex justify-end mt-3">
                <button
                  onClick={() => handleRegenerate(idx)}
                  disabled={regeneratingIndex !== null || generating}
                  className="text-xs font-semibold text-on-surface-variant hover:text-primary flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  {regeneratingIndex === idx ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent"></div>
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[14px]">refresh</span> Regenerate
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
