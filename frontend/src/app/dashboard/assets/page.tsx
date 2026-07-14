'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useRef, useEffect } from 'react';
import { useCreatorStore } from '@/store/useCreatorStore';

const FILE_TYPE_ICONS: Record<string, string> = {
  'video/mp4': 'videocam',
  'video/quicktime': 'videocam',
  'image/png': 'image',
  'image/jpeg': 'image',
  'image/gif': 'gif_box',
  'application/pdf': 'picture_as_pdf',
};

const FOLDERS = ['All', 'Videos', 'Images', 'Documents', 'Thumbnails'];

function formatBytes(bytes: number) {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  return `${(bytes / 1e3).toFixed(0)} KB`;
}

export default function AssetsPage() {
  const { assets, addAsset, deleteAsset } = useCreatorStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFolder, setSelectedFolder] = useState('All');
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debounce the local search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(localSearchQuery);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [localSearchQuery]);

  const filtered = assets.filter(a => {
    const matchFolder = selectedFolder === 'All' || a.folder === selectedFolder;
    const cleanQuery = debouncedQuery.toLowerCase();
    const matchSearch = !cleanQuery || 
      a.name.toLowerCase().includes(cleanQuery) || 
      (a.file_type && a.file_type.toLowerCase().includes(cleanQuery)) ||
      (a.folder && a.folder.toLowerCase().includes(cleanQuery));
    return matchFolder && matchSearch;
  });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const folder = isVideo ? 'Videos' : isImage ? 'Images' : 'Documents';
      const previewUrl = isImage ? URL.createObjectURL(file) : undefined;

      addAsset({
        name: file.name,
        file_url: previewUrl || '#',
        file_type: file.type,
        size_bytes: file.size,
        folder,
        thumbnail_url: isImage ? previewUrl : null
      });
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Asset Management</h1>
          <p className="text-sm text-on-surface-variant mt-1">All your brand content, thumbnails, and media files</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,application/pdf"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-sm font-bold active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">upload</span> Upload Files
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Folder Sidebar */}
        <div className="w-48 flex-shrink-0">
          <div className="glass-panel p-4 space-y-1">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-3 px-2">Folders</p>
            {FOLDERS.map(folder => (
              <button
                key={folder}
                onClick={() => setSelectedFolder(folder)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  selectedFolder === folder
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-on-surface-variant hover:text-white hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {folder === 'All' ? 'folder_open' : folder === 'Videos' ? 'videocam' : folder === 'Images' ? 'image' : folder === 'Documents' ? 'description' : 'photo_library'}
                </span>
                {folder}
                <span className="ml-auto text-[10px] bg-surface-container px-1.5 py-0.5 rounded">
                  {folder === 'All' ? assets.length : assets.filter(a => a.folder === folder).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-4">
          {/* Search + View Toggle */}
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input
                type="text"
                placeholder="Search assets..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg pl-9 pr-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
            <div className="bg-surface-card border border-outline-variant/10 rounded-lg p-0.5 flex gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-white'}`}
              >
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-white'}`}
              >
                <span className="material-symbols-outlined text-[18px]">list</span>
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="glass-panel p-16 text-center">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4 block">
                {localSearchQuery.trim() !== '' ? 'search_off' : 'folder_open'}
              </span>
              <h3 className="text-base font-bold text-white mb-2">
                {localSearchQuery.trim() !== '' ? 'No results found' : 'No assets found'}
              </h3>
              <p className="text-xs text-on-surface-variant mb-6">
                {localSearchQuery.trim() !== '' 
                  ? `No assets matched your search for "${localSearchQuery}".` 
                  : 'Upload images, videos, or documents to this folder.'}
              </p>
              {localSearchQuery.trim() === '' && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-hover"
                >
                  Upload Files
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.map(asset => (
                <div key={asset.id} className="glass-panel overflow-hidden group hover:scale-[1.02] transition-transform">
                  <div className="h-36 bg-surface-dim flex items-center justify-center relative">
                    {asset.thumbnail_url ? (
                      <img src={asset.thumbnail_url} alt={asset.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className={`material-symbols-outlined text-5xl ${asset.file_type?.startsWith('video') ? 'text-cyan-400' : asset.file_type?.includes('pdf') ? 'text-error' : 'text-on-surface-variant'}`}>
                        {FILE_TYPE_ICONS[asset.file_type] || 'insert_drive_file'}
                      </span>
                    )}
                    <button
                      onClick={() => deleteAsset(asset.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-black/60 text-error p-1 rounded-full transition-all"
                    >
                      <span className="material-symbols-outlined text-[14px]">delete</span>
                    </button>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold text-white truncate">{asset.name}</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">{formatBytes(asset.size_bytes)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-outline-variant/10 text-on-surface-variant">
                    <th className="text-left px-5 py-3 font-bold uppercase tracking-wider">Name</th>
                    <th className="text-left px-5 py-3 font-bold uppercase tracking-wider">Folder</th>
                    <th className="text-left px-5 py-3 font-bold uppercase tracking-wider">Type</th>
                    <th className="text-left px-5 py-3 font-bold uppercase tracking-wider">Size</th>
                    <th className="py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(asset => (
                    <tr key={asset.id} className="border-b border-outline-variant/5 hover:bg-surface-container/20 group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                            {FILE_TYPE_ICONS[asset.file_type] || 'insert_drive_file'}
                          </span>
                          <span className="font-semibold text-white truncate max-w-[180px]">{asset.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-on-surface-variant">{asset.folder}</td>
                      <td className="px-5 py-3 text-on-surface-variant">{asset.file_type?.split('/')[1]?.toUpperCase()}</td>
                      <td className="px-5 py-3 text-on-surface-variant">{formatBytes(asset.size_bytes)}</td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => deleteAsset(asset.id)}
                          className="text-on-surface-variant hover:text-error opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
