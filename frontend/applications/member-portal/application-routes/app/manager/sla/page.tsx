'use client';
import { Table, PriorityBadge } from '@/components/ui';
import { useAcknowledgeSLABreach, useSLABreaches } from '@/features/manager-dashboard/hooks';
import { TableControls } from '@/components/ui/TableControls';
import { useMemo, useState } from 'react';
export default function SLAPage() {
  const { data, isLoading } = useSLABreaches();
  const acknowledge = useAcknowledgeSLABreach();
  const rows = Array.isArray(data) ? data : data?.results ?? [];
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');
  const filteredRows = useMemo(() => rows.filter((row: any) => [row.authorization_request, row.breach_type].some((value) => String(value ?? '').toLowerCase().includes(search.trim().toLowerCase())) && (!statusFilter || (statusFilter === 'Acknowledged' ? row.acknowledged : !row.acknowledged))).sort((left: any, right: any) => { const leftDate = new Date(left.breach_detected_at).getTime(); const rightDate = new Date(right.breach_detected_at).getTime(); return sortOrder === 'recent' ? rightDate - leftDate : leftDate - rightDate; }), [rows, search, statusFilter, sortOrder]);
  const columns = [
    { key: 'authorization_request', header: 'Authorization', render: (v: string) => <span className="text-[#1769aa] font-medium">{v}</span> },
    { key: 'breach_type', header: 'Breach Type' },
    { key: 'breach_detected_at', header: 'Detected' },
    { key: 'acknowledged', header: 'Status', render: (v: boolean, row: any) => v ? <span className="text-slate-600">Acknowledged</span> : <button onClick={() => acknowledge.mutate(String(row.id))} disabled={acknowledge.isPending} className="font-semibold text-rose-600 hover:text-rose-800">Acknowledge</button> },
  ];
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900">SLA Management</h1>
      <div className="bg-white p-6 shadow-sm rounded-xl border border-slate-200">
        <TableControls search={search} onSearch={setSearch} searchPlaceholder="Search authorization or breach type..." filters={[{ value: statusFilter, onChange: setStatusFilter, options: ['Acknowledged', 'Open'], placeholder: 'All SLA statuses', ariaLabel: 'Filter by SLA status' }]} sortOrder={sortOrder} onSort={setSortOrder} onClear={() => { setSearch(''); setStatusFilter(''); setSortOrder('recent'); }} />
        <Table columns={columns} data={filteredRows} loading={isLoading} keyExtractor={(r: any) => String(r.id)} emptyMessage="No SLA breaches match your filters." />
      </div>
    </div>
  );
}