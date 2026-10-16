'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, MapPin, MessageCircle, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { deliveryOptions, useShop } from '@/components/shop-provider'
import { formatPrice, getSeller, products } from '@/lib/data'
import { OrderTimeline, StatusBadge } from '@/components/orders/order-ui'

const paymentLabels = { card: 'Card', transfer: 'Bank transfer', ussd: 'USSD', pod: 'Pay on delivery' } as const

export function OrderDetail({ id }: { id: string }) {
  const { orders } = useShop()
  const order = orders.find((o) => o.id === id)

  if (!order) {
    return (
      <div className="py-24 text-center">
        <p className="text-muted-foreground">Order not found.</p>
        <Link href="/orders" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">Back to orders</Link>
      </div>
    )
  }

  return (
    <>
      <Link href="/orders" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        All orders
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight">{`Order ${order.id}`}</h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {`Placed ${new Date(order.placedAt).toLocaleString('en-NG', { dateStyle: 'long', timeStyle: 'short' })}`}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <section className="rounded-3xl border bg-card p-6" aria-labelledby="tracking-heading">
            <div className="flex items-center justify-between gap-4">
              <h2 id="tracking-heading" className="font-display text-lg font-semibold">Tracking</h2>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Truck className="size-4" aria-hidden="true" />
                {`${deliveryOptions[order.delivery].label} · ${deliveryOptions[order.delivery].eta}`}
              </span>
            </div>
            <div className="mt-6">
              <OrderTimeline status={order.status} placedAt={order.placedAt} />
            </div>
          </section>

          <section className="rounded-3xl border bg-card" aria-labelledby="items-heading">
            <h2 id="items-heading" className="border-b p-6 font-display text-lg font-semibold">Items</h2>
            <ul className="divide-y">
              {order.items.map((item) => {
                const product = products.find((p) => p.id === item.productId)
                if (!product) return null
                const seller = getSeller(product.sellerId)
                return (
                  <li key={item.productId + JSON.stringify(item.options)} className="flex items-center gap-4 p-4 sm:px-6">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                      <Image src={product.image || '/placeholder.svg'} alt={product.name} fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link href={`/product/${product.slug}`} className="line-clamp-1 text-sm font-medium hover:underline">{product.name}</Link>
                      <p className="text-xs text-muted-foreground">{`${seller?.name} · Qty ${item.quantity}`}</p>
                      {Object.keys(item.options).length > 0 && (
                        <p className="text-xs text-muted-foreground">{Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(' · ')}</p>
                      )}
                    </div>
                    <p className="text-sm font-medium tabular-nums">{formatPrice(item.unitPrice * item.quantity)}</p>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <section className="rounded-3xl border bg-card p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <MapPin className="size-4 text-primary" aria-hidden="true" />
              Delivery address
            </h2>
            <address className="mt-3 text-sm not-italic leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">{order.address.fullName}</span>
              <br />
              {order.address.line1}
              <br />
              {`${order.address.city}, ${order.address.state}`}
              <br />
              {order.address.phone}
            </address>
          </section>
          <section className="rounded-3xl border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">Payment</h2>
            <dl className="mt-4 flex flex-col gap-2.5 text-sm">
              <Row label="Method" value={paymentLabels[order.payment]} />
              <Row label="Subtotal" value={formatPrice(order.subtotal)} />
              <Row label="Delivery" value={order.deliveryFee === 0 ? 'Free' : formatPrice(order.deliveryFee)} />
              <Row label="Service fee" value={formatPrice(order.serviceFee)} />
              <div className="mt-1 flex justify-between border-t pt-3">
                <dt className="font-medium">Total</dt>
                <dd className="font-display text-lg font-semibold tabular-nums">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </section>
          <div className="flex gap-3">
            <Link href="/messages" className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border text-sm font-medium hover:bg-muted">
              <MessageCircle className="size-4" aria-hidden="true" />
              Message seller
            </Link>
            <button
              type="button"
              onClick={() => toast('Our support team will reach out shortly')}
              className="h-11 flex-1 rounded-full border text-sm font-medium hover:bg-muted"
            >
              Get help
            </button>
          </div>
        </aside>
      </div>
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  )
}
