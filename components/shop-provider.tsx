'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { formatPrice, getProduct, getSeller, products, type Product } from '@/lib/data'
import { useNotifications } from '@/components/notifications-provider'

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

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'

export type ChatMessage = {
  id: string
  from: 'buyer' | 'seller' | 'system'
  text?: string
  voiceNote?: { url: string; duration: number }
  image?: string
  offerId?: string
  status?: MessageStatus
  at: number
}

export type Conversation = {
  id: string
  sellerId: string
  productId: string
  messages: ChatMessage[]
  unread: number
  typing?: boolean
}

type OutgoingMessage = Pick<ChatMessage, 'text' | 'voiceNote' | 'image'>

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
  sendMessage: (conversationId: string, message: OutgoingMessage) => void
  retryMessage: (conversationId: string, messageId: string) => void
  markRead: (conversationId: string) => void
  addresses: Address[]
  saveAddress: (address: Omit<Address, 'id'> & { id?: string }) => Address
  removeAddress: (id: string) => void
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

function seedConversations(): Conversation[] {
  const mins = (m: number) => Date.now() - m * 60 * 1000
  return [
    {
      id: 'conv_seed_1',
      sellerId: 's1',
      productId: 'p1',
      unread: 1,
      messages: [
        { id: 'm1', from: 'buyer', text: 'Hi, is the Aurora X5 available in Midnight Blue?', status: 'read', at: mins(190) },
        { id: 'm2', from: 'seller', text: 'Good afternoon! Yes, we have 3 units in Midnight Blue. All come sealed with a 12-month warranty.', at: mins(180) },
        { id: 'm3', from: 'buyer', text: 'Great. Can you deliver to Lekki by Friday?', status: 'read', at: mins(150) },
        { id: 'm4', from: 'seller', text: 'Yes, express delivery to Lekki arrives in 1–2 days. Order before 4pm for same-day dispatch.', at: mins(40) },
      ],
    },
    {
      id: 'conv_seed_2',
      sellerId: 's2',
      productId: 'p7',
      unread: 0,
      messages: [
        { id: 'm5', from: 'buyer', text: 'Do you have the Adé dress in size 12?', status: 'read', at: mins(60 * 26) },
        { id: 'm6', from: 'seller', text: 'We do! It runs true to size. Would you like me to share a fit video?', at: mins(60 * 25) },
        { id: 'm7', from: 'system', text: 'Ankara House shared their return policy: free exchanges within 7 days.', at: mins(60 * 25) },
      ],
    },
  ]
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
  const { notify } = useNotifications()
  const [conversations, setConversations] = useState<Conversation[]>(seedConversations)
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

  const patchConversation = useCallback((conversationId: string, fn: (c: Conversation) => Conversation) => {
    setConversations((prev) => prev.map((c) => (c.id === conversationId ? fn(c) : c)))
  }, [])

  const setStatus = useCallback(
    (conversationId: string, messageId: string, status: MessageStatus) =>
      patchConversation(conversationId, (c) => ({
        ...c,
        messages: c.messages.map((m) => (m.id === messageId ? { ...m, status } : m)),
      })),
    [patchConversation],
  )

  const deliver = useCallback(
    (conversationId: string, messageId: string) => {
      window.setTimeout(() => {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          setStatus(conversationId, messageId, 'failed')
          return
        }
        setStatus(conversationId, messageId, 'sent')
        window.setTimeout(() => setStatus(conversationId, messageId, 'delivered'), 500)
        window.setTimeout(() => {
          patchConversation(conversationId, (c) => ({
            ...c,
            typing: true,
            messages: c.messages.map((m) => (m.from === 'buyer' && m.status !== 'failed' ? { ...m, status: 'read' } : m)),
          }))
        }, 1200)
        window.setTimeout(() => {
          const reply = sellerReplies[Math.floor(Math.random() * sellerReplies.length)]
          let sellerId = ''
          patchConversation(conversationId, (c) => {
            sellerId = c.sellerId
            return {
              ...c,
              typing: false,
              unread: c.unread + 1,
              messages: [...c.messages, { id: uid('msg'), from: 'seller', text: reply, at: Date.now() }],
            }
          })
          const seller = getSeller(sellerId)
          notify({ type: 'message', title: `New message from ${seller?.name ?? 'a seller'}`, body: reply, href: `/messages?c=${conversationId}` })
        }, 2800)
      }, 450)
    },
    [setStatus, patchConversation, notify],
  )

  const sendMessage = useCallback(
    (conversationId: string, message: OutgoingMessage) => {
      const id = uid('msg')
      patchConversation(conversationId, (c) => ({
        ...c,
        messages: [...c.messages, { ...message, from: 'buyer', id, status: 'sending', at: Date.now() }],
      }))
      deliver(conversationId, id)
    },
    [patchConversation, deliver],
  )

  const retryMessage = useCallback(
    (conversationId: string, messageId: string) => {
      setStatus(conversationId, messageId, 'sending')
      deliver(conversationId, messageId)
    },
    [setStatus, deliver],
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
      notify({
        type: 'offer',
        title: status === 'accepted' ? `Offer accepted by ${seller?.name ?? 'seller'}` : `Offer declined by ${seller?.name ?? 'seller'}`,
        body:
          status === 'accepted'
            ? `${product?.name ?? 'Your item'} is now ${formatPrice(offer.offerPrice)} for you. Add it to your cart to lock it in.`
            : `${product?.name ?? 'Your item'} — you can send a new offer anytime.`,
        href: '/offers',
      })
    },
    [pushMessage, notify],
  )

  const saveAddress: ShopContextValue['saveAddress'] = useCallback((input) => {
    const address: Address = { ...input, id: input.id ?? uid('addr') }
    setAddresses((prev) => (prev.some((a) => a.id === address.id) ? prev.map((a) => (a.id === address.id ? address : a)) : [...prev, address]))
    setSelectedAddressId(address.id)
    return address
  }, [])

  const removeAddress = useCallback((id: string) => {
    setAddresses((prev) => {
      const next = prev.filter((a) => a.id !== id)
      setSelectedAddressId((current) => (current === id ? (next[0]?.id ?? null) : current))
      return next
    })
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
      notify({
        type: 'order',
        title: `Order ${order.id} placed`,
        body: payment === 'transfer' ? 'We will confirm your order once your transfer is received.' : `Payment confirmed. Total ${formatPrice(order.total)}.`,
        href: `/orders/${order.id}`,
      })
      return order
    },
    [addresses, selectedAddressId, cart, delivery, priceFor, notify],
  )

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0)

  const value = useMemo<ShopContextValue>(
    () => ({
      cart, cartCount, wishlist, addToCart, updateQuantity, removeFromCart, toggleWishlist,
      priceFor, acceptedOfferFor, offers, submitOffer, respondToOffer,
      conversations, openConversation, sendMessage, retryMessage, markRead,
      addresses, saveAddress, removeAddress, selectedAddressId, setSelectedAddressId, delivery, setDelivery,
      orders, placeOrder,
    }),
    [
      cart, cartCount, wishlist, addToCart, updateQuantity, removeFromCart, toggleWishlist,
      priceFor, acceptedOfferFor, offers, submitOffer, respondToOffer,
      conversations, openConversation, sendMessage, retryMessage, markRead,
      addresses, saveAddress, removeAddress, selectedAddressId, delivery, orders, placeOrder,
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
