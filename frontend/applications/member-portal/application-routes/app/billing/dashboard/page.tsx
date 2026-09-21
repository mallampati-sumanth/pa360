'use client';

import Link from 'next/link';
import { ArrowRight, CircleDollarSign, FileCheck2, FileText, TriangleAlert } from 'lucide-react';
import { useAuthorizationRequests } from '@/features/authorization-workspace/hooks';

export default function BillingDashboard() {
  const { data, isLoading } = useAuthorizationRequests();
  const requests = Array.isArray(data) ? data : data?.results ?? [];
  const approved = requests.filter((request: any) => request.status === 'Approved');
  const open = requests.filter((request: any) => !['Approved', 'Denied', 'Expired'].includes(request.status));
  const atRisk = requests.filter((request: any) => ['Denied', 'Additional Info Requested', 'Exception – Review Required'].includes(request.status));
  return <div className="space-y-6">
    <section className="flex flex-col gap-4 rounded-2xl bg-gradient-to-br from-[#243b53] via-[#285b6d] to-[#2e8b8b] px-7 py-7 text-white shadow-[0_18px_40px_rgba(25,65,78,0.18)] md:flex-row md:items-center md:justify-between"><div><p className="text-sm font-medium text-cyan-100">Billing workspace</p><h1 className="mt-1 text-3xl font-semibold">Authorization financial health</h1><p className="mt-2 text-sm text-slate-100">Monitor approval risk, coverage decisions, and downstream billing impact.</p></div><Link href="/billing/authorizations" className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#285b6d]"><FileText className="h-4 w-4" /> Review authorizations</Link></section>
    <section className="grid gap-4 sm:grid-cols-3"><Metric label="Open authorizations" value={isLoading ? '...' : String(open.length)} icon={FileText} /><Metric label="Approved authorizations" value={isLoading ? '...' : String(approved.length)} icon={CircleDollarSign} /><Metric label="At-risk claims" value={isLoading ? '...' : String(atRisk.length)} icon={TriangleAlert} /></section>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"><section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold text-slate-900">Billing review queue</h2><p className="mt-1 text-sm text-slate-500">Cases that could affect payment or claim release.</p></div><Link href="/billing/authorizations" className="text-sm font-semibold text-[#8b4c68]">Open authorizations</Link></div><div className="mt-5 space-y-3"><Queue label="At-risk authorizations" count={`${atRisk.length} cases`} tone="rose" /><Queue label="Open authorizations" count={`${open.length} cases`} tone="amber" /><Queue label="Approved authorizations" count={`${approved.length} cases`} tone="green" /></div></section><aside className="rounded-xl border border-pink-100 bg-pink-50 p-5"><FileCheck2 className="h-5 w-5 text-[#8b4c68]" /><h2 className="mt-3 font-semibold text-slate-900">Live claim signal</h2><p className="mt-2 text-sm leading-6 text-slate-600">Metrics are calculated from the current authorization records.</p></aside></div>
  </div>;
}

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) { return <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><span className="inline-flex rounded-lg bg-pink-50 p-2 text-[#8b4c68]"><Icon className="h-4 w-4" /></span><p className="mt-4 text-sm font-medium text-slate-500">{label}</p><p className="mt-1 text-3xl font-semibold text-slate-900">{value}</p></div> }
function Queue({ label, count, tone }: { label: string; count: string; tone: 'rose' | 'amber' | 'green' }) { const colors = { rose: 'bg-rose-50 text-rose-700', amber: 'bg-amber-50 text-amber-700', green: 'bg-emerald-50 text-emerald-700' }; return <Link href="/billing/authorizations" className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm hover:bg-slate-50"><span className="font-medium text-slate-700">{label}</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${colors[tone]}`}>{count}</span></Link> }
