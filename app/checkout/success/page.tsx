import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SuccessView } from '@/components/checkout/success-view'

export const metadata: Metadata = { title: 'Order confirmed' }

export default function SuccessPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 md:px-6">
      <Suspense>
        <SuccessView />
      </Suspense>
    </div>
  )
}
