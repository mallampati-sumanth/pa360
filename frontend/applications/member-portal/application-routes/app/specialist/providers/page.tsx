'use client';
import { useProviders } from '@/features/authorization-workspace/hooks';
import { Table } from '@/components/ui';
import { Stethoscope } from 'lucide-react';
import { TableControls } from '@/components/ui/TableControls';
import { useMemo, useState } from 'react';

export default function ProvidersPage() {
  const { data, isLoading } = useProviders();
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');
  const rows = (data?.results ?? data ?? []) as any[];
  const filteredRows = useMemo(() => rows.filter((row) => [row.provider_id, row.provider_name, row.specialty].filter(Boolean).some((value) => String(value).toLowerCase().includes(search.trim().toLowerCase()))).sort((left, right) => { const comparison = String(left.provider_name || '').localeCompare(String(right.provider_name || '')); return sortOrder === 'recent' ? comparison : -comparison; }), [rows, search, sortOrder]);
  const columns = [
    { key: 'provider_id', header: 'NPI', render: (val: string) => <span className="text-slate-500 font-mono text-sm">{val.slice(0, 10)}</span> },
    { key: 'provider_name', header: 'Provider Name', render: (val: string) => <span className="font-semibold text-slate-800">{val}</span> },
    { key: 'specialty', header: 'Specialty', render: (val: string) => <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-600">{val || 'General'}</span> },
  ];
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Providers</h1>
          <p className="text-sm text-slate-500 mt-1">Directory of ordering providers and specialists.</p>
        </div>
        <button className="bg-[#1356a1] text-white px-4 py-2 rounded-md font-semibold text-sm flex items-center gap-2">
          <Stethoscope className="h-4 w-4" /> New Provider
        </button>
      </div>
      <div className="bg-white p-5 shadow-sm rounded-xl border border-slate-200">
        <TableControls search={search} onSearch={setSearch} searchPlaceholder="Search providers..." sortOrder={sortOrder} onSort={setSortOrder} onClear={() => { setSearch(''); setSortOrder('recent'); }} />
        <Table columns={columns} data={filteredRows} loading={isLoading} keyExtractor={(r: any) => r.provider_id} emptyMessage="No providers match your filters." />
      </div>
    </div>
  );
}