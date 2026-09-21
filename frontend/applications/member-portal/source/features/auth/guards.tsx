'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from './store';
import { UserRole } from '@/shared/types';
import { Spinner } from '@/components/ui/Spinner';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { isAuthenticated, role } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (role && !allowedRoles.includes(role)) {
      router.replace('/unauthorized');
    }
  }, [isAuthenticated, role, allowedRoles, router]);

  if (!isAuthenticated || !role) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!allowedRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
}
