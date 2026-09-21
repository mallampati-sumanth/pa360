'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, FileText, Save } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthorizationRequest, usePayers, usePlans, useProviders, useServices } from '@/features/authorization-workspace/hooks'
import { authorizationEndpoints } from '@/shared/endpoints'

type Option = Record<string, any>

export default function EditAuthorizationPage() {
  const { id } = useParams()
  const router = useRouter()
  const authorizationId = id as string
  const { data: request, isLoading } = useAuthorizationRequest(authorizationId)
  const { data: providerData } = useProviders()
  const { data: payerData } = usePayers()
  const { data: planData } = usePlans()
  const { data: serviceData } = useServices()
  const [form, setForm] = useState({ provider: '', payer: '', plan: '', service_codes: [] as string[], diagnosis: '', clinical_indication: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const providers = toOptions(providerData)
  const payers = toOptions(payerData)
  const plans = toOptions(planData)
  const services = toOptions(serviceData)

  useEffect(() => {
    if (!request) return
    setForm({
      provider: request.provider?.provider_id ?? '',
      payer: request.payer?.payer_id ?? '',
      plan: request.plan?.plan_id ?? '',
      service_codes: request.requested_services?.map((service: Option) => service.service_code) ?? [request.service_code?.service_code].filter(Boolean),
      diagnosis: request.diagnosis ?? '',
      clinical_indication: request.clinical_indication ?? '',
      notes: request.notes ?? '',
    })
  }, [request])

  const setField = (key: string, value: string | string[]) => setForm((current) => ({ ...current, [key]: value }))
  const toggleService = (serviceCode: string) => setField('service_codes', form.service_codes.includes(serviceCode) ? form.service_codes.filter((item) => item !== serviceCode) : [...form.service_codes, serviceCode])

  async function saveCase() {
    setSaving(true)
    setMessage('')
    try {
      await authorizationEndpoints.update(authorizationId, { ...form, service_code: form.service_codes[0], service_codes: form.service_codes })
      setMessage('Authorization details saved.')
    } catch {
      setMessage('The authorization could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading authorization...</div>
  if (!request) return <div className="p-8 text-center text-slate-500">Authorization not found.</div>

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex items-center gap-3">
        <Link href={`/specialist/authorizations/${authorizationId}`} className="rounded-md p-2 text-slate-500 hover:bg-slate-100"><ArrowLeft className="h-5 w-5" /></Link>
        <div><p className="text-sm font-medium text-[#1769aa]">PA Specialist workspace</p><h1 className="text-2xl font-semibold text-slate-900">Edit authorization request</h1></div>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <ReadOnlyField label="Patient ID" value={request.patient?.patient_id ?? ''} />
          <ReadOnlyField label="Patient name" value={request.patient?.name ?? ''} />
          <Select label="Ordering provider" value={form.provider} onChange={(value) => setField('provider', value)} options={providers} id="provider_id" name="provider_name" placeholder="Select provider..." />
          <Select label="Payer" value={form.payer} onChange={(value) => setField('payer', value)} options={payers} id="payer_id" name="payer_name" placeholder="Select payer..." />
          <Select label="Plan" value={form.plan} onChange={(value) => setField('plan', value)} options={plans} id="plan_id" name="plan_name" placeholder="Select plan..." />
          <fieldset className="flex flex-col gap-2 text-sm font-medium text-slate-700"><legend>Requested services</legend><div className="max-h-44 space-y-1 overflow-y-auto rounded-md border border-slate-300 p-2">{services.map((service) => <label key={service.service_code} className={`flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 ${form.service_codes.includes(service.service_code) ? 'bg-blue-50 text-[#1356a1]' : 'hover:bg-slate-50'}`}><input type="checkbox" checked={form.service_codes.includes(service.service_code)} onChange={() => toggleService(service.service_code)} className="h-4 w-4 accent-[#1356a1]" />{service.service_name}</label>)}</div><span className="text-xs font-normal text-slate-500">{form.service_codes.length} service{form.service_codes.length === 1 ? '' : 's'} selected</span></fieldset>
          <Field label="Diagnosis" value={form.diagnosis} onChange={(value) => setField('diagnosis', value)} placeholder="ICD-10 or clinical diagnosis" />
          <Field label="Notes" value={form.notes} onChange={(value) => setField('notes', value)} placeholder="Specialist notes" />
          <div className="md:col-span-2"><Field label="Clinical indication" value={form.clinical_indication} onChange={(value) => setField('clinical_indication', value)} placeholder="Why are these services needed?" area /></div>
        </div>
        {message && <p className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">{message}</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={saveCase} disabled={saving || !form.service_codes.length} className="inline-flex items-center gap-2 rounded-md bg-[#1356a1] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save authorization'}</button>
          <Link href={`/specialist/authorizations/${authorizationId}`} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700"><FileText className="h-4 w-4" />Manage documents</Link>
          <Link href={`/specialist/authorizations/${authorizationId}/review`} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white"><Check className="h-4 w-4" />Continue to review</Link>
        </div>
      </section>
    </div>
  )
}

function Select({ label, value, onChange, options, id, name, placeholder }: { label: string; value: string; onChange: (value: string) => void; options: Option[]; id: string; name: string; placeholder: string }) { return <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-md border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-[#1769aa]"><option value="">{placeholder}</option>{options.map((option) => <option key={option[id]} value={option[id]}>{option[name]}</option>)}</select></label> }
function ReadOnlyField({ label, value }: { label: string; value: string }) { return <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">{label}<input value={value} readOnly className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700 outline-none" /></label> }
function Field({ label, value, onChange, placeholder, area = false }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; area?: boolean }) { return <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">{label}{area ? <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={4} className="rounded-md border border-slate-300 px-3 py-2.5 outline-none focus:border-[#1769aa]" /> : <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="rounded-md border border-slate-300 px-3 py-2.5 outline-none focus:border-[#1769aa]" />}</label> }
function toOptions(value: any): Option[] { return Array.isArray(value) ? value : Array.isArray(value?.results) ? value.results : [] }
