import type { Metadata } from 'next'
import { WishlistView } from '@/components/wishlist/wishlist-view'

export const metadata: Metadata = { title: 'Wishlists', description: 'Save items, build gift lists and let friends pay for you.' }

export default function WishlistPage() {
  return <WishlistView />
}
