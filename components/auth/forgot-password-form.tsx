'use client'

import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle2, KeyRound } from 'lucide-react'
import { DEMO_CODE, useAuth } from '@/components/auth-provider'
import { Field, FormAlert, OtpInput, PasswordInput, PasswordStrength, SubmitButton, inputClass, isEmail, isStrongPassword } from '@/components/forms'

export function ForgotPasswordForm() {
  const { requestPasswordReset, resetPassword } = useAuth()
  const [step, setStep] = useState<'email' | 'code' | 'done'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (step === 'email') {
      if (!isEmail(email)) return setError('Enter a valid email address')
      setLoading(true)
      await requestPasswordReset(email)
      setLoading(false)
      setStep('code')
      toast(`If an account exists for ${email}, a code is on its way`, { description: `Demo code: ${DEMO_CODE}` })
      return
    }
    if (code.length !== 6) return setError('Enter the 6-digit code from your email')
    if (!isStrongPassword(password)) return setError('Use 8+ characters with an uppercase letter and a number')
    if (password !== confirm) return setError('Passwords do not match')
    setLoading(true)
    const res = await resetPassword(email, code, password)
    setLoading(false)
    if (!res.ok) return setError(res.error)
    setStep('done')
  }

  if (step === 'done') {
    return (
      <div className="flex flex-col items-start gap-5">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="size-6" aria-hidden="true" />
        </span>
        <div>
          <p className="text-lg font-semibold">Password updated</p>
          <p className="text-sm text-muted-foreground">You can now sign in with your new password. For your security, other devices have been signed out.</p>
        </div>
        <Link href="/login" className="flex h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {error && <FormAlert>{error}</FormAlert>}
      {step === 'email' ? (
        <>
          <Field label="Email address" htmlFor="fp-email">
            <input id="fp-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </Field>
          <SubmitButton loading={loading}>Send reset code</SubmitButton>
        </>
      ) : (
        <>
          <div className="flex items-start gap-3 rounded-2xl border bg-muted/40 p-4 text-sm">
            <KeyRound className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <p className="text-muted-foreground">
              {'Enter the code sent to '}
              <span className="font-medium text-foreground">{email}</span>
              {' and choose a new password. '}
              <button type="button" onClick={() => setStep('email')} className="font-medium text-primary hover:underline underline-offset-2">
                Change email
              </button>
            </p>
          </div>
          <OtpInput value={code} onChange={setCode} />
          <Field label="New password" htmlFor="fp-pass">
            <PasswordInput id="fp-pass" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <PasswordStrength password={password} />
          <Field label="Confirm new password" htmlFor="fp-confirm">
            <PasswordInput id="fp-confirm" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </Field>
          <SubmitButton loading={loading}>Reset password</SubmitButton>
          <button type="button" onClick={() => toast('Code resent', { description: `Demo code: ${DEMO_CODE}` })} className="text-sm font-medium text-primary hover:underline underline-offset-2">
            {"Didn't get a code? Resend"}
          </button>
        </>
      )}
      <p className="text-center text-sm text-muted-foreground">
        {'Remembered it? '}
        <Link href="/login" className="font-medium text-primary hover:underline underline-offset-2">Sign in</Link>
      </p>
    </form>
  )
}
