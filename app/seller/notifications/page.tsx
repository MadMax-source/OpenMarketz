import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SellerAlerts } from '@/components/seller/seller-alerts'

export const metadata: Metadata = { title: 'Notifications' }

export default function Page() {
  return (
    <Suspense>
      <SellerAlerts />
    </Suspense>
  )
}
