'use client';
import { useAuthorizationRequests, useDeleteAuthorizationRequest } from '@/features/authorization-workspace/hooks';
import { Table, StatusBadge, PriorityBadge } from '@/components/ui';
import Link from 'next/link';
import { formatDate } from '@/shared/utils';
import { useState, useMemo } from 'react';
import { Search, Trash2 } from 'lucide-react';

export default function ProviderStatus() {
  const { data, isLoading } = useAuthorizationRequests();
  const deleteRequest = useDeleteAuthorizationRequest();
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [payerFilter, setPayerFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const rawData = (data?.results ?? data ?? []) as any[];
  
  const filterOptions = useMemo(() => ({
    statuses: [...new Set(rawData.map((row) => row.status).filter(Boolean))].sort(),
    priorities: [...new Set(rawData.map((row) => row.priority).filter(Boolean))].sort(),
    payers: [...new Set(rawData.map((row) => row.payer_name).filter(Boolean))].sort(),
    services: [...new Set(rawData.map((row) => row.service_name).filter(Boolean))].sort(),
  }), [rawData]);

  const filteredData = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const rows = rawData.filter((row) => {
      const matchesSearch = !normalizedSearch || [row.patient_name, row.service_name, row.authorization_id, row.status, row.priority, row.payer_name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch));
      return matchesSearch &&
        (!statusFilter || row.status === statusFilter) &&
        (!priorityFilter || row.priority === priorityFilter) &&
        (!payerFilter || row.payer_name === payerFilter) &&
        (!serviceFilter || row.service_name === serviceFilter);
    });

    return rows.sort((left, right) => {
      const leftDate = new Date(left.request_date).getTime();
      const rightDate = new Date(right.request_date).getTime();
      return sortOrder === 'recent' ? rightDate - leftDate : leftDate - rightDate;
    });
  }, [rawData, search, sortOrder, statusFilter, priorityFilter, payerFilter, serviceFilter]);

  const clearFilters = () => {
    setSearch('');
    setSortOrder('recent');
    setStatusFilter('');
    setPriorityFilter('');
    setPayerFilter('');
    setServiceFilter('');
  };

  const toggleSelected = (id: string) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const allVisibleSelected = filteredData.length > 0 && filteredData.every((row) => selectedIds.includes(row.authorization_id));
  const toggleAllVisible = () => setSelectedIds((current) => allVisibleSelected ? current.filter((id) => !filteredData.some((row) => row.authorization_id === id)) : [...new Set([...current, ...filteredData.map((row) => row.authorization_id)])]);
  const deleteSelected = async () => {
    if (!selectedIds.length || !window.confirm(`Delete ${selectedIds.length} selected case${selectedIds.length === 1 ? '' : 's'}? This cannot be undone.`)) return;
    await Promise.allSettled(selectedIds.map((id) => deleteRequest.mutateAsync(id)));
    setSelectedIds([]);
  };

  const columns = [
    { key: 'select', header: <input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} disabled={!filteredData.length || deleteRequest.isPending} aria-label="Select all visible cases" className="h-4 w-4 accent-[#1356a1]" />, render: (_val: unknown, row: any) => <input type="checkbox" checked={selectedIds.includes(row.authorization_id)} onChange={() => toggleSelected(row.authorization_id)} disabled={deleteRequest.isPending} aria-label={`Select case ${row.authorization_id}`} className="h-4 w-4 accent-[#1356a1]" /> },
    { key: 'authorization_id', header: 'ID', render: (val: string, row: any) => <Link href={`/provider/cases/${row.authorization_id}`} className="text-[#1769aa] font-medium">{val.slice(0, 8)}...</Link> },
    { key: 'patient_name', header: 'Patient' },
    { key: 'service_name', header: 'Service' },
    { key: 'status', header: 'Status', render: (val: string) => <StatusBadge status={val as any} /> },
    { key: 'priority', header: 'Priority', render: (val: any) => <PriorityBadge priority={val} /> },
    { key: 'request_date', header: 'Submitted', render: (val: string) => formatDate(val) },
    { key: 'actions', header: '', render: (_val: unknown, row: any) => <button type="button" title="Delete case" aria-label={`Delete case ${row.authorization_id}`} onClick={() => { if (window.confirm('Delete this case? This cannot be undone.')) deleteRequest.mutate(row.authorization_id) }} disabled={deleteRequest.isPending} className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button> },
  ];
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Cases</h1>
          <p className="text-sm text-slate-500 mt-1">Track the status of your submitted prior authorizations.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/provider/requests/new" className="bg-[#1769aa] text-white px-4 py-2 rounded-md font-semibold text-sm">New Case</Link>
          <Link href="/provider/dashboard" className="border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-md font-semibold text-sm">Provider dashboard</Link>
        </div>
      </div>
      <div className="bg-white p-6 shadow-sm rounded-xl border border-slate-200 space-y-4">
        <div className="flex flex-col gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search patient, service, or ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-md focus:border-[#1769aa] outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <FilterSelect value={statusFilter} onChange={setStatusFilter} options={filterOptions.statuses} placeholder="All statuses" ariaLabel="Filter by status" />
            <FilterSelect value={priorityFilter} onChange={setPriorityFilter} options={filterOptions.priorities} placeholder="All priorities" ariaLabel="Filter by priority" />
            <FilterSelect value={payerFilter} onChange={setPayerFilter} options={filterOptions.payers} placeholder="All payers" ariaLabel="Filter by payer" />
            <FilterSelect value={serviceFilter} onChange={setServiceFilter} options={filterOptions.services} placeholder="All services" ariaLabel="Filter by service" />
            <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as 'recent' | 'oldest')} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#1769aa]" aria-label="Sort cases by date">
              <option value="recent">Recent to oldest</option>
              <option value="oldest">Oldest to recent</option>
            </select>
            <button type="button" onClick={clearFilters} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Clear filters</button>
            <button type="button" onClick={deleteSelected} disabled={!selectedIds.length || deleteRequest.isPending} className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"><Trash2 className="h-4 w-4" />Delete selected{selectedIds.length ? ` (${selectedIds.length})` : ''}</button>
          </div>
        </div>
        <Table columns={columns} data={filteredData} loading={isLoading} keyExtractor={(r: any) => r.authorization_id} emptyMessage="No cases match your filters." />
      </div>
    </div>
  );
}

function FilterSelect({ value, onChange, options, placeholder, ariaLabel }: { value: string; onChange: (value: string) => void; options: string[]; placeholder: string; ariaLabel: string }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} className="max-w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#1769aa]" aria-label={ariaLabel}><option value="">{placeholder}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select>;
}