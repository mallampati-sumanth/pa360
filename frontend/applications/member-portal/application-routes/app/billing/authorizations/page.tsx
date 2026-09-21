'use client';
import { useState } from 'react';
import { useAuthorizationRequests } from '@/features/authorization-workspace/hooks';
import { Table, StatusBadge } from '@/components/ui';
import { formatDate } from '@/shared/utils';
import { authorizationEndpoints } from '@/shared/endpoints';
import { TableControls } from '@/components/ui/TableControls';

export default function BillingAuthsPage() {
  const { data, isLoading } = useAuthorizationRequests();
  const [workingId, setWorkingId] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');
  const allRequests = ((data?.results ?? data ?? []) as any[]).filter((request) => ['Approved', 'Service Delivery', 'Billing / RCM'].includes(request.status));
  const requests = allRequests.filter((request) => {
    const query = search.trim().toLowerCase();
    return (!query || [request.authorization_id, request.patient_name, request.payer_name, request.status].some((value) => String(value ?? '').toLowerCase().includes(query))) && (!statusFilter || request.status === statusFilter);
  }).sort((left, right) => { const leftDate = new Date(left.request_date).getTime(); const rightDate = new Date(right.request_date).getTime(); return sortOrder === 'recent' ? rightDate - leftDate : leftDate - rightDate; });

  async function runAction(id: string, action: 'delivery' | 'handoff') {
    setWorkingId(id);
    setMessage('');
    try {
      if (action === 'delivery') await authorizationEndpoints.recordServiceDelivery(id);
      else await authorizationEndpoints.billingHandoff(id);
      setMessage('Authorization workflow updated. Refreshing the list...');
      window.location.reload();
    } catch {
      setMessage('The workflow action could not be completed.');
    } finally {
      setWorkingId('');
    }
  }

  const columns = [
    { key: 'authorization_id', header: 'ID', render: (val: string) => <span className="text-[#1769aa] font-medium">{val.slice(0, 8)}...</span> },
    { key: 'patient_name', header: 'Patient' },
    { key: 'payer_name', header: 'Payer' },
    { key: 'status', header: 'Status', render: (val: string) => <StatusBadge status={val as any} /> },
    { key: 'request_date', header: 'Auth Date', render: (val: string) => formatDate(val) },
    { key: 'action', header: 'Next step', render: (_value: unknown, row: any) => row.status === 'Approved' ? <button type="button" onClick={() => runAction(row.authorization_id, 'delivery')} disabled={workingId === row.authorization_id} className="rounded-md bg-indigo-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{workingId === row.authorization_id ? 'Saving...' : 'Record delivery'}</button> : row.status === 'Service Delivery' ? <button type="button" onClick={() => runAction(row.authorization_id, 'handoff')} disabled={workingId === row.authorization_id} className="rounded-md bg-violet-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{workingId === row.authorization_id ? 'Saving...' : 'Handoff to RCM'}</button> : <span className="text-xs font-semibold text-emerald-700">Complete</span> },
  ];
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing Authorizations</h1>
        <p className="text-sm text-slate-500 mt-1">Approved authorizations ready for claims processing.</p>
      </div>
      {message && <p className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-800">{message}</p>}
      <div className="bg-white p-6 shadow-sm rounded-xl border border-slate-200">
        <TableControls search={search} onSearch={setSearch} searchPlaceholder="Search patient, payer, authorization..." filters={[{ value: statusFilter, onChange: setStatusFilter, options: ['Approved', 'Service Delivery', 'Billing / RCM'], placeholder: 'All billing statuses', ariaLabel: 'Filter by billing status' }]} sortOrder={sortOrder} onSort={setSortOrder} onClear={() => { setSearch(''); setStatusFilter(''); setSortOrder('recent'); }} />
        <Table columns={columns} data={requests} loading={isLoading} keyExtractor={(r: any) => r.authorization_id} emptyMessage="No approved authorizations are ready for billing workflow." />
      </div>
    </div>
  );
}