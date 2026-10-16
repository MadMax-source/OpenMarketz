'use client'

import Link from 'next/link'
import { Bell, Handshake, Megaphone, Package, Truck, Wallet } from 'lucide-react'
import type { SellerAlertType } from '@/lib/seller'
import { timeAgo } from '@/components/notifications-provider'
import { useSeller } from '@/components/seller/seller-provider'
import { PageHeader } from '@/components/seller/seller-shell'
import { cn } from '@/lib/utils'

const icons: Record<SellerAlertType, React.ComponentType<{ className?: string }>> = {
  order: Package, dispatch: Truck, offer: Handshake, request: Megaphone, payout: Wallet, system: Bell,
}

export function SellerAlerts() {
  const { alerts, unreadAlerts, markAlertRead, markAllAlertsRead } = useSeller()
  return (
    <div>
      <PageHeader
        title="Notifications"
        description={unreadAlerts ? `${unreadAlerts} unread` : 'You are all caught up'}
        action={unreadAlerts > 0 && (
          <button type="button" onClick={markAllAlertsRead} className="h-10 rounded-xl border px-4 text-sm font-medium hover:bg-muted">Mark all as read</button>
        )}
      />
      <ul className="divide-y overflow-hidden rounded-3xl border bg-card">
        {alerts.map((a) => {
          const Icon = icons[a.type]
          const body = (
            <>
              <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-full', a.type === 'dispatch' ? 'bg-amber-100 text-amber-800' : 'bg-primary/10 text-primary')}>
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{a.title}</span>
                <span className="block text-sm text-muted-foreground">{a.body}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{timeAgo(a.at)}</span>
              </span>
              {!a.read && <span className="mt-2 size-2 shrink-0 rounded-full bg-deal" aria-label="Unread" />}
            </>
          )
          const cls = cn('flex gap-3 p-4 text-left transition-colors hover:bg-muted/50', !a.read && 'bg-primary/[0.03]')
          return (
            <li key={a.id}>
              {a.href ? (
                <Link href={a.href} onClick={() => markAlertRead(a.id)} className={cls}>{body}</Link>
              ) : (
                <button type="button" onClick={() => markAlertRead(a.id)} className={cn(cls, 'w-full')}>{body}</button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
