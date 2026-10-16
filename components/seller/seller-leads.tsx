'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CalendarDays, MapPin, Send } from 'lucide-react'
import { toast } from 'sonner'
import { formatPrice, getCategory } from '@/lib/data'
import { STORE_ID } from '@/lib/seller'
import type { MarketRequest } from '@/lib/open-market'
import { useOpenMarket } from '@/components/open-market/open-market-provider'
import { useSeller } from '@/components/seller/seller-provider'
import { PageHeader, StatusPill } from '@/components/seller/seller-shell'
import { Select, inputClass } from '@/components/forms'
import { cn } from '@/lib/utils'

export function SellerLeads() {
  const { requests, responses } = useOpenMarket()
  const open = requests.filter((r) => r.status === 'open')
  const mine = responses.filter((r) => r.sellerId === STORE_ID)

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Open Market leads" description="Buyers post what they need. Send an offer and win the sale." />

      {mine.length > 0 && (
        <section aria-labelledby="sent-title">
          <h2 id="sent-title" className="mb-3 font-semibold">Offers you sent</h2>
          <ul className="flex flex-col gap-2">
            {mine.map((r) => {
              const req = requests.find((q) => q.id === r.requestId)
              return (
                <li key={r.id} className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-3 text-sm">
                  <Link href={`/open-market/requests/${r.requestId}`} className="min-w-0 truncate font-medium hover:underline">{req?.title}</Link>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-semibold">{formatPrice(r.price)}</span>
                    <StatusPill status={r.status} />
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section aria-labelledby="leads-title">
        <h2 id="leads-title" className="mb-3 font-semibold">{`Open requests (${open.length})`}</h2>
        <ul className="grid gap-4 xl:grid-cols-2">
          {open.map((r) => <LeadCard key={r.id} request={r} responded={mine.some((m) => m.requestId === r.id)} />)}
        </ul>
      </section>
    </div>
  )
}

function LeadCard({ request: r, responded }: { request: MarketRequest; responded: boolean }) {
  const { submitResponse, responsesFor } = useOpenMarket()
  const { listings } = useSeller()
  const [composing, setComposing] = useState(false)
  const [price, setPrice] = useState(String(r.budgetMax))
  const [days, setDays] = useState('2')
  const [note, setNote] = useState('')
  const [productId, setProductId] = useState('')
  const competing = responsesFor(r.id).length

  return (
    <li className="flex flex-col rounded-3xl border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/open-market/requests/${r.id}`} className="font-medium hover:underline">{r.title}</Link>
        <span className="shrink-0 text-xs text-muted-foreground">{getCategory(r.category)?.name}</span>
      </div>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.description}</p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{`${formatPrice(r.budgetMin)} – ${formatPrice(r.budgetMax)}`}</span>
        <span className="flex items-center gap-1"><MapPin className="size-3" aria-hidden="true" />{r.location}</span>
        <span className="flex items-center gap-1"><CalendarDays className="size-3" aria-hidden="true" />{`By ${new Date(r.neededBy).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}`}</span>
        <span>{`${competing} offer${competing === 1 ? '' : 's'}`}</span>
      </div>

      <div className="mt-auto pt-4">
        {responded ? (
          <p className="text-sm font-medium text-primary">You have sent an offer</p>
        ) : composing ? (
          <form
            className="flex flex-col gap-3 border-t pt-4"
            onSubmit={(e) => {
              e.preventDefault()
              const p = Number(price)
              const d = Number(days)
              if (!(p > 0) || !(d >= 1)) return toast.error('Enter a valid price and delivery time.')
              if (note.trim().length < 10) return toast.error('Add a short note for the buyer.')
              submitResponse({ requestId: r.id, sellerId: STORE_ID, price: p, deliveryDays: d, note: note.trim(), productId: productId || undefined })
              toast.success('Offer sent to buyer')
              setComposing(false)
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-xs font-medium">
                Your price (₦)
                <input inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))} className={cn(inputClass, 'h-10')} />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium">
                Delivery (days)
                <input inputMode="numeric" value={days} onChange={(e) => setDays(e.target.value.replace(/\D/g, ''))} className={cn(inputClass, 'h-10')} />
              </label>
            </div>
            <label className="flex flex-col gap-1 text-xs font-medium">
              Attach one of your listings
              <Select value={productId} onChange={(e) => setProductId(e.target.value)}>
                <option value="">None</option>
                {listings.filter((l) => l.status === 'active').map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </Select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium">
              Note to buyer
              <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Condition, warranty, what is included" className={cn(inputClass, 'h-auto resize-none py-2')} />
            </label>
            <div className="flex gap-2">
              <button type="submit" className="flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
                <Send className="size-4" aria-hidden="true" />
                Send offer
              </button>
              <button type="button" onClick={() => setComposing(false)} className="h-10 rounded-xl px-3 text-sm font-medium text-muted-foreground">Cancel</button>
            </div>
          </form>
        ) : (
          <button type="button" onClick={() => setComposing(true)} className="h-10 rounded-xl bg-foreground px-4 text-sm font-semibold text-background">Make an offer</button>
        )}
      </div>
    </li>
  )
}
