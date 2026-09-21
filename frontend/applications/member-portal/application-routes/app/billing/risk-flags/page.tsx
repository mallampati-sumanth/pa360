'use client';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { useAuthorizationRequests } from '@/features/authorization-workspace/hooks';
import { StatusBadge } from '@/components/ui';
export default function RiskFlagsPage() {
  const { data, isLoading } = useAuthorizationRequests();
  const requests = (Array.isArray(data) ? data : data?.results ?? []) as any[];
  const risks = requests.filter((request) => ['Denied', 'Additional Info Requested', 'Exception – Review Required', 'Expired'].includes(request.status));
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Risk Flags</h1>
        <p className="text-sm text-slate-500 mt-1">Identify potential denials and revenue leakage.</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5"><ShieldAlert className="h-5 w-5 text-rose-500" /><div><h2 className="font-semibold text-slate-900">Live billing risk queue</h2><p className="text-sm text-slate-500">Cases that may delay payment or require follow-up.</p></div></div>{isLoading ? <p className="p-8 text-sm text-slate-500">Loading risk flags...</p> : risks.length === 0 ? <div className="p-12 text-center"><ShieldAlert className="mx-auto mb-4 h-12 w-12 text-emerald-400" /><h2 className="font-semibold text-slate-800">No active risk flags</h2><p className="mt-2 text-sm text-slate-500">All current cases are proceeding normally.</p></div> : <div className="divide-y divide-slate-100">{risks.map((request) => <div key={request.authorization_id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-slate-800">{request.patient_name || 'Unknown patient'}</p><p className="mt-1 text-sm text-slate-500">{request.service_name || 'Service unavailable'} · {request.authorization_id.slice(0, 12)}</p></div><div className="flex items-center gap-3"><AlertTriangle className="h-4 w-4 text-amber-500" /><StatusBadge status={request.status} /></div></div>)}</div>}</div>
    </div>
  );
}