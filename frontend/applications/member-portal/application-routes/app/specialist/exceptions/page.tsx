'use client';
import { Table, StatusBadge, EdgeCaseBadge } from '@/components/ui';
import Link from 'next/link';
import { formatDate } from '@/shared/utils';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/shared/api-client';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { TableControls } from '@/components/ui/TableControls';

export default function ExceptionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['exceptions'],
    queryFn: async () => {
      const res = await apiClient.get('/authorizations/exception_queue/');
      return res.data;
    }
  });
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');
  const rows = Array.isArray(data) ? data : data?.results ?? [];
  const filteredRows = useMemo(() => rows.filter((row: any) => [row.authorization_id, row.patient_name, row.service_name, row.edge_case_type, row.status].some((value) => String(value ?? '').toLowerCase().includes(search.trim().toLowerCase()))).sort((left: any, right: any) => { const leftDate = new Date(left.request_date).getTime(); const rightDate = new Date(right.request_date).getTime(); return sortOrder === 'recent' ? rightDate - leftDate : leftDate - rightDate; }), [rows, search, sortOrder]);

  const columns = [
    { key: 'authorization_id', header: 'ID', render: (val: string) => <Link href={`/specialist/authorizations/${val}`} className="text-[#1769aa] font-medium hover:underline">{val.slice(0, 8)}...</Link> },
    { key: 'patient_name', header: 'Patient' },
    { key: 'service_name', header: 'Service' },
    { key: 'edge_case_type', header: 'Exception Type', render: (val: any) => <EdgeCaseBadge type={val} /> },
    { key: 'status', header: 'Status', render: (val: any) => <StatusBadge status={val} /> },
    { key: 'request_date', header: 'Date', render: (val: string) => formatDate(val) },
    { key: 'action', header: '', render: (_: any, row: any) => <Link href={`/specialist/authorizations/${row.authorization_id}`} className="text-[#1356a1] flex items-center gap-1 font-semibold text-sm hover:underline">Review <ArrowRight className="h-4 w-4" /></Link> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl bg-amber-50 px-7 py-6 border border-amber-200">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-lg text-amber-700"><AlertTriangle className="h-6 w-6" /></div>
          <div>
            <h1 className="text-2xl font-bold text-amber-900">Exception Queue</h1>
            <p className="mt-1 text-sm text-amber-800">Cases requiring manual intervention due to edge cases, peer-to-peer requirements, or complex rules.</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 shadow-sm rounded-xl border border-slate-200">
        <TableControls search={search} onSearch={setSearch} searchPlaceholder="Search patient, service, or exception..." sortOrder={sortOrder} onSort={setSortOrder} onClear={() => { setSearch(''); setSortOrder('recent'); }} />
        <Table columns={columns} data={filteredRows} loading={isLoading} keyExtractor={(r: any) => r.authorization_id} emptyMessage="No exceptions match your filters." />
      </div>
    </div>
  );
}
