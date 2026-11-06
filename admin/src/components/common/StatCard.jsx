import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-brand-teal',
  iconBg = 'bg-teal-50',
  linkTo,
  linkText,
  trend,
  trendPositive,
  highlight = false,
}) => {
  const CardContent = (
    <div
      className={`relative p-5 rounded-3xl bg-white border transition-all ${
        highlight
          ? 'border-brand-orange shadow-md ring-2 ring-brand-orange/20'
          : 'border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {title}
          </span>
          <div className="text-2xl font-black text-brand-navy tracking-tight">
            {value ?? '—'}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`w-12 h-12 rounded-2xl ${iconBg} ${iconColor} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>

      {(trend || linkTo) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {trend && (
            <div className={`flex items-center space-x-1 font-bold ${trendPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trendPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>{trend}</span>
            </div>
          )}
          {linkTo && (
            <span className="text-brand-orange hover:text-brand-orange-hover font-bold ml-auto inline-flex items-center space-x-1">
              <span>{linkText || 'View details'}</span>
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
