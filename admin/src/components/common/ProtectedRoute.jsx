import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { hasAnyPermission } from '../../config/permissions';

const ProtectedRoute = ({
  allowedRoles,
  requiredPermissions = [],
}) => {
  const location = useLocation();
  const { user, isAuthenticated, fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchCurrentUser();
    }
  }, [isAuthenticated, user, fetchCurrentUser]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user profile is still loading
  if (!user) {
    return null;
  }

  // SUPER_ADMIN has master bypass for all routes
  if (user.role === 'SUPER_ADMIN') {
    return <Outlet />;
  }

  // Check required permissions if specified
  if (requiredPermissions && requiredPermissions.length > 0) {
    const isAuthorized = hasAnyPermission(user, requiredPermissions);
    if (!isAuthorized) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 text-slate-800 text-center">
          <div className="max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Permission Restricted</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your account <strong>{user.email || user.name}</strong> ({user.designation || user.role}) does not have permission to access this module. Please contact the Super Administrator to update your access permissions.
            </p>
            <div className="pt-2">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 py-2 px-4 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors shadow-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  // Fallback role check if allowedRoles provided and no permissions passed
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role) && !user.isStaff) {
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
            className="inline-block py-2 px-4 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors"
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
