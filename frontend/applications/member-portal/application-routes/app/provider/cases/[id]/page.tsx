'use client';

import { ChangeEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Loader2, UploadCloud } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useAuthorizationRequest } from '@/features/authorization-workspace/hooks';
import { documentEndpoints } from '@/shared/endpoints';
import { StatusBadge } from '@/components/ui';

export default function CaseDetail() {
  const { id } = useParams();
  const { data: request, isLoading, refetch } = useAuthorizationRequest(id as string);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  async function uploadEvidence(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('authorization_request', id as string);
      formData.append('document_type', 'OTHER');
      formData.append('file', file);
      await documentEndpoints.upload(formData);
      await refetch();
      setMessage('Evidence uploaded. The authorization team can continue review.');
    } catch {
      setMessage('The evidence could not be uploaded. Please try again.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#1769aa]" /></div>;
  if (!request) return <div className="p-8 text-center text-slate-500">Case not found.</div>;

  return <div className="mx-auto max-w-5xl space-y-6">
    <div className="flex items-center gap-3"><Link href="/provider/status" className="rounded-md p-2 text-slate-500 hover:bg-slate-100"><ArrowLeft className="h-5 w-5" /></Link><div><p className="text-sm font-medium text-[#1769aa]">Provider case workspace</p><h1 className="text-2xl font-bold text-slate-900">Authorization {request.authorization_id.slice(0, 12)}</h1></div><StatusBadge status={request.status} /></div>
    <section className="grid gap-4 md:grid-cols-4"><Summary label="Patient" value={request.patient?.name} /><Summary label="Payer" value={request.payer?.payer_name} /><Summary label="Plan" value={request.plan?.plan_name} /><Summary label="Service" value={request.service_code?.service_name} /></section>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold text-slate-900">Clinical request</h2><dl className="mt-5 space-y-4 text-sm"><div><dt className="text-slate-500">Diagnosis</dt><dd className="mt-1 font-medium text-slate-900">{request.diagnosis}</dd></div><div><dt className="text-slate-500">Clinical indication</dt><dd className="mt-1 leading-6 text-slate-700">{request.clinical_indication}</dd></div></dl>{request.missing_information?.length > 0 && <div className="mt-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-900"><p className="font-semibold">Information requested</p><p className="mt-1">{request.missing_information.join(', ')}</p></div>}</section>
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold text-slate-900">Supporting evidence</h2><div className="mt-4 space-y-3">{request.documents?.length ? request.documents.map((document: any) => <div key={document.document_id} className="flex items-center gap-3 text-sm"><FileText className="h-4 w-4 text-[#1769aa]" /><span className="font-medium text-slate-700">{document.file_name}</span></div>) : <p className="text-sm text-slate-500">No evidence uploaded yet.</p>}</div><label className="mt-5 flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 hover:border-[#1769aa]">{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}{uploading ? 'Uploading...' : 'Upload clinical evidence'}<input type="file" className="sr-only" onChange={uploadEvidence} disabled={uploading} /></label>{message && <p className="mt-3 text-sm text-slate-600">{message}</p>}</section>
    </div>
  </div>;
}

function Summary({ label, value }: { label: string; value?: string }) { return <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-2 text-sm font-semibold text-slate-800">{value || 'Not available'}</p></div>; }
