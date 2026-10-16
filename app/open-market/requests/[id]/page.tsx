import { Suspense } from 'react'
import type { Metadata } from 'next'
import { RequestDetails } from '@/components/open-market/request-details'

export const metadata: Metadata = { title: 'Request details · Open Market' }

export default async function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <Suspense>
      <RequestDetails id={id} />
    </Suspense>
  )
}
