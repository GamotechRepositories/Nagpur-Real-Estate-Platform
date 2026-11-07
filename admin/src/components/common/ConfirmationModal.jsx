import React from 'react';
import Modal from './Modal';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  isLoading = false,
}) => {
  let icon = <AlertTriangle className="w-5 h-5 text-red-600" />;
  let btnClasses = 'bg-red-600 hover:bg-red-700 text-white';

  if (type === 'warning') {
    icon = <AlertTriangle className="w-5 h-5 text-amber-600" />;
    btnClasses = 'bg-amber-600 hover:bg-amber-700 text-white';
  } else if (type === 'info') {
    icon = <Info className="w-5 h-5 text-blue-600" />;
    btnClasses = 'bg-blue-600 hover:bg-blue-700 text-white';
  } else if (type === 'success') {
    icon = <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    btnClasses = 'bg-emerald-600 hover:bg-emerald-700 text-white';
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex-shrink-0">
            {icon}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed pt-0.5">{message}</p>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition-colors ${btnClasses} disabled:opacity-50`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
