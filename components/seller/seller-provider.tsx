'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { products as catalog, getSeller, type Product } from '@/lib/data'
import { useShop } from '@/components/shop-provider'
import {
  STORE_ID, newWaybill, seedAlerts, seedBargains, seedListings, seedSalesOrders,
  type BargainRequest, type DispatchMethod, type FulfilmentStatus, type ListingStatus, type SalesOrder, type SellerAlert, type SellerListing,
} from '@/lib/seller'

export type NewListing = Pick<Product, 'name' | 'brand' | 'category' | 'price' | 'stock' | 'description' | 'highlights' | 'freeDelivery' | 'image' | 'gallery'> &
  Partial<Pick<Product, 'compareAt' | 'negotiable' | 'condition' | 'variants'>> & { minPrice?: number; status: ListingStatus }

type SellerValue = {
  store: NonNullable<ReturnType<typeof getSeller>>
  listings: SellerListing[]
  bargains: BargainRequest[]
  orders: SalesOrder[]
  alerts: SellerAlert[]
  unreadAlerts: number
  productById: (id: string) => Product | undefined
  addListing: (input: NewListing) => SellerListing
  setListingStatus: (id: string, status: ListingStatus) => void
  updateStock: (id: string, stock: number) => void
  respondToBargain: (id: string, action: 'accept' | 'decline' | { counter: number }) => void
  advanceOrder: (id: string, next: FulfilmentStatus, dispatch?: { method: DispatchMethod; hub: string }) => void
  markAlertRead: (id: string) => void
  markAllAlertsRead: () => void
}

