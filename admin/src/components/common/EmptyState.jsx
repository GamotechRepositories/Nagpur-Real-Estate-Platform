import React from 'react';
import { FolderOpen } from 'lucide-react';

const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No Records Found',
  description = 'There are no items matching the selected criteria.',
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-10 text-center bg-white rounded-xl border border-dashed border-slate-300">
      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      {description && <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
