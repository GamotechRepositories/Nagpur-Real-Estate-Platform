import React from 'react';
import clsx from 'clsx';

const STATUS_CONFIGS = {
  // Property statuses
  LIVE: {
    label: 'Live on Portal',
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-600',
  },
  PENDING_REVIEW: {
    label: 'Under Moderation',
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
  },
  REJECTED: {
    label: 'Action Required',
    bg: 'bg-rose-50 text-rose-800 border-rose-200',
    dot: 'bg-rose-600',
  },
  SOLD: {
    label: 'Sold Out',
    bg: 'bg-blue-50 text-blue-800 border-blue-200',
    dot: 'bg-blue-600',
  },
  EXPIRED: {
    label: 'Expired',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  },
  DRAFT: {
    label: 'Draft',
    bg: 'bg-purple-50 text-purple-800 border-purple-200',
    dot: 'bg-purple-600',
  },

  // Lead / Enquiry statuses
  NEW: {
    label: 'New Lead',
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-600 animate-pulse',
  },
  CONTACTED: {
    label: 'Contacted',
    bg: 'bg-sky-50 text-sky-800 border-sky-200',
    dot: 'bg-sky-600',
  },
  SITE_VISIT_SCHEDULED: {
    label: 'Visit Scheduled',
    bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    dot: 'bg-indigo-600',
  },
  NEGOTIATION: {
    label: 'In Negotiation',
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-600',
  },
  CLOSED_WON: {
    label: 'Deal Closed 🎉',
    bg: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold',
    dot: 'bg-emerald-600',
  },
  LOST: {
    label: 'Archived / Lost',
    bg: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  },
};

export const Badge = ({ status, customLabel, size = 'md' }) => {
  const config = STATUS_CONFIGS[status] || {
    label: status ? status.replace(/_/g, ' ') : 'Unknown',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  };

  const isSmall = size === 'sm';

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-semibold rounded-md border',
        isSmall ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
        config.bg
      )}
    >
      <span className={clsx('rounded-full', isSmall ? 'w-1.5 h-1.5' : 'w-2 h-2', config.dot)} />
      {customLabel || config.label}
    </span>
  );
};
