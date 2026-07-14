'use client';

import React, { useState, useRef } from 'react';

type TabKey = 'text' | 'voice' | 'screenshot' | 'link';

interface CaptureModalProps {
  onClose: () => void;
  onSave: (type: TabKey, content: string) => Promise<void>;
}

const TABS: { key: TabKey; icon: string; label: string }[] = [
  { key: 'text', icon: 'text_fields', label: 'Text' },
  { key: 'voice', icon: 'mic', label: 'Voice' },
  { key: 'screenshot', icon: 'image', label: 'Screenshot' },
  { key: 'link', icon: 'link', label: 'Link' },
];

export default function CaptureModal({ onClose, onSave }: CaptureModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('text');
  const [textContent, setTextContent] = useState('');
  const [linkContent, setLinkContent] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScreenshotDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const getContent = (): string => {
    switch (activeTab) {
      case 'text': return textContent;
      case 'link': return linkContent;
      case 'screenshot': return screenshotFile?.name || 'Screenshot captured';
      case 'voice': return 'Voice note recorded';
      default: return '';
    }
  };

  const handleSave = async () => {
    const content = getContent();
    if (!content.trim()) return;
    setSaving(true);
    try {
      await onSave(activeTab, content);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg glass-panel p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-white font-headline">Capture Idea</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Add anything — AI will organize it for you.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-1 p-1 bg-surface-dim rounded-xl mb-5">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[160px]">
          {/* Text Tab */}
          {activeTab === 'text' && (
            <textarea
              autoFocus
              placeholder="Dump your idea here, in any format — raw thoughts are fine..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              rows={6}
              className="w-full bg-surface-dim border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
            />
          )}

          {/* Voice Tab */}
          {activeTab === 'voice' && (
            <div className="flex flex-col items-center justify-center gap-4 py-6">
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isRecording
                    ? 'bg-error/20 border-2 border-error animate-pulse shadow-[0_0_24px_rgba(255,100,80,0.35)]'
                    : 'bg-primary/10 border-2 border-primary hover:bg-primary/20'
                }`}
              >
                <span className={`material-symbols-outlined text-[36px] ${isRecording ? 'text-error' : 'text-primary'}`}>
                  {isRecording ? 'stop' : 'mic'}
                </span>
              </button>

              {/* Waveform placeholder */}
              {isRecording && (
                <div className="flex items-center gap-1 h-8">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-primary rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 24 + 8}px`,
                        animationDelay: `${i * 0.05}s`
                      }}
                    />
                  ))}
                </div>
              )}

              <p className="text-xs text-on-surface-variant text-center">
                {isRecording
                  ? 'Recording... tap stop when done. AI will auto-transcribe.'
                  : 'Tap the mic to start recording your idea.'}
              </p>
            </div>
          )}

          {/* Screenshot Tab */}
          {activeTab === 'screenshot' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleScreenshotDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-outline-variant/40 hover:border-primary/50 hover:bg-surface-container/30'
              }`}
            >
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
              {screenshotPreview ? (
                <img src={screenshotPreview} alt="Preview" className="max-h-32 mx-auto rounded-lg object-contain" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">add_photo_alternate</span>
                  <p className="text-sm text-on-surface-variant">
                    <span className="text-primary font-semibold">Drop a screenshot</span> or click to browse
                  </p>
                  <p className="text-xs text-on-surface-variant/60 mt-1">PNG, JPG, WebP supported</p>
                </>
              )}
            </div>
          )}

          {/* Link Tab */}
          {activeTab === 'link' && (
            <div className="space-y-3">
              <input
                autoFocus
                type="url"
                placeholder="https://..."
                value={linkContent}
                onChange={(e) => setLinkContent(e.target.value)}
                className="w-full bg-surface-dim border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-label"
              />
              {linkContent && (
                <div className="flex items-center gap-2 p-3 bg-surface-container rounded-lg border border-outline-variant/20">
                  <span className="material-symbols-outlined text-[18px] text-primary">language</span>
                  <span className="text-xs text-on-surface-variant truncate">{linkContent}</span>
                  <span className="ml-auto text-[10px] text-primary font-label">AI will fetch title & preview</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving || !getContent().trim()}
          className="w-full mt-5 py-3 bg-primary hover:bg-primary-hover disabled:opacity-40 text-white font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              AI is organizing...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">psychology</span>
              Save Idea
            </>
          )}
        </button>
      </div>
    </div>
  );
}
