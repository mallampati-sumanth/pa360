'use client';

import { CheckCircle2, CircleAlert, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { usePayerResponses, useProcessPayerResponse } from '@/features/authorization-workspace/hooks';
import { TableControls } from '@/components/ui/TableControls';

export default function BillingPayerResponsesPage() {
  const { data, isLoading } = usePayerResponses();
  const processResponse = useProcessPayerResponse();
  const responses = (Array.isArray(data) ? data : data?.results ?? []) as any[];
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');
  const types = [...new Set(responses.map((response) => response.response_type).filter(Boolean))].sort();
  const filteredResponses = useMemo(() => responses.filter((response) => {
    const query = search.trim().toLowerCase();
    return (!query || [response.payer_name, response.authorization_request, response.response_text, response.response_type].some((value) => String(value ?? '').toLowerCase().includes(query))) && (!typeFilter || response.response_type === typeFilter);
  }).sort((left, right) => { const leftDate = new Date(left.response_date).getTime(); const rightDate = new Date(right.response_date).getTime(); return sortOrder === 'recent' ? rightDate - leftDate : leftDate - rightDate; }), [responses, search, typeFilter, sortOrder]);

  return <div className="mx-auto max-w-6xl space-y-6">
    <header><h1 className="text-2xl font-bold text-slate-900">Payer Responses</h1><p className="mt-1 text-sm text-slate-500">Track payer decisions and process follow-up work for billing operations.</p></header>
    <section className="space-y-3"><TableControls search={search} onSearch={setSearch} searchPlaceholder="Search payer, authorization, response..." filters={[{ value: typeFilter, onChange: setTypeFilter, options: types, placeholder: 'All response types', ariaLabel: 'Filter by response type' }]} sortOrder={sortOrder} onSort={setSortOrder} onClear={() => { setSearch(''); setTypeFilter(''); setSortOrder('recent'); }} />{isLoading ? <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-[#8b4c68]" /></div> : filteredResponses.length === 0 ? <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">No payer responses match your filters.</div> : filteredResponses.map((response) => {
      const followUp = ['PENDING', 'ADDITIONAL_INFO_REQUESTED'].includes(response.response_type);
      return <article key={response.response_id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2"><span className="font-semibold text-slate-900">{response.payer_name}</span>{followUp ? <CircleAlert className="h-4 w-4 text-amber-500" /> : <CheckCircle2 className="h-4 w-4 text-emerald-500" />}</div><p className="mt-1 text-xs font-mono text-slate-500">Authorization: {String(response.authorization_request).slice(0, 12)}</p><p className="mt-3 text-sm leading-6 text-slate-700">{response.response_text}</p></div><div className="flex shrink-0 flex-col items-start gap-2 sm:items-end"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{response.response_type}</span>{response.processed ? <span className="text-xs text-emerald-700">Processed</span> : <button onClick={() => processResponse.mutate(String(response.response_id))} disabled={processResponse.isPending} className="rounded-md bg-[#8b4c68] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Mark processed</button>}</div></div></article>;
    })}</section>
  </div>;
}