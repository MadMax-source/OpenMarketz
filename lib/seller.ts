import { getProductsBySeller, type Product } from '@/lib/data'

export const STORE_ID = 's1'

export type ListingStatus = 'active' | 'draft' | 'paused'

export type SellerListing = Product & { status: ListingStatus; minPrice?: number; views: number }

export type BargainStatus = 'pending' | 'accepted' | 'declined' | 'countered'

export type BargainRequest = {
  id: string
  productId: string
  buyerName: string
  buyerCity: string
  listPrice: number
  offerPrice: number
  counterPrice?: number
  quantity: number
  message?: string
  status: BargainStatus
  createdAt: number
  source: 'seed' | 'shop'
}

export type FulfilmentStatus = 'awaiting_dispatch' | 'packed' | 'handed_over' | 'in_transit' | 'delivered'

export const fulfilmentSteps: { id: FulfilmentStatus; label: string }[] = [
  { id: 'awaiting_dispatch', label: 'New order' },
  { id: 'packed', label: 'Packed' },
  { id: 'handed_over', label: 'Handed to delivery' },
  { id: 'in_transit', label: 'In transit' },
  { id: 'delivered', label: 'Delivered' },
]

export type DispatchMethod = 'dropoff' | 'pickup'

export type SalesOrder = {
  id: string
  buyer: { name: string; city: string; phone: string }
  items: { productId: string; quantity: number; unitPrice: number; options: Record<string, string> }[]
  total: number
  placedAt: number
  dispatchBy: number
  status: FulfilmentStatus
  dispatch?: { method: DispatchMethod; hub: string; waybill: string; at: number }
  payout: 'escrow' | 'released'
  source: 'seed' | 'shop'
}

export type SellerAlertType = 'order' | 'dispatch' | 'offer' | 'request' | 'payout' | 'system'

export type SellerAlert = {
  id: string
  type: SellerAlertType
  title: string
  body: string
  href?: string
  at: number
  read: boolean
}

export const dropOffHubs = [
  'OpenMarketz Hub — Ikeja, Lagos',
  'OpenMarketz Hub — Lekki Phase 1, Lagos',
  'OpenMarketz Hub — Wuse II, Abuja',
  'OpenMarketz Hub — GRA, Port Harcourt',
]

const HOUR = 3_600_000
const now = Date.now()

const storeProducts = getProductsBySeller(STORE_ID)
const pid = (i: number) => storeProducts[i % storeProducts.length]?.id ?? ''
const priceOf = (i: number) => storeProducts[i % storeProducts.length]?.price ?? 0

export const seedListings: SellerListing[] = storeProducts.map((p, i) => ({
  ...p,
  status: i === storeProducts.length - 1 && storeProducts.length > 2 ? 'paused' : 'active',
  minPrice: p.negotiable ? Math.round((p.price * 0.88) / 100) * 100 : undefined,
  views: 420 + i * 137,
}))

export const seedBargains: BargainRequest[] = [
  { id: 'b101', productId: pid(0), buyerName: 'Tunde A.', buyerCity: 'Yaba, Lagos', listPrice: priceOf(0), offerPrice: Math.round(priceOf(0) * 0.9), quantity: 1, message: 'I can pay right now if you accept. Please include a screen guard.', status: 'pending', createdAt: now - 2 * HOUR, source: 'seed' },
  { id: 'b102', productId: pid(1), buyerName: 'Chiamaka O.', buyerCity: 'Enugu', listPrice: priceOf(1), offerPrice: Math.round(priceOf(1) * 0.85), quantity: 2, message: 'Buying two for my sisters. Can you do a discount?', status: 'pending', createdAt: now - 5 * HOUR, source: 'seed' },
  { id: 'b103', productId: pid(2), buyerName: 'Ibrahim S.', buyerCity: 'Kano', listPrice: priceOf(2), offerPrice: Math.round(priceOf(2) * 0.93), quantity: 1, status: 'accepted', createdAt: now - 26 * HOUR, source: 'seed' },
  { id: 'b104', productId: pid(0), buyerName: 'Grace E.', buyerCity: 'Benin City', listPrice: priceOf(0), offerPrice: Math.round(priceOf(0) * 0.7), quantity: 1, message: 'Last price?', status: 'declined', createdAt: now - 48 * HOUR, source: 'seed' },
]

