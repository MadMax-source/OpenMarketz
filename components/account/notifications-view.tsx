'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Bell, CheckCheck, Gift, HandCoins, MessageCircle, Package, ShieldCheck, Tag, X } from 'lucide-react'
import {
  notificationTypeLabels, useNotifications, type AppNotification, type NotificationPrefs, type NotificationType,
} from '@/components/notifications-provider'
import { AccountShell, Card } from '@/components/account/account-shell'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

const icons: Record<NotificationType, typeof Bell> = {
  order: Package, offer: HandCoins, message: MessageCircle, wishlist: Gift, account: ShieldCheck, promo: Tag,
}

type Filter = 'all' | 'unread' | NotificationType

export function NotificationsView() {
  const { unreadCount, markAllRead } = useNotifications()
  const [tab, setTab] = useState<'feed' | 'settings'>('feed')
  return (
    <AccountShell
      title="Notifications"
      description={unreadCount ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}.` : "You're all caught up."}
      actions={
        tab === 'feed' && unreadCount > 0 ? (
          <button type="button" onClick={markAllRead} className="flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-medium hover:bg-muted">
            <CheckCheck className="size-4" aria-hidden="true" />
            Mark all read
          </button>
        ) : null
      }
    >
      <div role="tablist" aria-label="Notifications" className="mb-5 flex w-fit gap-1 rounded-xl bg-muted p-1">
        {(['feed', 'settings'] as const).map((t) => (
          <button
            key={t}
            role="tab"
            type="button"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn('h-9 rounded-lg px-4 text-sm font-medium', tab === t ? 'bg-background shadow-sm' : 'text-muted-foreground')}
          >
            {t === 'feed' ? 'Activity' : 'Preferences'}
          </button>
        ))}
      </div>
      {tab === 'feed' ? <Feed /> : <Preferences />}
    </AccountShell>
  )
}

function Feed() {
  const { notifications, markRead, remove } = useNotifications()
  const [filter, setFilter] = useState<Filter>('all')
  const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread' },
    { value: 'order', label: 'Orders' },
    { value: 'message', label: 'Messages' },
    { value: 'offer', label: 'Offers' },
    { value: 'wishlist', label: 'Gifts' },
  ]
  const visible = notifications.filter((n) => (filter === 'all' ? true : filter === 'unread' ? !n.read : n.type === filter))

  return (
    <div className="flex flex-col gap-4">
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={cn('h-9 shrink-0 rounded-full border px-4 text-sm', filter === f.value ? 'border-foreground bg-foreground text-background' : 'hover:bg-muted')}
          >
            {f.label}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-16 text-center">
          <Bell className="size-6 text-muted-foreground" aria-hidden="true" />
          <p className="font-medium">Nothing here yet</p>
          <p className="text-sm text-muted-foreground">Order updates, replies from sellers and gift alerts will show up here.</p>
        </div>
      ) : (
        <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
          {visible.map((n) => (
            <NotificationRow key={n.id} n={n} onOpen={() => markRead(n.id)} onRemove={() => remove(n.id)} />
          ))}
        </ul>
      )}
    </div>
  )
}

function NotificationRow({ n, onOpen, onRemove }: { n: AppNotification; onOpen: () => void; onRemove: () => void }) {
  const Icon = icons[n.type]
  return (
    <li className={cn('group relative flex gap-3 p-4 transition-colors hover:bg-muted/50', !n.read && 'bg-primary/[0.03]')}>
      <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-full', n.read ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary')}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <Link href={n.href} onClick={onOpen} className="min-w-0 flex-1 after:absolute after:inset-0">
        <p className={cn('text-sm', !n.read && 'font-semibold')}>{n.title}</p>
        <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{n.body}</p>
        <p className="mt-1 text-xs text-muted-foreground">{timeAgo(n.at)}</p>
      </Link>
      {!n.read && <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Dismiss notification"
        className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground opacity-0 hover:bg-muted focus-visible:opacity-100 group-hover:opacity-100"
      >
        <X className="size-4" />
      </button>
    </li>
  )
}

function Preferences() {
  const { prefs, setPref } = useNotifications()
  const channels: (keyof NotificationPrefs[NotificationType])[] = ['inApp', 'email', 'sms']
  const channelLabel = { inApp: 'In-app', email: 'Email', sms: 'SMS' }
  return (
    <Card title="How we reach you" description="Choose which updates you get and where.">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="pb-3 font-medium">Type</th>
              {channels.map((c) => (
                <th key={c} className="w-20 pb-3 text-center font-medium">{channelLabel[c]}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {(Object.keys(notificationTypeLabels) as NotificationType[]).map((type) => (
              <tr key={type}>
                <td className="py-3 pr-4">
                  <p className="font-medium">{notificationTypeLabels[type].label}</p>
                  <p className="text-muted-foreground">{notificationTypeLabels[type].description}</p>
                </td>
                {channels.map((c) => (
                  <td key={c} className="py-3 text-center">
                    <Switch
                      checked={prefs[type][c]}
                      onCheckedChange={(v) => setPref(type, c, v)}
                      aria-label={`${notificationTypeLabels[type].label} via ${channelLabel[c]}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export function timeAgo(at: number) {
  const s = Math.round((Date.now() - at) / 1000)
  if (s < 60) return 'Just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
}
