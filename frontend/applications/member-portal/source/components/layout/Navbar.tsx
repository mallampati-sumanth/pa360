'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Command, HelpCircle, Menu, PanelLeftClose, PanelLeftOpen, Search, LogIn, LogOut, ChevronsUpDown } from 'lucide-react';
import { UserRole } from '@/shared/types';
import { useAuthStore } from '@/features/auth/store';
import { classNames } from '@/shared/utils';

const roleOptions: { role: UserRole; label: string; href: string }[] = [
  { role: 'AUTHORIZATION_SPECIALIST', label: 'Authorization Specialist', href: '/specialist/dashboard' },
  { role: 'PROVIDER', label: 'Provider', href: '/provider/dashboard' },
  { role: 'BILLING', label: 'Billing', href: '/billing/dashboard' },
  { role: 'OPS_MANAGER', label: 'Operations Manager', href: '/manager/dashboard' },
];

export function Navbar({ role, sidebarOpen, onToggleSidebar }: { role: UserRole; sidebarOpen: boolean; onToggleSidebar: () => void }) {
  const { logout } = useAuthStore();
  const router = useRouter();
  
  return (
    <header className="z-20 flex h-16 flex-shrink-0 items-center justify-between border-b border-[#dce6eb] bg-white/95 px-4 text-[#142334] shadow-[0_4px_18px_rgba(25,55,72,0.05)] backdrop-blur sm:px-6">
      <div className="flex flex-1 items-center gap-3">
        <button aria-label={sidebarOpen ? 'Collapse navigation' : 'Open navigation'} onClick={onToggleSidebar} className="rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900">
          <span className="hidden md:block">{sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}</span>
          <span className="md:hidden"><Menu className="h-5 w-5" /></span>
        </button>
        
        <div className="hidden max-w-xl flex-1 md:flex">
          <label className="flex h-9 w-full items-center gap-2 rounded-lg border border-[#dce6eb] bg-[#f6fafb] px-3 text-slate-500 focus-within:border-[#12a8c7] focus-within:ring-1 focus-within:ring-[#12a8c7]/20">
            <Search className="h-4 w-4 shrink-0" />
            <input aria-label="Search workspace" placeholder="Search patient, member ID, or authorization number..." className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" />
            <span className="flex items-center gap-0.5 text-[10px] text-slate-400"><Command className="h-3 w-3" /> K</span>
          </label>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4 ml-auto">
        <button aria-label="Help" className="hidden rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:block"><HelpCircle className="h-5 w-5" /></button>
        <button aria-label="Notifications" className="relative rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>
        
        <span className="hidden h-6 w-px bg-slate-200 md:block mx-1" />
        
        <details className="group relative">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md p-1.5 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d9f3f4] text-xs font-bold text-[#087f8c]">JS</span>
            <span className="hidden min-w-0 md:block text-left">
              <span className="block truncate text-sm font-semibold text-slate-700">Jessica Smith</span>
              <span className="block truncate text-[11px] text-slate-500">{roleOptions.find((option) => option.role === role)?.label}</span>
            </span>
            <ChevronsUpDown className="hidden h-4 w-4 text-slate-400 md:block" />
          </summary>
          <div className="absolute right-0 top-full mt-1 z-30 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
            <p className="px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Switch role</p>
            {roleOptions.map((option) => (
              <Link key={option.role} href={option.href} className={classNames('block rounded-md px-2 py-2 text-xs transition-colors hover:bg-slate-50', option.role === role ? 'bg-sky-50 font-semibold text-[#1769aa]' : 'text-slate-700')}>
                {option.label}
              </Link>
            ))}
            <div className="my-1 border-t border-slate-100" />
            <button onClick={async () => { await logout(); router.push('/login'); }} className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-xs text-rose-600 hover:bg-rose-50">
              <LogOut className="h-3.5 w-3.5" />Log out
            </button>
          </div>
        </details>
      </div>
    </header>
  );
}
