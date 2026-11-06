import React from 'react';

const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-teal-50 text-teal-800 border-teal-200',
    brand: 'bg-orange-50 text-orange-800 border-orange-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    purple: 'bg-purple-50 text-purple-800 border-purple-200',
    // Status specific badges
    LIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PENDING_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
    EXPIRED: 'bg-slate-100 text-slate-600 border-slate-300',
    SOLD: 'bg-blue-50 text-blue-700 border-blue-200',
    RENTED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    DRAFT: 'bg-gray-100 text-gray-600 border-gray-200',
    ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    SUSPENDED: 'bg-red-50 text-red-700 border-red-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    REQUESTED: 'bg-amber-50 text-amber-700 border-amber-200',
    CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200',
  };

  const sizeStyles = {
    xs: 'px-1.5 py-0.5 text-[10px] font-bold rounded',
    sm: 'px-2.5 py-1 text-xs font-semibold rounded-lg',
    md: 'px-3 py-1.5 text-xs font-bold rounded-xl',
  };

  const selectedVariant = variantStyles[variant] || variantStyles.default;
  const selectedSize = sizeStyles[size] || sizeStyles.sm;

  return (
    <span className={`inline-flex items-center border ${selectedVariant} ${selectedSize} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
