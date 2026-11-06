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
  type = 'danger', // 'danger' | 'warning' | 'info' | 'success'
  isLoading = false,
}) => {
  let icon = <AlertTriangle className="w-8 h-8 text-red-500" />;
  let btnClasses = 'bg-red-600 hover:bg-red-700 text-white';

  if (type === 'warning') {
    icon = <AlertTriangle className="w-8 h-8 text-amber-500" />;
    btnClasses = 'bg-amber-600 hover:bg-amber-700 text-white';
  } else if (type === 'info') {
    icon = <Info className="w-8 h-8 text-blue-500" />;
    btnClasses = 'bg-blue-600 hover:bg-blue-700 text-white';
  } else if (type === 'success') {
    icon = <CheckCircle2 className="w-8 h-8 text-emerald-500" />;
    btnClasses = 'bg-emerald-600 hover:bg-emerald-700 text-white';
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-md"
      footer={
        <>
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-5 py-2 text-xs font-bold rounded-xl shadow-md transition-all ${btnClasses} disabled:opacity-50`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </>
      }
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 p-2 rounded-2xl bg-slate-50 border border-slate-100">
          {icon}
        </div>
        <p className="text-sm text-slate-600 leading-relaxed pt-1">{message}</p>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;

