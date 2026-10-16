import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SellerBargains } from '@/components/seller/seller-bargains'

export const metadata: Metadata = { title: 'Bargain requests' }

export default function Page() {
  return (
    <Suspense>
      <SellerBargains />
    </Suspense>
  )
}
