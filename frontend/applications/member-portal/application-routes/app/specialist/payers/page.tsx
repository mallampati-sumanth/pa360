'use client';
import { usePayers } from '@/features/authorization-workspace/hooks';
import { Table } from '@/components/ui';
import { Building } from 'lucide-react';
import { TableControls } from '@/components/ui/TableControls';
import { useMemo, useState } from 'react';

export default function PayersPage() {
  const { data, isLoading } = usePayers();
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');
  const rows = (data?.results ?? data ?? []) as any[];
  const filteredRows = useMemo(() => rows.filter((row) => [row.payer_id, row.payer_name].filter(Boolean).some((value) => String(value).toLowerCase().includes(search.trim().toLowerCase()))).sort((left, right) => { const comparison = String(left.payer_name || '').localeCompare(String(right.payer_name || '')); return sortOrder === 'recent' ? comparison : -comparison; }), [rows, search, sortOrder]);
  const columns = [
    { key: 'payer_id', header: 'Payer ID', render: (val: string) => <span className="text-slate-500 font-mono text-sm">{val.slice(0, 8)}</span> },
    { key: 'payer_name', header: 'Payer Name', render: (val: string) => <span className="font-semibold text-slate-800">{val}</span> },
  ];
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Payers</h1>
          <p className="text-sm text-slate-500 mt-1">Connected insurance payers and plans.</p>
        </div>
        <button className="bg-[#1356a1] text-white px-4 py-2 rounded-md font-semibold text-sm flex items-center gap-2">
          <Building className="h-4 w-4" /> Add Payer
        </button>
      </div>
      <div className="bg-white p-5 shadow-sm rounded-xl border border-slate-200">
        <TableControls search={search} onSearch={setSearch} searchPlaceholder="Search payers..." sortOrder={sortOrder} onSort={setSortOrder} onClear={() => { setSearch(''); setSortOrder('recent'); }} />
        <Table columns={columns} data={filteredRows} loading={isLoading} keyExtractor={(r: any) => r.payer_id} emptyMessage="No payers match your filters." />
      </div>
    </div>
  );
}