'use client'

import Link from 'next/link'
import { useState } from 'react'
import { BadgeCheck, Check, CreditCard, Landmark, ShieldCheck, Smartphone, Truck } from 'lucide-react'
import { formatPrice, getSeller } from '@/lib/data'
import { countries } from '@/lib/geo'
import { useAuth } from '@/components/auth-provider'
import { useOpenMarket } from '@/components/open-market/open-market-provider'
import { Field, Select, SubmitButton, inputClass } from '@/components/forms'
import { cn } from '@/lib/utils'

const methods = [
  { id: 'card', label: 'Card', icon: CreditCard },
  { id: 'transfer', label: 'Bank transfer', icon: Landmark },
  { id: 'ussd', label: 'USSD', icon: Smartphone },
] as const

export function OfferCheckout({ responseId }: { responseId: string }) {
  const { user } = useAuth()
  const { responses, requests, acceptResponse } = useOpenMarket()
  const response = responses.find((r) => r.id === responseId)
  const request = requests.find((r) => r.id === response?.requestId)
  const seller = response ? getSeller(response.sellerId) : undefined

  const [name, setName] = useState(user ? `${user.firstName} ${user.lastName}` : '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [state, setState] = useState(user?.region ?? '')
  const [address, setAddress] = useState('')
  const [method, setMethod] = useState<(typeof methods)[number]['id']>('card')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [ref, setRef] = useState('')

  if (!response || !request || !seller) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold">Offer not found</h1>
        <Link href="/open-market/requests?scope=mine" className="text-sm font-medium text-primary hover:underline">Back to requests</Link>
      </div>
    )
  }

  const fee = Math.round(response.price * 0.015)
  const total = response.price + fee

  async function pay(e: React.FormEvent) {
    e.preventDefault()
    const err: Record<string, string> = {}
    if (name.trim().split(/\s+/).length < 2) err.name = 'Enter your full name.'
    if (phone.replace(/\D/g, '').length < 10) err.phone = 'Enter a valid phone number.'
    if (!state) err.state = 'Choose your state.'
    if (address.trim().length < 8) err.address = 'Enter your delivery address.'
    setErrors(err)
    if (Object.keys(err).length) return
    setLoading(true)
    if (response && response.status !== 'accepted') acceptResponse(response.id)
    await new Promise((r) => setTimeout(r, 1300))
    setLoading(false)
    setRef(`OM-${Math.floor(100000 + Math.random() * 899999)}`)
  }

  if (ref) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-20 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="size-8" aria-hidden="true" /></span>
        <h1 className="font-display text-3xl font-semibold">Order placed</h1>
        <p className="text-muted-foreground">{`${seller.name} has been notified and will deliver within ${response.deliveryDays} day${response.deliveryDays > 1 ? 's' : ''}. Your ${formatPrice(total)} is held in escrow until you confirm delivery.`}</p>
        <p className="rounded-xl bg-muted px-4 py-2 font-mono text-sm">{`Order ${ref}`}</p>
        <div className="flex gap-3">
          <Link href="/messages" className="flex h-11 items-center rounded-xl border px-5 text-sm font-medium hover:bg-muted">Message seller</Link>
          <Link href="/open-market" className="flex h-11 items-center rounded-xl bg-foreground px-5 text-sm font-medium text-background">Back to Open Market</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <Link href={`/open-market/requests/${request.id}`} className="text-sm text-muted-foreground hover:text-foreground">{'← Back to request'}</Link>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">Checkout accepted offer</h1>

      <form onSubmit={pay} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]" noValidate>
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-4 rounded-3xl border bg-card p-6" aria-labelledby="ship">
            <h2 id="ship" className="flex items-center gap-2 font-semibold"><Truck className="size-4" aria-hidden="true" />Delivery details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" error={errors.name} htmlFor="n"><input id="n" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} aria-invalid={!!errors.name || undefined} /></Field>
              <Field label="Phone" error={errors.phone} htmlFor="p"><input id="p" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} aria-invalid={!!errors.phone || undefined} /></Field>
              <Field label="State" error={errors.state} htmlFor="s">
                <Select id="s" value={state} onChange={(e) => setState(e.target.value)} aria-invalid={!!errors.state || undefined}>
                  <option value="">Select state</option>
                  {countries[0].regions.map((r) => <option key={r}>{r}</option>)}
                </Select>
              </Field>
              <Field label="Street address" error={errors.address} htmlFor="a"><input id="a" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} aria-invalid={!!errors.address || undefined} /></Field>
            </div>
          </section>
          <fieldset className="rounded-3xl border bg-card p-6">
            <legend className="sr-only">Payment method</legend>
            <h2 className="font-semibold" aria-hidden="true">Payment method</h2>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {methods.map(({ id, label, icon: Icon }) => (
                <label key={id} className={cn('flex cursor-pointer flex-col items-center gap-2 rounded-2xl border p-4 text-sm font-medium', method === id && 'border-primary bg-primary/5')}>
                  <input type="radio" name="m" className="sr-only" checked={method === id} onChange={() => setMethod(id)} />
                  <Icon className="size-5" aria-hidden="true" />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <aside className="flex flex-col gap-4 rounded-3xl border bg-card p-6 lg:sticky lg:top-40 lg:self-start">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Your request</p>
          <h2 className="font-medium leading-snug">{request.title}</h2>
          <div className="flex items-center gap-3 rounded-2xl bg-muted/60 p-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">{seller.initials}</span>
            <div className="text-sm">
              <p className="flex items-center gap-1 font-medium">{seller.name}<BadgeCheck className="size-3.5 text-primary" aria-label="Verified" /></p>
              <p className="text-xs text-muted-foreground">{`Delivers in ${response.deliveryDays} day${response.deliveryDays > 1 ? 's' : ''}`}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{response.note}</p>
          <dl className="flex flex-col gap-2 border-t pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Offer price</dt><dd className="tabular-nums">{formatPrice(response.price)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Delivery</dt><dd className="text-primary">Included</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Escrow fee</dt><dd className="tabular-nums">{formatPrice(fee)}</dd></div>
            <div className="flex items-baseline justify-between border-t pt-3"><dt className="font-medium">Total</dt><dd className="font-display text-2xl font-semibold tabular-nums">{formatPrice(total)}</dd></div>
          </dl>
          <SubmitButton loading={loading}>{`Pay ${formatPrice(total)}`}</SubmitButton>
          <p className="flex items-start gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />Funds are released to the seller only after you confirm delivery.</p>
        </aside>
      </form>
    </div>
  )
}
