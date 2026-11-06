import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import HomePage from './pages/Home/Index';
import PropertyListingPage from './pages/PropertyListing/Index';
import PropertyDetailsPage from './pages/PropertyDetails/Index';
import ProjectsPage from './pages/Projects/Index';
import AgentsDirectoryPage from './pages/Agents/Index';
import LocalitiesPage from './pages/Localities/Index';
import EmiCalculatorPage from './pages/Tools/EmiCalculator';
import AreaConverterPage from './pages/Tools/AreaConverter';
import LoanEnquiryPage from './pages/Tools/LoanEnquiry';
import PostPropertyPage from './pages/PostProperty/Index';
import MyPropertiesPage from './pages/Account/MyProperties';
import SavedPropertiesPage from './pages/Account/SavedProperties';

// Admin Views
import AdminLayout from './admin/layouts/AdminLayout';
import AdminLoginPage from './admin/pages/AdminLogin';
import DashboardOverview from './admin/pages/DashboardOverview';
import ModerationQueuePage from './admin/pages/ModerationQueue';
import ListingsManagementPage from './admin/pages/ListingsManagement';
import LeadManagementPage from './admin/pages/LeadManagement';
import SiteVisitsManagementPage from './admin/pages/SiteVisitsManagement';
import AgentsManagementPage from './admin/pages/AgentsManagement';
import SettingsManagementPage from './admin/pages/SettingsManagement';
import AuditLogsPage from './admin/pages/AuditLogs';
import ProtectedRoute from './components/common/ProtectedRoute';

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
      {/* Public Marketplace Layout */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="properties" element={<PropertyListingPage />} />
        <Route path="properties/:slug" element={<PropertyDetailsPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="agents" element={<AgentsDirectoryPage />} />
        <Route path="localities" element={<LocalitiesPage />} />
        <Route path="tools/emi-calculator" element={<EmiCalculatorPage />} />
        <Route path="tools/area-converter" element={<AreaConverterPage />} />
        <Route path="tools/loan-enquiry" element={<LoanEnquiryPage />} />
        <Route path="post-property" element={<PostPropertyPage />} />
        <Route path="account/my-properties" element={<MyPropertiesPage />} />
        <Route path="account/saved" element={<SavedPropertiesPage />} />
      </Route>

      {/* Admin Login */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Staff Admin Portal (Protected) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute
            allowedRoles={['SUPER_ADMIN', 'MODERATOR', 'CRM_MANAGER', 'CONTENT_EDITOR']}
          />
        }
      >
        <Route element={<AdminLayout />}>
          <Route path="dashboard" element={<DashboardOverview />} />
          <Route path="moderation" element={<ModerationQueuePage />} />
          <Route path="listings" element={<ListingsManagementPage />} />
          <Route path="leads" element={<LeadManagementPage />} />
          <Route path="site-visits" element={<SiteVisitsManagementPage />} />
          <Route path="agents" element={<AgentsManagementPage />} />
          <Route path="settings" element={<SettingsManagementPage />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />
        </Route>
      </Route>

      {/* Fallback 404 */}
      <Route path="*" element={<PublicLayout />}>
        <Route
          path="*"
          element={
            <div className="py-24 text-center">
              <h1 className="text-4xl font-black text-brand-navy">404</h1>
              <p className="text-sm text-slate-500 mt-2">The page you were looking for does not exist.</p>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;

