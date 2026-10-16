import type { Metadata } from 'next'
import { SellerShell } from '@/components/seller/seller-shell'

export const metadata: Metadata = {
  title: { default: 'Seller hub', template: '%s · Seller hub · OpenMarketz' },
  description: 'Manage your products, bargains, orders and deliveries on OpenMarketz.',
}

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return <SellerShell>{children}</SellerShell>
}
