import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PageHeader = ({
  title,
  subtitle,
  icon: Icon,
  breadcrumbs = [],
  actions,
  action,
}) => {
  const headerActions = actions || action;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
      <div className="space-y-0.5">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-1 text-xs text-slate-400 font-medium mb-1">
            <Link to="/dashboard" className="hover:text-slate-700">
              Admin
            </Link>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                {crumb.href ? (
                  <Link to={crumb.href} className="hover:text-slate-700">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-slate-600 font-semibold">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex items-center space-x-2.5">
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0 border border-teal-100">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
            {subtitle && <p className="text-xs text-slate-500 font-normal mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>

      {headerActions && (
        <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
          {headerActions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
