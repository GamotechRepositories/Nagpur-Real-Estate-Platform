import React from 'react';
import clsx from 'clsx';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'teal', onClick }) => {
  const colorMap = {
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white border border-slate-200 rounded-xl p-4 shadow-2xs transition duration-150',
        onClick && 'cursor-pointer hover:border-slate-300 hover:shadow-xs'
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{title}</span>
        {Icon && (
          <div className={clsx('p-2 rounded-lg border', colorMap[color] || colorMap.teal)}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="mt-2.5">
        <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">{value}</div>
        {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
};
