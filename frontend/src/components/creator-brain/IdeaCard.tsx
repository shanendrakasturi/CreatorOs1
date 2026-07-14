'use client';

import React from 'react';

export interface Idea {
  id: string;
  type: 'text' | 'voice' | 'screenshot' | 'link';
  aiTitle: string;
  aiSummary: string;
  tags: string[];
  connectedIdeas: string[];
  createdAt: string;
  rawContent?: string;
  resurfaceReason?: string;
}

const TYPE_CONFIG = {
  text:       { icon: 'text_fields', label: 'Text',       color: 'text-primary bg-primary/10' },
  voice:      { icon: 'mic',         label: 'Voice',      color: 'text-fuchsia-400 bg-fuchsia-400/10' },
  screenshot: { icon: 'image',       label: 'Screenshot', color: 'text-cyan-400 bg-cyan-400/10' },
  link:       { icon: 'link',        label: 'Link',       color: 'text-amber-400 bg-amber-400/10' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface IdeaCardProps {
  idea: Idea;
  onEditClick: (idea: Idea) => void;
  onDeleteClick: (id: string) => void;
}

export default function IdeaCard({ idea, onEditClick, onDeleteClick }: IdeaCardProps) {
  const cfg = TYPE_CONFIG[idea.type] ?? TYPE_CONFIG.text;

  return (
    <div className="glass-panel p-5 flex flex-col gap-3 group transition-all duration-200 hover:border-primary/40 hover:shadow-[0_0_20px_rgba(21,92,190,0.12)]">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold font-label uppercase tracking-wider ${cfg.color}`}>
          <span className="material-symbols-outlined text-[13px]">{cfg.icon}</span>
          {cfg.label}
        </span>

        {/* Action buttons — always <button> with stopPropagation */}
        <div className="flex items-center gap-1 text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            title="Edit idea"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onEditClick(idea);
            }}
            className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
          <button
            type="button"
            title="Delete idea"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onDeleteClick(idea.id);
            }}
            className="p-1.5 rounded-lg hover:bg-error/10 hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-white leading-snug font-headline line-clamp-2">
        {idea.aiTitle}
      </h3>

      {/* Summary */}
      <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">
        {idea.aiSummary}
      </p>

      {/* Tags */}
      {idea.tags && idea.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {idea.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md bg-surface-container text-[10px] font-label text-on-surface-variant border border-outline-variant/20"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1 border-t border-outline-variant/10">
        {idea.connectedIdeas && idea.connectedIdeas.length > 0 ? (
          <span className="flex items-center gap-1 text-[10px] font-label text-primary">
            <span className="material-symbols-outlined text-[13px]">hub</span>
            {idea.connectedIdeas.length} linked
          </span>
        ) : (
          <span />
        )}
        <span className="text-[10px] font-label text-on-surface-variant tracking-wider">
          {timeAgo(idea.createdAt)}
        </span>
      </div>
    </div>
  );
}
