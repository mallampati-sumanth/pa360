'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock3, FileText, Plus, Search } from 'lucide-react';
import { useAuthorizationRequests } from '@/features/authorization-workspace/hooks';

export default function ProviderDashboard() {
  const { data, isLoading } = useAuthorizationRequests();
  const cases = (Array.isArray(data) ? data : data?.results ?? []).slice(0, 5);
  const active = cases.filter((item: any) => !['Approved', 'Denied', 'Expired'].includes(item.status));
  const awaiting = cases.filter((item: any) => item.status === 'Additional Info Requested');
  const approved = cases.filter((item: any) => item.status === 'Approved');
  return <div className="space-y-6">
    <section className="flex flex-col gap-4 rounded-2xl bg-gradient-to-br from-[#12384c] via-[#176477] to-[#1597a1] px-7 py-7 text-white shadow-[0_18px_40px_rgba(12,86,103,0.18)] md:flex-row md:items-center md:justify-between">
      <div><p className="text-sm font-medium text-teal-100">Provider workspace</p><h1 className="mt-1 text-3xl font-semibold">Your authorization cases</h1><p className="mt-2 text-sm text-teal-50">Track requests, respond to payer questions, and keep care moving.</p></div>
      <Link href="/provider/status" className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-[#164c63]"><FileText className="h-4 w-4" /> View my cases</Link>
    </section>
    <section className="grid gap-4 sm:grid-cols-3"><Metric label="Active cases" value={isLoading ? '...' : String(active.length)} icon={FileText} tone="blue" /><Metric label="Awaiting your response" value={isLoading ? '...' : String(awaiting.length)} icon={Clock3} tone="amber" /><Metric label="Approved cases" value={isLoading ? '...' : String(approved.length)} icon={CheckCircle2} tone="green" /></section>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-200 px-6 py-5"><div><h2 className="text-lg font-semibold text-slate-900">Recent cases</h2><p className="mt-1 text-sm text-slate-500">Your latest authorization activity.</p></div><Link href="/provider/status" className="text-sm font-semibold text-[#1769aa]">View all</Link></div><div className="divide-y divide-slate-100">{cases.map((item: any) => <div key={item.authorization_id} className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-[#1769aa]">{item.authorization_id.slice(0, 12)}</p><p className="mt-1 text-sm text-slate-700">{item.service_name}</p></div><div className="flex items-center gap-5 text-sm"><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">{item.status}</span><span className="text-slate-500">{item.request_date}</span></div></div>)}{!isLoading && cases.length === 0 && <p className="px-6 py-8 text-sm text-slate-500">No authorization cases found.</p>}</div></section>
      <aside className="space-y-4"><Action href="/provider/status" icon={Search} label="Find a case" /><Action href="/provider/status" icon={Plus} label="Start a request" /><section className="rounded-xl border border-teal-100 bg-teal-50 p-5"><h2 className="font-semibold text-teal-900">Response reminder</h2><p className="mt-2 text-sm leading-6 text-teal-800">{awaiting.length} cases currently request additional information.</p></section></aside>
    </div>
  </div>;
}

function Metric({ label, value, icon: Icon, tone }: { label: string; value: string; icon: React.ElementType; tone: 'blue' | 'amber' | 'green' }) { const colors = { blue: 'bg-cyan-50 text-cyan-700', amber: 'bg-amber-50 text-amber-700', green: 'bg-emerald-50 text-emerald-700' }; return <div className="rounded-2xl border border-[#dce6eb] bg-white/95 p-5 shadow-[0_8px_24px_rgba(25,55,72,0.05)]"><div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-500">{label}</p><span className={`rounded-xl p-2.5 ${colors[tone]}`}><Icon className="h-4 w-4" /></span></div><p className="mt-4 text-3xl font-semibold tracking-tight text-[#142334]">{value}</p></div> }
function Action({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) { return <Link href={href} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50"><span className="flex items-center gap-3"><Icon className="h-4 w-4 text-[#1769aa]" />{label}</span><ArrowRight className="h-4 w-4 text-slate-400" /></Link> }
