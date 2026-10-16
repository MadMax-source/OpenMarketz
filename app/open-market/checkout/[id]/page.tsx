import type { Metadata } from 'next'
import { OfferCheckout } from '@/components/open-market/offer-checkout'

export const metadata: Metadata = { title: 'Checkout · Open Market' }

export default async function OfferCheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <OfferCheckout responseId={id} />
}
