import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ToastContainer from '../common/Toast';
import { useAuthStore } from '../../store/useAuthStore';
import apiClient from '../../api/client';

export const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { sidebarCollapsed, setPendingReviewCount } = useAuthStore();

  // Periodically sync pending reviews count for sidebar badge
  const { data: dashboardData } = useQuery({
    queryKey: ['admin-stats-badge-sync'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/dashboard');
      return res.data?.data;
    },
    refetchInterval: 30000, // every 30 seconds
  });

  useEffect(() => {
    if (dashboardData?.properties?.PENDING_REVIEW !== undefined) {
      setPendingReviewCount(dashboardData.properties.PENDING_REVIEW);
    }
  }, [dashboardData, setPendingReviewCount]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Sidebar Component */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Topbar onOpenMobileSidebar={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export default AdminLayout;
