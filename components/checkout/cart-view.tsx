'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { BadgeCheck, Minus, Plus, ShoppingBag, Trash2, Truck } from 'lucide-react'
import { formatPrice, getSeller } from '@/lib/data'
import { FREE_DELIVERY_THRESHOLD, useCartTotals, useShop } from '@/components/shop-provider'
import { CheckoutSteps, OrderSummary } from '@/components/checkout/checkout-ui'

export function CartView() {
  const { updateQuantity, removeFromCart, acceptedOfferFor } = useShop()
  const { lines, subtotal, remainingForFree } = useCartTotals()

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="size-7 text-muted-foreground" aria-hidden="true" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Discover great deals from verified sellers across Nigeria.</p>
        <Link href="/products" className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90">
          Start shopping
        </Link>
      </div>
    )
  }

  const progress = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100)

  return (
    <>
      <CheckoutSteps current={0} />
      <h1 className="mt-8 font-display text-3xl font-semibold tracking-tight">
        {'Shopping cart '}
        <span className="text-lg font-normal text-muted-foreground">{`(${lines.length} ${lines.length === 1 ? 'item' : 'items'})`}</span>
      </h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border bg-card p-4">
            <p className="flex items-center gap-2 text-sm">
              <Truck className="size-4 text-primary" aria-hidden="true" />
              {remainingForFree > 0 ? (
                <span>
                  {'Add '}
                  <span className="font-semibold">{formatPrice(remainingForFree)}</span>
                  {' more for free standard delivery'}
                </span>
              ) : (
                <span className="font-medium text-primary">You qualify for free standard delivery</span>
              )}
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
              <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${progress}%` }} />
            </div>
          </div>

          <ul className="flex flex-col divide-y rounded-2xl border bg-card">
            <AnimatePresence initial={false}>
              {lines.map(({ item, product, unitPrice }) => {
                const seller = getSeller(product.sellerId)
                const accepted = acceptedOfferFor(product.id)
                return (
                  <motion.li
                    key={item.key}
                    layout
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-4 overflow-hidden p-4"
                  >
                    <Link href={`/product/${product.slug}`} className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-28">
                      <Image src={product.image || '/placeholder.svg'} alt={product.name} fill sizes="112px" className="object-cover" />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex justify-between gap-3">
                        <div className="min-w-0">
                          <Link href={`/product/${product.slug}`} className="line-clamp-2 font-medium hover:underline">
                            {product.name}
                          </Link>
                          <p className="mt-0.5 text-xs text-muted-foreground">{`Sold by ${seller?.name}`}</p>
                          {Object.keys(item.options).length > 0 && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold tabular-nums">{formatPrice(unitPrice * item.quantity)}</p>
                          {item.quantity > 1 && <p className="text-xs text-muted-foreground">{`${formatPrice(unitPrice)} each`}</p>}
                        </div>
                      </div>
                      {accepted && (
                        <p className="mt-2 flex w-fit items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          <BadgeCheck className="size-3.5" aria-hidden="true" />
                          Bargained price applied
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="flex h-9 items-center rounded-full border">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.key, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                            className="flex size-9 items-center justify-center rounded-full hover:bg-muted disabled:opacity-40"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.key, item.quantity + 1)}
                            disabled={item.quantity >= product.stock}
                            aria-label="Increase quantity"
                            className="flex size-9 items-center justify-center rounded-full hover:bg-muted disabled:opacity-40"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <span className="hidden text-xs text-muted-foreground sm:inline">{`${product.stock} available`}</span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.key)}
                          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-deal"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          <span className="hidden sm:inline">Remove</span>
                          <span className="sr-only sm:hidden">{`Remove ${product.name}`}</span>
                        </button>
                      </div>
                    </div>
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </ul>
          <Link href="/products" className="text-sm font-medium text-primary hover:underline">
            Continue shopping
          </Link>
        </div>
        <OrderSummary>
          <Link
            href="/checkout/address"
            className="flex h-12 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Proceed to checkout
          </Link>
        </OrderSummary>
      </div>
    </>
  )
}
