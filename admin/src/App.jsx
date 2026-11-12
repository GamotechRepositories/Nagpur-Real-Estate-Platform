import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import { useAuthStore } from './store/useAuthStore';
import { PERMISSIONS, hasPermission } from './config/permissions';

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
const LoanRequestsPage = lazy(() => import('./pages/CRM/LoanRequestsPage'));
const ContentManagementPage = lazy(() => import('./pages/Content/ContentManagementPage'));
const StaffManagementPage = lazy(() => import('./pages/Administration/StaffManagementPage'));
const StaffFormPage = lazy(() => import('./pages/Administration/StaffFormPage'));
const UsersManagementPage = lazy(() => import('./pages/Administration/UsersManagementPage'));
const AgentsManagementPage = lazy(() => import('./pages/Administration/AgentsManagementPage'));
const NotificationsBroadcastPage = lazy(() => import('./pages/Administration/NotificationsBroadcastPage'));
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

// Smart default redirect based on staff permissions
const DefaultRouteRedirect = () => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'SUPER_ADMIN' || hasPermission(user, PERMISSIONS.DASHBOARD_VIEW)) {
    return <Navigate to="/dashboard" replace />;
  }
  if (hasPermission(user, PERMISSIONS.MODERATION_VIEW) || hasPermission(user, PERMISSIONS.MODERATION_REVIEW)) {
    return <Navigate to="/moderation" replace />;
  }
  if (hasPermission(user, PERMISSIONS.LISTINGS_VIEW)) {
    return <Navigate to="/listings" replace />;
  }
  if (hasPermission(user, PERMISSIONS.LEADS_VIEW) || hasPermission(user, PERMISSIONS.LEADS_MANAGE)) {
    return <Navigate to="/leads" replace />;
  }
  if (hasPermission(user, PERMISSIONS.CONTENT_VIEW) || hasPermission(user, PERMISSIONS.CONTENT_MANAGE)) {
    return <Navigate to="/content" replace />;
  }
  if (hasPermission(user, PERMISSIONS.STAFF_MANAGE)) {
    return <Navigate to="/staff" replace />;
  }
  return <Navigate to="/profile" replace />;
};

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
            <Route path="/" element={<DefaultRouteRedirect />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Dashboard Overview */}
            <Route
              element={
                <ProtectedRoute
                  requiredPermissions={[PERMISSIONS.DASHBOARD_VIEW]}
                />
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>

            {/* Moderation */}
            <Route
              element={
                <ProtectedRoute
                  requiredPermissions={[PERMISSIONS.MODERATION_VIEW, PERMISSIONS.MODERATION_REVIEW]}
                />
              }
            >
              <Route path="/moderation" element={<ModerationQueuePage />} />
            </Route>

            {/* Listings */}
            <Route
              element={
                <ProtectedRoute
                  requiredPermissions={[
                    PERMISSIONS.LISTINGS_VIEW,
                    PERMISSIONS.LISTINGS_CREATE,
                    PERMISSIONS.LISTINGS_EDIT,
                  ]}
                />
              }
            >
              <Route path="/listings" element={<ListingsManagementPage />} />
              <Route path="/listings/new" element={<AddPropertyPage />} />
            </Route>

            {/* Localities & Projects */}
            <Route
              element={
                <ProtectedRoute
                  requiredPermissions={[PERMISSIONS.PROJECTS_MANAGE, PERMISSIONS.LOCALITIES_MANAGE]}
                />
              }
            >
              <Route path="/projects" element={<ProjectsManagementPage />} />
              <Route path="/localities" element={<LocalitiesManagementPage />} />
            </Route>

            {/* CRM & Leads */}
            <Route
              element={
                <ProtectedRoute
                  requiredPermissions={[PERMISSIONS.LEADS_VIEW, PERMISSIONS.LEADS_MANAGE]}
                />
              }
            >
              <Route path="/leads" element={<LeadManagementPage />} />
              <Route path="/agents" element={<AgentsManagementPage />} />
            </Route>

            {/* Site Visits */}
            <Route
              element={
                <ProtectedRoute
                  requiredPermissions={[PERMISSIONS.SITE_VISITS_VIEW, PERMISSIONS.SITE_VISITS_MANAGE]}
                />
              }
            >
              <Route path="/site-visits" element={<SiteVisitsManagementPage />} />
            </Route>

            {/* Loan Requests */}
            <Route
              element={
                <ProtectedRoute
                  requiredPermissions={[PERMISSIONS.LOANS_VIEW, PERMISSIONS.LOANS_MANAGE]}
                />
              }
            >
              <Route path="/loan-requests" element={<LoanRequestsPage />} />
            </Route>

            {/* Content & CMS */}
            <Route
              element={
                <ProtectedRoute
                  requiredPermissions={[PERMISSIONS.CONTENT_VIEW, PERMISSIONS.CONTENT_MANAGE]}
                />
              }
            >
              <Route path="/content" element={<ContentManagementPage />} />
            </Route>

            {/* Staff & User Management */}
            <Route
              element={
                <ProtectedRoute
                  requiredPermissions={[PERMISSIONS.STAFF_MANAGE]}
                />
              }
            >
              <Route path="/staff" element={<StaffManagementPage />} />
              <Route path="/staff/new" element={<StaffFormPage />} />
              <Route path="/staff/:id/edit" element={<StaffFormPage />} />
              <Route path="/users" element={<UsersManagementPage />} />
            </Route>

            {/* Notifications Broadcast */}
            <Route
              element={
                <ProtectedRoute
                  requiredPermissions={[PERMISSIONS.NOTIFICATIONS_SEND]}
                />
              }
            >
              <Route path="/notifications" element={<NotificationsBroadcastPage />} />
            </Route>

            {/* System Settings */}
            <Route
              element={
                <ProtectedRoute
                  requiredPermissions={[PERMISSIONS.SETTINGS_MANAGE]}
                />
              }
            >
              <Route path="/settings" element={<SettingsManagementPage />} />
            </Route>

            {/* Audit Logs */}
            <Route
              element={
                <ProtectedRoute
                  requiredPermissions={[PERMISSIONS.AUDIT_LOGS_VIEW]}
                />
              }
            >
              <Route path="/audit-logs" element={<AuditLogsPage />} />
            </Route>

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
