'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useNotifications } from '@/components/notifications-provider'
import { formatPrice } from '@/lib/data'

export type Occasion = 'birthday' | 'wedding' | 'baby' | 'graduation' | 'housewarming' | 'holiday' | 'just-because'

export const occasions: { value: Occasion; label: string }[] = [
  { value: 'birthday', label: 'Birthday' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'baby', label: 'Baby shower' },
  { value: 'graduation', label: 'Graduation' },
  { value: 'housewarming', label: 'Housewarming' },
  { value: 'holiday', label: 'Holiday / Christmas' },
  { value: 'just-because', label: 'Just because' },
]

export type GiftList = {
  id: string
  name: string
  note: string
  occasion: Occasion
  eventDate: string
  productIds: string[]
  ownerName: string
  ownerRegion: string
  createdAt: number
}

export type SharedPayload = Omit<GiftList, 'createdAt'>

export type Gift = {
  listId: string
  productId: string
  giverName: string
  anonymous: boolean
  message: string
  reference: string
  amount: number
  at: number
}

type WishlistContextValue = {
  lists: GiftList[]
  gifts: Gift[]
  createList: (input: Omit<GiftList, 'id' | 'createdAt'>) => GiftList
  updateList: (id: string, patch: Partial<Omit<GiftList, 'id'>>) => void
  deleteList: (id: string) => void
  toggleInList: (listId: string, productId: string) => void
  recordGifts: (list: SharedPayload, input: Omit<Gift, 'listId' | 'productId' | 'at' | 'amount'> & { items: { productId: string; amount: number }[] }) => void
  giftsFor: (listId: string) => Gift[]
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

export const demoFriendList: SharedPayload = {
  id: 'friend_tunde',
  name: "Tunde & Bisi's wedding registry",
  note: 'Thank you for celebrating with us! Anything from this list helps us set up our first home.',
  occasion: 'wedding',
  eventDate: '2026-12-12',
  productIds: ['p13', 'p12', 'p4', 'p11'],
  ownerName: 'Tunde Adebayo',
  ownerRegion: 'Ibadan, Oyo',
}

const seedLists = (): GiftList[] => [
  {
    id: 'list_birthday',
    name: 'My 30th birthday wishlist',
    note: 'Turning 30 in style! Pick anything you like — every gift is delivered straight to me.',
    occasion: 'birthday',
    eventDate: '2026-11-21',
    productIds: ['p1', 'p7', 'p10', 'p9'],
    ownerName: 'Adaeze Okafor',
    ownerRegion: 'Lekki, Lagos',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
]

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { notify } = useNotifications()
  const [lists, setLists] = useState<GiftList[]>(seedLists)
  const [gifts, setGifts] = useState<Gift[]>([])

  const createList = useCallback<WishlistContextValue['createList']>((input) => {
    const list: GiftList = { ...input, id: Math.random().toString(36).slice(2, 10), createdAt: Date.now() }
    setLists((prev) => [list, ...prev])
    return list
  }, [])

  const updateList = useCallback<WishlistContextValue['updateList']>((id, patch) => {
    setLists((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }, [])

  const deleteList = useCallback((id: string) => setLists((prev) => prev.filter((l) => l.id !== id)), [])

  const toggleInList = useCallback((listId: string, productId: string) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id !== listId
          ? l
          : {
              ...l,
              productIds: l.productIds.includes(productId)
                ? l.productIds.filter((p) => p !== productId)
                : [...l.productIds, productId],
            },
      ),
    )
  }, [])

  const recordGifts = useCallback<WishlistContextValue['recordGifts']>(
    (list, { items, ...giver }) => {
      const at = Date.now()
      setGifts((prev) => [
        ...prev,
        ...items.map((item) => ({ ...giver, listId: list.id, productId: item.productId, amount: item.amount, at })),
      ])
      const total = items.reduce((s, i) => s + i.amount, 0)
      notify({
        type: 'wishlist',
        title: `${giver.anonymous ? 'Someone' : giver.giverName} paid for ${items.length} item${items.length > 1 ? 's' : ''} on "${list.name}"`,
        body: giver.message ? `"${giver.message}" — ${formatPrice(total)} gift` : `A ${formatPrice(total)} gift is being prepared for delivery.`,
        href: '/wishlist',
      })
    },
    [notify],
  )

  const giftsFor = useCallback((listId: string) => gifts.filter((g) => g.listId === listId), [gifts])

  const value = useMemo(
    () => ({ lists, gifts, createList, updateList, deleteList, toggleInList, recordGifts, giftsFor }),
    [lists, gifts, createList, updateList, deleteList, toggleInList, recordGifts, giftsFor],
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlists() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlists must be used within WishlistProvider')
  return ctx
}

export function encodeList(list: GiftList): string {
  const payload: SharedPayload = {
    id: list.id,
    name: list.name,
    note: list.note,
    occasion: list.occasion,
    eventDate: list.eventDate,
    productIds: list.productIds,
    ownerName: list.ownerName,
    ownerRegion: list.ownerRegion,
  }
  const bytes = new TextEncoder().encode(JSON.stringify(payload))
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeList(token: string): SharedPayload | null {
  try {
    const base64 = token.replace(/-/g, '+').replace(/_/g, '/')
    const binary = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4))
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    const data = JSON.parse(new TextDecoder().decode(bytes)) as SharedPayload
    if (!data || typeof data.name !== 'string' || !Array.isArray(data.productIds)) return null
    return data
  } catch {
    return null
  }
}

export function shareUrl(list: GiftList) {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}/w/${encodeList(list)}`
}
