'use client';

import React from 'react';
import { CreatorAPI } from '@/lib/api';
import { useCreatorStore } from '@/store/useCreatorStore';
import BrandAvatar from '@/components/shared/BrandAvatar';
import UserAvatar from '@/components/shared/UserAvatar';

interface InvoicePreviewProps {
  type: 'invoice';
  data: {
    invoice_number: string;
    brand_name: string;
    amount: number;
    status: string;
    due_date: string;
  };
}

interface MediaKitPreviewProps {
  type: 'mediakit';
  data: {
    full_name: string;
    niche: string;
    bio: string;
    avatar_url?: string | null;
    youtubeHandle: string;
    youtubeFollowers: number;
    instagramHandle: string;
    instagramFollowers: number;
    tiktokHandle: string;
    tiktokFollowers: number;
    rateDedicated: number;
    rateIntegration: number;
    rateReel: number;
  };
}

type PdfPreviewProps = InvoicePreviewProps | MediaKitPreviewProps;

export default function PdfPreview({ type, data }: PdfPreviewProps) {
  const { deals } = useCreatorStore();
  
  const handleExport = async () => {
    if (type === 'invoice') {
      await CreatorAPI.downloadInvoicePdf(data);
    } else {
      // Map data structure for API
      await CreatorAPI.downloadMediaKitPdf({
        full_name: data.full_name,
        niche: data.niche,
        bio: data.bio
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-card border border-outline-variant/10 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top action header */}
      <div className="bg-surface-dim/80 px-6 py-4 flex justify-between items-center border-b border-outline-variant/5">
        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Document Preview</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => alert("Link copied to clipboard!")}
            className="px-3 py-1.5 bg-surface-container border border-outline-variant/10 hover:bg-surface-container-high rounded-lg text-xs font-bold text-on-surface transition-all"
          >
            Share Link
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-1.5 bg-primary hover:bg-primary-hover rounded-lg text-xs font-bold text-white transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[14px]">download</span> Export PDF
          </button>
        </div>
      </div>

      {/* Render mock document sheet */}
      <div className="flex-1 p-8 bg-neutral-900 overflow-y-auto custom-scrollbar flex justify-center">
        {type === 'invoice' ? (
          /* Invoice Document Mock */
          <div className="w-[480px] min-h-[600px] bg-white text-zinc-800 p-8 shadow-2xl rounded-sm flex flex-col font-sans text-xs">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-xl font-bold text-[#155CBE] tracking-tight">INVOICE</h1>
                <p className="text-[10px] text-zinc-400 mt-1">CreatorOS Billing Engine</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-zinc-900">Alex Rivera</p>
                <p className="text-zinc-500 text-[10px]">alex@rivera.tech</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <p className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold mb-1">Bill To</p>
                <p className="font-bold text-zinc-900">{(data as any).brand_name || 'Brand Client'}</p>
                <p className="text-zinc-500">Sponsorship Partnership</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold mb-1">Details</p>
                <p className="text-zinc-900"><span className="font-bold">Invoice #:</span> {(data as any).invoice_number || 'INV-2026-00X'}</p>
                <p className="text-zinc-500"><span className="font-bold">Due Date:</span> {(data as any).due_date || 'N/A'}</p>
                <p className="text-zinc-500"><span className="font-bold">Status:</span> <span className="font-bold text-[#155CBE] uppercase text-[9px] bg-blue-50 px-1.5 py-0.5 rounded">{(data as any).status || 'Draft'}</span></p>
              </div>
            </div>

            {/* Table */}
            <table className="w-full text-left mb-8 border-collapse">
              <thead>
                <tr className="bg-[#155CBE] text-white text-[9px] uppercase font-bold">
                  <th className="p-2 rounded-l">Item Description</th>
                  <th className="p-2 text-center">Qty</th>
                  <th className="p-2 text-right rounded-r">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-150">
                  <td className="p-3 font-semibold text-zinc-800">
                    Sponsorship Deliverables Integration - {(data as any).brand_name || 'Campaign'}
                  </td>
                  <td className="p-3 text-center text-zinc-500">1</td>
                  <td className="p-3 text-right font-bold text-zinc-800">${((data as any).amount || 0).toLocaleString()}</td>
                </tr>
                <tr className="font-bold text-sm">
                  <td></td>
                  <td className="p-3 text-center text-zinc-500">Total</td>
                  <td className="p-3 text-right text-zinc-900 border-t-2 border-zinc-900">${((data as any).amount || 0).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            {/* Bank detail block */}
            <div className="mt-auto pt-8 border-t border-zinc-100">
              <p className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold mb-1">Payment Instructions</p>
              <p className="text-zinc-600 leading-relaxed text-[10px]">
                Please remit payments within 30 days of invoice date. <br/>
                Bank Name: <span className="font-bold text-zinc-850">Creators Bank</span> | Account: <span className="font-bold text-zinc-850">1234-5678-9012</span> | Routing: <span className="font-bold text-zinc-850">987654321</span>
              </p>
            </div>
          </div>
        ) : (
          /* Media Kit Document Mock */
          <div className="w-[480px] min-h-[600px] bg-white text-zinc-800 p-8 shadow-2xl rounded-sm flex flex-col font-sans text-xs">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-100">
              <div>
                <h1 className="text-xl font-bold text-[#155CBE] tracking-tight">{(data as any).full_name || 'Alex Rivera'}</h1>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold font-mono">{(data as any).niche || 'Tech Creator'}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden">
                <UserAvatar
                  avatarUrl={(data as any).avatar_url}
                  name={(data as any).full_name}
                  size={48}
                  className="w-full h-full"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="mb-6">
              <p className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold mb-1">About Me</p>
              <p className="text-zinc-650 leading-relaxed text-[10px]">{(data as any).bio || 'Insert creator biography...'}</p>
            </div>

            {/* Demographics/Platforms */}
            <div className="mb-6">
              <p className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold mb-2">Audience reach</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-zinc-50 p-2.5 rounded border border-zinc-100 text-center">
                  <p className="text-[9px] font-bold text-red-500">YouTube</p>
                  <p className="text-sm font-extrabold text-zinc-800">{(data as any).youtubeFollowers?.toLocaleString() || '850k'}</p>
                  <p className="text-[8px] text-zinc-400 font-mono">{(data as any).youtubeHandle || '@alex'}</p>
                </div>
                <div className="bg-zinc-50 p-2.5 rounded border border-zinc-100 text-center">
                  <p className="text-[9px] font-bold text-fuchsia-500">Instagram</p>
                  <p className="text-sm font-extrabold text-zinc-800">{(data as any).instagramFollowers?.toLocaleString() || '420k'}</p>
                  <p className="text-[8px] text-zinc-400 font-mono">{(data as any).instagramHandle || '@alex'}</p>
                </div>
                <div className="bg-zinc-50 p-2.5 rounded border border-zinc-100 text-center">
                  <p className="text-[9px] font-bold text-cyan-500">TikTok</p>
                  <p className="text-sm font-extrabold text-zinc-800">{(data as any).tiktokFollowers?.toLocaleString() || '1.2M'}</p>
                  <p className="text-[8px] text-zinc-400 font-mono">{(data as any).tiktokHandle || '@alex'}</p>
                </div>
              </div>
            </div>

            {/* Past Collaborations */}
            <div className="mb-6">
              <p className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold mb-2">Past Collaborations</p>
              <div className="grid grid-cols-5 gap-3 bg-zinc-50 p-3.5 rounded border border-zinc-100">
                {deals.slice(0, 5).map((deal) => (
                  <div key={deal.id} className="flex flex-col items-center justify-center gap-1 text-center">
                    <BrandAvatar brandName={deal.brand_name} logoUrl={deal.brandLogoUrl || deal.logo_url} size={48} />
                    <span className="text-[9px] font-semibold text-zinc-700 truncate w-full" title={deal.brand_name}>
                      {deal.brand_name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rate Cards */}
            <div className="mt-auto">
              <p className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold mb-2">Standard Rates</p>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center py-1.5 border-b border-zinc-50">
                  <span className="font-semibold text-zinc-700">YouTube Dedicated Video</span>
                  <span className="font-bold text-[#155CBE]">${((data as any).rateDedicated || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-zinc-50">
                  <span className="font-semibold text-zinc-700">YouTube Integration (60s)</span>
                  <span className="font-bold text-[#155CBE]">${((data as any).rateIntegration || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="font-semibold text-zinc-700">Reel / TikTok Placement</span>
                  <span className="font-bold text-[#155CBE]">${((data as any).rateReel || 0).toLocaleString()}</span>
                </div>
              </div>
              <p className="text-[8px] text-zinc-400 text-center mt-6">
                Generated via CreatorOS Portfolio Services. Details: partners@rivera.tech
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
