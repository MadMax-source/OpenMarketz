'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { getProduct, getSeller, products, type Product } from '@/lib/data'

export type CartItem = {
  key: string
  productId: string
  quantity: number
  options: Record<string, string>
}

export type OfferStatus = 'pending' | 'accepted' | 'declined'

export type Offer = {
  id: string
  productId: string
  sellerId: string
  listPrice: number
  offerPrice: number
  quantity: number
  message?: string
  voiceNote?: { url: string; duration: number }
  status: OfferStatus
  createdAt: number
}

export type ChatMessage = {
  id: string
  from: 'buyer' | 'seller'
  text?: string
  voiceNote?: { url: string; duration: number }
  offerId?: string
  at: number
}

export type Conversation = {
  id: string
  sellerId: string
  productId: string
  messages: ChatMessage[]
  unread: number
}

export type Address = {
  id: string
  fullName: string
  phone: string
  line1: string
  city: string
  state: string
  landmark?: string
  label: 'Home' | 'Work' | 'Other'
}

export type DeliveryMethod = 'standard' | 'express' | 'pickup'
export type PaymentMethod = 'card' | 'transfer' | 'ussd' | 'pod'

export type OrderStatus = 'placed' | 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered'

export type Order = {
  id: string
  items: { productId: string; quantity: number; unitPrice: number; options: Record<string, string> }[]
  address: Address
  delivery: DeliveryMethod
  payment: PaymentMethod
  subtotal: number
  deliveryFee: number
  serviceFee: number
  total: number
  status: OrderStatus
  placedAt: number
}

type ShopContextValue = {
  cart: CartItem[]
  cartCount: number
  wishlist: Set<string>
  addToCart: (product: Product, quantity?: number, options?: Record<string, string>) => void
  updateQuantity: (key: string, quantity: number) => void
  removeFromCart: (key: string) => void
  toggleWishlist: (product: Product) => void
  priceFor: (product: Product) => number
  acceptedOfferFor: (productId: string) => Offer | undefined
  offers: Offer[]
  submitOffer: (input: Omit<Offer, 'id' | 'status' | 'createdAt' | 'sellerId' | 'listPrice'> & { product: Product }) => Offer
  respondToOffer: (offerId: string, status: Exclude<OfferStatus, 'pending'>) => void
  conversations: Conversation[]
  openConversation: (product: Product) => string
  sendMessage: (conversationId: string, message: Pick<ChatMessage, 'text' | 'voiceNote'>) => void
  markRead: (conversationId: string) => void
  addresses: Address[]
  saveAddress: (address: Omit<Address, 'id'> & { id?: string }) => Address
  selectedAddressId: string | null
  setSelectedAddressId: (id: string) => void
  delivery: DeliveryMethod
  setDelivery: (method: DeliveryMethod) => void
  orders: Order[]
  placeOrder: (payment: PaymentMethod) => Order | null
}

const ShopContext = createContext<ShopContextValue | null>(null)

export const deliveryOptions: Record<DeliveryMethod, { label: string; eta: string; fee: number }> = {
  standard: { label: 'Standard delivery', eta: '3–5 business days', fee: 1500 },
  express: { label: 'Express delivery', eta: '1–2 business days', fee: 3500 },
  pickup: { label: 'Pickup station', eta: 'Ready in 2–4 days', fee: 800 },
}

export const SERVICE_FEE_RATE = 0.015
export const FREE_DELIVERY_THRESHOLD = 50000

