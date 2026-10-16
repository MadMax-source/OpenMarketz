'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { toast } from 'sonner'
import type { Product } from '@/lib/data'

type ShopContextValue = {
  cartCount: number
  wishlist: Set<string>
  addToCart: (product: Product, quantity?: number) => void
  toggleWishlist: (product: Product) => void
}

const ShopContext = createContext<ShopContextValue | null>(null)

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = useState(0)
  const [wishlist, setWishlist] = useState<Set<string>>(new Set())

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setCartCount((c) => c + quantity)
    toast.success('Added to cart', { description: product.name })
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

  const value = useMemo(
    () => ({ cartCount, wishlist, addToCart, toggleWishlist }),
    [cartCount, wishlist, addToCart, toggleWishlist],
  )

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop() {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error('useShop must be used within ShopProvider')
  return ctx
}
