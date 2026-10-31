import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  role: 'ADOPTER' | 'PROTECTOR' | 'SHELTER_MEMBER' | 'MASTER_ADMIN';
  fullName: string;
  avatarUrl?: string | null;
  emailVerified?: boolean;
  bio?: string | null;
  city?: string | null;
  state?: string | null;
  profile?: {
    avatarUrl?: string | null;
    bio?: string | null;
    addressCity?: string | null;
    addressState?: string | null;
    fullName?: string | null;
  } | null;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AuthUser | null, token?: string | null) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('patinhas_token'),
  isAuthenticated: Boolean(localStorage.getItem('patinhas_token')),
  isLoading: true,

  setUser: (user, token) => {
    if (token) {
      localStorage.setItem('patinhas_token', token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } else {
      set({ user, isAuthenticated: Boolean(user), isLoading: false });
    }
  },

  logout: async () => {
    try {
      await fetch('http://localhost:3333/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.error('Erro ao deslogar:', e);
    } finally {
      localStorage.removeItem('patinhas_token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  checkAuth: async () => {
    const token = get().token || localStorage.getItem('patinhas_token');
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const res = await fetch('http://localhost:3333/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, isAuthenticated: true, isLoading: false });
      } else {
        localStorage.removeItem('patinhas_token');
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));

