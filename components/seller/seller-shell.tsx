'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BadgeCheck, Bell, Handshake, LayoutDashboard, Megaphone, Package, Plus, Truck } from 'lucide-react'
import { useSeller } from '@/components/seller/seller-provider'
import { cn } from '@/lib/utils'

export function SellerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { store, bargains, orders, unreadAlerts } = useSeller()
  const pendingBargains = bargains.filter((b) => b.status === 'pending').length
  const toShip = orders.filter((o) => o.status === 'awaiting_dispatch' || o.status === 'packed').length

  const nav = [
    { href: '/seller', label: 'Overview', icon: LayoutDashboard, exact: true },
    { href: '/seller/products', label: 'Products', icon: Package },
    { href: '/seller/offers', label: 'Bargains', icon: Handshake, count: pendingBargains },
    { href: '/seller/orders', label: 'Orders & delivery', icon: Truck, count: toShip },
    { href: '/seller/open-market', label: 'Open Market leads', icon: Megaphone },
    { href: '/seller/notifications', label: 'Notifications', icon: Bell, count: unreadAlerts },
  ]

  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href))

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:flex-row md:px-6 md:py-10">
      <aside className="flex shrink-0 flex-col gap-4 md:sticky md:top-28 md:h-fit md:w-60">
        <div className="flex items-center gap-3 rounded-2xl border bg-card p-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">{store.initials}</span>
          <div className="min-w-0">
            <p className="flex items-center gap-1 truncate text-sm font-semibold">
              {store.name}
              {store.verified && <BadgeCheck className="size-4 shrink-0 text-primary" aria-label="Verified seller" />}
            </p>
            <Link href={`/store/${store.slug}`} className="text-xs text-muted-foreground hover:text-foreground hover:underline">
              View public store
            </Link>
          </div>
        </div>

        <Link href="/seller/products/new" className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90">
          <Plus className="size-4" aria-hidden="true" />
          Post a product
        </Link>

        <nav aria-label="Seller hub" className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <ul className="flex gap-1 md:flex-col">
            {nav.map(({ href, label, icon: Icon, count, exact }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive(href, exact) ? 'page' : undefined}
                  className={cn(
                    'flex h-10 items-center gap-3 whitespace-nowrap rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                    isActive(href, exact) && 'bg-muted text-foreground',
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  <span className="flex-1">{label}</span>
                  {!!count && <span className="rounded-full bg-deal px-1.5 text-xs font-semibold text-white">{count}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-balance">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </header>
  )
}

const statusTone: Record<string, string> = {
  active: 'bg-primary/10 text-primary',
  accepted: 'bg-primary/10 text-primary',
  delivered: 'bg-primary/10 text-primary',
  released: 'bg-primary/10 text-primary',
  pending: 'bg-amber-100 text-amber-800',
  awaiting_dispatch: 'bg-amber-100 text-amber-800',
  countered: 'bg-sky-100 text-sky-800',
  packed: 'bg-sky-100 text-sky-800',
  handed_over: 'bg-sky-100 text-sky-800',
  in_transit: 'bg-sky-100 text-sky-800',
  escrow: 'bg-muted text-muted-foreground',
  draft: 'bg-muted text-muted-foreground',
  paused: 'bg-muted text-muted-foreground',
  declined: 'bg-deal/10 text-deal',
}

export function StatusPill({ status, label }: { status: string; label?: string }) {
  return (
    <span className={cn('inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium capitalize', statusTone[status] ?? 'bg-muted text-muted-foreground')}>
      {label ?? status.replace(/_/g, ' ')}
    </span>
  )
}
