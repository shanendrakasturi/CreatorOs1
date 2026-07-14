'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useCreatorStore } from '@/store/useCreatorStore';
import nextDynamic from 'next/dynamic';

const PdfPreview = nextDynamic(() => import('@/components/shared/PdfPreview'), { ssr: false });

const STATUS_STYLES: Record<string, string> = {
  'Paid': 'bg-emerald-400/10 text-emerald-400',
  'Sent': 'bg-primary/10 text-primary',
  'Draft': 'bg-zinc-400/10 text-zinc-400',
  'Overdue': 'bg-error/10 text-error',
};

export default function InvoicesPage() {
  const { invoices, addInvoice, updateInvoiceStatus, deals, searchQuery } = useCreatorStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const filteredInvoices = invoices.filter(inv => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      inv.invoice_number.toLowerCase().includes(q) ||
      inv.brand_name.toLowerCase().includes(q) ||
      inv.status.toLowerCase().includes(q)
    );
  });

  // New invoice form state
  const [invNumber, setInvNumber] = useState('');
  const [invBrand, setInvBrand] = useState('');
  const [invAmount, setInvAmount] = useState('');
  const [invStatus, setInvStatus] = useState('Draft');
  const [invDue, setInvDue] = useState('');
  const [invDealId, setInvDealId] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const invoiceNum = invNumber || `INV-${Date.now().toString().slice(-6)}`;
    addInvoice({
      invoice_number: invoiceNum,
      brand_name: invBrand,
      amount: parseFloat(invAmount) || 0,
      status: invStatus,
      due_date: invDue,
      deal_id: invDealId || null
    });
    setInvNumber(''); setInvBrand(''); setInvAmount(''); setInvStatus('Draft'); setInvDue(''); setInvDealId('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Invoicing & Contracts</h1>
          <p className="text-sm text-on-surface-variant mt-1">Manage all billing and signed agreements</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-sm font-bold active:scale-95 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span> New Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Invoices Table */}
        <div className="lg:col-span-2 glass-panel overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant/5">
            <h2 className="text-sm font-bold text-white">All Invoices</h2>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-outline-variant/5 text-on-surface-variant">
                <th className="text-left px-6 py-3 font-bold uppercase tracking-wider">Invoice #</th>
                <th className="text-left px-6 py-3 font-bold uppercase tracking-wider">Brand</th>
                <th className="text-left px-6 py-3 font-bold uppercase tracking-wider">Amount</th>
                <th className="text-left px-6 py-3 font-bold uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 font-bold uppercase tracking-wider">Due Date</th>
                <th className="text-left px-6 py-3 font-bold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map(invoice => (
                <tr
                  key={invoice.id}
                  onClick={() => setSelectedInvoice(invoice)}
                  className={`border-b border-outline-variant/5 hover:bg-surface-container/20 cursor-pointer transition-colors group ${selectedInvoice?.id === invoice.id ? 'bg-primary/5 border-primary/10' : ''}`}
                >
                  <td className="px-6 py-4 font-mono font-bold text-white">{invoice.invoice_number}</td>
                  <td className="px-6 py-4 text-on-surface">{invoice.brand_name}</td>
                  <td className="px-6 py-4 font-bold text-primary">${invoice.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLES[invoice.status] || ''}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">{invoice.due_date}</td>
                  <td className="px-6 py-4">
                    <select
                      value={invoice.status}
                      onChange={(e) => { e.stopPropagation(); updateInvoiceStatus(invoice.id, e.target.value); }}
                      onClick={e => e.stopPropagation()}
                      className="bg-surface-dim border border-outline-variant/30 rounded px-2 py-1 text-[10px] text-on-surface focus:outline-none focus:border-primary"
                    >
                      {['Draft', 'Sent', 'Paid', 'Overdue'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredInvoices.length === 0 && (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">
                {searchQuery.trim() ? 'search_off' : 'receipt_long'}
              </span>
              <p className="text-sm font-bold text-white mb-1">
                {searchQuery.trim() ? 'No matching invoices' : 'No invoices yet'}
              </p>
              <p className="text-xs text-on-surface-variant">
                {searchQuery.trim() ? `No invoices matched "${searchQuery}".` : 'Click "New Invoice" to get started.'}
              </p>
            </div>
          )}
        </div>

        {/* Invoice Preview Pane */}
        <div className="h-[600px] lg:sticky lg:top-24">
          {selectedInvoice ? (
            <PdfPreview type="invoice" data={selectedInvoice} />
          ) : (
            <div className="glass-panel h-full flex flex-col items-center justify-center text-center p-8">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4">description</span>
              <h3 className="text-sm font-bold text-white mb-2">Invoice Preview</h3>
              <p className="text-xs text-on-surface-variant">Click any invoice to preview and export as PDF.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Invoice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-card border border-outline-variant/10 rounded-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="text-lg font-bold text-white mb-4">Create New Invoice</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Invoice #</label>
                  <input placeholder="Auto-generated" value={invNumber} onChange={e => setInvNumber(e.target.value)} className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Brand / Client</label>
                  <input required placeholder="e.g. Nike" value={invBrand} onChange={e => setInvBrand(e.target.value)} className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Amount ($)</label>
                  <input required type="number" placeholder="5000" value={invAmount} onChange={e => setInvAmount(e.target.value)} className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Due Date</label>
                  <input required type="date" value={invDue} onChange={e => setInvDue(e.target.value)} className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Status</label>
                  <select value={invStatus} onChange={e => setInvStatus(e.target.value)} className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary">
                    {['Draft', 'Sent', 'Paid', 'Overdue'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Linked Deal</label>
                  <select value={invDealId} onChange={e => setInvDealId(e.target.value)} className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary">
                    <option value="">None</option>
                    {deals.map(d => <option key={d.id} value={d.id}>{d.brand_name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface">Cancel</button>
                <button type="submit" className="px-5 py-2 text-sm font-bold bg-primary hover:bg-primary-hover text-white rounded-lg">Create Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
