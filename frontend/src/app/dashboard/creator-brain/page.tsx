'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from 'react';
import IdeaCard, { type Idea } from '@/components/creator-brain/IdeaCard';
import CaptureModal from '@/components/creator-brain/CaptureModal';
import EditIdeaModal from '@/components/creator-brain/EditIdeaModal';
import DeleteConfirmModal from '@/components/creator-brain/DeleteConfirmModal';
import { MockDatabase } from '@/lib/supabase';
import { CreatorAPI } from '@/lib/api';

function genId() {
  return 'idea_' + Math.random().toString(36).slice(2, 9);
}

export default function CreatorBrainPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [resurfaced, setResurfaced] = useState<Idea[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Modals state
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [deletingIdea, setDeletingIdea] = useState<Idea | null>(null);
  
  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Load from MockDatabase
  useEffect(() => {
    const loaded: Idea[] = MockDatabase.getIdeas();
    setIdeas(loaded);
    setFilteredIdeas(loaded);

    // Load resurfaced ideas (async)
    CreatorAPI.getResurfacedIdeas(loaded).then(setResurfaced).catch(() => {
      if (loaded.length >= 2) {
        setResurfaced(loaded.slice(-2).map(i => ({
          ...i,
          resurfaceReason: 'This idea aligns with your current content momentum.'
        })));
      }
    });
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchDebounce) clearTimeout(searchDebounce);
    if (!searchQuery.trim()) {
      setFilteredIdeas(ideas);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const p = setTimeout(async () => {
      const results = await CreatorAPI.searchIdeas(searchQuery, ideas);
      setFilteredIdeas(results);
      setIsSearching(false);
    }, 500);
    setSearchDebounce(p);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, ideas]);

  const handleSaveIdea = useCallback(async (type: 'text' | 'voice' | 'screenshot' | 'link', content: string) => {
    try {
      const enriched = await CreatorAPI.enrichIdea(content, type);
      const newIdea: Idea = {
        id: genId(),
        type,
        rawContent: content,
        aiTitle: enriched.title,
        aiSummary: enriched.summary,
        tags: enriched.tags,
        connectedIdeas: [],
        createdAt: new Date().toISOString(),
      };
      const updated = [newIdea, ...ideas];
      setIdeas(updated);
      setFilteredIdeas(updated);
      MockDatabase.saveIdeas(updated);
      showToast("Idea captured and enriched by AI!");
    } catch {
      showToast("Failed to save idea", "error");
    }
  }, [ideas, showToast]);

  const handleUpdateIdea = useCallback(async (id: string, updatedFields: { rawContent: string; tags: string[] }) => {
    try {
      const originalIdea = ideas.find(i => i.id === id);
      const ideaType = originalIdea ? originalIdea.type : 'text';

      const enriched = await CreatorAPI.updateIdea(id, {
        rawContent: updatedFields.rawContent,
        tags: updatedFields.tags,
        type: ideaType
      });

      const updatedIdeas = ideas.map(idea => {
        if (idea.id === id) {
          return {
            ...idea,
            rawContent: updatedFields.rawContent,
            tags: updatedFields.tags,
            aiTitle: enriched.aiTitle || idea.aiTitle,
            aiSummary: enriched.aiSummary || idea.aiSummary,
          };
        }
        return idea;
      });

      setIdeas(updatedIdeas);
      setFilteredIdeas(updatedIdeas);
      MockDatabase.saveIdeas(updatedIdeas);
      showToast("Idea updated and re-enriched!");
      setEditingIdea(null);
    } catch {
      showToast("Failed to update idea", "error");
    }
  }, [ideas, showToast]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingIdea) return;
    const targetId = deletingIdea.id;
    const originalIdeas = [...ideas];

    // Optimistically update frontend state
    const updatedIdeas = ideas.filter(i => i.id !== targetId).map(i => {
      if (i.connectedIdeas.includes(targetId)) {
        return {
          ...i,
          connectedIdeas: i.connectedIdeas.filter(cid => cid !== targetId)
        };
      }
      return i;
    });

    setIdeas(updatedIdeas);
    setFilteredIdeas(updatedIdeas);
    MockDatabase.saveIdeas(updatedIdeas);
    showToast("Idea deleted successfully.");

    try {
      await CreatorAPI.deleteIdea(targetId);
    } catch {
      // Rollback on failure
      setIdeas(originalIdeas);
      setFilteredIdeas(originalIdeas);
      MockDatabase.saveIdeas(originalIdeas);
      showToast("Failed to delete idea on server. Restored original.", "error");
    }
  }, [deletingIdea, ideas, showToast]);

  const connections = ideas.flatMap(i =>
    i.connectedIdeas.map(cid => {
      const connected = ideas.find(x => x.id === cid);
      return connected ? { from: i.aiTitle, to: connected.aiTitle } : null;
    }).filter(Boolean)
  ).slice(0, 4) as { from: string; to: string }[];

  return (
    <div className="space-y-6 relative">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[200] flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg animate-in fade-in slide-in-from-bottom-5 duration-200 bg-surface-card border-outline-variant/20">
          <span className={`material-symbols-outlined text-[18px] ${toast.type === 'error' ? 'text-error' : 'text-success'}`}>
            {toast.type === 'error' ? 'error' : 'check_circle'}
          </span>
          <span className="text-xs font-semibold text-white">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Creator Brain</h1>
          <p className="text-sm text-on-surface-variant mt-1 font-label tracking-wide">Never lose an idea again.</p>
        </div>
        <button
          onClick={() => setShowCaptureModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl transition-all active:scale-95 whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Capture Idea
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-on-surface-variant pointer-events-none">
          search
        </span>
        {isSearching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        )}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder='Search your ideas... e.g. "that video idea about morning routines"'
          className="w-full bg-surface-dim border border-outline-variant/30 rounded-xl pl-11 pr-12 py-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 placeholder:font-label focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        />
      </div>

      {/* Main layout: ideas grid + sidebar panel */}
      <div className="flex gap-6 items-start">
        {/* Left — Idea Cards Grid */}
        <div className="flex-1 min-w-0">
          {filteredIdeas.length === 0 && !isSearching ? (
            /* Empty State */
            <div className="glass-panel p-16 text-center">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant/40 mb-4 block">psychology</span>
              <h3 className="text-lg font-bold text-white mb-2">
                {searchQuery ? 'No ideas match your search' : 'No ideas captured yet'}
              </h3>
              <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
                {searchQuery
                  ? 'Try a different search — use natural language like "sponsorship ideas" or "desk setup".'
                  : 'Start capturing thoughts, screenshots, or links — Creator Brain organizes them for you.'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowCaptureModal(true)}
                  className="mt-5 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl transition-all"
                >
                  Capture Your First Idea
                </button>
              )}
            </div>
          ) : (
            <>
              {searchQuery && (
                <p className="text-xs text-on-surface-variant mb-3 font-label">
                  {filteredIdeas.length} result{filteredIdeas.length !== 1 ? 's' : ''} for "{searchQuery}"
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredIdeas.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    onEditClick={setEditingIdea}
                    onDeleteClick={(id) => setDeletingIdea(idea)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right — Sticky Sidebar Panel */}
        <div className="w-72 flex-shrink-0 space-y-4 sticky top-6">
          {/* Resurfaced Today */}
          <div className="glass-panel p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[18px] text-primary">auto_awesome</span>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Resurfaced Today</h3>
            </div>
            {resurfaced.length === 0 ? (
              <p className="text-xs text-on-surface-variant">AI picks relevant old ideas daily.</p>
            ) : (
              <div className="space-y-3">
                {resurfaced.map((idea) => (
                  <div key={idea.id} className="p-3 bg-surface-container rounded-lg border border-outline-variant/20 hover:border-primary/30 transition-colors cursor-pointer">
                    <p className="text-xs font-semibold text-white line-clamp-1 mb-1">{idea.aiTitle}</p>
                    {idea.resurfaceReason && (
                      <p className="text-[10px] text-primary leading-relaxed">
                        <span className="font-bold">Why now: </span>
                        {idea.resurfaceReason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Idea Connections */}
          <div className="glass-panel p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[18px] text-cyan-400">hub</span>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Idea Connections</h3>
            </div>
            {connections.length === 0 ? (
              <p className="text-xs text-on-surface-variant">No linked ideas yet. AI links related ideas automatically.</p>
            ) : (
              <div className="space-y-2">
                {connections.map((conn, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[10px] text-on-surface-variant">
                    <span className="max-w-[90px] truncate font-medium text-white">{conn.from}</span>
                    <span className="material-symbols-outlined text-[12px] text-primary flex-shrink-0">link</span>
                    <span className="max-w-[90px] truncate">{conn.to}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="glass-panel p-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Brain Stats</h3>
            <div className="space-y-3">
              {[
                { label: 'Total Ideas', value: ideas.length.toString(), icon: 'lightbulb' },
                { label: 'Linked Pairs', value: connections.length.toString(), icon: 'hub' },
                {
                  label: 'Types',
                  value: [...new Set(ideas.map(i => i.type))].length.toString(),
                  icon: 'category'
                },
              ].map(stat => (
                <div key={stat.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-[14px] text-primary">{stat.icon}</span>
                    {stat.label}
                  </div>
                  <span className="text-sm font-bold text-white font-label">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Capture Modal */}
      {showCaptureModal && (
        <CaptureModal
          onClose={() => setShowCaptureModal(false)}
          onSave={handleSaveIdea}
        />
      )}

      {/* Edit Modal */}
      {editingIdea && (
        <EditIdeaModal
          idea={editingIdea}
          onClose={() => setEditingIdea(null)}
          onSave={handleUpdateIdea}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingIdea && (
        <DeleteConfirmModal
          title={deletingIdea.aiTitle}
          onClose={() => setDeletingIdea(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
