import { create } from 'zustand';
import { apiClient } from '../api/client';

const safeJsonParse = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw || raw === 'undefined' || raw === 'null') return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[useAuthStore] Failed to parse ${key} from localStorage:`, err);
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
    return fallback;
  }
};

export const useAuthStore = create((set, get) => ({
  token: localStorage.getItem('agent_token') || null,
  user: safeJsonParse('agent_user', null),
  profile: safeJsonParse('agent_profile', null),
  isLoading: false,
  error: null,

  login: async ({ identifier, password, role }) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post('/auth/agent/login', { identifier, password, role });
      const payload = res?.data || res || {};
      const { user, accessToken } = payload;
      const profile = payload.profile || user?.builderProfile || user?.agentProfile || null;

      if (accessToken) {
        localStorage.setItem('agent_token', accessToken);
      }
      if (user) {
        localStorage.setItem('agent_user', JSON.stringify(user));
      }
      if (profile) {
        localStorage.setItem('agent_profile', JSON.stringify(profile));
      }

      set({
        token: accessToken || null,
        user: user || null,
        profile: profile || null,
        isLoading: false,
        error: null,
      });
      return { success: true };
    } catch (err) {
      const message =
        err?.message ||
        err?.error ||
        'Login failed. Please verify your phone/email and password.';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  logout: () => {
    try {
      localStorage.removeItem('agent_token');
      localStorage.removeItem('agent_user');
      localStorage.removeItem('agent_profile');
    } catch {
      // ignore storage access errors
    }
    set({ token: null, user: null, profile: null, error: null });
  },

  setProfile: (profile) => {
    try {
      if (profile) {
        localStorage.setItem('agent_profile', JSON.stringify(profile));
      } else {
        localStorage.removeItem('agent_profile');
      }
    } catch {
      // ignore
    }
    set({ profile: profile || null });
  },

  setUser: (user) => {
    try {
      if (user) {
        localStorage.setItem('agent_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('agent_user');
      }
    } catch {
      // ignore
    }
    set({ user: user || null });
  },
}));