export const seedSalesOrders: SalesOrder[] = [
  {
    id: 'OMZ-58214', buyer: { name: 'Adaeze N.', city: 'Lekki, Lagos', phone: '+234 803 555 0192' },
    items: [{ productId: pid(0), quantity: 1, unitPrice: priceOf(0), options: {} }],
    total: priceOf(0), placedAt: now - 3 * HOUR, dispatchBy: now + 21 * HOUR, status: 'awaiting_dispatch', payout: 'escrow', source: 'seed',
  },
  {
    id: 'OMZ-58197', buyer: { name: 'Kelechi U.', city: 'Owerri', phone: '+234 806 222 4410' },
    items: [{ productId: pid(1), quantity: 2, unitPrice: priceOf(1), options: {} }],
    total: priceOf(1) * 2, placedAt: now - 9 * HOUR, dispatchBy: now + 15 * HOUR, status: 'packed', payout: 'escrow', source: 'seed',
  },
  {
    id: 'OMZ-58102', buyer: { name: 'Ibrahim S.', city: 'Kano', phone: '+234 809 101 7788' },
    items: [{ productId: pid(2), quantity: 1, unitPrice: Math.round(priceOf(2) * 0.93), options: {} }],
    total: Math.round(priceOf(2) * 0.93), placedAt: now - 30 * HOUR, dispatchBy: now - 6 * HOUR, status: 'in_transit', payout: 'escrow', source: 'seed',
    dispatch: { method: 'dropoff', hub: dropOffHubs[0], waybill: 'WB-90412', at: now - 20 * HOUR },
  },
  {
    id: 'OMZ-57940', buyer: { name: 'Folake B.', city: 'Ibadan', phone: '+234 802 444 9021' },
    items: [{ productId: pid(3), quantity: 1, unitPrice: priceOf(3), options: {} }],
    total: priceOf(3), placedAt: now - 96 * HOUR, dispatchBy: now - 72 * HOUR, status: 'delivered', payout: 'released', source: 'seed',
    dispatch: { method: 'pickup', hub: dropOffHubs[0], waybill: 'WB-90011', at: now - 80 * HOUR },
  },
]

export const seedAlerts: SellerAlert[] = [
  { id: 'a1', type: 'dispatch', title: 'Send OMZ-58214 to delivery', body: 'Paid order — pack and drop off at an OpenMarketz hub within 24 hours.', href: '/seller/orders?focus=OMZ-58214', at: now - 3 * HOUR, read: false },
  { id: 'a2', type: 'offer', title: 'New bargain from Tunde A.', body: 'Offer received on one of your listings. Respond quickly to close the sale.', href: '/seller/offers', at: now - 2 * HOUR, read: false },
  { id: 'a3', type: 'request', title: '3 Open Market requests match your store', body: 'Buyers are looking for phones and gadgets you sell.', href: '/seller/open-market', at: now - 6 * HOUR, read: false },
  { id: 'a4', type: 'payout', title: 'Payout released for OMZ-57940', body: 'Funds were sent to your GTBank account ending 4410.', at: now - 70 * HOUR, read: true },
]

export function newWaybill() {
  return `WB-${Math.floor(10000 + Math.random() * 89999)}`
}

export function timeUntil(at: number) {
  const diff = at - Date.now()
  const hrs = Math.round(Math.abs(diff) / HOUR)
  if (diff < 0) return hrs < 1 ? 'Overdue' : `${hrs}h overdue`
  return hrs < 1 ? 'Due within the hour' : `Due in ${hrs}h`
}
