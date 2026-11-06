import { create } from 'zustand';
import apiClient from '../api/client';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('nagpur_user') || 'null'),
  token: localStorage.getItem('nagpur_access_token') || null,
  isAuthenticated: Boolean(localStorage.getItem('nagpur_access_token')),
  unreadNotifications: 0,
  savedPropertyIds: new Set(),

  setAuth: (user, token) => {
    localStorage.setItem('nagpur_user', JSON.stringify(user));
    localStorage.setItem('nagpur_access_token', token);
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      // Ignore logout api network error
    }
    localStorage.removeItem('nagpur_user');
    localStorage.removeItem('nagpur_access_token');
    set({ user: null, token: null, isAuthenticated: false, savedPropertyIds: new Set() });
  },

  fetchCurrentUser: async () => {
    try {
      const res = await apiClient.get('/auth/me');
      if (res.data?.data) {
        const user = res.data.data;
        localStorage.setItem('nagpur_user', JSON.stringify(user));
        set({ user });
      }
    } catch (err) {
      // If unauthorized, clear state
      if (err.response?.status === 401) {
        get().logout();
      }
    }
  },

  setUnreadNotifications: (count) => set({ unreadNotifications: count }),

  toggleSavedPropertyId: (id) => {
    set((state) => {
      const next = new Set(state.savedPropertyIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { savedPropertyIds: next };
    });
  },

  setSavedPropertyIds: (ids) => set({ savedPropertyIds: new Set(ids) }),
}));
