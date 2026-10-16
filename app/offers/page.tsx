import type { Metadata } from 'next'
import { OffersList } from '@/components/offers/offers-list'

export const metadata: Metadata = { title: 'My offers' }

export default function OffersPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-8 md:px-6">
      <OffersList />
    </div>
  )
}
