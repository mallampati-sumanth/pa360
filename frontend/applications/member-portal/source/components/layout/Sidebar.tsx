'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, CheckSquare, FileText, AlertTriangle,
  Eye, BarChart2, Shield, TrendingDown, Users, Clock, FileSearch,
  PlusCircle, Stethoscope, Building, Settings
} from 'lucide-react';
import { useRole } from '@/features/auth/hooks';
import { classNames } from '@/shared/utils';
import { UserRole } from '@/shared/types';
import { X } from 'lucide-react';

const navItems: Record<UserRole, { href: string; label: string; icon: React.FC<any> }[]> = {
  AUTHORIZATION_SPECIALIST: [
    { href: '/specialist/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/specialist/new-authorization', label: 'New Authorization', icon: PlusCircle },
    { href: '/specialist/authorizations', label: 'Authorizations', icon: FileText },
    { href: '/specialist/exceptions', label: 'Exceptions', icon: AlertTriangle },
    { href: '/specialist/patients', label: 'Patients', icon: Users },
    { href: '/specialist/providers', label: 'Providers', icon: Stethoscope },
    { href: '/specialist/payers', label: 'Payers', icon: Building },
    { href: '/specialist/reports', label: 'Reports', icon: BarChart2 },
    { href: '/specialist/settings', label: 'Settings', icon: Settings },
  ],
  PROVIDER: [
    { href: '/provider/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/provider/status', label: 'My Cases', icon: Eye },
  ],
  BILLING: [
    { href: '/billing/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/billing/risk-flags', label: 'Risk Flags', icon: Shield },
    { href: '/billing/authorizations', label: 'Authorizations', icon: FileText },
  ],
  OPS_MANAGER: [
    { href: '/manager/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/manager/trends', label: 'Trends', icon: TrendingDown },
    { href: '/manager/workload', label: 'Workload', icon: Users },
    { href: '/manager/sla', label: 'SLA', icon: Clock },
    { href: '/manager/audit', label: 'Audit Trail', icon: FileSearch },
  ],
};

const ROLE_DASHBOARDS: Record<UserRole, string> = {
  AUTHORIZATION_SPECIALIST: '/specialist/dashboard',
  PROVIDER: '/provider/dashboard',
  BILLING: '/billing/dashboard',
  OPS_MANAGER: '/manager/dashboard',
};

export function Sidebar({ role: routeRole, open = true, onClose }: { role?: UserRole; open?: boolean; onClose?: () => void }) {
  const storedRole = useRole();
  const pathname = usePathname();
  const role = routeRole ?? storedRole ?? 'AUTHORIZATION_SPECIALIST';
  const items = role ? navItems[role] : [];

  return (
    <>
    {open && <button aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-30 bg-slate-950/50 md:hidden" />}
    <aside className={classNames(
      'fixed inset-y-0 left-0 z-40 flex w-64 flex-shrink-0 flex-col bg-[#102b3f] text-slate-300 pt-16 shadow-xl transition-all duration-200 md:relative md:z-0 md:translate-x-0 md:pt-0 md:shadow-none',
      open ? 'translate-x-0 md:w-64' : '-translate-x-full md:w-20',
    )}>
      <div className="flex h-16 shrink-0 items-center border-b border-white/10 px-5 md:px-4">
        <Link href={ROLE_DASHBOARDS[role] || '/'} className="flex shrink-0 items-center gap-3 w-full">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#65d6df] text-sm font-black tracking-tight text-[#102b3f] shadow-[0_0_0_4px_rgba(101,214,223,0.12)]">PA</span>
          <span className={classNames('text-xl font-bold tracking-tight text-white', !open && 'md:hidden')}>PA360</span>
        </Link>
        <button aria-label="Close navigation" onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white md:hidden ml-auto">
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto overflow-x-hidden">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={classNames(
                'group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-[#1a536b] text-white shadow-[inset_3px_0_0_#65d6df]'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon className={classNames('h-5 w-5 flex-shrink-0', !open && 'md:mx-auto', active ? 'text-[#29b5e8]' : 'text-slate-400 group-hover:text-slate-300')} />
              <span className={classNames(!open && 'md:hidden')}>{label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className={classNames('p-4 border-t border-white/10', !open && 'md:p-2 md:flex md:justify-center')}>
        <div className={classNames('rounded-md bg-white/5 p-3 text-center', !open && 'md:hidden')}>
          <p className="text-xs font-semibold text-slate-300">Demo environment</p>
          <p className="mt-1 text-[11px] text-slate-500">Connected to backend API</p>
        </div>
        <span className={classNames('hidden text-xs font-bold text-[#29b5e8]', !open && 'md:block')}>D</span>
      </div>
    </aside>
    </>
  );
}
