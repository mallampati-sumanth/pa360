'use client';
import { BarChart2, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { useAuthorizationRequests } from '@/features/authorization-workspace/hooks';

export default function ReportsPage() {
  const { data, isLoading } = useAuthorizationRequests();
  const requests = Array.isArray(data) ? data : data?.results ?? [];
  const total = requests.length;
  const approved = requests.filter((item: any) => item.status === 'Approved').length;
  const denied = requests.filter((item: any) => item.status === 'Denied').length;
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Reports & Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Exportable operational reports and performance metrics.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Approval Rate', val: total ? `${Math.round((approved / total) * 100)}%` : '0%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Avg Turnaround', val: 'Not available', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Denial Rate', val: total ? `${Math.round((denied / total) * 100)}%` : '0%', icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-100' },
          { label: 'Total Volume', val: isLoading ? '...' : String(total), icon: BarChart2, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        ].map((s,i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${s.bg} ${s.color}`}><s.icon className="h-6 w-6" /></div>
            <div><p className="text-sm font-medium text-slate-500">{s.label}</p><p className="text-2xl font-bold text-slate-900">{s.val}</p></div>
          </div>
        ))}
      </div>
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center">
        <div className="mx-auto w-16 h-16 bg-slate-50 flex items-center justify-center rounded-full mb-4">
          <BarChart2 className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">Advanced Reporting Module</h3>
        <p className="text-slate-500 max-w-md mx-auto mt-2">Turnaround data is not available from the current API.</p>
      </div>
    </div>
  );
}