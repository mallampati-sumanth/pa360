'use client';
import { useAuthorizationRequest } from '@/features/authorization-workspace/hooks';
import { authorizationEndpoints } from '@/shared/endpoints';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardBody, StatusBadge, EdgeCaseBadge, PriorityBadge } from '@/components/ui';
import { StatusTimeline } from '@/components/status/StatusTimeline';
import Link from 'next/link';
import { ShieldAlert, FileText, CheckCircle2, User, Building, HeartPulse, Sparkles, ClipboardList } from 'lucide-react';
import { formatDate } from '@/shared/utils';

export default function RequestDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: request, isLoading } = useAuthorizationRequest(id as string);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  async function runWorkflowAction(action: () => Promise<unknown>) {
    setActionLoading(true);
    setActionError('');
    try {
      await action();
      router.refresh();
      window.location.reload();
    } catch {
      setActionError('The workflow action could not be completed.');
    } finally {
      setActionLoading(false);
    }
  }

  if (isLoading) return <div className="flex h-96 items-center justify-center">Loading...</div>;
  if (!request) return <div className="p-8 text-center text-slate-500">Request not found</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-900">Request {request.authorization_id.slice(0, 12)}</h1>
          <StatusBadge status={request.status} />
          <PriorityBadge priority={request.priority} />
          <EdgeCaseBadge type={request.edge_case_type} />
        </div>
        <div className="flex items-center gap-3">
          {request.status === 'Draft' && (
             <Link href={`/specialist/authorizations/${id}/edit`} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Edit details</Link>
          )}
           {(request.status === 'Draft' || request.status === 'Exception – Review Required' || request.status === 'Additional Info Requested') && (
             <Link href={`/specialist/authorizations/${id}/review`} className="rounded-md bg-[#1356a1] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">Review & Submit</Link>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Workflow Progress</h2>
        <StatusTimeline currentStatus={request.status} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 font-semibold text-slate-800"><User className="h-4 w-4 text-[#1769aa]" /> Patient</div>
          <p className="mt-3 text-lg font-medium text-slate-900">{request.patient?.name || 'Unknown'}</p>
          <p className="mt-1 text-sm text-slate-500">ID: {request.patient?.patient_id}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 font-semibold text-slate-800"><Building className="h-4 w-4 text-[#1769aa]" /> Insurance</div>
          <p className="mt-3 text-lg font-medium text-slate-900">{request.payer?.payer_name || 'Unknown'}</p>
          <p className="mt-1 text-sm text-slate-500">{request.plan?.plan_name || 'Standard'}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 font-semibold text-slate-800"><HeartPulse className="h-4 w-4 text-[#1769aa]" /> Service</div>
          <p className="mt-3 text-lg font-medium text-slate-900">{request.service_code?.service_name || 'Unknown'}</p>
          <p className="mt-1 text-sm text-slate-500">Code: {request.service_code?.service_code}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 font-semibold text-slate-800"><ClipboardList className="h-4 w-4 text-[#1769aa]" /> Details</div>
          <p className="mt-3 text-sm font-medium text-slate-900 line-clamp-1" title={request.diagnosis}>{request.diagnosis}</p>
          <p className="mt-1 text-xs text-slate-500">Requested: {formatDate(request.request_date)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 font-semibold text-slate-900 mb-4"><FileText className="h-5 w-5 text-[#1769aa]" /> Clinical Documents</div>
          {(!request.documents || request.documents.length === 0) ? (
            <div className="rounded-lg border-2 border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">No documents uploaded.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {request.documents.map((doc: any) => (
                <li key={doc.document_id} className="flex justify-between py-3 text-sm">
                  <span className="font-medium text-slate-700">{doc.file_name}</span>
                  <span className="text-slate-400">{doc.document_type}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 font-semibold text-[#1356a1]"><Sparkles className="h-5 w-5" /> AI Analysis</div>
            {request.ai_confidence_score && <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#1356a1] border border-blue-200">Confidence: {Math.round(request.ai_confidence_score * 100)}%</span>}
          </div>
          {request.ai_summary ? (
            <p className="text-sm leading-6 text-slate-700">{request.ai_summary}</p>
          ) : (
            <p className="text-sm text-slate-500 italic">No AI analysis has been run on this request yet.</p>
          )}
        </div>
      </div>

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <div className="flex items-center justify-between"><div><h2 className="font-semibold text-amber-950">Mock payer response</h2><p className="mt-1 text-sm text-amber-800">Latest response from the simulated payer workflow.</p></div><span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-900">{request.payer_responses?.[0]?.response_type || 'No response yet'}</span></div>
        {request.payer_responses?.length ? <div className="mt-4 rounded-lg border border-amber-200 bg-white p-4"><p className="text-sm font-medium text-slate-800">{request.payer_responses[0].response_text}</p><p className="mt-2 text-xs text-slate-500">{request.payer_responses[0].processed ? 'Processed' : 'Awaiting follow-up'} · {formatDate(request.payer_responses[0].response_date)}</p>{request.status === 'Additional Info Requested' && <Link href={`/specialist/authorizations/${id}/review`} className="mt-4 inline-flex rounded-md bg-[#1356a1] px-4 py-2 text-sm font-semibold text-white">Continue follow-up</Link>}</div> : <p className="mt-4 text-sm text-amber-800">Submit the approved request to the mock payer to receive a response.</p>}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Post-payer workflow</h2>
        <p className="mt-1 text-sm text-slate-500">Continue the case after the payer response through delivery and revenue cycle management.</p>
        {actionError && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{actionError}</p>}
        <div className="mt-4 flex flex-wrap gap-3">
          {request.status === 'Pending' && <button disabled={actionLoading} onClick={() => runWorkflowAction(() => authorizationEndpoints.validateCoverage(id as string, { notes: 'Coverage validated for the requested service.' }))} className="rounded-md bg-cyan-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">9. Validate coverage</button>}
          {request.status === 'Coverage Validation' && <button disabled={actionLoading} onClick={() => runWorkflowAction(() => authorizationEndpoints.recordDecision(id as string))} className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">10. Record decision</button>}
          {request.status === 'Approved' && <button disabled={actionLoading} onClick={() => runWorkflowAction(() => authorizationEndpoints.recordServiceDelivery(id as string))} className="rounded-md bg-indigo-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">11. Record service delivery</button>}
          {request.status === 'Service Delivery' && <button disabled={actionLoading} onClick={() => runWorkflowAction(() => authorizationEndpoints.billingHandoff(id as string))} className="rounded-md bg-violet-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">12. Handoff to Billing / RCM</button>}
          {request.status === 'Billing / RCM' && <span className="rounded-md bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-800">Billing / RCM handoff complete</span>}
        </div>
      </section>
    </div>
  );
}
