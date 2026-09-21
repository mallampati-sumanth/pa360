'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { StatusBadge, Table } from '@/components/ui';
import { useAuthorizationRequests } from '@/features/authorization-workspace/hooks';
import { TableControls } from '@/components/ui/TableControls';

export default function ManagerExceptionsPage() {
  const { data, isLoading } = useAuthorizationRequests({ status: 'Exception – Review Required' });
  const exceptions = (Array.isArray(data) ? data : data?.results ?? []) as any[];
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');
  const rows = useMemo(() => exceptions.filter((row) => [row.authorization_id, row.patient_name, row.provider_name, row.service_name].some((value) => String(value ?? '').toLowerCase().includes(search.trim().toLowerCase()))).sort((left, right) => { const leftDate = new Date(left.request_date).getTime(); const rightDate = new Date(right.request_date).getTime(); return sortOrder === 'recent' ? rightDate - leftDate : leftDate - rightDate; }), [exceptions, search, sortOrder]);
  const columns = [
    { key: 'authorization_id', header: 'Authorization', render: (value: string) => <span className="font-mono text-xs text-[#1769aa]">{value.slice(0, 12)}</span> },
    { key: 'patient_name', header: 'Patient' },
    { key: 'provider_name', header: 'Provider' },
    { key: 'service_name', header: 'Service' },
    { key: 'status', header: 'Status', render: (value: string) => <StatusBadge status={value as any} /> },
    { key: 'request_date', header: 'Opened' },
  ];

  return <div className="mx-auto max-w-6xl space-y-6">
    <header><div className="flex items-center gap-3"><AlertTriangle className="h-6 w-6 text-amber-600" /><h1 className="text-2xl font-bold text-slate-900">Exception Queue</h1></div><p className="mt-1 text-sm text-slate-500">Review cases that need operational intervention before they can continue.</p></header>
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold text-slate-900">Live exceptions</h2><p className="mt-1 text-sm text-slate-500">Loaded from authorization records with exception status.</p></div>{isLoading && <Loader2 className="h-5 w-5 animate-spin text-[#1769aa]" />}</div><TableControls search={search} onSearch={setSearch} searchPlaceholder="Search authorization, patient, provider..." sortOrder={sortOrder} onSort={setSortOrder} onClear={() => { setSearch(''); setSortOrder('recent'); }} /><Table columns={columns} data={rows} loading={isLoading} keyExtractor={(row: any) => row.authorization_id} emptyMessage="No exception cases match your filters." /></section>
  </div>;
}