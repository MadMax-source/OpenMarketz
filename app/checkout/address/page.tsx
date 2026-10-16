import type { Metadata } from 'next'
import { AddressView } from '@/components/checkout/address-view'

export const metadata: Metadata = { title: 'Delivery address' }

export default function AddressPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 md:px-6">
      <AddressView />
    </div>
  )
}
