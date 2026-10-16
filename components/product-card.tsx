'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'motion/react'
import { BadgeCheck, Heart, Plus, Truck } from 'lucide-react'
import { discount, formatPrice, getSeller, type Product } from '@/lib/data'
import { useShop } from '@/components/shop-provider'
import { Rating } from '@/components/rating'
import { cn } from '@/lib/utils'

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { wishlist, toggleWishlist, addToCart } = useShop()
  const seller = getSeller(product.sellerId)
  const off = discount(product)
  const saved = wishlist.has(product.id)

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col"
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
        <Link href={`/product/${product.slug}`} aria-label={product.name} className="absolute inset-0">
          <Image
            src={product.image || '/placeholder.svg'}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 50vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        </Link>

        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
          {off > 0 && (
            <span className="rounded-full bg-deal px-2 py-0.5 text-[11px] font-semibold text-deal-foreground">
              {`-${off}%`}
            </span>
          )}
          {product.badge && (
            <span className="rounded-full bg-background/90 px-2 py-0.5 text-[11px] font-medium text-foreground backdrop-blur">
              {product.badge}
            </span>
          )}
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.85 }}
          onClick={() => toggleWishlist(product)}
          aria-pressed={saved}
          aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          className="absolute right-2.5 top-2.5 flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background"
        >
          <Heart className={cn('size-4 transition-colors', saved && 'fill-deal text-deal')} />
        </motion.button>

        <button
          type="button"
          onClick={() => addToCart(product)}
          className="absolute inset-x-2.5 bottom-2.5 flex translate-y-2 items-center justify-center gap-1.5 rounded-xl bg-foreground py-2 text-xs font-medium text-background opacity-0 transition-all duration-300 focus-visible:translate-y-0 focus-visible:opacity-100 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <Plus className="size-3.5" />
          Add to cart
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 pt-3">
        {seller && (
          <Link
            href={`/store/${seller.slug}`}
            className="flex w-fit items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            {seller.name}
            {seller.verified && <BadgeCheck className="size-3.5 text-primary" aria-label="Verified seller" />}
          </Link>
        )}
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground text-pretty">
          <Link href={`/product/${product.slug}`} className="hover:underline underline-offset-2">
            {product.name}
          </Link>
        </h3>
        <Rating value={product.rating} count={product.reviews} />
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-1">
          <span className="text-base font-semibold tracking-tight text-foreground">{formatPrice(product.price)}</span>
          {product.compareAt && (
            <span className="text-xs text-muted-foreground line-through">{formatPrice(product.compareAt)}</span>
          )}
        </div>
        {product.freeDelivery && (
          <span className="flex items-center gap-1 text-xs font-medium text-primary">
            <Truck className="size-3.5" />
            Free delivery
          </span>
        )}
      </div>
    </motion.article>
  )
}
