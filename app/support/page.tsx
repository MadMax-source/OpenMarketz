import type { Metadata } from 'next'
import { SupportView } from '@/components/support/support-view'

export const metadata: Metadata = { title: 'Help & support', description: 'Live chat, WhatsApp, email and social channels for OpenMarketz support.' }

export default function SupportPage() {
  return <SupportView />
}
