import type { Metadata } from 'next'
import { SellerOnboarding } from '@/components/sell/seller-onboarding'

export const metadata: Metadata = { title: 'Sell on OpenMarketz', description: 'Verify your identity and open your OpenMarketz store.' }

export default function SellPage() {
  return <SellerOnboarding />
}
