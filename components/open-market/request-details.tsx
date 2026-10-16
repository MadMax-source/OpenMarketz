'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { BadgeCheck, CalendarDays, Check, Clock, Eye, MapPin, MessageCircle, Package, Star, Truck } from 'lucide-react'
import { formatPrice, getCategory, getSeller, products, sellers } from '@/lib/data'
import { ME, conditionLabels, timeAgo, type SellerResponse } from '@/lib/open-market'
import { useOpenMarket } from '@/components/open-market/open-market-provider'
import { RequestStatusBadge } from '@/components/open-market/request-card'
import { Field, FormAlert, Select, SubmitButton, inputClass } from '@/components/forms'
import { cn } from '@/lib/utils'

export function RequestDetails({ id }: { id: string }) {
  const { requests, responsesFor } = useOpenMarket()
  const posted = useSearchParams().get('posted') === '1'
  const request = requests.find((r) => r.id === id)

  if (!request) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold">Request not found</h1>
        <Link href="/open-market/requests" className="text-sm font-medium text-primary hover:underline">Browse all requests</Link>
      </div>
    )
  }

  const responses = responsesFor(request.id)
  const isMine = request.buyerId === ME
  const lowest = responses[0]?.price

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link href="/open-market" className="hover:text-foreground">Open Market</Link>
        {' / '}
        <Link href="/open-market/requests" className="hover:text-foreground">Requests</Link>
      </nav>

      {posted && <div className="mt-4"><FormAlert tone="success">Your request is live. Sellers are being notified now.</FormAlert></div>}

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-8">
          <article className="overflow-hidden rounded-3xl border bg-card">
            {request.image && (
              <div className="relative aspect-[16/8] bg-muted">
                <Image src={request.image || '/placeholder.svg'} alt={request.title} fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" priority />
              </div>
            )}
            <div className="flex flex-col gap-4 p-6">
              <div className="flex flex-wrap items-center gap-2">
                <RequestStatusBadge status={request.status} />
                <span className="text-xs text-muted-foreground">{`${getCategory(request.category)?.name ?? 'Other'} · ${conditionLabels[request.condition]}`}</span>
              </div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-balance md:text-3xl">{request.title}</h1>
              <p className="leading-relaxed text-muted-foreground">{request.description}</p>
              <dl className="grid grid-cols-2 gap-4 rounded-2xl bg-muted/60 p-4 text-sm sm:grid-cols-4">
                <div><dt className="text-xs text-muted-foreground">Budget</dt><dd className="font-semibold tabular-nums">{`${formatPrice(request.budgetMin)} – ${formatPrice(request.budgetMax)}`}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Quantity</dt><dd className="font-semibold">{request.quantity}</dd></div>
                <div><dt className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" aria-hidden="true" />Location</dt><dd className="font-semibold">{request.location}</dd></div>
                <div><dt className="flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="size-3" aria-hidden="true" />Needed by</dt><dd className="font-semibold">{request.neededBy ? new Date(request.neededBy).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) : 'Flexible'}</dd></div>
              </dl>
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>{`Posted by ${request.buyerName}`}</span>
                <span className="flex items-center gap-1"><Clock className="size-3.5" aria-hidden="true" />{timeAgo(request.postedHoursAgo)}</span>
                <span className="flex items-center gap-1"><Eye className="size-3.5" aria-hidden="true" />{`${request.views} views`}</span>
              </div>
            </div>
          </article>

          <section aria-labelledby="offers">
            <div className="flex items-baseline justify-between">
              <h2 id="offers" className="font-display text-xl font-semibold">{`Seller offers (${responses.length})`}</h2>
              {lowest && <p className="text-sm text-muted-foreground">{`Lowest: ${formatPrice(lowest)}`}</p>}
            </div>
            {responses.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">No offers yet. Sellers usually respond within an hour.</p>
            ) : (
              <ul className="mt-4 flex flex-col gap-4">
                {responses.map((r) => <OfferCard key={r.id} response={r} isMine={isMine} budgetMax={request.budgetMax} />)}
              </ul>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-40 lg:self-start">
          {isMine ? <BuyerPanel requestStatus={request.status} count={responses.length} /> : request.status === 'open' ? <RespondForm requestId={request.id} budgetMax={request.budgetMax} category={request.category} /> : (
            <div className="rounded-3xl border bg-card p-6 text-sm text-muted-foreground">This request has been fulfilled and is no longer accepting offers.</div>
          )}
        </aside>
      </div>
    </div>
  )
}

