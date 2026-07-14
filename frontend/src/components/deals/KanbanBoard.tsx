'use client';

import React, { useState } from 'react';
import { useCreatorStore } from '@/store/useCreatorStore';
import BrandAvatar from '@/components/shared/BrandAvatar';

const STAGES = ['Lead', 'Negotiating', 'Contract Sent', 'Active', 'Paid'] as const;
type Stage = typeof STAGES[number];

export default function KanbanBoard() {
  const { deals, updateDealStage, addDeal, deleteDeal, searchQuery } = useCreatorStore();
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredDeals = deals.filter(deal => {
    const cleanQuery = searchQuery.trim().toLowerCase();
    if (!cleanQuery) return true;
    return (
      deal.brand_name.toLowerCase().includes(cleanQuery) ||
      deal.stage.toLowerCase().includes(cleanQuery) ||
      (deal.description && deal.description.toLowerCase().includes(cleanQuery))
    );
  });
  const [newBrand, setNewBrand] = useState('');
  const [newBrandLogoUrl, setNewBrandLogoUrl] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newStage, setNewStage] = useState<Stage>('Lead');
  const [newDeadline, setNewDeadline] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('text/plain', dealId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, stage: Stage) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain');
    if (dealId) {
      updateDealStage(dealId, stage);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrand.trim()) return;

    let finalLogoUrl = '';
    const trimmedLogoInput = newBrandLogoUrl.trim();

    if (trimmedLogoInput) {
      if (trimmedLogoInput.startsWith('http://') || trimmedLogoInput.startsWith('https://')) {
        finalLogoUrl = trimmedLogoInput;
      } else if (trimmedLogoInput.includes('.')) {
        finalLogoUrl = `https://logo.clearbit.com/${trimmedLogoInput}`;
      } else {
        finalLogoUrl = `https://logo.clearbit.com/${trimmedLogoInput.toLowerCase().replace(/\s+/g, '')}.com`;
      }
    } else {
      finalLogoUrl = `https://logo.clearbit.com/${newBrand.toLowerCase().replace(/\s+/g, '')}.com`;
    }

    addDeal({
      brand_name: newBrand,
      deal_value: parseFloat(newValue) || 0,
      stage: newStage,
      deadline: newDeadline || new Date().toISOString().split('T')[0],
      description: newDesc,
      brandLogoUrl: finalLogoUrl,
      logo_url: finalLogoUrl
    });

    setNewBrand('');
    setNewBrandLogoUrl('');
    setNewValue('');
    setNewStage('Lead');
    setNewDeadline('');
    setNewDesc('');
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Deal Pipeline</h2>
          <p className="text-sm text-on-surface-variant">Track campaigns from pitch to payment. Drag cards to update stage.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-sm font-bold active:scale-95 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span> Add Brand Deal
        </button>
      </div>

      {/* Kanban Grid */}
      {searchQuery.trim() !== '' && filteredDeals.length === 0 ? (
        <div className="glass-panel p-16 text-center mt-6">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4 block">search_off</span>
          <h3 className="text-base font-bold text-white mb-2">No deals found</h3>
          <p className="text-xs text-on-surface-variant">No brand campaigns matched your search for &quot;{searchQuery}&quot;.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1 overflow-x-auto min-h-[500px]">
          {STAGES.map((stage) => {
            const stageDeals = filteredDeals.filter((d) => d.stage === stage);
            return (
              <div
                key={stage}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage)}
                className="flex flex-col bg-surface-dim/40 rounded-xl p-3 border border-outline-variant/5 min-w-[200px]"
              >
                <div className="flex justify-between items-center mb-3 px-1">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{stage}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-semibold">
                    {stageDeals.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 space-y-3 min-h-[400px]">
                  {stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal.id)}
                      className="p-4 bg-surface-card border border-outline-variant/10 rounded-xl hover:border-primary/40 cursor-grab active:cursor-grabbing transition-all group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <BrandAvatar brandName={deal.brand_name} logoUrl={deal.brandLogoUrl || deal.logo_url} size={40} />
                          <h4 className="text-sm font-bold text-white truncate max-w-[120px]">{deal.brand_name}</h4>
                        </div>
                        <button
                          onClick={() => deleteDeal(deal.id)}
                          className="text-on-surface-variant opacity-0 group-hover:opacity-100 hover:text-error transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>

                      <p className="text-xs text-on-surface-variant mb-3 line-clamp-2">{deal.description}</p>

                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-primary">${deal.deal_value.toLocaleString()}</span>
                        <span className="text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">event</span>
                          {deal.deadline}
                        </span>
                      </div>
                    </div>
                  ))}

                  {stageDeals.length === 0 && (
                    <div className="border border-dashed border-outline-variant/10 rounded-xl h-24 flex items-center justify-center">
                      <p className="text-xs text-on-surface-variant">Drop deal here</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Deal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-card border border-outline-variant/10 rounded-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="text-lg font-bold text-white mb-4">Create Brand Deal</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                  Brand Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nike"
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                  Brand Logo URL / Domain (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. nike.com or https://example.com/logo.png"
                  value={newBrandLogoUrl}
                  onChange={(e) => setNewBrandLogoUrl(e.target.value)}
                  className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                    Deal Value ($)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5000"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                    Stage
                  </label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value as Stage)}
                    className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                  Deadline Date
                </label>
                <input
                  type="date"
                  required
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                  Brief Campaign Description
                </label>
                <textarea
                  placeholder="Describe campaign deliverables..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-primary hover:bg-primary-hover text-white rounded-lg"
                >
                  Create Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
