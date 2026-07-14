'use client';

import React, { useState, useEffect } from 'react';
import type { Idea } from './IdeaCard';

interface EditIdeaModalProps {
  idea: Idea;
  onClose: () => void;
  onSave: (id: string, updatedFields: { rawContent: string; tags: string[] }) => Promise<void>;
}

export default function EditIdeaModal({ idea, onClose, onSave }: EditIdeaModalProps) {
  const [content, setContent] = useState(idea.rawContent || idea.aiSummary || '');
  const [tags, setTags] = useState<string[]>([...idea.tags]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  // Reset when idea changes (shouldn't remount, but safety)
  useEffect(() => {
    setContent(idea.rawContent || idea.aiSummary || '');
    setTags([...idea.tags]);
  }, [idea.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags(prev => prev.filter(t => t !== tag));

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(prev => prev.slice(0, -1));
    }
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      await onSave(idea.id, { rawContent: content.trim(), tags });
    } finally {
      setSaving(false);
    }
  };

  const typeIcon: Record<Idea['type'], string> = {
    text: 'text_fields', voice: 'mic', screenshot: 'image', link: 'link',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg glass-panel p-6 shadow-2xl z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[20px] text-primary">{typeIcon[idea.type]}</span>
            <div>
              <h2 className="text-base font-bold text-white font-headline">Edit Idea</h2>
              <p className="text-[10px] text-on-surface-variant font-label mt-0.5 uppercase tracking-wider">
                {idea.type} idea — AI will re-summarize on save
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content Field */}
        <div className="mb-4">
          <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            Content
          </label>
          <textarea
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            placeholder="Edit your idea content..."
            className="w-full bg-surface-dim border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none transition-all"
          />
        </div>

        {/* Tags Field */}
        <div className="mb-5">
          <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            Tags
          </label>
          {/* Tag pills + input */}
          <div className="flex flex-wrap gap-1.5 p-3 bg-surface-dim border border-outline-variant/30 rounded-xl min-h-[48px] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container border border-outline-variant/20 text-[10px] font-label text-on-surface-variant"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-error transition-colors ml-0.5"
                >
                  <span className="material-symbols-outlined text-[11px]">close</span>
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={addTag}
              placeholder={tags.length === 0 ? 'Add tags (Enter or comma to add)...' : ''}
              className="flex-1 min-w-[120px] bg-transparent text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none font-label"
            />
          </div>
          <p className="text-[10px] text-on-surface-variant mt-1.5">Press Enter or comma to add a tag. Backspace removes the last one.</p>
        </div>

        {/* AI Re-enrichment note */}
        <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/15 rounded-xl mb-5">
          <span className="material-symbols-outlined text-[16px] text-primary flex-shrink-0">auto_awesome</span>
          <p className="text-[10px] text-primary leading-relaxed">
            Saving will re-run AI enrichment — the card title and summary will update automatically.
          </p>
        </div>

        {/* Footer buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-white text-sm font-semibold rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !content.trim()}
            className="flex-1 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-40 text-white text-sm font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">save</span>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
