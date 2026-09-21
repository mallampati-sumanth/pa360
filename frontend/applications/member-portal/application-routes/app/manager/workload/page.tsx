'use client';
import { Table } from '@/components/ui';
import { useWorkload } from '@/features/manager-dashboard/hooks';
import { TableControls } from '@/components/ui/TableControls';
import { useMemo, useState } from 'react';
export default function WorkloadPage() {
  const { data, isLoading } = useWorkload();
  const requests = Array.isArray(data) ? data : data?.results ?? [];
  const grouped = Object.values(requests.reduce((result: Record<string, any>, request: any) => {
    const name = request.provider_name || 'Unassigned';
    result[name] ??= { staff: name, queue: 0, completed: 0, avg_time: 'Not available' };
    result[name].queue += 1;
    if (['Approved', 'Denied'].includes(request.status)) result[name].completed += 1;
    return result;
  }, {}));
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');
  const filteredRows = useMemo(() => [...grouped].filter((row: any) => String(row.staff).toLowerCase().includes(search.trim().toLowerCase())).sort((left: any, right: any) => { const comparison = left.queue - right.queue; return sortOrder === 'recent' ? -comparison : comparison; }), [grouped, search, sortOrder]);
  const columns = [
    { key: 'staff', header: 'Specialist' },
    { key: 'queue', header: 'Active Queue', render: (v: number) => <span className="font-bold text-slate-800">{v}</span> },
    { key: 'completed', header: 'Completed Today' },
    { key: 'avg_time', header: 'Avg Processing Time' },
  ];
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900">Staff Workload</h1>
      <div className="bg-white p-6 shadow-sm rounded-xl border border-slate-200">
        <TableControls search={search} onSearch={setSearch} searchPlaceholder="Search specialist..." sortOrder={sortOrder} onSort={setSortOrder} onClear={() => { setSearch(''); setSortOrder('recent'); }} />
        <Table columns={columns} data={filteredRows} loading={isLoading} keyExtractor={(r: any) => r.staff} emptyMessage="No workload data matches your filters." />
      </div>
    </div>
  );
}