function OfferCard({ response, isMine, budgetMax }: { response: SellerResponse; isMine: boolean; budgetMax: number }) {
  const router = useRouter()
  const { acceptResponse, declineResponse } = useOpenMarket()
  const seller = getSeller(response.sellerId)
  const product = response.productId ? products.find((p) => p.id === response.productId) : undefined
  if (!seller) return null

  return (
    <li className={cn('rounded-2xl border bg-card p-5', response.status === 'accepted' && 'border-primary ring-2 ring-primary/20', response.status === 'declined' && 'opacity-60')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Link href={`/store/${seller.slug}`} className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">{seller.initials}</span>
          <span>
            <span className="flex items-center gap-1 font-medium">
              {seller.name}
              {seller.verified && <BadgeCheck className="size-4 text-primary" aria-label="Verified seller" />}
            </span>
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-0.5"><Star className="size-3 fill-current text-amber-500" aria-hidden="true" />{seller.rating}</span>
              <span>{`${seller.positiveRate}% positive`}</span>
              <span>{seller.location}</span>
            </span>
          </span>
        </Link>
        <div className="text-right">
          <p className="font-display text-2xl font-semibold tabular-nums">{formatPrice(response.price)}</p>
          {response.price <= budgetMax && <p className="text-xs font-medium text-primary">Within budget</p>}
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed">{response.note}</p>
      {product && (
        <Link href={`/product/${product.slug}`} className="mt-3 flex items-center gap-3 rounded-xl bg-muted/60 p-2 hover:bg-muted">
          <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-background">
            <Image src={product.image || '/placeholder.svg'} alt="" fill sizes="56px" className="object-cover" />
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1 text-xs text-muted-foreground"><Package className="size-3" aria-hidden="true" />Attached listing</span>
            <span className="line-clamp-1 text-sm font-medium">{product.name}</span>
          </span>
        </Link>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Truck className="size-3.5" aria-hidden="true" />{`Delivers in ${response.deliveryDays} day${response.deliveryDays > 1 ? 's' : ''}`}</span>
          <span>{timeAgo(response.postedHoursAgo)}</span>
        </span>
        {response.status === 'accepted' ? (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-sm font-medium text-primary"><Check className="size-4" aria-hidden="true" />Accepted</span>
            {isMine && <Link href={`/open-market/checkout/${response.id}`} className="flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">Checkout</Link>}
          </div>
        ) : response.status === 'declined' ? (
          <span className="text-sm text-muted-foreground">Declined</span>
        ) : isMine ? (
          <div className="flex gap-2">
            <Link href="/messages" className="flex h-10 items-center gap-1.5 rounded-xl border px-3 text-sm font-medium hover:bg-muted"><MessageCircle className="size-4" aria-hidden="true" />Chat</Link>
            <button type="button" onClick={() => declineResponse(response.id)} className="h-10 rounded-xl border px-3 text-sm font-medium hover:bg-muted">Decline</button>
            <button
              type="button"
              onClick={() => {
                acceptResponse(response.id)
                router.push(`/open-market/checkout/${response.id}`)
              }}
              className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Accept offer
            </button>
          </div>
        ) : null}
      </div>
    </li>
  )
}

function BuyerPanel({ requestStatus, count }: { requestStatus: string; count: number }) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border bg-card p-6">
      <h2 className="font-display text-lg font-semibold">This is your request</h2>
      <p className="text-sm text-muted-foreground">
        {requestStatus === 'accepted'
          ? 'You accepted an offer. Complete checkout to have the seller ship your order.'
          : count
            ? 'Compare offers below. Chat with a seller for more photos, then accept the best one to check out.'
            : 'Sellers are reviewing your request. We will notify you as offers come in.'}
      </p>
      <ul className="mt-2 flex flex-col gap-2 text-sm">
        <li className="flex items-center gap-2"><Check className="size-4 text-primary" aria-hidden="true" />Payment held in escrow</li>
        <li className="flex items-center gap-2"><Check className="size-4 text-primary" aria-hidden="true" />Verified sellers only</li>
        <li className="flex items-center gap-2"><Check className="size-4 text-primary" aria-hidden="true" />Free returns if not as described</li>
      </ul>
    </div>
  )
}

function RespondForm({ requestId, budgetMax, category }: { requestId: string; budgetMax: number; category: string }) {
  const { submitResponse } = useOpenMarket()
  const [sellerId, setSellerId] = useState(sellers[0].id)
  const [price, setPrice] = useState('')
  const [days, setDays] = useState('2')
  const [note, setNote] = useState('')
  const [productId, setProductId] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sent, setSent] = useState(false)
  const listings = products.filter((p) => p.sellerId === sellerId)
  const sorted = [...listings].sort((a, b) => Number(b.category === category) - Number(a.category === category))

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const p = Number(price)
    const d = Number(days)
    const err: Record<string, string> = {}
    if (!p || p < 100) err.price = 'Enter your offer price.'
    if (!Number.isInteger(d) || d < 1 || d > 60) err.days = 'Enter 1–60 days.'
    if (note.trim().length < 15) err.note = 'Describe what you are offering (15+ characters).'
    setErrors(err)
    if (Object.keys(err).length) return
    submitResponse({ requestId, sellerId, price: p, deliveryDays: d, note: note.trim(), productId: productId || undefined })
    setSent(true)
    setPrice('')
    setNote('')
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-3xl border bg-card p-6" noValidate>
      <h2 className="font-display text-lg font-semibold">Make an offer</h2>
      {sent && <FormAlert tone="success">Offer sent! The buyer will be notified.</FormAlert>}
      <Field label="Respond as" htmlFor="as" hint="Your verified store">
        <Select id="as" value={sellerId} onChange={(e) => { setSellerId(e.target.value); setProductId('') }}>
          {sellers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Your price (₦)" error={errors.price} hint={`Budget up to ${formatPrice(budgetMax)}`} htmlFor="op">
          <input id="op" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))} className={inputClass} aria-invalid={!!errors.price || undefined} />
        </Field>
        <Field label="Delivery (days)" error={errors.days} htmlFor="od">
          <input id="od" type="number" min={1} value={days} onChange={(e) => setDays(e.target.value)} className={inputClass} aria-invalid={!!errors.days || undefined} />
        </Field>
      </div>
      <Field label="Attach a listing" optional htmlFor="ol">
        <Select id="ol" value={productId} onChange={(e) => setProductId(e.target.value)}>
          <option value="">No listing</option>
          {sorted.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
      </Field>
      <Field label="Message to buyer" error={errors.note} htmlFor="on">
        <textarea id="on" rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Brand, condition, warranty, what's included…" className={cn(inputClass, 'h-auto py-3')} aria-invalid={!!errors.note || undefined} />
      </Field>
      <SubmitButton>Send offer</SubmitButton>
    </form>
  )
}
