'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ChevronRight, Package } from 'lucide-react'
import { useShop } from '@/components/shop-provider'
import { formatPrice, products } from '@/lib/data'
import { StatusBadge } from '@/components/orders/order-ui'
import { cn } from '@/lib/utils'

const filters = ['All', 'In progress', 'Delivered'] as const

export function OrdersList() {
  const { orders } = useShop()
  const [filter, setFilter] = useState<(typeof filters)[number]>('All')
  const visible = orders.filter((o) =>
    filter === 'All' ? true : filter === 'Delivered' ? o.status === 'delivered' : o.status !== 'delivered',
  )

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">My orders</h1>
          <p className="mt-1 text-muted-foreground">Track deliveries and review past purchases.</p>
        </div>
        <div role="tablist" aria-label="Filter orders" className="flex gap-1 rounded-full bg-muted p-1">
          {filters.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={cn('rounded-full px-4 py-1.5 text-sm', filter === f ? 'bg-background font-medium shadow-sm' : 'text-muted-foreground')}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="mt-12 flex flex-col items-center rounded-3xl border border-dashed py-16 text-center">
          <Package className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-4 font-medium">No orders here yet</p>
          <Link href="/products" className="mt-3 text-sm font-medium text-primary hover:underline">Start shopping</Link>
        </div>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {visible.map((order) => {
            const first = products.find((p) => p.id === order.items[0]?.productId)
            const count = order.items.reduce((s, i) => s + i.quantity, 0)
            return (
              <li key={order.id}>
                <Link href={`/orders/${order.id}`} className="group flex items-center gap-4 rounded-2xl border bg-card p-4 transition-colors hover:bg-muted/40">
                  <div className="flex -space-x-4">
                    {order.items.slice(0, 3).map((item) => {
                      const p = products.find((x) => x.id === item.productId)
                      return (
                        <div key={item.productId} className="relative size-16 overflow-hidden rounded-xl border-2 border-card bg-muted">
                          <Image src={p?.image || '/placeholder.svg'} alt="" fill sizes="64px" className="object-cover" />
                        </div>
                      )
                    })}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{order.id}</p>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                      {`${first?.name}${order.items.length > 1 ? ` + ${order.items.length - 1} more` : ''}`}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {`${new Date(order.placedAt).toLocaleDateString('en-NG', { dateStyle: 'medium' })} · ${count} ${count === 1 ? 'item' : 'items'}`}
                    </p>
                  </div>
                  <p className="hidden font-semibold tabular-nums sm:block">{formatPrice(order.total)}</p>
                  <ChevronRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
