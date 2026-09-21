'use client';
import { usePatients } from '@/features/authorization-workspace/hooks';
import { Table } from '@/components/ui';
import { UserPlus } from 'lucide-react';
import { TableControls } from '@/components/ui/TableControls';
import { useMemo, useState } from 'react';

export default function PatientsPage() {
  const { data, isLoading } = usePatients();
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');
  const rows = (data?.results ?? data ?? []) as any[];
  const filteredRows = useMemo(() => rows.filter((row) => [row.patient_id, row.name, row.plan_id].filter(Boolean).some((value) => String(value).toLowerCase().includes(search.trim().toLowerCase()))).sort((left, right) => { const leftValue = new Date(left.dob || 0).getTime(); const rightValue = new Date(right.dob || 0).getTime(); return sortOrder === 'recent' ? rightValue - leftValue : leftValue - rightValue; }), [rows, search, sortOrder]);
  const columns = [
    { key: 'patient_id', header: 'ID', render: (val: string) => <span className="text-slate-500 font-mono text-sm">{val.slice(0, 8)}</span> },
    { key: 'name', header: 'Name', render: (val: string) => <span className="font-semibold text-slate-800">{val}</span> },
    { key: 'dob', header: 'DOB' },
    { key: 'plan_id', header: 'Plan ID' },
  ];
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Patients</h1>
          <p className="text-sm text-slate-500 mt-1">Manage patient records and insurance details.</p>
        </div>
        <button className="bg-[#1356a1] text-white px-4 py-2 rounded-md font-semibold text-sm flex items-center gap-2">
          <UserPlus className="h-4 w-4" /> Add Patient
        </button>
      </div>
      <div className="bg-white p-5 shadow-sm rounded-xl border border-slate-200">
        <TableControls search={search} onSearch={setSearch} searchPlaceholder="Search patients..." sortOrder={sortOrder} onSort={setSortOrder} onClear={() => { setSearch(''); setSortOrder('recent'); }} />
        <Table columns={columns} data={filteredRows} loading={isLoading} keyExtractor={(r: any) => r.patient_id} emptyMessage="No patients match your filters." />
      </div>
    </div>
  );
}