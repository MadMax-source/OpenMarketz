import type { Metadata } from 'next'
import { OrdersList } from '@/components/orders/orders-list'

export const metadata: Metadata = { title: 'My orders' }

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-8 md:px-6">
      <OrdersList />
    </div>
  )
}
