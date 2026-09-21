import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, UserRole, LoginCredentials } from '@/shared/types'
import { authEndpoints } from '@/shared/endpoints'

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      role: null,
      login: async (credentials) => {
        try {
          const response = await authEndpoints.login(credentials);
          const data = response.data;
          set({
            user: data.user,
            accessToken: data.access,
            refreshToken: data.refresh,
            isAuthenticated: true,
            role: data.role as UserRole
          });
        } catch (error) {
          console.error("Login failed:", error);
          throw error;
        }
      },
      logout: async () => {
        try {
          // Attempt server logout if possible
          await authEndpoints.logout();
        } catch (e) {}
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, role: null });
      },
      refreshAccessToken: async () => {
        const refresh = useAuthStore.getState().refreshToken;
        if (!refresh) throw new Error('No refresh token available');
        const response = await authEndpoints.refreshToken({ refresh });
        set({ accessToken: response.data.access, isAuthenticated: true });
      }
    }),
    {
      name: 'pa360-auth',
    }
  )
)
