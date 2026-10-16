import type { Metadata } from 'next'
import { SecurityView } from '@/components/account/security-view'

export const metadata: Metadata = { title: 'Login & security' }

export default function SecurityPage() {
  return <SecurityView />
}
