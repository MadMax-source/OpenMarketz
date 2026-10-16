import type { Metadata } from 'next'
import { Suspense } from 'react'
import { NewProductForm } from '@/components/seller/new-product-form'

export const metadata: Metadata = { title: 'Post a product' }

export default function Page() {
  return (
    <Suspense>
      <NewProductForm />
    </Suspense>
  )
}
