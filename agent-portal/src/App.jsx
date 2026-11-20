import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AgentLayout } from './components/layout/AgentLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AgentLoginPage } from './pages/Auth/AgentLoginPage';
import { AgentDashboardPage } from './pages/Dashboard/AgentDashboardPage';
import { AgentListingsPage } from './pages/Listings/AgentListingsPage';
import { AgentAddPropertyPage } from './pages/Listings/AgentAddPropertyPage';
import { AgentViewPropertyPage } from './pages/Listings/AgentViewPropertyPage';
import { AgentEditPropertyPage } from './pages/Listings/AgentEditPropertyPage';
import { AgentLeadsPage } from './pages/Leads/AgentLeadsPage';
import { AgentSiteVisitsPage } from './pages/SiteVisits/AgentSiteVisitsPage';
import { AgentProfilePage } from './pages/Profile/AgentProfilePage';
import { BuilderProjectsPage } from './pages/Projects/BuilderProjectsPage';
import { BuilderAddProjectPage } from './pages/Projects/BuilderAddProjectPage';
import { BuilderProjectDetailsPage } from './pages/Projects/BuilderProjectDetailsPage';
import { NotFoundPage } from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 3, // 3 minutes
    },
  },
});

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        {/* Public Agent Auth Route */}
        <Route path="/login" element={<AgentLoginPage />} />

        {/* Protected Agent Workspace Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AgentLayout />}>
            <Route path="/" element={<AgentDashboardPage />} />
            <Route path="/projects" element={<BuilderProjectsPage />} />
            <Route path="/projects/new" element={<BuilderAddProjectPage />} />
            <Route path="/projects/:id" element={<BuilderProjectDetailsPage />} />
            <Route path="/projects/view/:id" element={<BuilderProjectDetailsPage />} />
            <Route path="/listings" element={<AgentListingsPage />} />
            <Route path="/listings/new" element={<AgentAddPropertyPage />} />
            <Route path="/listings/:id" element={<AgentViewPropertyPage />} />
            <Route path="/listings/view/:id" element={<AgentViewPropertyPage />} />
            <Route path="/listings/edit/:id" element={<AgentEditPropertyPage />} />
            <Route path="/leads" element={<AgentLeadsPage />} />
            <Route path="/site-visits" element={<AgentSiteVisitsPage />} />
            <Route path="/profile" element={<AgentProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </QueryClientProvider>
  );
};

