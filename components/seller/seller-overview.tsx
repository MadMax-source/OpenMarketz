'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Eye, Handshake, Truck, Wallet } from 'lucide-react'
import { formatPrice } from '@/lib/data'
import { timeUntil } from '@/lib/seller'
import { timeAgo } from '@/components/notifications-provider'
import { useSeller } from '@/components/seller/seller-provider'
import { PageHeader, StatusPill } from '@/components/seller/seller-shell'

export function SellerOverview() {
  const { listings, bargains, orders, alerts, productById } = useSeller()
  const toShip = orders.filter((o) => o.status === 'awaiting_dispatch' || o.status === 'packed')
  const pending = bargains.filter((b) => b.status === 'pending')
  const escrow = orders.filter((o) => o.payout === 'escrow').reduce((s, o) => s + o.total, 0)
  const released = orders.filter((o) => o.payout === 'released').reduce((s, o) => s + o.total, 0)
  const views = listings.reduce((s, l) => s + l.views, 0)

  const stats = [
    { label: 'To send to delivery', value: String(toShip.length), icon: Truck, href: '/seller/orders' },
    { label: 'Bargains waiting', value: String(pending.length), icon: Handshake, href: '/seller/offers' },
    { label: 'In escrow', value: formatPrice(escrow), icon: Wallet, hint: `${formatPrice(released)} paid out` },
    { label: 'Listing views (30d)', value: views.toLocaleString('en-NG'), icon: Eye, href: '/seller/products' },
  ]

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Good to see you" description="Here is what needs your attention today." />

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, href, hint }) => {
          const body = (
            <>
              <Icon className="size-5 text-primary" aria-hidden="true" />
              <p className="mt-3 font-display text-2xl font-semibold">{value}</p>
              <p className="text-xs text-muted-foreground">{hint ?? label}</p>
              {hint && <p className="sr-only">{label}</p>}
            </>
          )
          return (
            <li key={label} className="rounded-2xl border bg-card p-4">
              {href ? <Link href={href} className="block">{body}</Link> : body}
            </li>
          )
        })}
      </ul>

      {toShip.length > 0 && (
        <section aria-labelledby="ship-title" className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id="ship-title" className="flex items-center gap-2 font-semibold">
              <Truck className="size-5 text-amber-700" aria-hidden="true" />
              Goods to send to OpenMarketz delivery
            </h2>
            <Link href="/seller/orders" className="text-sm font-medium text-amber-800 hover:underline">See all</Link>
          </div>
          <ul className="flex flex-col gap-2">
            {toShip.map((o) => {
              const p = productById(o.items[0].productId)
              return (
                <li key={o.id}>
                  <Link href={`/seller/orders?focus=${o.id}`} className="flex items-center gap-3 rounded-2xl bg-card p-3 hover:shadow-sm">
                    {p && <Image src={p.image} alt="" width={48} height={48} className="size-12 rounded-xl object-cover" />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p?.name}</p>
                      <p className="text-xs text-muted-foreground">{`${o.id} · Bought by ${o.buyer.name}, ${o.buyer.city}`}</p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <StatusPill status={o.status} />
                      <p className="mt-1 text-xs font-medium text-amber-800">{timeUntil(o.dispatchBy)}</p>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="bargain-title" className="rounded-3xl border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="bargain-title" className="font-semibold">Latest bargain requests</h2>
            <Link href="/seller/offers" className="text-sm font-medium text-primary hover:underline">Respond</Link>
          </div>
          {pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bargains waiting. Nice work.</p>
          ) : (
            <ul className="divide-y">
              {pending.slice(0, 4).map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{productById(b.productId)?.name}</p>
                    <p className="text-xs text-muted-foreground">{`${b.buyerName} · ${timeAgo(b.createdAt)}`}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(b.offerPrice)}</p>
                    <p className="text-xs text-muted-foreground line-through">{formatPrice(b.listPrice)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="activity-title" className="rounded-3xl border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="activity-title" className="font-semibold">Recent activity</h2>
            <Link href="/seller/notifications" className="text-sm font-medium text-primary hover:underline">All</Link>
          </div>
          <ul className="divide-y">
            {alerts.slice(0, 5).map((a) => (
              <li key={a.id} className="py-3 text-sm">
                <p className="font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground">{timeAgo(a.at)}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
