import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';

// Modular Pages
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ModerationQueuePage from './pages/Moderation/ModerationQueuePage';
import ListingsManagementPage from './pages/Listings/ListingsManagementPage';
import AddPropertyPage from './pages/Listings/AddPropertyPage';
import ProjectsManagementPage from './pages/Content/ProjectsManagementPage';
import LocalitiesManagementPage from './pages/Content/LocalitiesManagementPage';
import LeadManagementPage from './pages/CRM/LeadManagementPage';
import SiteVisitsManagementPage from './pages/CRM/SiteVisitsManagementPage';
import UsersManagementPage from './pages/Administration/UsersManagementPage';
import AgentsManagementPage from './pages/Administration/AgentsManagementPage';
import SettingsManagementPage from './pages/System/SettingsManagementPage';
import AuditLogsPage from './pages/System/AuditLogsPage';
import NotFoundPage from './pages/NotFoundPage';

import { useAuthStore } from './store/useAuthStore';

function App() {
  const { fetchCurrentUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentUser();
    }
  }, [isAuthenticated, fetchCurrentUser]);

  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Staff Administrative Portal (Protected) */}
      <Route
        element={
          <ProtectedRoute
            allowedRoles={['SUPER_ADMIN', 'MODERATOR', 'CRM_MANAGER', 'CONTENT_EDITOR']}
          />
        }
      >
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/moderation" element={<ModerationQueuePage />} />
          <Route path="/listings" element={<ListingsManagementPage />} />
          <Route path="/listings/new" element={<AddPropertyPage />} />
          <Route path="/projects" element={<ProjectsManagementPage />} />
          <Route path="/localities" element={<LocalitiesManagementPage />} />
          <Route path="/leads" element={<LeadManagementPage />} />
          <Route path="/site-visits" element={<SiteVisitsManagementPage />} />
          <Route path="/users" element={<UsersManagementPage />} />
          <Route path="/agents" element={<AgentsManagementPage />} />
          <Route path="/settings" element={<SettingsManagementPage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
