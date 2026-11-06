import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2 } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-slate-200 text-slate-500 flex items-center justify-center">
        <Building2 className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-brand-navy tracking-tight">404</h1>
      <p className="text-sm font-semibold text-slate-600 max-w-sm">
        The administrative panel view you are looking for does not exist or has been relocated.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center space-x-2 py-2.5 px-5 rounded-xl bg-brand-orange text-white text-xs font-bold hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/20"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;
