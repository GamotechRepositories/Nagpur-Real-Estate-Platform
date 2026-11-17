import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="text-5xl font-extrabold text-teal-600 font-mono">404</div>
      <h2 className="text-xl font-bold text-slate-900 mt-3">Page Not Found</h2>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">
        The agent portal page you are looking for does not exist or may have been moved.
      </p>
      <Link
        to="/"
        className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-2xs transition"
      >
        <Home size={15} />
        <span>Back to Agent Dashboard</span>
      </Link>
    </div>
  );
};
