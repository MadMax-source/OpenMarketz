import type { Metadata } from 'next'
import { SharedListView } from '@/components/wishlist/shared-list-view'

export const metadata: Metadata = { title: 'Gift a wishlist', description: 'Pay for items on a friend’s OpenMarketz wishlist.' }

export default async function SharedWishlistPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  return <SharedListView token={token} />
}
