import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-teal-700',
  iconBg = 'bg-teal-50',
  linkTo,
  linkText,
  trend,
  trendPositive,
  highlight = false,
}) => {
  const CardContent = (
    <div
      className={`p-4 sm:p-5 rounded-xl bg-white border transition-colors ${
        highlight
          ? 'border-amber-400 bg-amber-50/20 shadow-xs'
          : 'border-slate-200 hover:border-slate-300 shadow-xs'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1 min-w-0">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
            {title}
          </span>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {value ?? '—'}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 truncate">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div className={`w-10 h-10 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center flex-shrink-0 border border-slate-100`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(trend || linkTo) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {trend && (
            <div className={`flex items-center space-x-1 font-semibold ${trendPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trendPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>{trend}</span>
            </div>
          )}
          {linkTo && (
            <span className="text-teal-700 hover:text-teal-800 font-semibold ml-auto inline-flex items-center space-x-1">
              <span>{linkText || 'View'}</span>
              <span>→</span>
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (linkTo && !trend) {
    return <Link to={linkTo} className="block group">{CardContent}</Link>;
  }

  return CardContent;
};

export default StatCard;
