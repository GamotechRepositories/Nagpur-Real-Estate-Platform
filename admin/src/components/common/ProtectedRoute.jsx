import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { ShieldAlert } from 'lucide-react';

const ProtectedRoute = ({ allowedRoles = ['SUPER_ADMIN', 'MODERATOR', 'CRM_MANAGER', 'CONTENT_EDITOR'] }) => {
  const location = useLocation();
  const { user, isAuthenticated, isCheckingAuth, fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchCurrentUser();
    }
  }, [isAuthenticated, user, fetchCurrentUser]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check roles if user object loaded
  if (user && allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white text-center">
        <div className="max-w-md bg-slate-800 p-8 rounded-3xl border border-slate-700 space-y-4">
          <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black">Access Denied</h2>
          <p className="text-xs text-slate-300">
            Your account ({user.email || user.name}) does not have administrative privileges ({user.role}) required for this area.
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
            className="inline-block py-2 px-4 rounded-xl bg-brand-orange text-white text-xs font-bold hover:bg-orange-600 transition-colors"
          >
            Sign in with Staff Account
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
