'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Search, ShieldCheck } from 'lucide-react'
import { useCreateRequest, usePARequirementCheck, usePatient, usePatients, usePayers, usePlans, useProviders, useServices } from '@/features/authorization-workspace/hooks'
import { useRouter } from 'next/navigation'

type Option = Record<string, any>
const steps = ['Identify Case', 'Check PA Requirement', 'Next Steps']

export default function ProviderNewAuthorizationPage() {
  const router = useRouter()
  const [form, setForm] = useState({ patient: '', provider: '', payer: '', plan: '', service_codes: [] as string[], priority: 'ROUTINE', diagnosis: '', clinical_indication: '' })
  const [caseId, setCaseId] = useState('')
  const [result, setResult] = useState<any>(null)
  const [requestError, setRequestError] = useState('')
  const [step, setStep] = useState(1)
  const [selectedPatientId, setSelectedPatientId] = useState('')

  const patientQuery = usePatients(); const selectedPatientQuery = usePatient(selectedPatientId); const providerQuery = useProviders(); const payerQuery = usePayers(); const planQuery = usePlans(); const serviceQuery = useServices()
  const patients = toOptions(patientQuery.data); const providers = toOptions(providerQuery.data); const payers = toOptions(payerQuery.data); const plans = toOptions(planQuery.data); const services = toOptions(serviceQuery.data)
  
  const createRequest = useCreateRequest(); const checkRequirement = usePARequirementCheck();
  const selectedPlan = useMemo(() => plans.find((item: Option) => item.plan_id === form.plan), [plans, form.plan])
  const setField = (key: string, value: string | string[]) => setForm((current) => ({ ...current, [key]: value }))
  
  const selectPatient = (patientId: string) => {
    setSelectedPatientId(patientId)
    const patient = patients.find((item: Option) => item.patient_id === patientId)
    const plan = plans.find((item: Option) => item.plan_id === patient?.plan_id)
    const suggestedProvider = (patient?.provider_suggestions ?? [])[0]?.provider__provider_id ?? ''
    setForm((current) => ({
      ...current,
      patient: patientId,
      provider: suggestedProvider || current.provider,
      plan: patient?.plan_id ?? '',
      payer: plan?.payer ?? plan?.payer_id ?? '',
    }))
  }

  const selectedPatient = selectedPatientQuery.data ?? patients.find((item: Option) => item.patient_id === selectedPatientId)
  const suggestedProviderIds = new Set((selectedPatient?.provider_suggestions ?? []).map((item: Option) => item.provider__provider_id))
  const orderedProviders = [...providers].sort((left: Option, right: Option) => Number(suggestedProviderIds.has(right.provider_id)) - Number(suggestedProviderIds.has(left.provider_id)))

  async function identifyCase() {
    setRequestError('')
    try {
      const { service_codes, ...requestFields } = form
      const created = await createRequest.mutateAsync({ ...requestFields, service_code: service_codes[0], service_codes })
      const requirementResult = await checkRequirement.mutateAsync(created.authorization_id)
      setCaseId(created.authorization_id)
      setResult({
        is_required: requirementResult.is_required,
        services: requirementResult.services,
      })
      setStep(2)
    } catch (error: any) {
      const detail = error?.response?.data
      setRequestError(typeof detail === 'object' ? Object.entries(detail).map(([field, message]) => `${field}: ${Array.isArray(message) ? message.join(', ') : message}`).join(' ') : 'The request could not be created. Check the selected patient, coverage, provider, and services.')
    }
  }

  const ready = Boolean(form.patient && form.provider && form.payer && form.plan && form.service_codes.length && form.diagnosis && form.clinical_indication)

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex items-center gap-3">
        <Link href="/provider/status" className="rounded-md p-2 text-slate-500 hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="text-sm font-medium text-[#1769aa]">Provider Workspace</p>
          <h1 className="text-2xl font-semibold text-slate-900">New Service Request</h1>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        {steps.map((label, index) => (
          <div key={label} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${step === index + 1 ? 'bg-blue-50 font-semibold text-[#1769aa]' : step > index + 1 ? 'text-emerald-600' : 'text-slate-400'}`}>
            <span className="flex h-6 w-6 items-center justify-center rounded-full border text-xs">
              {step > index + 1 ? <Check className="h-4 w-4" /> : index + 1}
            </span>
            {label}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Identify the case</h2>
            <p className="mt-1 text-sm text-slate-500">Select the patient, coverage, provider, and one or more requested services.</p>
            {patientQuery.isError && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">Patient data could not be loaded.</p>}
            {requestError && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{requestError}</p>}
            
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <PatientSelect label="Patient ID" value={form.patient} onChange={selectPatient} options={patients} placeholder={patientQuery.isLoading ? 'Loading...' : 'Select Patient ID...'} />
              <ReadOnlyField label="Patient Name" value={selectedPatient?.name || ''} placeholder="Auto-filled on patient selection" />
              <Select label="Ordering provider" value={form.provider} onChange={(v) => setField('provider', v)} options={orderedProviders} id="provider_id" name="provider_name" placeholder="Select provider..." />
              <Select label="Payer" value={form.payer} onChange={(v) => setField('payer', v)} options={payers} id="payer_id" name="payer_name" placeholder="Select payer..." />
              <Select label="Plan" value={form.plan} onChange={(v) => setField('plan', v)} options={plans} id="plan_id" name="plan_name" placeholder="Select plan..." />
              <Select label="Case priority" value={form.priority} onChange={(v) => setField('priority', v)} options={[{ priority: 'ROUTINE', label: 'Normal' }, { priority: 'URGENT', label: 'Critical' }]} id="priority" name="label" placeholder="Select priority..." />
              <MultiSelect label="Requested services" value={form.service_codes} onChange={(v) => setField('service_codes', v)} options={services} id="service_code" name="service_name" placeholder="Select one or more services..." />
              <Field label="Diagnosis" value={form.diagnosis} onChange={(v) => setField('diagnosis', v)} placeholder="ICD-10 or clinical diagnosis" />
              <div className="md:col-span-2">
                <Field label="Clinical indication" value={form.clinical_indication} onChange={(v) => setField('clinical_indication', v)} placeholder="Why is this service needed?" area />
              </div>
            </div>

            <button disabled={!ready || createRequest.isPending || checkRequirement.isPending} onClick={identifyCase} className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#1356a1] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              <ShieldCheck className="h-4 w-4" />
              {createRequest.isPending ? 'Creating cases...' : 'Check authorization requirement'}
            </button>
          </section>
          
          <aside className="space-y-4">
            <InfoCard icon={Search} title="Real-time PA Rules" text="Instantly verify if a service requires prior authorization before proceeding." />
          </aside>
        </div>
      )}

      {step === 2 && (
        <section className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${result?.services?.some((service: any) => service.is_required) ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
            {result?.services?.some((service: any) => service.is_required) ? <ShieldCheck className="h-7 w-7" /> : <Check className="h-7 w-7" />}
          </div>
          <h2 className="mt-5 text-2xl font-semibold text-slate-900">
            {result?.services?.some((service: any) => service.is_required) ? 'Service authorization results' : 'Treatment can proceed'}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">Services that do not require prior authorization can proceed directly. Only required services are sent to the PA Specialist.</p>
          <div className="mt-6 space-y-3 text-left">
            {result?.services?.map((service: any) => <div key={service.service_code} className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 p-4"><div><p className="font-semibold text-slate-900">{service.service_name}</p><p className="mt-1 text-sm text-slate-500">{service.reason}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${service.is_required ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{service.is_required ? 'PA required' : 'No PA required'}</span></div>)}
          </div>
          
          <div className="mt-8 flex justify-center gap-4">
            {result?.services?.some((service: any) => service.is_required) ? (
              <button onClick={() => setStep(3)} className="rounded-md bg-[#1356a1] px-5 py-2.5 text-sm font-semibold text-white">
                Send required services to PA Specialist
              </button>
            ) : null}
            {result?.services?.some((service: any) => !service.is_required) ? (
              <button onClick={() => router.push('/provider/status')} className="rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white">
                Proceed with treatment
              </button>
            ) : null}
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <Check className="mx-auto h-12 w-12 rounded-full bg-emerald-100 p-3 text-emerald-600" />
          <h2 className="mt-4 text-2xl font-semibold text-slate-900">Sent to PA Specialist</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
            This case has been routed to the PA Specialist team to gather clinical evidence and submit to the payer.
          </p>
          <button onClick={() => router.push('/provider/status')} className="mt-6 inline-flex rounded-md bg-[#1356a1] px-5 py-2.5 text-sm font-semibold text-white">
            Return to My Cases
          </button>
        </section>
      )}
    </div>
  )
}

function Select({ label, value, onChange, options, id, name, placeholder }: { label: string; value: string; onChange: (v: string) => void; options: Option[]; id: string; name: string; placeholder: string }) { return <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-md border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-[#1769aa]"><option value="">{placeholder}</option>{options.map((option) => <option key={option[id]} value={option[id]}>{option[name]}</option>)}</select></label> }
function MultiSelect({ label, value, onChange, options, id, name, placeholder }: { label: string; value: string[]; onChange: (v: string[]) => void; options: Option[]; id: string; name: string; placeholder: string }) {
  const toggleService = (serviceCode: string) => onChange(value.includes(serviceCode) ? value.filter((item) => item !== serviceCode) : [...value, serviceCode])
  return (
    <fieldset className="flex min-w-0 flex-col gap-2 text-sm font-medium text-slate-700">
      <legend>{label}</legend>
      <div className="rounded-md border border-slate-300 bg-white p-2 focus-within:border-[#1769aa]">
        <div className="max-h-44 space-y-1 overflow-y-auto" aria-label={placeholder}>
          {options.map((option) => {
            const selected = value.includes(option[id])
            return <label key={option[id]} className={`flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors ${selected ? 'bg-blue-50 text-[#1356a1]' : 'hover:bg-slate-50'}`}><input type="checkbox" checked={selected} onChange={() => toggleService(option[id])} className="h-4 w-4 accent-[#1356a1]" /><span className="truncate">{option[name]}</span></label>
          })}
        </div>
        {!options.length && <p className="px-3 py-2 text-sm font-normal text-slate-500">No services available.</p>}
      </div>
      <div className="flex min-h-6 flex-wrap gap-2">
        {value.length ? value.map((serviceCode) => { const service = options.find((option) => option[id] === serviceCode); return <span key={serviceCode} className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-[#1356a1]">{service?.[name] ?? serviceCode}</span> }) : <span className="text-xs font-normal text-slate-500">{placeholder}</span>}
      </div>
    </fieldset>
  )
}
function PatientSelect({ label, value, onChange, options, placeholder }: { label: string; value: string; onChange: (v: string) => void; options: Option[]; placeholder: string }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-md border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-[#1769aa]">
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.patient_id} value={option.patient_id}>
            {option.patient_id}
          </option>
        ))}
      </select>
    </label>
  )
}
function ReadOnlyField({ label, value, placeholder }: { label: string; value: string; placeholder: string }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
      {label}
      <input
        value={value}
        readOnly
        placeholder={placeholder}
        className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700 outline-none cursor-default"
      />
    </label>
  )
}
function Field({ label, value, onChange, placeholder, area = false }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; area?: boolean }) { return <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">{label}{area ? <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={3} className="rounded-md border border-slate-300 px-3 py-2.5 outline-none focus:border-[#1769aa]" /> : <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="rounded-md border border-slate-300 px-3 py-2.5 outline-none focus:border-[#1769aa]" />}</label> }
function InfoCard({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) { return <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><Icon className="h-5 w-5 text-[#1769aa]" /><h3 className="mt-3 font-semibold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></div> }
function toOptions(value: any): Option[] { return Array.isArray(value) ? value : Array.isArray(value?.results) ? value.results : [] }
