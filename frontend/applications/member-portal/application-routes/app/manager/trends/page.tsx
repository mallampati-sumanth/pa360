'use client';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { useAuthorizationRequests } from '@/features/authorization-workspace/hooks';
export default function TrendsPage() {
  const { data, isLoading } = useAuthorizationRequests();
  const requests = Array.isArray(data) ? data : data?.results ?? [];
  const days = Array.from({ length: 30 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return date.toISOString().slice(0, 10);
  });
  const approvals = days.map((day) => requests.filter((item: any) => item.status === 'Approved' && item.request_date?.slice(0, 10) === day).length);
  const denials = days.map((day) => requests.filter((item: any) => item.status === 'Denied' && item.request_date?.slice(0, 10) === day).length);
  const maxValue = Math.max(...approvals, ...denials, 1);
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900">Denial & Approval Trends</h1>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><TrendingUp className="h-5 w-5" /></div>
            <h2 className="font-semibold text-slate-800">Approvals (Last 30 Days)</h2>
          </div>
          <div className="h-48 flex items-end gap-2">
            {approvals.map((value, i) => <div key={days[i]} className="flex-1 bg-emerald-400 rounded-t-md" style={{height: `${(value / maxValue) * 100}%`}}></div>)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><TrendingDown className="h-5 w-5" /></div>
            <h2 className="font-semibold text-slate-800">Denials (Last 30 Days)</h2>
          </div>
          <div className="h-48 flex items-end gap-2">
            {denials.map((value, i) => <div key={days[i]} className="flex-1 bg-rose-400 rounded-t-md" style={{height: `${(value / maxValue) * 100}%`}}></div>)}
          </div>
        </div>
      </div>
      {isLoading && <p className="text-sm text-slate-500">Loading live trend data...</p>}
    </div>
  );
}