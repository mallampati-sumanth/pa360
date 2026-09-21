import { useAuthStore } from './store';
import { UserRole } from '@/shared/types';

export function useAuth() {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  return { user, isAuthenticated, login, logout };
}

export function useCurrentUser() {
  return useAuthStore((state) => state.user);
}

export function useRole(): UserRole | null {
  return useAuthStore((state) => state.role);
}

export function useIsAuthorized(requiredRole: UserRole | UserRole[]): boolean {
  const role = useAuthStore((state) => state.role);
  if (!role) return false;
  if (Array.isArray(requiredRole)) return requiredRole.includes(role);
  return role === requiredRole;
}

export function useAccessToken(): string | null {
  return useAuthStore((state) => state.accessToken);
}
