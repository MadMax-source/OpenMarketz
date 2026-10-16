'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { KeyRound, Laptop, ShieldCheck, Smartphone } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { AccountShell, Card } from '@/components/account/account-shell'
import { Field, FormAlert, PasswordInput, PasswordStrength, SubmitButton, isStrongPassword } from '@/components/forms'
import { Switch } from '@/components/ui/switch'

export function SecurityView() {
  return (
    <AccountShell title="Login & security" description="Keep your account and payments safe.">
      <div className="flex flex-col gap-6">
        <PasswordCard />
        <TwoFactorCard />
        <SessionsCard />
      </div>
    </AccountShell>
  )
}

function PasswordCard() {
  const { changePassword } = useAuth()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!current) return setError('Enter your current password')
    if (!isStrongPassword(next)) return setError('New password does not meet the requirements')
    if (next !== confirm) return setError('New passwords do not match')
    if (next === current) return setError('Choose a password different from your current one')
    setLoading(true)
    const res = await changePassword(current, next)
    setLoading(false)
    if (!res.ok) return setError(res.error)
    setCurrent(''); setNext(''); setConfirm('')
    toast.success('Password changed')
  }

  return (
    <Card title="Change password" description="Use at least 8 characters with a mix of letters, numbers and symbols.">
      <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-4">
        {error && <FormAlert>{error}</FormAlert>}
        <Field label="Current password" htmlFor="sec-current">
          <PasswordInput id="sec-current" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        </Field>
        <Field label="New password" htmlFor="sec-new" hint={next ? <PasswordStrength password={next} /> : undefined}>
          <PasswordInput id="sec-new" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
        </Field>
        <Field label="Confirm new password" htmlFor="sec-confirm">
          <PasswordInput id="sec-confirm" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </Field>
        <SubmitButton loading={loading} className="w-fit px-6">
          <KeyRound className="size-4" aria-hidden="true" />
          Update password
        </SubmitButton>
      </form>
    </Card>
  )
}

function TwoFactorCard() {
  const { user, updateProfile } = useAuth()
  if (!user) return null
  return (
    <Card>
      <div className="flex items-start gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
        </span>
        <div className="flex-1">
          <p className="font-semibold">Two-step verification</p>
          <p className="text-sm text-muted-foreground">
            {`We'll send a one-time code to ${user.phone ? 'your phone' : 'your email'} when you sign in from a new device.`}
          </p>
        </div>
        <Switch
          checked={user.twoFactor}
          aria-label="Two-step verification"
          onCheckedChange={(v) => {
            updateProfile({ twoFactor: v })
            toast.success(v ? 'Two-step verification on' : 'Two-step verification off')
          }}
        />
      </div>
    </Card>
  )
}

function SessionsCard() {
  const [sessions, setSessions] = useState([
    { id: 'cur', device: 'Chrome on this device', place: 'Lagos, Nigeria', when: 'Active now', icon: Laptop, current: true },
    { id: 'm1', device: 'OpenMarketz app · iPhone', place: 'Lagos, Nigeria', when: '2 days ago', icon: Smartphone, current: false },
  ])
  return (
    <Card title="Where you're signed in">
      <ul className="divide-y">
        {sessions.map((s) => (
          <li key={s.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <s.icon className="size-5 text-muted-foreground" aria-hidden="true" />
            <div className="flex-1 text-sm">
              <p className="font-medium">{s.device}</p>
              <p className="text-muted-foreground">{`${s.place} · ${s.when}`}</p>
            </div>
            {s.current ? (
              <span className="text-xs font-medium text-primary">This device</span>
            ) : (
              <button
                type="button"
                onClick={() => { setSessions((p) => p.filter((x) => x.id !== s.id)); toast('Signed out of device') }}
                className="h-9 rounded-lg border px-3 text-sm hover:bg-muted"
              >
                Sign out
              </button>
            )}
          </li>
        ))}
      </ul>
    </Card>
  )
}
