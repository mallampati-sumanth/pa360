'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { UserRole } from '@/shared/types';

interface RoleLayoutProps {
  children: React.ReactNode;
}

export function RoleLayout({ children }: RoleLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const role: UserRole = pathname.startsWith('/provider')
    ? 'PROVIDER'
    : pathname.startsWith('/billing')
      ? 'BILLING'
      : pathname.startsWith('/manager')
        ? 'OPS_MANAGER'
        : 'AUTHORIZATION_SPECIALIST';

  return (
    <div className="flex h-screen flex-col bg-[#f2f7f9] text-[#142334]">
      <Navbar role={role} sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((open) => !open)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar role={role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,_rgba(18,168,199,0.08),_transparent_34rem)] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
