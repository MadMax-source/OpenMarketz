'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

export type NotificationType = 'order' | 'offer' | 'message' | 'wishlist' | 'account' | 'promo'

export type AppNotification = {
  id: string
  type: NotificationType
  title: string
  body: string
  href: string
  at: number
  read: boolean
}

export type NotificationPrefs = Record<NotificationType, { inApp: boolean; email: boolean; sms: boolean }>

type NotificationsContextValue = {
  notifications: AppNotification[]
  unreadCount: number
  notify: (n: Omit<AppNotification, 'id' | 'at' | 'read'>) => void
  markRead: (id: string) => void
  markAllRead: () => void
  remove: (id: string) => void
  prefs: NotificationPrefs
  setPref: (type: NotificationType, channel: keyof NotificationPrefs[NotificationType], value: boolean) => void
}

export const notificationTypeLabels: Record<NotificationType, { label: string; description: string }> = {
  order: { label: 'Orders & delivery', description: 'Confirmations, dispatch and delivery updates' },
  offer: { label: 'Offers & bargaining', description: 'When sellers accept, decline or counter your offers' },
  message: { label: 'Messages', description: 'New chat messages from sellers' },
  wishlist: { label: 'Wishlist & gifts', description: 'Price drops, back in stock and gifts from friends' },
  account: { label: 'Account & security', description: 'Sign-ins, password changes and seller application status' },
  promo: { label: 'Deals & promotions', description: 'Flash sales and offers picked for you' },
}

const hours = (h: number) => Date.now() - h * 60 * 60 * 1000

const seed: AppNotification[] = [
  { id: 'n1', type: 'order', title: 'Order OMZ-48213 has shipped', body: 'Your HUSH headphones and serum are on the way. Expected in 2–3 days.', href: '/orders/OMZ-48213', at: hours(2), read: false },
  { id: 'n2', type: 'wishlist', title: 'Price drop on a saved item', body: 'An item on your wishlist is now cheaper. Grab it before it sells out.', href: '/wishlist', at: hours(9), read: false },
  { id: 'n3', type: 'promo', title: 'Flash deals end tonight', body: 'Up to 40% off phones, fashion and home essentials.', href: '/#deals', at: hours(26), read: true },
  { id: 'n4', type: 'account', title: 'Welcome to OpenMarketz', body: 'Save addresses, build wishlists and chat with verified sellers.', href: '/account', at: hours(80), read: true },
]

const defaultPrefs: NotificationPrefs = {
  order: { inApp: true, email: true, sms: true },
  offer: { inApp: true, email: true, sms: false },
  message: { inApp: true, email: false, sms: false },
  wishlist: { inApp: true, email: true, sms: false },
  account: { inApp: true, email: true, sms: true },
  promo: { inApp: true, email: false, sms: false },
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(seed)
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaultPrefs)

  const prefsRef = useRef(prefs)
  prefsRef.current = prefs

  const notify = useCallback<NotificationsContextValue['notify']>((n) => {
    if (!prefsRef.current[n.type].inApp) return
    const id = `n_${Math.random().toString(36).slice(2, 9)}`
    setNotifications((prev) => [{ ...n, id, at: Date.now(), read: false }, ...prev])
  }, [])

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const remove = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const setPref = useCallback<NotificationsContextValue['setPref']>((type, channel, value) => {
    setPrefs((prev) => ({ ...prev, [type]: { ...prev[type], [channel]: value } }))
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const value = useMemo(
    () => ({ notifications, unreadCount, notify, markRead, markAllRead, remove, prefs, setPref }),
    [notifications, unreadCount, notify, markRead, markAllRead, remove, prefs, setPref],
  )

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
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
