import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import { useAuthStore } from './store/useAuthStore';

// Code-split all pages using React.lazy for instant loading
const LoginPage = lazy(() => import('./pages/Auth/LoginPage'));
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage'));
const ModerationQueuePage = lazy(() => import('./pages/Moderation/ModerationQueuePage'));
const ListingsManagementPage = lazy(() => import('./pages/Listings/ListingsManagementPage'));
const AddPropertyPage = lazy(() => import('./pages/Listings/AddPropertyPage'));
const ProjectsManagementPage = lazy(() => import('./pages/Content/ProjectsManagementPage'));
const LocalitiesManagementPage = lazy(() => import('./pages/Content/LocalitiesManagementPage'));
const LeadManagementPage = lazy(() => import('./pages/CRM/LeadManagementPage'));
const SiteVisitsManagementPage = lazy(() => import('./pages/CRM/SiteVisitsManagementPage'));
const UsersManagementPage = lazy(() => import('./pages/Administration/UsersManagementPage'));
const AgentsManagementPage = lazy(() => import('./pages/Administration/AgentsManagementPage'));
const ProfilePage = lazy(() => import('./pages/Administration/ProfilePage'));
const SettingsManagementPage = lazy(() => import('./pages/System/SettingsManagementPage'));
const AuditLogsPage = lazy(() => import('./pages/System/AuditLogsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Sleek minimal page loader
const PageFallback = () => (
  <div className="w-full py-12 flex flex-col items-center justify-center space-y-3">
    <div className="w-6 h-6 border-2 border-slate-300 border-t-teal-600 rounded-full animate-spin" />
    <span className="text-xs text-slate-400 font-medium">Loading page...</span>
  </div>
);

function App() {
  const { fetchCurrentUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentUser();
    }
  }, [isAuthenticated, fetchCurrentUser]);

  return (
    <Suspense fallback={<PageFallback />}>
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
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsManagementPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
