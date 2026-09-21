'use client';
import { Table } from '@/components/ui';
import { useAuditLog } from '@/features/manager-dashboard/hooks';
import { TableControls } from '@/components/ui/TableControls';
import { useMemo, useState } from 'react';
export default function AuditPage() {
  const { data, isLoading } = useAuditLog();
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');
  const rows = Array.isArray(data) ? data : data?.results ?? [];
  const filteredRows = useMemo(() => rows.filter((row: any) => [row.timestamp, row.actor_name, row.action].some((value) => String(value ?? '').toLowerCase().includes(search.trim().toLowerCase()))).sort((left: any, right: any) => { const leftDate = new Date(left.timestamp).getTime(); const rightDate = new Date(right.timestamp).getTime(); return sortOrder === 'recent' ? rightDate - leftDate : leftDate - rightDate; }), [rows, search, sortOrder]);
  const columns = [
    { key: 'timestamp', header: 'Timestamp' },
    { key: 'actor_name', header: 'Actor' },
    { key: 'action', header: 'Action Event' },
  ];
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900">Audit Trail</h1>
      <div className="bg-white p-6 shadow-sm rounded-xl border border-slate-200">
        <TableControls search={search} onSearch={setSearch} searchPlaceholder="Search actor or action..." sortOrder={sortOrder} onSort={setSortOrder} onClear={() => { setSearch(''); setSortOrder('recent'); }} />
        <Table columns={columns} data={filteredRows} loading={isLoading} keyExtractor={(r: any) => String(r.audit_id)} emptyMessage="No audit events match your filters." />
      </div>
    </div>
  );
}