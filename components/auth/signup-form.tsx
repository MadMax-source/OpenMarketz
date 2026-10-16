'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { ArrowLeft, MailCheck } from 'lucide-react'
import { DEMO_CODE, useAuth, type Gender } from '@/components/auth-provider'
import {
  Field, FormAlert, OtpInput, PasswordInput, PasswordStrength, Select, SubmitButton, inputClass, isEmail, isStrongPassword,
} from '@/components/forms'
import { countries, getCountry, maxBirthDate, yearsSince, type CountryCode } from '@/lib/geo'
import { cn } from '@/lib/utils'

type Form = {
  firstName: string
  lastName: string
  email: string
  password: string
  confirm: string
  phone: string
  country: CountryCode
  region: string
  birthDate: string
  gender: Gender
  terms: boolean
  marketing: boolean
}

type Errors = Partial<Record<keyof Form, string>>

const MIN_AGE = 16

export function SignupForm() {
  const { signUp, verifyEmail, isEmailTaken } = useAuth()
  const router = useRouter()
  const next = useSearchParams().get('next') || '/account'
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [code, setCode] = useState('')
  const [form, setForm] = useState<Form>({
    firstName: '', lastName: '', email: '', password: '', confirm: '',
    phone: '', country: 'NG', region: '', birthDate: '', gender: 'prefer-not', terms: false, marketing: true,
  })
  const country = getCountry(form.country)
  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function validateStep1() {
    const e: Errors = {}
    if (form.firstName.trim().length < 2) e.firstName = 'Enter your first name'
    if (form.lastName.trim().length < 2) e.lastName = 'Enter your last name'
    if (!isEmail(form.email)) e.email = 'Enter a valid email address'
    else if (isEmailTaken(form.email)) e.email = 'This email already has an account. Try signing in.'
    if (!isStrongPassword(form.password)) e.password = 'Use 8+ characters with an uppercase letter and a number'
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateStep2() {
    const e: Errors = {}
    const digits = form.phone.replace(/\D/g, '')
    if (digits.length < 7 || digits.length > 11) e.phone = 'Enter a valid phone number'
    if (!form.region) e.region = `Select your ${country.regionLabel.toLowerCase()}`
    if (!form.birthDate) e.birthDate = 'Enter your date of birth'
    else if (yearsSince(form.birthDate) < MIN_AGE) e.birthDate = `You must be at least ${MIN_AGE} years old`
    if (!form.terms) e.terms = 'Please accept the terms to continue'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    if (step === 1) {
      if (validateStep1()) setStep(2)
      return
    }
    if (step === 2) {
      if (!validateStep2()) return
      setLoading(true)
      const { confirm: _c, terms: _t, ...rest } = form
      const res = await signUp({ ...rest, firstName: rest.firstName.trim(), lastName: rest.lastName.trim() })
      setLoading(false)
      if (!res.ok) return setFormError(res.error)
      setStep(3)
      toast(`Verification code sent to ${form.email}`, { description: `Demo code: ${DEMO_CODE}` })
      return
    }
    if (code.length !== 6) return setFormError('Enter the 6-digit code we sent you')
    setLoading(true)
    const res = await verifyEmail(code)
    setLoading(false)
    if (!res.ok) return setFormError(res.error)
    toast.success(`Welcome to OpenMarketz, ${form.firstName}!`)
    router.push(next.startsWith('/') ? next : '/account')
  }

  if (step === 3) {
    return (
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <div className="flex items-start gap-3 rounded-2xl border bg-muted/40 p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MailCheck className="size-5" aria-hidden="true" />
          </span>
          <div className="text-sm">
            <p className="font-medium">Verify your email</p>
            <p className="text-muted-foreground">
              {'We sent a 6-digit code to '}
              <span className="font-medium text-foreground">{form.email}</span>
              {'. It expires in 10 minutes.'}
            </p>
          </div>
        </div>
        {formError && <FormAlert>{formError}</FormAlert>}
        <OtpInput value={code} onChange={setCode} invalid={Boolean(formError)} />
        <SubmitButton loading={loading}>Verify and continue</SubmitButton>
        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            className="font-medium text-primary hover:underline underline-offset-2"
            onClick={() => toast('A new code is on its way', { description: `Demo code: ${DEMO_CODE}` })}
          >
            Resend code
          </button>
          <Link href={next} className="text-muted-foreground hover:text-foreground">
            Skip for now
          </Link>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <ol className="flex items-center gap-2 text-xs font-medium" aria-label="Sign up progress">
        {['Account', 'About you', 'Verify'].map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2" aria-current={step === i + 1 ? 'step' : undefined}>
            <span className={cn('h-1.5 flex-1 rounded-full', i + 1 <= step ? 'bg-primary' : 'bg-muted')} />
            <span className={cn(i + 1 === step ? 'text-foreground' : 'text-muted-foreground')}>{label}</span>
          </li>
        ))}
      </ol>

      {formError && <FormAlert>{formError}</FormAlert>}

      {step === 1 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name" htmlFor="su-first" error={errors.firstName}>
              <input id="su-first" autoComplete="given-name" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} aria-invalid={Boolean(errors.firstName) || undefined} className={inputClass} />
            </Field>
            <Field label="Last name" htmlFor="su-last" error={errors.lastName}>
              <input id="su-last" autoComplete="family-name" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} aria-invalid={Boolean(errors.lastName) || undefined} className={inputClass} />
            </Field>
          </div>
          <Field label="Email address" htmlFor="su-email" error={errors.email} hint="We'll send order updates and a verification code here">
            <input id="su-email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} aria-invalid={Boolean(errors.email) || undefined} className={inputClass} />
          </Field>
          <Field label="Password" htmlFor="su-password" error={errors.password}>
            <PasswordInput id="su-password" autoComplete="new-password" value={form.password} onChange={(e) => set('password', e.target.value)} aria-invalid={Boolean(errors.password) || undefined} />
          </Field>
          <PasswordStrength password={form.password} />
          <Field label="Confirm password" htmlFor="su-confirm" error={errors.confirm}>
            <PasswordInput id="su-confirm" autoComplete="new-password" value={form.confirm} onChange={(e) => set('confirm', e.target.value)} aria-invalid={Boolean(errors.confirm) || undefined} />
          </Field>
          <SubmitButton>Continue</SubmitButton>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Country" htmlFor="su-country">
              <Select
                id="su-country"
                autoComplete="country"
                value={form.country}
                onChange={(e) => {
                  set('country', e.target.value as CountryCode)
                  set('region', '')
                }}
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </Select>
            </Field>
            <Field label={country.regionLabel} htmlFor="su-region" error={errors.region}>
              <Select id="su-region" autoComplete="address-level1" value={form.region} onChange={(e) => set('region', e.target.value)} aria-invalid={Boolean(errors.region) || undefined}>
                <option value="">{`Select ${country.regionLabel.toLowerCase()}`}</option>
                {country.regions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Phone number" htmlFor="su-phone" error={errors.phone} hint="For delivery updates and account recovery">
            <div className="flex gap-2">
              <span className="flex h-12 shrink-0 items-center rounded-xl border bg-muted/50 px-3 text-sm font-medium tabular-nums">{country.dialCode}</span>
              <input id="su-phone" type="tel" autoComplete="tel-national" inputMode="tel" placeholder="803 123 4567" value={form.phone} onChange={(e) => set('phone', e.target.value)} aria-invalid={Boolean(errors.phone) || undefined} className={inputClass} />
            </div>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date of birth" htmlFor="su-dob" error={errors.birthDate} hint="We'll send you a birthday treat">
              <input id="su-dob" type="date" autoComplete="bday" max={maxBirthDate(MIN_AGE)} value={form.birthDate} onChange={(e) => set('birthDate', e.target.value)} aria-invalid={Boolean(errors.birthDate) || undefined} className={inputClass} />
            </Field>
            <Field label="Gender" htmlFor="su-gender" optional>
              <Select id="su-gender" value={form.gender} onChange={(e) => set('gender', e.target.value as Gender)}>
                <option value="prefer-not">Prefer not to say</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </Select>
            </Field>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border p-4 text-sm">
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" checked={form.terms} onChange={(e) => set('terms', e.target.checked)} aria-invalid={Boolean(errors.terms) || undefined} className="mt-0.5 size-4 accent-primary" />
              <span>
                {'I agree to the '}
                <Link href="#" className="font-medium text-primary underline-offset-2 hover:underline">Terms of Service</Link>
                {' and '}
                <Link href="#" className="font-medium text-primary underline-offset-2 hover:underline">Privacy Policy</Link>
              </span>
            </label>
            {errors.terms && <p role="alert" className="text-xs font-medium text-deal">{errors.terms}</p>}
            <label className="flex cursor-pointer items-start gap-3 text-muted-foreground">
              <input type="checkbox" checked={form.marketing} onChange={(e) => set('marketing', e.target.checked)} className="mt-0.5 size-4 accent-primary" />
              Send me deals, price drops and new arrivals
            </label>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="flex h-12 items-center gap-1.5 rounded-xl border px-4 text-sm font-medium hover:bg-muted">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
            </button>
            <SubmitButton loading={loading} className="flex-1">
              {loading ? 'Creating account…' : 'Create account'}
            </SubmitButton>
          </div>
        </>
      )}

      <p className="text-center text-sm text-muted-foreground">
        {'Already have an account? '}
        <Link href="/login" className="font-medium text-primary hover:underline underline-offset-2">Sign in</Link>
      </p>
    </form>
  )
}
