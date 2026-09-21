'use client';
import { useMemo, useState } from 'react';
import { useAuthorizationRequests } from '@/features/authorization-workspace/hooks';
import { Table, StatusBadge, PriorityBadge } from '@/components/ui';
import Link from 'next/link';
import { formatDate } from '@/shared/utils';
import { Search } from 'lucide-react';

export default function RequestsPage() {
  const { data, isLoading } = useAuthorizationRequests();
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [payerFilter, setPayerFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');

  const allRequests = (data?.results ?? data ?? []) as any[];
  const filterOptions = useMemo(() => ({
    statuses: [...new Set(allRequests.map((request) => request.status).filter(Boolean))].sort(),
    priorities: [...new Set(allRequests.map((request) => request.priority).filter(Boolean))].sort(),
    payers: [...new Set(allRequests.map((request) => request.payer_name).filter(Boolean))].sort(),
    services: [...new Set(allRequests.map((request) => request.service_name).filter(Boolean))].sort(),
  }), [allRequests]);

  const requests = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const rows = [...allRequests].filter((request: any) => {
      const matchesSearch = !normalizedSearch || [request.authorization_id, request.patient_name, request.service_name, request.status, request.priority, request.payer_name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch));
      return matchesSearch &&
        (!statusFilter || request.status === statusFilter) &&
        (!priorityFilter || request.priority === priorityFilter) &&
        (!payerFilter || request.payer_name === payerFilter) &&
        (!serviceFilter || request.service_name === serviceFilter);
    });

    return rows.sort((left: any, right: any) => {
      const leftDate = new Date(left.request_date).getTime();
      const rightDate = new Date(right.request_date).getTime();
      return sortOrder === 'recent' ? rightDate - leftDate : leftDate - rightDate;
    });
  }, [allRequests, search, sortOrder, statusFilter, priorityFilter, payerFilter, serviceFilter]);

  const clearFilters = () => {
    setSearch('');
    setSortOrder('recent');
    setStatusFilter('');
    setPriorityFilter('');
    setPayerFilter('');
    setServiceFilter('');
  };

  const columns = [
    { key: 'authorization_id', header: 'ID', render: (val: string) => <Link href={`/specialist/authorizations/${val}`} className="text-[#1769aa] font-medium hover:underline">{val.slice(0, 8)}...</Link> },
    { key: 'patient_name', header: 'Patient' },
    { key: 'service_name', header: 'Service' },
    { key: 'status', header: 'Status', render: (val: any) => <StatusBadge status={val} /> },
    { key: 'priority', header: 'Priority', render: (val: any) => <PriorityBadge priority={val} /> },
    { key: 'request_date', header: 'Date', render: (val: string) => formatDate(val) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Authorization Requests</h1>
        <Link href="/specialist/requests/new" className="bg-[#1356a1] text-white px-4 py-2 rounded font-semibold text-sm">New Request</Link>
      </div>
      <div className="bg-white p-6 shadow-sm rounded-xl border border-slate-200">
        <div className="mb-4 flex flex-col gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search patient, service, authorization, or status..."
              className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#1769aa]"
              aria-label="Search authorization requests"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <FilterSelect value={statusFilter} onChange={setStatusFilter} options={filterOptions.statuses} placeholder="All statuses" ariaLabel="Filter by status" />
            <FilterSelect value={priorityFilter} onChange={setPriorityFilter} options={filterOptions.priorities} placeholder="All priorities" ariaLabel="Filter by priority" />
            <FilterSelect value={payerFilter} onChange={setPayerFilter} options={filterOptions.payers} placeholder="All payers" ariaLabel="Filter by payer" />
            <FilterSelect value={serviceFilter} onChange={setServiceFilter} options={filterOptions.services} placeholder="All services" ariaLabel="Filter by service" />
            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value as 'recent' | 'oldest')}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#1769aa]"
              aria-label="Sort authorization requests by date"
            >
              <option value="recent">Recent to oldest</option>
              <option value="oldest">Oldest to recent</option>
            </select>
            <button type="button" onClick={clearFilters} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Clear filters</button>
          </div>
        </div>
        <Table columns={columns} data={requests} loading={isLoading} keyExtractor={(r: any) => r.authorization_id} emptyMessage="No authorization requests match your filters." />
      </div>
    </div>
  );
}

function FilterSelect({ value, onChange, options, placeholder, ariaLabel }: { value: string; onChange: (value: string) => void; options: string[]; placeholder: string; ariaLabel: string }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="max-w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#1769aa]" aria-label={ariaLabel}>
      <option value="">{placeholder}</option>
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  );
}
