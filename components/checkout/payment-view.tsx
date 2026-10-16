'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Building2, CreditCard, Hash, Loader2, Lock, MapPin, Wallet } from 'lucide-react'
import { deliveryOptions, useCartTotals, useShop, type PaymentMethod } from '@/components/shop-provider'
import { CheckoutSteps, OrderSummary, fieldClass } from '@/components/checkout/checkout-ui'
import { formatPrice } from '@/lib/data'
import { cn } from '@/lib/utils'

const methods: { id: PaymentMethod; label: string; hint: string; icon: typeof CreditCard }[] = [
  { id: 'card', label: 'Debit / credit card', hint: 'Verve, Visa, Mastercard', icon: CreditCard },
  { id: 'transfer', label: 'Bank transfer', hint: 'Pay into a one-time account', icon: Building2 },
  { id: 'ussd', label: 'USSD', hint: 'Dial a code from any bank', icon: Hash },
  { id: 'pod', label: 'Pay on delivery', hint: 'Cash or POS at your door', icon: Wallet },
]

export function PaymentView() {
  const router = useRouter()
  const { addresses, selectedAddressId, delivery, placeOrder } = useShop()
  const { lines, total } = useCartTotals()
  const [method, setMethod] = useState<PaymentMethod>('card')
  const [processing, setProcessing] = useState(false)
  const address = addresses.find((a) => a.id === selectedAddressId)

  if (lines.length === 0 || !address) {
    return (
      <div className="py-24 text-center">
        <p className="text-muted-foreground">{lines.length === 0 ? 'Your cart is empty.' : 'Please choose a delivery address first.'}</p>
        <Link href={lines.length === 0 ? '/products' : '/checkout/address'} className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
          {lines.length === 0 ? 'Browse products' : 'Choose address'}
        </Link>
      </div>
    )
  }

  const pay = (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    setTimeout(() => {
      const order = placeOrder(method)
      if (order) router.push(`/checkout/success?order=${order.id}`)
      else setProcessing(false)
    }, 1400)
  }

  return (
    <>
      <CheckoutSteps current={2} />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <form id="payment-form" onSubmit={pay} className="flex flex-col gap-8">
          <section className="flex items-start gap-4 rounded-2xl border bg-card p-4">
            <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <div className="flex-1 text-sm">
              <p className="font-medium">{`Delivering to ${address.fullName}`}</p>
              <p className="text-muted-foreground">{`${address.line1}, ${address.city}, ${address.state}`}</p>
              <p className="mt-1 text-muted-foreground">{`${deliveryOptions[delivery].label} · ${deliveryOptions[delivery].eta}`}</p>
            </div>
            <Link href="/checkout/address" className="text-sm font-medium text-primary hover:underline">
              Change
            </Link>
          </section>

          <fieldset>
            <legend className="font-display text-2xl font-semibold tracking-tight">Payment method</legend>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {methods.map((m) => {
                const active = method === m.id
                return (
                  <label
                    key={m.id}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                      active ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted/50',
                    )}
                  >
                    <input type="radio" name="method" value={m.id} checked={active} onChange={() => setMethod(m.id)} className="sr-only" />
                    <span className={cn('flex size-10 items-center justify-center rounded-xl', active ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                      <m.icon className="size-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-sm font-medium">{m.label}</span>
                      <span className="text-xs text-muted-foreground">{m.hint}</span>
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <section className="rounded-2xl border bg-card p-5" aria-live="polite">
            {method === 'card' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label htmlFor="card-number" className="text-sm font-medium">Card number</label>
                  <input id="card-number" inputMode="numeric" autoComplete="cc-number" placeholder="5399 0000 0000 0000" className={fieldClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="card-exp" className="text-sm font-medium">Expiry</label>
                  <input id="card-exp" autoComplete="cc-exp" placeholder="MM / YY" className={fieldClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="card-cvv" className="text-sm font-medium">CVV</label>
                  <input id="card-cvv" inputMode="numeric" autoComplete="cc-csc" placeholder="123" className={fieldClass} />
                </div>
              </div>
            )}
            {method === 'transfer' && (
              <div className="text-sm">
                <p className="text-muted-foreground">Transfer the exact amount to this one-time account. It expires in 30 minutes.</p>
                <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Info label="Bank" value="OpenMarketz / Wema" />
                  <Info label="Account number" value="7810 293 455" />
                  <Info label="Amount" value={formatPrice(total)} />
                </dl>
              </div>
            )}
            {method === 'ussd' && (
              <div className="text-sm">
                <p className="text-muted-foreground">Dial the code below on the phone linked to your bank account.</p>
                <p className="mt-4 rounded-xl bg-muted px-4 py-3 font-mono text-lg font-semibold tracking-wide">{`*737*000*${Math.round(total)}#`}</p>
              </div>
            )}
            {method === 'pod' && (
              <p className="text-sm text-muted-foreground">
                Pay with cash or POS when the rider arrives. Please have the exact amount ready — riders may not carry change.
              </p>
            )}
            <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="size-3.5" aria-hidden="true" />
              Payment processing is a preview — no real charge will be made.
            </p>
          </section>
        </form>

        <OrderSummary compact>
          <button
            type="submit"
            form="payment-form"
            disabled={processing}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-70"
          >
            {processing ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Processing…
              </>
            ) : method === 'pod' ? (
              'Place order'
            ) : (
              `Pay ${formatPrice(total)}`
            )}
          </button>
        </OrderSummary>
      </div>
    </>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted px-4 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  )
}
