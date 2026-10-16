'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { CalendarDays, Check, CreditCard, Gift, Landmark, MapPin, ShieldCheck, Smartphone } from 'lucide-react'
import { formatPrice, products } from '@/lib/data'
import { useAuth } from '@/components/auth-provider'
import { decodeList, occasions, useWishlists } from '@/components/wishlist-provider'
import { fieldClass } from '@/components/checkout/checkout-ui'
import { cn } from '@/lib/utils'

const methods = [
  { id: 'card', label: 'Card', icon: CreditCard },
  { id: 'transfer', label: 'Bank transfer', icon: Landmark },
  { id: 'ussd', label: 'USSD', icon: Smartphone },
] as const

export function SharedListView({ token }: { token: string }) {
  const list = useMemo(() => decodeList(token), [token])
  const { user } = useAuth()
  const { giftsFor, recordGifts } = useWishlists()
  const [selected, setSelected] = useState<string[]>([])
  const [giverName, setGiverName] = useState(user ? `${user.firstName} ${user.lastName}` : '')
  const [anonymous, setAnonymous] = useState(false)
  const [message, setMessage] = useState('')
  const [method, setMethod] = useState<(typeof methods)[number]['id']>('card')
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState<{ reference: string; total: number; count: number } | null>(null)

  if (!list) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
        <Gift className="size-8 text-muted-foreground" aria-hidden="true" />
        <h1 className="font-display text-2xl font-semibold">This wishlist link is not valid</h1>
        <p className="text-muted-foreground">Ask the owner to send you a fresh link.</p>
        <Link href="/wishlist" className="mt-2 flex h-11 items-center rounded-xl bg-foreground px-5 text-sm font-medium text-background">Go to wishlists</Link>
      </div>
    )
  }

  const items = list.productIds.flatMap((id) => products.find((p) => p.id === id) ?? [])
  const gifted = new Set(giftsFor(list.id).map((g) => g.productId))
  const chosen = items.filter((p) => selected.includes(p.id))
  const subtotal = chosen.reduce((s, p) => s + p.price, 0)
  const serviceFee = Math.round(subtotal * 0.015)
  const total = subtotal + serviceFee
  const occasion = occasions.find((o) => o.value === list.occasion)?.label
  const firstName = list.ownerName.split(' ')[0]

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  async function pay(e: React.FormEvent) {
    e.preventDefault()
    if (!list) return
    if (chosen.length === 0) return setError('Choose at least one item to gift.')
    if (!anonymous && giverName.trim().length < 2) return setError(`Add your name so ${firstName} knows who to thank.`)
    setError('')
    setPaying(true)
    await new Promise((r) => setTimeout(r, 1400))
    const reference = `GFT-${Math.floor(100000 + Math.random() * 899999)}`
    recordGifts(list, {
      giverName: giverName.trim() || 'A friend',
      anonymous,
      message: message.trim(),
      reference,
      items: chosen.map((p) => ({ productId: p.id, amount: p.price })),
    })
    setPaying(false)
    setDone({ reference, total, count: chosen.length })
    setSelected([])
  }

  if (done) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-20 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-8" aria-hidden="true" />
        </span>
        <h1 className="font-display text-3xl font-semibold">Gift sent to {firstName}!</h1>
        <p className="text-muted-foreground">
          {`You paid ${formatPrice(done.total)} for ${done.count} item${done.count > 1 ? 's' : ''}. ${firstName} has been notified and the seller will deliver to their address in ${list.ownerRegion || 'their city'}.`}
        </p>
        <p className="rounded-xl bg-muted px-4 py-2 font-mono text-sm">{`Reference: ${done.reference}`}</p>
        <div className="flex gap-3">
          <button type="button" onClick={() => setDone(null)} className="h-11 rounded-xl border px-5 text-sm font-medium hover:bg-muted">Gift another item</button>
          <Link href="/" className="flex h-11 items-center rounded-xl bg-foreground px-5 text-sm font-medium text-background">Keep shopping</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <header className="rounded-3xl bg-accent p-6 md:p-10">
        <div className="flex flex-wrap items-center gap-2 text-sm text-accent-foreground/80">
          <span className="rounded-full bg-background px-3 py-1 font-medium text-foreground">{occasion}</span>
          {list.eventDate && (
            <span className="flex items-center gap-1">
              <CalendarDays className="size-4" aria-hidden="true" />
              {new Date(list.eventDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          )}
          {list.ownerRegion && (
            <span className="flex items-center gap-1">
              <MapPin className="size-4" aria-hidden="true" />
              {list.ownerRegion}
            </span>
          )}
        </div>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-balance text-accent-foreground md:text-4xl">{list.name}</h1>
        <p className="mt-2 text-accent-foreground/80">{`A wishlist by ${list.ownerName}`}</p>
        {list.note && <blockquote className="mt-4 max-w-2xl border-l-2 border-primary pl-4 italic text-accent-foreground">{`"${list.note}"`}</blockquote>}
      </header>

      <form onSubmit={pay} className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]" noValidate>
        <section aria-labelledby="pick-items">
          <h2 id="pick-items" className="font-display text-xl font-semibold">Pick what to gift</h2>
          <p className="text-sm text-muted-foreground">{`Items are delivered straight to ${firstName}. Their address stays private.`}</p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {items.map((p) => {
              const isGifted = gifted.has(p.id)
              const on = selected.includes(p.id)
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    disabled={isGifted}
                    onClick={() => toggle(p.id)}
                    aria-pressed={on}
                    className={cn(
                      'flex w-full items-center gap-4 rounded-2xl border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                      on ? 'border-primary bg-primary/5 ring-2 ring-primary/25' : 'hover:border-foreground/30',
                    )}
                  >
                    <span className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                      <Image src={p.image || '/placeholder.svg'} alt="" fill sizes="80px" className="object-cover" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="line-clamp-2 text-sm font-medium">{p.name}</span>
                      <span className="font-semibold tabular-nums">{formatPrice(p.price)}</span>
                      {isGifted && <span className="text-xs font-medium text-primary">Already gifted</span>}
                    </span>
                    <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-full border', on && 'border-primary bg-primary text-primary-foreground')}>
                      {on && <Check className="size-3.5" aria-hidden="true" />}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        <aside className="flex flex-col gap-5 rounded-3xl border bg-card p-6 lg:sticky lg:top-40 lg:self-start" aria-label="Gift payment">
          <h2 className="font-display text-lg font-semibold">Your gift</h2>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Your name</span>
            <input value={giverName} onChange={(e) => setGiverName(e.target.value)} disabled={anonymous} placeholder="So they know who to thank" className={fieldClass} />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="size-4 accent-primary" />
            Gift anonymously
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Gift message <span className="font-normal text-muted-foreground">(optional)</span></span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              maxLength={160}
              placeholder={`Happy ${occasion?.toLowerCase()}, ${firstName}!`}
              className="w-full rounded-xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <fieldset>
            <legend className="text-sm font-medium">Pay with</legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {methods.map(({ id, label, icon: Icon }) => (
                <label key={id} className={cn('flex cursor-pointer flex-col items-center gap-1 rounded-xl border p-3 text-xs font-medium', method === id && 'border-primary bg-primary/5')}>
                  <input type="radio" name="method" value={id} checked={method === id} onChange={() => setMethod(id)} className="sr-only" />
                  <Icon className="size-5" aria-hidden="true" />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <dl className="flex flex-col gap-2 border-t pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">{`Items (${chosen.length})`}</dt><dd className="tabular-nums">{formatPrice(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Delivery to {firstName}</dt><dd className="text-primary">Free</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Service fee</dt><dd className="tabular-nums">{formatPrice(serviceFee)}</dd></div>
            <div className="mt-1 flex items-baseline justify-between border-t pt-3"><dt className="font-medium">Total</dt><dd className="font-display text-2xl font-semibold tabular-nums">{formatPrice(total)}</dd></div>
          </dl>
          {error && <p role="alert" className="text-sm text-deal">{error}</p>}
          <button type="submit" disabled={paying} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
            <Gift className="size-4" aria-hidden="true" />
            {paying ? 'Processing payment…' : `Pay ${formatPrice(total)} for ${firstName}`}
          </button>
          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
            Your payment is held in escrow until {firstName} confirms the gift arrived.
          </p>
        </aside>
      </form>
    </div>
  )
}