const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 9)}`
const cartKey = (productId: string, options: Record<string, string>) =>
  `${productId}::${Object.entries(options).sort().map(([k, v]) => `${k}=${v}`).join('|')}`

const sellerReplies = [
  'Thanks for reaching out! Yes, this item is available. Any questions?',
  'Hello! It is in stock and we can deliver this week.',
  'Good day. Feel free to send an offer if you want a better price.',
]

const demoAddress: Address = {
  id: 'addr_home',
  fullName: 'Adaeze Okafor',
  phone: '0803 123 4567',
  line1: '14 Admiralty Way, Lekki Phase 1',
  city: 'Lekki',
  state: 'Lagos',
  landmark: 'Opposite Mega Plaza',
  label: 'Home',
}

function seedOrders(): Order[] {
  const p1 = products.find((p) => p.slug === 'hush-anc-headphones')
  const p2 = products.find((p) => p.slug === 'glow-vitamin-c-serum')
  if (!p1 || !p2) return []
  const subtotal = p1.price + p2.price * 2
  return [
    {
      id: 'OMZ-48213',
      items: [
        { productId: p1.id, quantity: 1, unitPrice: p1.price, options: { Colour: 'Sage' } },
        { productId: p2.id, quantity: 2, unitPrice: p2.price, options: {} },
      ],
      address: demoAddress,
      delivery: 'standard',
      payment: 'card',
      subtotal,
      deliveryFee: 0,
      serviceFee: Math.round(subtotal * SERVICE_FEE_RATE),
      total: subtotal + Math.round(subtotal * SERVICE_FEE_RATE),
      status: 'shipped',
      placedAt: Date.now() - 1000 * 60 * 60 * 30,
    },
  ]
}

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [wishlist, setWishlist] = useState<Set<string>>(new Set())
  const [offers, setOffers] = useState<Offer[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [addresses, setAddresses] = useState<Address[]>([demoAddress])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(demoAddress.id)
  const [delivery, setDelivery] = useState<DeliveryMethod>('standard')
  const [orders, setOrders] = useState<Order[]>(seedOrders)
  const offersRef = useRef(offers)
  offersRef.current = offers

  const acceptedOfferFor = useCallback(
    (productId: string) =>
      offers.filter((o) => o.productId === productId && o.status === 'accepted').sort((a, b) => b.createdAt - a.createdAt)[0],
    [offers],
  )

  const priceFor = useCallback(
    (product: Product) => acceptedOfferFor(product.id)?.offerPrice ?? product.price,
    [acceptedOfferFor],
  )

  const addToCart = useCallback((product: Product, quantity = 1, options: Record<string, string> = {}) => {
    const key = cartKey(product.id, options)
    setCart((prev) => {
      const existing = prev.find((i) => i.key === key)
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, quantity: Math.min(product.stock, i.quantity + quantity) } : i))
      }
      return [...prev, { key, productId: product.id, quantity: Math.min(product.stock, quantity), options }]
    })
    toast.success('Added to cart', { description: product.name, action: { label: 'View cart', onClick: () => (window.location.href = '/cart') } })
  }, [])

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setCart((prev) =>
      prev.map((i) => {
        if (i.key !== key) return i
        const stock = products.find((p) => p.id === i.productId)?.stock ?? 1
        return { ...i, quantity: Math.max(1, Math.min(stock, quantity)) }
      }),
    )
  }, [])

  const removeFromCart = useCallback((key: string) => {
    setCart((prev) => prev.filter((i) => i.key !== key))
  }, [])

  const toggleWishlist = useCallback((product: Product) => {
    setWishlist((prev) => {
      const next = new Set(prev)
      if (next.has(product.id)) {
        next.delete(product.id)
        toast('Removed from wishlist', { description: product.name })
      } else {
        next.add(product.id)
        toast.success('Saved to wishlist', { description: product.name })
      }
      return next
    })
  }, [])

  const pushMessage = useCallback((sellerId: string, productId: string, message: Omit<ChatMessage, 'id' | 'at'>) => {
    let conversationId = ''
    setConversations((prev) => {
      const existing = prev.find((c) => c.sellerId === sellerId && c.productId === productId)
      const msg: ChatMessage = { ...message, id: uid('msg'), at: Date.now() }
      if (existing) {
        conversationId = existing.id
        return prev.map((c) =>
          c.id === existing.id
            ? { ...c, messages: [...c.messages, msg], unread: message.from === 'seller' ? c.unread + 1 : c.unread }
            : c,
        )
      }
      conversationId = uid('conv')
      return [{ id: conversationId, sellerId, productId, messages: [msg], unread: message.from === 'seller' ? 1 : 0 }, ...prev]
    })
    return conversationId
  }, [])

  const openConversation = useCallback(
    (product: Product) => {
      const existing = conversations.find((c) => c.productId === product.id && c.sellerId === product.sellerId)
      if (existing) return existing.id
      const id = uid('conv')
      setConversations((prev) => [{ id, sellerId: product.sellerId, productId: product.id, messages: [], unread: 0 }, ...prev])
      return id
    },
    [conversations],
  )

  const sendMessage = useCallback(
    (conversationId: string, message: Pick<ChatMessage, 'text' | 'voiceNote'>) => {
      let target: Conversation | undefined
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== conversationId) return c
          target = c
          return { ...c, messages: [...c.messages, { ...message, from: 'buyer', id: uid('msg'), at: Date.now() }] }
        }),
      )
      window.setTimeout(() => {
        if (!target) return
        const reply = sellerReplies[Math.floor(Math.random() * sellerReplies.length)]
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? { ...c, messages: [...c.messages, { id: uid('msg'), from: 'seller', text: reply, at: Date.now() }], unread: c.unread + 1 }
              : c,
          ),
        )
      }, 1600)
    },
    [],
  )

  const markRead = useCallback((conversationId: string) => {
    setConversations((prev) => prev.map((c) => (c.id === conversationId && c.unread ? { ...c, unread: 0 } : c)))
  }, [])

  const submitOffer: ShopContextValue['submitOffer'] = useCallback(
    ({ product, ...input }) => {
      const offer: Offer = {
        ...input,
        id: uid('offer'),
        sellerId: product.sellerId,
        listPrice: product.price,
        status: 'pending',
        createdAt: Date.now(),
      }
      setOffers((prev) => [offer, ...prev])
      pushMessage(product.sellerId, product.id, {
        from: 'buyer',
        offerId: offer.id,
        text: input.message,
        voiceNote: input.voiceNote,
      })
      toast.success('Offer sent to seller', { description: 'You will be notified when they respond.' })
      return offer
    },
    [pushMessage],
  )

  const respondToOffer = useCallback(
    (offerId: string, status: Exclude<OfferStatus, 'pending'>) => {
      const offer = offersRef.current.find((o) => o.id === offerId)
      if (!offer) return
      setOffers((prev) => prev.map((o) => (o.id === offerId ? { ...o, status } : o)))
      const product = getProduct(products.find((p) => p.id === offer.productId)?.slug ?? '')
      const seller = getSeller(offer.sellerId)
      pushMessage(offer.sellerId, offer.productId, {
        from: 'seller',
        offerId,
        text:
          status === 'accepted'
            ? 'Deal! I have accepted your offer. The new price is now applied for you.'
            : 'Sorry, I cannot go that low on this one. Feel free to send another offer.',
      })
      if (status === 'accepted') {
        toast.success(`${seller?.name ?? 'Seller'} accepted your offer`, {
          description: `${product?.name ?? 'Item'} is now yours for your offered price.`,
        })
      } else {
        toast(`${seller?.name ?? 'Seller'} declined your offer`, { description: product?.name })
      }
    },
    [pushMessage],
  )

  const saveAddress: ShopContextValue['saveAddress'] = useCallback((input) => {
    const address: Address = { ...input, id: input.id ?? uid('addr') }
    setAddresses((prev) => (prev.some((a) => a.id === address.id) ? prev.map((a) => (a.id === address.id ? address : a)) : [...prev, address]))
    setSelectedAddressId(address.id)
    return address
  }, [])

  const placeOrder = useCallback(
    (payment: PaymentMethod) => {
      const address = addresses.find((a) => a.id === selectedAddressId)
      if (!address || cart.length === 0) return null
      const items = cart.flatMap((i) => {
        const product = products.find((p) => p.id === i.productId)
        return product ? [{ productId: i.productId, quantity: i.quantity, unitPrice: priceFor(product), options: i.options }] : []
      })
      const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
      const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD && delivery === 'standard' ? 0 : deliveryOptions[delivery].fee
      const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE)
      const order: Order = {
        id: `OMZ-${Math.floor(10000 + Math.random() * 89999)}`,
        items,
        address,
        delivery,
        payment,
        subtotal,
        deliveryFee,
        serviceFee,
        total: subtotal + deliveryFee + serviceFee,
        status: payment === 'transfer' ? 'placed' : 'confirmed',
        placedAt: Date.now(),
      }
      setOrders((prev) => [order, ...prev])
      setCart([])
      return order
    },
    [addresses, selectedAddressId, cart, delivery, priceFor],
  )

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0)

  const value = useMemo<ShopContextValue>(
    () => ({
      cart, cartCount, wishlist, addToCart, updateQuantity, removeFromCart, toggleWishlist,
      priceFor, acceptedOfferFor, offers, submitOffer, respondToOffer,
      conversations, openConversation, sendMessage, markRead,
      addresses, saveAddress, selectedAddressId, setSelectedAddressId, delivery, setDelivery,
      orders, placeOrder,
    }),
    [
      cart, cartCount, wishlist, addToCart, updateQuantity, removeFromCart, toggleWishlist,
      priceFor, acceptedOfferFor, offers, submitOffer, respondToOffer,
      conversations, openConversation, sendMessage, markRead,
      addresses, saveAddress, selectedAddressId, delivery, orders, placeOrder,
    ],
  )

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop() {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error('useShop must be used within ShopProvider')
  return ctx
}

export function useCartTotals() {
  const { cart, priceFor, delivery } = useShop()
  const lines = cart.flatMap((item) => {
    const product = products.find((p) => p.id === item.productId)
    return product ? [{ item, product, unitPrice: priceFor(product) }] : []
  })
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.item.quantity, 0)
  const listSubtotal = lines.reduce((sum, l) => sum + (l.product.compareAt ?? l.product.price) * l.item.quantity, 0)
  const freeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD && delivery === 'standard'
  const deliveryFee = lines.length === 0 ? 0 : freeDelivery ? 0 : deliveryOptions[delivery].fee
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE)
  return {
    lines,
    subtotal,
    savings: Math.max(0, listSubtotal - subtotal),
    deliveryFee,
    serviceFee,
    total: subtotal + deliveryFee + serviceFee,
    freeDelivery,
    remainingForFree: Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal),
  }
}