const SellerContext = createContext<SellerValue | null>(null)

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export function SellerProvider({ children }: { children: React.ReactNode }) {
  const shop = useShop()
  const store = getSeller(STORE_ID)!
  const [listings, setListings] = useState<SellerListing[]>(seedListings)
  const [bargains, setBargains] = useState<BargainRequest[]>(seedBargains)
  const [orders, setOrders] = useState<SalesOrder[]>(seedSalesOrders)
  const [alerts, setAlerts] = useState<SellerAlert[]>(seedAlerts)
  const [shopOverrides, setShopOverrides] = useState<Record<string, Partial<SalesOrder>>>({})
  const [counters, setCounters] = useState<Record<string, number>>({})
  const [readIds, setReadIds] = useState<Set<string>>(new Set())

  const productById = useCallback(
    (id: string) => listings.find((l) => l.id === id) ?? catalog.find((p) => p.id === id),
    [listings],
  )

  // Orders and offers the buyer side placed on this store's products surface here too.
  const shopOrders = useMemo<SalesOrder[]>(
    () =>
      shop.orders.flatMap((o) => {
        const items = o.items.filter((i) => productById(i.productId)?.sellerId === STORE_ID)
        if (!items.length) return []
        const base: SalesOrder = {
          id: o.id,
          buyer: { name: o.address.fullName, city: `${o.address.city}, ${o.address.state}`, phone: o.address.phone },
          items,
          total: items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
          placedAt: o.placedAt,
          dispatchBy: o.placedAt + 24 * 3_600_000,
          status: 'awaiting_dispatch',
          payout: 'escrow',
          source: 'shop',
        }
        return [{ ...base, ...shopOverrides[o.id] }]
      }),
    [shop.orders, shopOverrides, productById],
  )

  const shopBargains = useMemo<BargainRequest[]>(
    () =>
      shop.offers
        .filter((o) => o.sellerId === STORE_ID)
        .map((o) => ({
          id: o.id,
          productId: o.productId,
          buyerName: 'You (buyer account)',
          buyerCity: 'Lagos',
          listPrice: o.listPrice,
          offerPrice: o.offerPrice,
          quantity: o.quantity,
          message: o.message,
          createdAt: o.createdAt,
          source: 'shop' as const,
          status: counters[o.id] && o.status === 'pending' ? ('countered' as const) : o.status,
          counterPrice: counters[o.id],
        })),
    [shop.offers, counters],
  )

  const derivedAlerts = useMemo<SellerAlert[]>(
    () => [
      ...shopOrders
        .filter((o) => o.status === 'awaiting_dispatch')
        .map((o) => ({
          id: `alert-${o.id}`, type: 'dispatch' as const, title: `Send ${o.id} to delivery`,
          body: `${o.buyer.name} paid for ${o.items.length} item${o.items.length > 1 ? 's' : ''}. Drop off or book a pickup within 24 hours.`,
          href: `/seller/orders?focus=${o.id}`, at: o.placedAt, read: readIds.has(`alert-${o.id}`),
        })),
      ...shopBargains
        .filter((b) => b.status === 'pending')
        .map((b) => ({
          id: `alert-${b.id}`, type: 'offer' as const, title: 'New bargain request',
          body: `A buyer offered ${b.offerPrice.toLocaleString('en-NG')} NGN for ${productById(b.productId)?.name ?? 'your listing'}.`,
          href: '/seller/offers', at: b.createdAt, read: readIds.has(`alert-${b.id}`),
        })),
    ],
    [shopOrders, shopBargains, readIds, productById],
  )

  const allOrders = useMemo(() => [...shopOrders, ...orders].sort((a, b) => b.placedAt - a.placedAt), [shopOrders, orders])
  const allBargains = useMemo(() => [...shopBargains, ...bargains].sort((a, b) => b.createdAt - a.createdAt), [shopBargains, bargains])
  const allAlerts = useMemo(() => [...derivedAlerts, ...alerts].sort((a, b) => b.at - a.at), [derivedAlerts, alerts])

  const pushAlert = useCallback((a: Omit<SellerAlert, 'id' | 'at' | 'read'>) => {
    setAlerts((prev) => [{ ...a, id: `a_${Math.random().toString(36).slice(2, 8)}`, at: Date.now(), read: false }, ...prev])
  }, [])

  const addListing = useCallback(
    (input: NewListing) => {
      const id = `sp_${Math.random().toString(36).slice(2, 8)}`
      const listing: SellerListing = {
        ...input,
        id,
        slug: `${slugify(input.name)}-${id.slice(3)}`,
        sellerId: STORE_ID,
        rating: 0,
        reviews: 0,
        sold: 0,
        specs: [],
        badge: 'New',
        views: 0,
      }
      setListings((prev) => [listing, ...prev])
      pushAlert({ type: 'system', title: input.status === 'active' ? 'Listing is live' : 'Draft saved', body: `${input.name} ${input.status === 'active' ? 'is now visible to buyers.' : 'was saved as a draft.'}`, href: '/seller/products' })
      return listing
    },
    [pushAlert],
  )

  const setListingStatus = useCallback((id: string, status: ListingStatus) => {
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
  }, [])

  const updateStock = useCallback((id: string, stock: number) => {
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, stock: Math.max(0, Math.floor(stock)) } : l)))
  }, [])

  const respondToBargain = useCallback<SellerValue['respondToBargain']>(
    (id, action) => {
      const isShop = shop.offers.some((o) => o.id === id)
      if (isShop) {
        if (action === 'accept') shop.respondToOffer(id, 'accepted')
        else if (action === 'decline') shop.respondToOffer(id, 'declined')
        else setCounters((c) => ({ ...c, [id]: action.counter }))
        return
      }
      setBargains((prev) =>
        prev.map((b) => {
          if (b.id !== id) return b
          if (action === 'accept') return { ...b, status: 'accepted' }
          if (action === 'decline') return { ...b, status: 'declined' }
          return { ...b, status: 'countered', counterPrice: action.counter }
        }),
      )
    },
    [shop],
  )

  const advanceOrder = useCallback<SellerValue['advanceOrder']>(
    (id, next, dispatch) => {
      const patch: Partial<SalesOrder> = { status: next }
      if (dispatch) patch.dispatch = { ...dispatch, waybill: newWaybill(), at: Date.now() }
      if (shop.orders.some((o) => o.id === id)) {
        setShopOverrides((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))
        setReadIds((prev) => new Set(prev).add(`alert-${id}`))
      } else {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)))
      }
      if (dispatch) {
        pushAlert({
          type: 'dispatch',
          title: dispatch.method === 'pickup' ? `Pickup booked for ${id}` : `Drop-off confirmed for ${id}`,
          body: dispatch.method === 'pickup' ? 'A rider will collect the package from your store within 4 hours.' : `Hand the package to the desk at ${dispatch.hub}.`,
          href: `/seller/orders?focus=${id}`,
        })
      }
    },
    [shop.orders, pushAlert],
  )

  const markAlertRead = useCallback((id: string) => {
    setReadIds((prev) => new Set(prev).add(id))
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)))
  }, [])

  const markAllAlertsRead = useCallback(() => {
    setReadIds((prev) => new Set([...prev, ...derivedAlerts.map((a) => a.id)]))
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))
  }, [derivedAlerts])

  const unreadAlerts = allAlerts.filter((a) => !a.read).length

  const value = useMemo(
    () => ({
      store, listings, bargains: allBargains, orders: allOrders, alerts: allAlerts, unreadAlerts, productById,
      addListing, setListingStatus, updateStock, respondToBargain, advanceOrder, markAlertRead, markAllAlertsRead,
    }),
    [store, listings, allBargains, allOrders, allAlerts, unreadAlerts, productById, addListing, setListingStatus, updateStock, respondToBargain, advanceOrder, markAlertRead, markAllAlertsRead],
  )

  return <SellerContext.Provider value={value}>{children}</SellerContext.Provider>
}

export function useSeller() {
  const ctx = useContext(SellerContext)
  if (!ctx) throw new Error('useSeller must be used within SellerProvider')
  return ctx
}
