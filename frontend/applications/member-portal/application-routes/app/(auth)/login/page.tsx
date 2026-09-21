'use client'

import { useAuthStore } from '@/features/auth/store'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import Image from 'next/image'
import { ArrowRight, Loader2, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const login = useAuthStore(state => state.login)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    try {
      await login({ email: fd.get('email') as string, password: fd.get('password') as string })
      const role = useAuthStore.getState().role
      if (role === 'AUTHORIZATION_SPECIALIST') router.push('/specialist/dashboard')
      else if (role === 'PROVIDER') router.push('/provider/dashboard')
      else if (role === 'BILLING') router.push('/billing/dashboard')
      else if (role === 'OPS_MANAGER') router.push('/manager/dashboard')
      else router.push('/specialist/dashboard')
    } catch (err) {
      setError('Invalid email or password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemo = (email: string) => {
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passInput = document.getElementById('password') as HTMLInputElement;
    if (emailInput && passInput) {
      emailInput.value = email;
      passInput.value = 'password123';
    }
  }

  return (
    <div className="grid min-h-screen bg-[#f7fafc] lg:grid-cols-[1.12fr_0.88fr]">
      <div className="relative hidden min-h-[420px] overflow-hidden bg-[#dceffc] lg:block">
        <Image src="/loginpage.png" alt="PA360 intelligent prior authorization platform" fill priority sizes="56vw" className="object-cover object-center" />
      </div>

      <div className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16 xl:px-24">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 text-[#1356a1]">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e0f3fb] text-[#1356a1]"><ShieldCheck className="h-6 w-6" /></span>
            <div>
              <p className="text-2xl font-extrabold tracking-tight">PA360</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#62809b]">Prior authorization workspace</p>
            </div>
          </div>

          <div className="mt-12">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1489b3]">Welcome back</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#102b3f]">Sign in to your workspace</h1>
            <p className="mt-3 text-sm leading-6 text-[#617184]">Access authorizations, clinical documents, and real-time workflow updates.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-9 space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#142334]">Email address</label>
              <input id="email" name="email" type="email" autoComplete="email" required className="mt-2 block h-12 w-full rounded-lg border border-[#cbdce6] bg-white px-4 text-sm text-[#142334] shadow-sm outline-none transition focus:border-[#12a8c7] focus:ring-4 focus:ring-[#12a8c7]/15" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-semibold text-[#142334]">Password</label>
                <button type="button" className="text-xs font-semibold text-[#1489b3] hover:text-[#102b3f]">Forgot password?</button>
              </div>
              <input id="password" name="password" type="password" autoComplete="current-password" required className="mt-2 block h-12 w-full rounded-lg border border-[#cbdce6] bg-white px-4 text-sm text-[#142334] shadow-sm outline-none transition focus:border-[#12a8c7] focus:ring-4 focus:ring-[#12a8c7]/15" />
            </div>

            {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <button type="submit" disabled={isLoading} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#1264a3] px-3 text-sm font-bold text-white shadow-[0_8px_18px_rgba(18,100,163,0.2)] transition hover:bg-[#0d4f83] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1264a3] disabled:cursor-not-allowed disabled:opacity-70">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <div className="mt-10 border-t border-[#dce6eb] pt-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8093a4]">Quick demo access</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => fillDemo('specialist@pa360.demo')} className="rounded-lg border border-[#cbdce6] bg-white px-3 py-2.5 text-sm font-semibold text-[#27465c] transition hover:border-[#12a8c7] hover:bg-[#f1fbfd]">Specialist</button>
              <button type="button" onClick={() => fillDemo('provider@pa360.demo')} className="rounded-lg border border-[#cbdce6] bg-white px-3 py-2.5 text-sm font-semibold text-[#27465c] transition hover:border-[#12a8c7] hover:bg-[#f1fbfd]">Provider</button>
              <button type="button" onClick={() => fillDemo('billing@pa360.demo')} className="rounded-lg border border-[#cbdce6] bg-white px-3 py-2.5 text-sm font-semibold text-[#27465c] transition hover:border-[#12a8c7] hover:bg-[#f1fbfd]">Billing</button>
              <button type="button" onClick={() => fillDemo('manager@pa360.demo')} className="rounded-lg border border-[#cbdce6] bg-white px-3 py-2.5 text-sm font-semibold text-[#27465c] transition hover:border-[#12a8c7] hover:bg-[#f1fbfd]">Manager</button>
            </div>
          </div>

          <p className="mt-10 text-center text-xs text-[#8a9aa8]">Protected workspace for prior authorization teams</p>
        </div>
      </div>
    </div>
  )
}