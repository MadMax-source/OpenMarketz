'use client'

import { useId, useState } from 'react'
import { CheckCircle2, Mail } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { Field, FormAlert, Select, SubmitButton, inputClass, isEmail } from '@/components/forms'
import { cn } from '@/lib/utils'

export const SUPPORT_EMAIL = 'support@openmarketz.ng'

const topics = ['Order & delivery', 'Payment or refund', 'Problem with a seller', 'Open Market request', 'Account & login', 'Selling on OpenMarketz', 'Something else']

export function ComplaintForm({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth()
  const uid = useId()
  const [name, setName] = useState(user ? `${user.firstName} ${user.lastName}` : '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [topic, setTopic] = useState(topics[0])
  const [orderId, setOrderId] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [ticket, setTicket] = useState<string | null>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const err: Record<string, string> = {}
    if (name.trim().length < 2) err.name = 'Enter your name.'
    if (!isEmail(email)) err.email = 'Enter a valid email so we can reply.'
    if (message.trim().length < 20) err.message = 'Tell us a bit more (20+ characters).'
    setErrors(err)
    if (Object.keys(err).length) return
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setTicket(`TCK-${Math.floor(100000 + Math.random() * 899999)}`)
    }, 900)
  }

  if (ticket) {
    const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`[${ticket}] ${topic}`)}&body=${encodeURIComponent(message)}`
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center" role="status">
        <CheckCircle2 className="size-10 text-primary" aria-hidden="true" />
        <h3 className="font-display text-xl font-semibold">Complaint received</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          {`Your ticket number is ${ticket}. We sent a copy to ${email} and will reply within 24 hours.`}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <a href={mailto} className="flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-medium hover:bg-muted">
            <Mail className="size-4" aria-hidden="true" />
            Open in email app
          </a>
          <button
            type="button"
            onClick={() => {
              setTicket(null)
              setMessage('')
              setOrderId('')
            }}
            className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            Send another
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <div className={cn('grid gap-4', !compact && 'sm:grid-cols-2')}>
        <Field label="Your name" htmlFor={`${uid}-name`} error={errors.name}>
          <input id={`${uid}-name`} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} aria-invalid={!!errors.name} autoComplete="name" />
        </Field>
        <Field label="Email" htmlFor={`${uid}-email`} error={errors.email}>
          <input id={`${uid}-email`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} aria-invalid={!!errors.email} autoComplete="email" />
        </Field>
        <Field label="Topic" htmlFor={`${uid}-topic`}>
          <Select id={`${uid}-topic`} value={topic} onChange={(e) => setTopic(e.target.value)}>
            {topics.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Field>
        <Field label="Order or request ID" htmlFor={`${uid}-order`} optional>
          <input id={`${uid}-order`} value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="e.g. OMZ-48213" className={inputClass} />
        </Field>
      </div>
      <Field label="What happened?" htmlFor={`${uid}-msg`} error={errors.message}>
        <textarea
          id={`${uid}-msg`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={compact ? 4 : 5}
          aria-invalid={!!errors.message}
          placeholder="Describe the issue so we can help quickly…"
          className={cn(inputClass, 'h-auto resize-none py-3')}
        />
      </Field>
      {!compact && <FormAlert tone="info">{`We reply by email within 24 hours. You can also write to us directly at ${SUPPORT_EMAIL}.`}</FormAlert>}
      <SubmitButton loading={sending}>Send complaint</SubmitButton>
    </form>
  )
}
