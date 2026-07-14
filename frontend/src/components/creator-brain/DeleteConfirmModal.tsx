'use client';

import React from 'react';

interface DeleteConfirmModalProps {
  title: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteConfirmModal({ title, onClose, onConfirm }: DeleteConfirmModalProps) {
  const [deleting, setDeleting] = React.useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-sm glass-panel p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-error/10 rounded-lg text-error flex-shrink-0">
            <span className="material-symbols-outlined text-[24px]">delete</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-headline">Delete Idea</h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Are you sure you want to delete <span className="text-white font-semibold">"{title}"</span>? This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="flex-1 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-white text-xs font-semibold rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 bg-error hover:bg-error/80 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            {deleting ? (
              <>
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Deleting...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[14px]">delete</span>
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
