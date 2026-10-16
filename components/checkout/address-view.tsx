'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Check, MapPin, Plus } from 'lucide-react'
import { formatPrice } from '@/lib/data'
import { deliveryOptions, useCartTotals, useShop, type Address, type DeliveryMethod } from '@/components/shop-provider'
import { CheckoutSteps, OrderSummary, fieldClass } from '@/components/checkout/checkout-ui'
import { cn } from '@/lib/utils'

const states = ['Abuja (FCT)', 'Lagos', 'Ogun', 'Oyo', 'Rivers', 'Kano', 'Kaduna', 'Enugu', 'Anambra', 'Delta', 'Edo', 'Kwara', 'Plateau']

type Draft = Omit<Address, 'id'>
const emptyDraft: Draft = { fullName: '', phone: '', line1: '', city: '', state: 'Lagos', landmark: '', label: 'Home' }

export function AddressView() {
  const router = useRouter()
  const { addresses, saveAddress, selectedAddressId, setSelectedAddressId, delivery, setDelivery } = useShop()
  const { lines } = useCartTotals()
  const [adding, setAdding] = useState(addresses.length === 0)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({})

  if (lines.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Link href="/products" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
          Browse products
        </Link>
      </div>
    )
  }

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const submitAddress = (e: React.FormEvent) => {
    e.preventDefault()
    const next: typeof errors = {}
    if (draft.fullName.trim().length < 3) next.fullName = 'Enter your full name'
    if (!/^[0-9+\s]{10,15}$/.test(draft.phone.trim())) next.phone = 'Enter a valid phone number'
    if (draft.line1.trim().length < 5) next.line1 = 'Enter your street address'
    if (draft.city.trim().length < 2) next.city = 'Enter your city or area'
    setErrors(next)
    if (Object.keys(next).length) return
    const saved = saveAddress({ ...draft, fullName: draft.fullName.trim(), line1: draft.line1.trim(), city: draft.city.trim() })
    setSelectedAddressId(saved.id)
    setDraft(emptyDraft)
    setAdding(false)
  }

  const canContinue = Boolean(selectedAddressId) && !adding

  return (
    <>
      <CheckoutSteps current={1} />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-10">
          <section aria-labelledby="address-heading">
            <div className="flex items-center justify-between">
              <h1 id="address-heading" className="font-display text-2xl font-semibold tracking-tight">
                Delivery address
              </h1>
              {!adding && (
                <button
                  type="button"
                  onClick={() => setAdding(true)}
                  className="flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  <Plus className="size-4" aria-hidden="true" />
                  New address
                </button>
              )}
            </div>

            {addresses.length > 0 && (
              <div role="radiogroup" aria-label="Saved addresses" className="mt-5 grid gap-3 sm:grid-cols-2">
                {addresses.map((a) => {
                  const active = a.id === selectedAddressId
                  return (
                    <button
                      key={a.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setSelectedAddressId(a.id)}
                      className={cn(
                        'relative flex flex-col rounded-2xl border p-4 text-left transition-colors',
                        active ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted/50',
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <MapPin className="size-4 text-primary" aria-hidden="true" />
                        <span className="text-xs font-semibold uppercase tracking-wide">{a.label}</span>
                      </span>
                      <span className="mt-2 font-medium">{a.fullName}</span>
                      <span className="mt-1 text-sm text-muted-foreground">{a.line1}</span>
                      <span className="text-sm text-muted-foreground">{`${a.city}, ${a.state}`}</span>
                      {a.landmark && <span className="text-xs text-muted-foreground">{a.landmark}</span>}
                      <span className="mt-2 text-sm">{a.phone}</span>
                      {active && (
                        <span className="absolute right-4 top-4 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-3.5" aria-hidden="true" />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {adding && (
              <form onSubmit={submitAddress} noValidate className="mt-5 grid gap-4 rounded-2xl border bg-card p-5 sm:grid-cols-2">
                <Field label="Full name" error={errors.fullName} className="sm:col-span-1">
                  {(id) => (
                    <input id={id} autoComplete="name" value={draft.fullName} onChange={(e) => update('fullName', e.target.value)} aria-invalid={!!errors.fullName} className={fieldClass} />
                  )}
                </Field>
                <Field label="Phone number" error={errors.phone}>
                  {(id) => (
                    <input id={id} type="tel" inputMode="tel" autoComplete="tel" placeholder="0803 000 0000" value={draft.phone} onChange={(e) => update('phone', e.target.value)} aria-invalid={!!errors.phone} className={fieldClass} />
                  )}
                </Field>
                <Field label="Street address" error={errors.line1} className="sm:col-span-2">
                  {(id) => (
                    <input id={id} autoComplete="street-address" value={draft.line1} onChange={(e) => update('line1', e.target.value)} aria-invalid={!!errors.line1} className={fieldClass} />
                  )}
                </Field>
                <Field label="City / Area" error={errors.city}>
                  {(id) => (
                    <input id={id} autoComplete="address-level2" value={draft.city} onChange={(e) => update('city', e.target.value)} aria-invalid={!!errors.city} className={fieldClass} />
                  )}
                </Field>
                <Field label="State">
                  {(id) => (
                    <select id={id} value={draft.state} onChange={(e) => update('state', e.target.value)} className={fieldClass}>
                      {states.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  )}
                </Field>
                <Field label="Landmark (optional)" className="sm:col-span-2">
                  {(id) => (
                    <input id={id} placeholder="e.g. Opposite First Bank" value={draft.landmark} onChange={(e) => update('landmark', e.target.value)} className={fieldClass} />
                  )}
                </Field>
                <fieldset className="sm:col-span-2">
                  <legend className="text-sm font-medium">Save as</legend>
                  <div className="mt-2 flex gap-2">
                    {(['Home', 'Work', 'Other'] as const).map((l) => (
                      <button
                        key={l}
                        type="button"
                        aria-pressed={draft.label === l}
                        onClick={() => update('label', l)}
                        className={cn('rounded-full border px-4 py-1.5 text-sm', draft.label === l ? 'border-foreground bg-foreground text-background' : 'hover:bg-muted')}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <div className="flex gap-3 sm:col-span-2">
                  <button type="submit" className="h-11 rounded-full bg-foreground px-6 text-sm font-medium text-background hover:opacity-90">
                    Save address
                  </button>
                  {addresses.length > 0 && (
                    <button type="button" onClick={() => setAdding(false)} className="h-11 rounded-full px-5 text-sm font-medium hover:bg-muted">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </section>

          <section aria-labelledby="delivery-heading">
            <h2 id="delivery-heading" className="font-display text-2xl font-semibold tracking-tight">
              Delivery method
            </h2>
            <div role="radiogroup" aria-label="Delivery method" className="mt-5 flex flex-col gap-3">
              {(Object.entries(deliveryOptions) as [DeliveryMethod, (typeof deliveryOptions)[DeliveryMethod]][]).map(([key, opt]) => {
                const active = delivery === key
                return (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setDelivery(key)}
                    className={cn(
                      'flex items-center gap-4 rounded-2xl border p-4 text-left transition-colors',
                      active ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted/50',
                    )}
                  >
                    <span className={cn('flex size-5 items-center justify-center rounded-full border-2', active ? 'border-primary' : 'border-muted-foreground/40')}>
                      {active && <span className="size-2.5 rounded-full bg-primary" />}
                    </span>
                    <span className="flex-1">
                      <span className="block font-medium">{opt.label}</span>
                      <span className="text-sm text-muted-foreground">{opt.eta}</span>
                    </span>
                    <span className="text-sm font-medium tabular-nums">{formatPrice(opt.fee)}</span>
                  </button>
                )
              })}
            </div>
          </section>
        </div>

        <OrderSummary compact>
          <button
            type="button"
            disabled={!canContinue}
            onClick={() => router.push('/checkout/payment')}
            className="h-12 w-full rounded-full bg-primary text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue to payment
          </button>
          {!canContinue && <p className="mt-2 text-center text-xs text-muted-foreground">Select or save an address to continue</p>}
        </OrderSummary>
      </div>
    </>
  )
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string
  error?: string
  className?: string
  children: (id: string) => React.ReactNode
}) {
  const id = `f-${label.toLowerCase().replace(/[^a-z]+/g, '-')}`
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children(id)}
      {error && <p className="text-xs text-deal">{error}</p>}
    </div>
  )
}
