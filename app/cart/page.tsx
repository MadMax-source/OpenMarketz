import type { Metadata } from 'next'
import { CartView } from '@/components/checkout/cart-view'

export const metadata: Metadata = { title: 'Shopping cart' }

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 md:px-6">
      <CartView />
    </div>
  )
}
