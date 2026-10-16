import type { Metadata } from 'next'
import { OrderDetail } from '@/components/orders/order-detail'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  return { title: `Order ${id}` }
}

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 md:px-6">
      <OrderDetail id={id} />
    </div>
  )
}
