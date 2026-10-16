import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SellerProducts } from '@/components/seller/seller-products'

export const metadata: Metadata = { title: 'Products' }

export default function Page() {
  return (
    <Suspense>
      <SellerProducts />
    </Suspense>
  )
}
