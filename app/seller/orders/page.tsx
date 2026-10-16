import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SellerOrders } from '@/components/seller/seller-orders'

export const metadata: Metadata = { title: 'Orders & delivery' }

export default function Page() {
  return (
    <Suspense>
      <SellerOrders />
    </Suspense>
  )
}
