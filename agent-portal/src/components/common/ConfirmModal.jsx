import React, { useEffect } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Info, X } from 'lucide-react';

/**
 * In-App Modal Dialog for Confirmations and Warnings (replaces browser confirm() and alert())
 */
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Attention',
  message = '',
  confirmText = 'OK',
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false,
  type = 'warning', // 'confirm' | 'warning' | 'info' | 'success'
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  const isAlert = type !== 'confirm';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={() => {
          if (!isLoading) onClose();
        }}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-5 text-center shadow-2xl transition-all border border-slate-200 z-10 animate-in fade-in zoom-in-95 duration-150">
        {!isLoading && (
          <button
            onClick={onClose}
            className="absolute right-3.5 top-3.5 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Icon based on type */}
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-2xs ${
            isDestructive || type === 'warning'
              ? 'bg-rose-50 text-rose-600 border border-rose-100'
              : type === 'success'
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
              : 'bg-teal-50 text-teal-600 border border-teal-100'
          }`}
        >
          {isDestructive || type === 'warning' ? (
            <AlertCircle className="w-6 h-6" />
          ) : type === 'success' ? (
            <CheckCircle className="w-6 h-6" />
          ) : (
            <Info className="w-6 h-6" />
          )}
        </div>

        <h3 className="text-base font-bold text-slate-900 mb-1.5">{title}</h3>
        <p className="text-xs text-slate-600 leading-relaxed mb-5">{message}</p>

        {isAlert ? (
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            OK
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-white shadow-2xs transition cursor-pointer disabled:opacity-50 ${
                isDestructive
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-teal-600 hover:bg-teal-700'
              }`}
            >
              {isLoading ? 'Processing...' : confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmModal;
