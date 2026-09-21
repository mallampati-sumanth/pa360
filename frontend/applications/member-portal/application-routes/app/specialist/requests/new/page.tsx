'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, FileText, Search, ShieldCheck, Sparkles, UploadCloud } from 'lucide-react'
import { authorizationEndpoints } from '@/shared/endpoints'
import { useCheckCompleteness, useCreateRequest, usePARequirementCheck, usePatient, usePatients, usePayers, usePlans, useProviders, useServices } from '@/features/authorization-workspace/hooks'

type Option = Record<string, any>
const steps = ['Identify', 'Determine PA', 'Gather information', 'Prepare request', 'Human review']

export default function NewAuthorizationPage() {
  const [form, setForm] = useState({ patient: '', provider: '', payer: '', plan: '', service_codes: [] as string[], diagnosis: '', clinical_indication: '' })
  const [caseId, setCaseId] = useState('')
  const [caseIds, setCaseIds] = useState<string[]>([])
  const [result, setResult] = useState<any>(null)
  const [step, setStep] = useState(1)
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const patientQuery = usePatients(); const selectedPatientQuery = usePatient(selectedPatientId); const providerQuery = useProviders(); const payerQuery = usePayers(); const planQuery = usePlans(); const serviceQuery = useServices()
  const patients = toOptions(patientQuery.data); const providers = toOptions(providerQuery.data); const payers = toOptions(payerQuery.data); const plans = toOptions(planQuery.data); const services = toOptions(serviceQuery.data)
  const createRequest = useCreateRequest(); const checkRequirement = usePARequirementCheck(); const checkComplete = useCheckCompleteness()
  const selectedPlan = useMemo(() => plans.find((item: Option) => item.plan_id === form.plan), [plans, form.plan])
  const setField = (key: string, value: string | string[]) => setForm((current) => ({ ...current, [key]: value }))
  const selectPatient = (patientId: string) => {
    setSelectedPatientId(patientId)
    const patient = patients.find((item: Option) => item.patient_id === patientId)
    const plan = plans.find((item: Option) => item.plan_id === patient?.plan_id)
    setForm((current) => ({
      ...current,
      patient: patientId,
      plan: patient?.plan_id ?? '',
      payer: plan?.payer ?? plan?.payer_id ?? '',
    }))
  }
  const selectedPatient = selectedPatientQuery.data ?? patients.find((item: Option) => item.patient_id === selectedPatientId)
  const suggestedProviderIds = new Set((selectedPatient?.provider_suggestions ?? []).map((item: Option) => item.provider__provider_id))
  const orderedProviders = [...providers].sort((left: Option, right: Option) => Number(suggestedProviderIds.has(right.provider_id)) - Number(suggestedProviderIds.has(left.provider_id)))

  async function identifyCase() {
    const { service_codes, ...requestFields } = form
    const createdCases = await Promise.all(service_codes.map((service_code) => createRequest.mutateAsync({ ...requestFields, service_code })))
    const requirementResults = await Promise.all(createdCases.map((created) => checkRequirement.mutateAsync(created.authorization_id)))
    setCaseIds(createdCases.map((created) => created.authorization_id))
    setCaseId(createdCases[0].authorization_id)
    setResult({
      is_required: requirementResults.some((item) => item.is_required),
      needs_review: requirementResults.some((item) => item.needs_review),
      reason: requirementResults.map((item, index) => `${form.service_codes[index]}: ${item.reason}`).join(' '),
    })
    setStep(2)
  }
  async function checkInformation() { 
    await Promise.all(caseIds.map((id) => checkComplete.mutateAsync(id)))
  }
  async function runAIAnalysis() {
    await authorizationEndpoints.aiAnalyze(caseId);
    setStep(4);
  }
  async function sendToReview() { await Promise.all(caseIds.map((id) => authorizationEndpoints.approveForSubmission(id, { verified: { information: true, documents: true, readiness: true } }))); setStep(5) }
  const ready = Boolean(form.patient && form.provider && form.payer && form.plan && form.service_codes.length && form.diagnosis && form.clinical_indication)

  return <div className="mx-auto max-w-6xl space-y-6">
    <header className="flex items-center gap-3"><Link href="/specialist/dashboard" className="rounded-md p-2 text-slate-500 hover:bg-slate-100"><ArrowLeft className="h-5 w-5" /></Link><div><p className="text-sm font-medium text-[#1769aa]">Authorization workspace</p><h1 className="text-2xl font-semibold text-slate-900">New prior authorization</h1></div></header>
    <div className="grid grid-cols-5 gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">{steps.map((label, index) => <div key={label} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${step === index + 1 ? 'bg-blue-50 font-semibold text-[#1769aa]' : step > index + 1 ? 'text-emerald-600' : 'text-slate-400'}`}><span className="flex h-6 w-6 items-center justify-center rounded-full border text-xs">{step > index + 1 ? <Check className="h-4 w-4" /> : index + 1}</span>{label}</div>)}</div>
    {step === 1 && <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]"><section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold text-slate-900">Identify the case</h2><p className="mt-1 text-sm text-slate-500">Select a patient ID and one or more requested services.</p>{patientQuery.isError && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">Patient data could not be loaded. Refresh after starting the Django backend.</p>}<div className="mt-6 grid gap-5 md:grid-cols-2"><Select label="Patient ID" value={form.patient} onChange={selectPatient} options={patients} id="patient_id" name="patient_id" placeholder={patientQuery.isLoading ? 'Loading patient IDs...' : 'Select patient ID...'} /><ReadOnlyField label="Patient name" value={selectedPatient?.name || ''} placeholder="Auto-filled after selecting patient ID" /><Select label="Ordering provider" value={form.provider} onChange={(v) => setField('provider', v)} options={orderedProviders} id="provider_id" name="provider_name" placeholder="Select provider..." /><Select label="Payer" value={form.payer} onChange={(v) => setField('payer', v)} options={payers} id="payer_id" name="payer_name" placeholder="Select payer..." /><Select label="Plan" value={form.plan} onChange={(v) => setField('plan', v)} options={plans} id="plan_id" name="plan_name" placeholder="Select plan..." /><MultiSelect label="Requested services" value={form.service_codes} onChange={(v) => setField('service_codes', v)} options={services} id="service_code" name="service_name" placeholder="Select one or more services..." /><Field label="Diagnosis" value={form.diagnosis} onChange={(v) => setField('diagnosis', v)} placeholder="ICD-10 or clinical diagnosis" /><div className="md:col-span-2"><Field label="Clinical indication" value={form.clinical_indication} onChange={(v) => setField('clinical_indication', v)} placeholder="Why are these services needed?" area /></div></div>{selectedPatient && <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm"><p className="font-semibold text-[#1356a1]">Patient coverage loaded</p><p className="mt-1 text-slate-700">{selectedPatient.name} · Insurance {selectedPatient.insurance_id || 'Not recorded'}</p><p className="mt-1 text-slate-600">Plan and payer were resolved from the patient record. Providers previously used for this patient are shown first.</p></div>}<button disabled={!ready || createRequest.isPending || checkRequirement.isPending} onClick={identifyCase} className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#1356a1] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><ShieldCheck className="h-4 w-4" />{createRequest.isPending ? 'Creating cases...' : 'Check authorization requirement'}</button></section><aside className="space-y-4"><InfoCard icon={Search} title="Rules first" text="Each selected service is checked against the patient's coverage rules." /><InfoCard icon={Sparkles} title="AI stays assistive" text="AI can flag missing evidence, but a human verifies every submission." /></aside></div>}
    {step === 2 && <ResultCard result={result} onContinue={() => setStep(3)} />}
    {step === 3 && <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"><section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex justify-between"><div><h2 className="text-lg font-semibold text-slate-900">Gather required information</h2><p className="mt-1 text-sm text-slate-500">The case tells you exactly what is missing.</p></div><FileText className="h-6 w-6 text-[#1769aa]" /></div><div className="mt-6 space-y-3">{['Patient information', 'Insurance and plan', 'Ordering provider', 'Diagnosis and clinical indication', 'Clinical note', 'Supporting service report'].map((label, index) => <div key={label} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm"><span className="flex items-center gap-3">{index < 4 ? <Check className="h-4 w-4 text-emerald-600" /> : <span className="h-4 w-4 rounded-full border-2 border-amber-400" />}{label}</span>{index >= 4 && <span className="text-xs font-semibold text-amber-600">Missing</span>}</div>)}</div><div className="mt-6 rounded-lg border-2 border-dashed border-slate-300 p-6 text-center"><UploadCloud className="mx-auto h-7 w-7 text-slate-400" /><p className="mt-2 text-sm font-medium">Upload clinical evidence</p><p className="mt-1 text-xs text-slate-500">Demo mode keeps the workflow local.</p></div><button onClick={checkInformation} className="mt-6 rounded-md bg-[#1356a1] px-5 py-2.5 text-sm font-semibold text-white">Run completeness check</button></section><InfoCard icon={Sparkles} title="AI document review" text="Extract diagnosis, symptoms, treatment history, and evidence for specialist review." /></section>}
    {step === 4 && <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm"><h2 className="text-xl font-semibold text-slate-900">Requests prepared</h2><p className="mt-1 text-sm text-slate-500">{caseIds.length} authorization case{caseIds.length === 1 ? '' : 's'} ready for the human checkpoint.</p><div className="mt-6 grid gap-4 md:grid-cols-2"><Summary label="Patient" value={`${form.patient} — ${find(patients, 'patient_id', form.patient, 'name')}`} /><Summary label="Payer and plan" value={`${find(payers, 'payer_id', form.payer, 'payer_name')} · ${selectedPlan?.plan_name ?? form.plan}`} /><Summary label="Requested services" value={form.service_codes.map((code) => find(services, 'service_code', code, 'service_name')).join(', ')} /><Summary label="PA determination" value={result?.is_required ? 'Prior authorization required for at least one service' : 'Not required'} /></div><div className="mt-6 rounded-lg bg-blue-50 p-5"><div className="flex items-center gap-2 font-semibold text-[#1769aa]"><Sparkles className="h-4 w-4" />Human-in-the-loop checkpoint</div><p className="mt-2 text-sm text-slate-600">Verify all evidence before sending the cases for review.</p></div><button onClick={sendToReview} className="mt-6 rounded-md bg-[#1356a1] px-5 py-2.5 text-sm font-semibold text-white">Submit for human review</button></section>}
    {step === 5 && <section className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm"><Check className="mx-auto h-12 w-12 rounded-full bg-emerald-100 p-3 text-emerald-600" /><h2 className="mt-4 text-2xl font-semibold text-slate-900">Human review started</h2><p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">The authorization is ready for verification before mock payer submission.</p><Link href={`/specialist/requests/${caseId}`} className="mt-6 inline-flex rounded-md bg-[#1356a1] px-5 py-2.5 text-sm font-semibold text-white">Open review workspace</Link></section>}
  </div>
}

function Select({ label, value, onChange, options, id, name, placeholder }: { label: string; value: string; onChange: (v: string) => void; options: Option[]; id: string; name: string; placeholder: string }) { return <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-md border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-[#1769aa]"><option value="">{placeholder}</option>{options.map((option) => <option key={option[id]} value={option[id]}>{option[name]}</option>)}</select></label> }
function MultiSelect({ label, value, onChange, options, id, name, placeholder }: { label: string; value: string[]; onChange: (v: string[]) => void; options: Option[]; id: string; name: string; placeholder: string }) {
  return <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">{label}<select multiple value={value} onChange={(event) => onChange(Array.from(event.target.selectedOptions, (option) => option.value))} className="min-h-28 rounded-md border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-[#1769aa]" aria-label={placeholder}>{options.map((option) => <option key={option[id]} value={option[id]}>{option[name]}</option>)}</select><span className="text-xs font-normal text-slate-500">{value.length ? `${value.length} service${value.length === 1 ? '' : 's'} selected` : placeholder}</span></label>
}
function ReadOnlyField({ label, value, placeholder }: { label: string; value: string; placeholder: string }) { return <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">{label}<input value={value} readOnly placeholder={placeholder} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700 outline-none" /></label> }
function Field({ label, value, onChange, placeholder, area = false }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; area?: boolean }) { return <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">{label}{area ? <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={3} className="rounded-md border border-slate-300 px-3 py-2.5 outline-none focus:border-[#1769aa]" /> : <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="rounded-md border border-slate-300 px-3 py-2.5 outline-none focus:border-[#1769aa]" />}</label> }
function InfoCard({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) { return <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><Icon className="h-5 w-5 text-[#1769aa]" /><h3 className="mt-3 font-semibold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></div> }
function ResultCard({ result, onContinue }: { result: any; onContinue: () => void }) { const review = result?.needs_review; const required = result?.is_required; return <section className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm"><div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${review ? 'bg-amber-100 text-amber-600' : required ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>{required || review ? <ShieldCheck className="h-7 w-7" /> : <Check className="h-7 w-7" />}</div><h2 className="mt-5 text-2xl font-semibold text-slate-900">{review ? 'Review required' : required ? 'Prior authorization required' : 'Prior authorization not required'}</h2><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">{result?.reason || 'The deterministic rules engine returned a result for this case.'}</p><button onClick={onContinue} className="mt-7 rounded-md bg-[#1356a1] px-5 py-2.5 text-sm font-semibold text-white">Continue to information</button></section> }
function Summary({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-slate-200 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-2 text-sm font-medium text-slate-800">{value}</p></div> }
function find(items: Option[], id: string, value: string, name: string) { return items.find((item) => item[id] === value)?.[name] ?? value }
function toOptions(value: any): Option[] { return Array.isArray(value) ? value : Array.isArray(value?.results) ? value.results : [] }
