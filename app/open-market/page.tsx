import type { Metadata } from 'next'
import { OpenMarketLanding } from '@/components/open-market/open-market-landing'

export const metadata: Metadata = { title: 'Open Market', description: 'Post what you need and let verified sellers send you offers.' }

export default function OpenMarketPage() {
  return <OpenMarketLanding />
}
