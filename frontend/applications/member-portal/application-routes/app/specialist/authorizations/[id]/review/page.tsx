'use client';
import { useAuthorizationRequest } from '@/features/authorization-workspace/hooks';
import { useParams, useRouter } from 'next/navigation';
import { ChangeEvent, useState } from 'react';
import { CheckCircle2, AlertTriangle, FileText, ArrowLeft, Loader2, Send } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/shared/api-client';
import { documentEndpoints } from '@/shared/endpoints';

export default function ReviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: request, isLoading } = useAuthorizationRequest(id as string);
  
  const [checks, setChecks] = useState({ info: false, docs: false, ready: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#1356a1]" /></div>;
  if (!request) return <div>Request not found</div>;

  const allChecked = checks.info && checks.docs && checks.ready;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (request.status !== 'Ready for Submission') {
        await apiClient.post(`/authorizations/${id}/approve_for_submission/`, { verified: checks });
      }
      await apiClient.post(`/authorizations/${id}/submit_to_payer/`);
      router.push(`/specialist/authorizations/${id}`);
    } catch (e) {
      console.error(e);
      alert('Failed to submit. Check console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('authorization_request', id as string);
      formData.append('document_type', 'OTHER');
      formData.append('file', file);
      await documentEndpoints.upload(formData);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Evidence upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      <div className="flex items-center gap-3">
        <Link href={`/specialist/authorizations/${id}`} className="rounded-md p-2 text-slate-500 hover:bg-slate-100"><ArrowLeft className="h-5 w-5" /></Link>
        <div>
          <p className="text-sm font-medium text-[#1769aa]">Review Checkpoint</p>
          <h1 className="text-2xl font-bold text-slate-900">Final Verification</h1>
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-900">Human-in-the-loop requirement</h3>
            <p className="mt-1 text-sm text-amber-800">Please verify all AI-extracted information against the original documents before submitting to the payer.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 border-b pb-3 mb-4">Request Data</h2>
            <dl className="space-y-4 text-sm">
              <div><dt className="text-slate-500">Patient</dt><dd className="font-medium text-slate-900">{request.patient?.name}</dd></div>
              <div><dt className="text-slate-500">Insurance</dt><dd className="font-medium text-slate-900">{request.payer?.payer_name} - {request.plan?.plan_name}</dd></div>
              <div><dt className="text-slate-500">Service</dt><dd className="font-medium text-slate-900">{request.service_code?.service_name}</dd></div>
              <div><dt className="text-slate-500">Diagnosis</dt><dd className="font-medium text-slate-900">{request.diagnosis}</dd></div>
              <div><dt className="text-slate-500">Clinical Indication</dt><dd className="font-medium text-slate-900">{request.clinical_indication}</dd></div>
            </dl>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 border-b pb-3 mb-4">AI Summary</h2>
            <p className="text-sm leading-relaxed text-slate-700">{request.ai_summary || 'No summary available.'}</p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 border-b pb-3 mb-4">Supporting Evidence</h2>
            {request.documents?.length ? (
              <ul className="space-y-3">
                {request.documents.map((doc: any) => (
                  <li key={doc.document_id} className="flex items-center gap-3 text-sm">
                    <FileText className="h-4 w-4 text-[#1769aa]" />
                    <span className="font-medium text-slate-700">{doc.file_name}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-slate-500">No documents attached.</p>}
            <label className="mt-4 flex cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 hover:border-[#1769aa] hover:text-[#1769aa]">
              {uploading ? 'Uploading evidence...' : 'Upload supporting report'}
              <input type="file" className="sr-only" onChange={handleUpload} disabled={uploading} />
            </label>
          </section>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Verification Checklist</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
            <input type="checkbox" checked={checks.info} onChange={(e) => setChecks({...checks, info: e.target.checked})} className="h-5 w-5 rounded border-slate-300 text-[#1356a1] focus:ring-[#1356a1]" />
            <span className="text-sm font-medium text-slate-700">Patient, insurance, and service information verified</span>
          </label>
          <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
            <input type="checkbox" checked={checks.docs} onChange={(e) => setChecks({...checks, docs: e.target.checked})} className="h-5 w-5 rounded border-slate-300 text-[#1356a1] focus:ring-[#1356a1]" />
            <span className="text-sm font-medium text-slate-700">Clinical evidence matches diagnosis and indication</span>
          </label>
          <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
            <input type="checkbox" checked={checks.ready} onChange={(e) => setChecks({...checks, ready: e.target.checked})} className="h-5 w-5 rounded border-slate-300 text-[#1356a1] focus:ring-[#1356a1]" />
            <span className="text-sm font-medium text-slate-700">Request is complete and ready for submission to payer</span>
          </label>
        </div>

        <div className="mt-8 flex items-center justify-end gap-4 border-t pt-6">
          <button onClick={() => router.back()} className="rounded-md px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
          <button disabled={!allChecked || isSubmitting} onClick={handleSubmit} className="flex items-center gap-2 rounded-md bg-[#1356a1] px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {request.status === 'Additional Info Requested' ? 'Resubmit to Mock Payer' : 'Submit to Mock Payer'}
          </button>
        </div>
      </section>
    </div>
  );
}
