'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { BadgeCheck, Boxes, Check, Heart, Minus, Phone, Plus, RotateCcw, ShieldCheck, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { discount, formatPrice, type Product } from '@/lib/data'
import { useShop } from '@/components/shop-provider'
import { BargainDialog } from '@/components/product/bargain-dialog'
import { ChatSheet } from '@/components/chat/chat-sheet'
import { Rating } from '@/components/rating'
import { cn } from '@/lib/utils'

export function PurchasePanel({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, wishlist, acceptedOfferFor } = useShop()
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries((product.variants ?? []).map((v) => [v.name, v.options[Math.min(1, v.options.length - 1)]])),
  )
  const accepted = acceptedOfferFor(product.id)
  const off = discount(product)
  const saved = wishlist.has(product.id)
  const lowStock = product.stock <= 10
  const unitWord = product.unitLabel ?? 'units'

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium text-primary">{product.brand}</p>
        {product.condition && (
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">{product.condition}</span>
        )}
        {product.negotiable && (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">Negotiable</span>
        )}
      </div>
      <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight text-balance md:text-4xl">
        {product.name}
      </h1>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <Rating value={product.rating} count={product.reviews} size="md" />
        <span aria-hidden="true">·</span>
        <span>{`${product.sold.toLocaleString()} sold`}</span>
      </div>

      {accepted ? (
        <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
            <BadgeCheck className="size-4" aria-hidden="true" />
            Your offer was accepted — this is your price
          </p>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-3">
            <span className="font-display text-3xl font-semibold tracking-tight">{formatPrice(accepted.offerPrice)}</span>
            <span className="text-lg text-muted-foreground line-through">{formatPrice(product.price)}</span>
          </div>
        </div>
      ) : (
      <div className="mt-6 flex flex-wrap items-baseline gap-3">
        <span className="font-display text-3xl font-semibold tracking-tight">{formatPrice(product.price)}</span>
        {product.compareAt && (
          <>
            <span className="text-lg text-muted-foreground line-through">{formatPrice(product.compareAt)}</span>
            <span className="rounded-full bg-deal/10 px-2.5 py-0.5 text-sm font-semibold text-deal">
              {`Save ${off}%`}
            </span>
          </>
        )}
      </div>
      )}

      <div className="mt-5 flex items-center gap-4 rounded-2xl border p-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted">
          <Boxes className="size-5 text-primary" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <p className="text-sm">
            <span className="font-display text-xl font-semibold tabular-nums">{product.stock}</span>
            <span className="text-muted-foreground">{` ${unitWord} available`}</span>
          </p>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
            <div
              className={cn('h-full rounded-full', lowStock ? 'bg-deal' : 'bg-primary')}
              style={{ width: `${Math.min(100, Math.max(8, (product.stock / (product.stock + Math.min(product.sold, 200))) * 100))}%` }}
            />
          </div>
        </div>
        {lowStock && <span className="text-xs font-medium text-deal">Selling fast</span>}
      </div>

      <p className="mt-5 leading-relaxed text-muted-foreground text-pretty">{product.description}</p>

      {product.variants?.map((variant) => (
        <fieldset key={variant.name} className="mt-6">
          <legend className="mb-2.5 text-sm">
            <span className="font-medium">{variant.name}</span>
            <span className="text-muted-foreground">{`: ${selected[variant.name]}`}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {variant.options.map((option) => {
              const isActive = selected[variant.name] === option
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setSelected((s) => ({ ...s, [variant.name]: option }))}
                  className={cn(
                    'relative min-w-12 rounded-xl border px-4 py-2 text-sm transition-colors',
                    isActive ? 'border-foreground font-medium' : 'hover:border-foreground/40',
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId={`variant-${variant.name}`}
                      className="absolute inset-0 rounded-xl bg-muted"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative">{option}</span>
                </button>
              )
            })}
          </div>
        </fieldset>
      ))}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="flex h-12 items-center rounded-full border">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="flex size-12 items-center justify-center rounded-full hover:bg-muted disabled:opacity-40"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-8 text-center text-sm font-medium tabular-nums" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            disabled={quantity >= product.stock}
            aria-label="Increase quantity"
            className="flex size-12 items-center justify-center rounded-full hover:bg-muted disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => addToCart(product, quantity, selected)}
          className="h-12 flex-1 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Add to cart
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => toggleWishlist(product)}
          aria-pressed={saved}
          aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          className="flex size-12 items-center justify-center rounded-full border hover:bg-muted"
        >
          <Heart className={cn('size-5', saved && 'fill-deal text-deal')} />
        </motion.button>
      </div>
      <button
        type="button"
        onClick={() => {
          addToCart(product, quantity, selected)
          router.push('/cart')
        }}
        className="mt-3 h-12 rounded-full bg-foreground text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        Buy now
      </button>

      <div className="mt-3 flex flex-wrap gap-3">
        {product.negotiable && !accepted && <BargainDialog product={product} quantity={quantity} />}
        <ChatSheet
          product={product}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors hover:bg-muted"
        />
        <button
          type="button"
          onClick={() => toast('Calling sellers is coming soon', { description: 'Use chat to reach the seller for now.' })}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors hover:bg-muted"
        >
          <Phone className="size-4" aria-hidden="true" />
          Call seller
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Soon
          </span>
        </button>
      </div>

      <p className={cn('mt-4 flex items-center gap-2 text-sm', lowStock ? 'text-deal' : 'text-muted-foreground')}>
        <span className={cn('size-2 rounded-full', lowStock ? 'bg-deal' : 'bg-primary')} aria-hidden="true" />
        {lowStock ? `Only ${product.stock} ${unitWord} left` : 'In stock, ready to ship'}
      </p>

      <ul className="mt-8 flex flex-col divide-y rounded-2xl border">
        <InfoRow icon={Truck} title={product.freeDelivery ? 'Free delivery' : 'Delivery from ₦1,500'}>
          Arrives in 1–3 business days in Lagos & Abuja, 3–5 days elsewhere.
        </InfoRow>
        <InfoRow icon={ShieldCheck} title="Buyer protection">
          Your payment is held in escrow until you confirm delivery.
        </InfoRow>
        <InfoRow icon={RotateCcw} title="7-day returns">
          Return eligible items within 7 days for a full refund.
        </InfoRow>
      </ul>

      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {product.highlights.map((h) => (
          <li key={h} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            {h}
          </li>
        ))}
      </ul>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <li className="flex gap-3 p-4">
      <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{children}</p>
      </div>
    </li>
  )
}
