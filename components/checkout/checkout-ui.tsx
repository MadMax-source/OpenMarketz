'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Check, ShieldCheck } from 'lucide-react'
import { formatPrice } from '@/lib/data'
import { useCartTotals } from '@/components/shop-provider'
import { cn } from '@/lib/utils'

const steps = [
  { label: 'Cart', href: '/cart' },
  { label: 'Delivery', href: '/checkout/address' },
  { label: 'Payment', href: '/checkout/payment' },
  { label: 'Done', href: '#' },
]

export function CheckoutSteps({ current }: { current: number }) {
  return (
    <nav aria-label="Checkout progress">
      <ol className="flex items-center gap-2">
        {steps.map((step, i) => {
          const done = i < current
          const active = i === current
          return (
            <li key={step.label} className="flex flex-1 items-center gap-2 last:flex-none">
              <Link
                href={done ? step.href : '#'}
                aria-current={active ? 'step' : undefined}
                aria-disabled={!done}
                className={cn('flex items-center gap-2 text-sm', !done && 'pointer-events-none')}
              >
                <span
                  className={cn(
                    'flex size-7 items-center justify-center rounded-full border text-xs font-semibold',
                    done && 'border-primary bg-primary text-primary-foreground',
                    active && 'border-foreground bg-foreground text-background',
                    !done && !active && 'text-muted-foreground',
                  )}
                >
                  {done ? <Check className="size-3.5" aria-hidden="true" /> : i + 1}
                </span>
                <span className={cn('hidden sm:inline', active ? 'font-medium' : 'text-muted-foreground')}>{step.label}</span>
              </Link>
              {i < steps.length - 1 && (
                <span className={cn('h-px flex-1', done ? 'bg-primary' : 'bg-border')} aria-hidden="true" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function OrderSummary({ children, compact = false }: { children?: React.ReactNode; compact?: boolean }) {
  const { lines, subtotal, savings, deliveryFee, serviceFee, total, freeDelivery } = useCartTotals()

  return (
    <aside className="rounded-3xl border bg-card p-6 lg:sticky lg:top-40" aria-label="Order summary">
      <h2 className="font-display text-lg font-semibold">Order summary</h2>
      {compact && lines.length > 0 && (
        <ul className="mt-4 flex flex-col gap-3 border-b pb-4">
          {lines.map(({ item, product, unitPrice }) => (
            <li key={item.key} className="flex items-center gap-3">
              <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image src={product.image || '/placeholder.svg'} alt="" fill sizes="48px" className="object-cover" />
                <span className="absolute -right-0 -top-0 flex size-5 items-center justify-center rounded-bl-lg bg-foreground text-[10px] font-semibold text-background">
                  {item.quantity}
                </span>
              </div>
              <p className="line-clamp-2 flex-1 text-sm">{product.name}</p>
              <p className="text-sm font-medium tabular-nums">{formatPrice(unitPrice * item.quantity)}</p>
            </li>
          ))}
        </ul>
      )}
      <dl className="mt-4 flex flex-col gap-3 text-sm">
        <Row label="Subtotal" value={formatPrice(subtotal)} />
        {savings > 0 && <Row label="You save" value={`-${formatPrice(savings)}`} valueClass="text-deal" />}
        <Row label="Delivery" value={freeDelivery || deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)} valueClass={freeDelivery ? 'text-primary' : undefined} />
        <Row label="Service fee" value={formatPrice(serviceFee)} />
        <div className="mt-1 flex items-baseline justify-between border-t pt-4">
          <dt className="font-medium">Total</dt>
          <dd className="font-display text-2xl font-semibold tabular-nums">{formatPrice(total)}</dd>
        </div>
      </dl>
      {children && <div className="mt-6">{children}</div>}
      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
        Payments are held in escrow and released to the seller only after you confirm delivery.
      </p>
    </aside>
  )
}

function Row({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn('font-medium tabular-nums', valueClass)}>{value}</dd>
    </div>
  )
}

export const fieldClass =
  'h-12 w-full rounded-xl border bg-transparent px-4 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 aria-invalid:border-deal'
