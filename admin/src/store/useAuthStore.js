import { create } from 'zustand';
import apiClient from '../api/client';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('nagpur_admin_user') || localStorage.getItem('nagpur_user') || 'null'),
  token: localStorage.getItem('nagpur_admin_token') || localStorage.getItem('nagpur_access_token') || null,
  isAuthenticated: Boolean(localStorage.getItem('nagpur_admin_token') || localStorage.getItem('nagpur_access_token')),
  sidebarCollapsed: localStorage.getItem('nagpur_admin_sidebar_collapsed') === 'true',
  sidebarMobileOpen: false,
  pendingReviewCount: 0,
  setPendingReviewCount: (count) => set({ pendingReviewCount: count }),

  setAuth: (user, token) => {
    localStorage.setItem('nagpur_admin_user', JSON.stringify(user));
    localStorage.setItem('nagpur_admin_token', token);
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      // Ignore logout network error
    }
    localStorage.removeItem('nagpur_admin_user');
    localStorage.removeItem('nagpur_admin_token');
    localStorage.removeItem('nagpur_user');
    localStorage.removeItem('nagpur_access_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  fetchCurrentUser: async () => {
    try {
      const res = await apiClient.get('/auth/me');
      if (res.data?.data) {
        const user = res.data.data;
        localStorage.setItem('nagpur_admin_user', JSON.stringify(user));
        set({ user });
      }
    } catch (err) {
      if (err.response?.status === 401) {
        get().logout();
      }
    }
  },

  toggleSidebarCollapsed: () => {
    set((state) => {
      const next = !state.sidebarCollapsed;
      localStorage.setItem('nagpur_admin_sidebar_collapsed', String(next));
      return { sidebarCollapsed: next };
    });
  },

  setSidebarMobileOpen: (open) => set({ sidebarMobileOpen: open }),
}));
