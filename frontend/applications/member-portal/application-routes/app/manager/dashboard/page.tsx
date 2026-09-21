'use client';

import Link from 'next/link';
import { Activity, ArrowRight, Clock3, FileText, Users, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/shared/api-client';

export default function ManagerDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['manager_summary'],
    queryFn: async () => {
      const res = await apiClient.get('/authorizations/manager_summary/');
      return res.data;
    }
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#304c42]" /></div>;

  const totalRequests = data?.statuses?.reduce((sum: number, item: any) => sum + item.count, 0) || 0;
  const getCount = (status: string) => data?.statuses?.find((s: any) => s.status === status)?.count || 0;
  
  const identifyCount = getCount('Draft');
  const reviewCount = getCount('Ready for Submission') + getCount('Exception – Review Required');
  const pendingCount = getCount('Pending') + getCount('Submitted');

  return <div className="space-y-6">
    <section className="flex flex-col gap-4 rounded-2xl bg-gradient-to-br from-[#23404a] via-[#28636a] to-[#4f8064] px-7 py-7 text-white shadow-[0_18px_40px_rgba(35,75,77,0.18)] md:flex-row md:items-center md:justify-between"><div><p className="text-sm font-medium text-emerald-100">Operations manager workspace</p><h1 className="mt-1 text-3xl font-semibold">Team performance at a glance</h1><p className="mt-2 text-sm text-emerald-50">See workload, service levels, and exceptions across the authorization operation.</p></div><Link href="/manager/workload" className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#28636a]"><Users className="h-4 w-4" /> View team workload</Link></section>
    <section className="grid gap-4 sm:grid-cols-3"><Metric label="Total Requests" value={totalRequests.toString()} icon={FileText} /><Metric label="Within SLA" value={data?.sla_health || "Not available"} icon={Clock3} /><Metric label="Active specialists" value={data?.active_specialists?.toString() || "Not available"} icon={Users} /></section>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"><section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold text-slate-900">Operational pulse</h2><p className="mt-1 text-sm text-slate-500">Current workload by workflow stage.</p></div><Link href="/manager/trends" className="text-sm font-semibold text-[#4f8064]">View trends</Link></div><div className="mt-6 space-y-5"><Progress label="Draft / Gathering Info" value={totalRequests ? String(Math.round((identifyCount / totalRequests) * 100)) : "0"} count={`${identifyCount} cases`} /><Progress label="Human review" value={totalRequests ? String(Math.round((reviewCount / totalRequests) * 100)) : "0"} count={`${reviewCount} cases`} /><Progress label="Pending Payer" value={totalRequests ? String(Math.round((pendingCount / totalRequests) * 100)) : "0"} count={`${pendingCount} cases`} /></div></section><aside className="space-y-4"><Link href="/specialist/exceptions" className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-4"><span><p className="font-semibold text-amber-900">Exception queue</p><p className="mt-1 text-sm text-amber-800">{data?.exception_count || 0} items need attention</p></span><ArrowRight className="h-4 w-4 text-amber-700" /></Link><section className="rounded-xl border border-emerald-100 bg-emerald-50 p-5"><Activity className="h-5 w-5 text-[#4f8064]" /><h2 className="mt-3 font-semibold text-emerald-950">SLA health</h2><p className="mt-2 text-sm leading-6 text-emerald-900">Median turnaround is 6.4 hours, down 12% from last week.</p></section></aside></div>
  </div>;
}

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) { return <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><span className="inline-flex rounded-lg bg-emerald-50 p-2 text-[#4f8064]"><Icon className="h-4 w-4" /></span><p className="mt-4 text-sm font-medium text-slate-500">{label}</p><p className="mt-1 text-3xl font-semibold text-slate-900">{value}</p></div> }
function Progress({ label, value, count }: { label: string; value: string; count: string }) { return <div><div className="flex items-center justify-between text-sm"><span className="font-medium text-slate-700">{label}</span><span className="text-slate-500">{count}</span></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-[#4f8064]" style={{ width: `${value}%` }} /></div></div> }
