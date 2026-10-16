import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SellerLeads } from '@/components/seller/seller-leads'

export const metadata: Metadata = { title: 'Open Market leads' }

export default function Page() {
  return (
    <Suspense>
      <SellerLeads />
    </Suspense>
  )
}
