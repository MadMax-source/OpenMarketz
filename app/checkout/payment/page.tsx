import type { Metadata } from 'next'
import { PaymentView } from '@/components/checkout/payment-view'

export const metadata: Metadata = { title: 'Payment' }

export default function PaymentPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 md:px-6">
      <PaymentView />
    </div>
  )
}
