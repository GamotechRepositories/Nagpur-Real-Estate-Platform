import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export const ProtectedRoute = () => {
  const { token, user } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!['AGENT', 'BUILDER'].includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

